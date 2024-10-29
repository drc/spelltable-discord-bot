/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from "itty-router";
import * as dsi from "discord-interactions";
import * as command from "./commands.js";
import { getRandomUrl, getNamedUrl, getAutoCompleteNames, getAutoCompleteSets } from "./scryfall.js";
import * as act from "./interactions.js";
import JsonResponse from "./response.js";

/**
 * The router for handling incoming requests from Discord.
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 *
 * @type {Router}
 * @see https://itty.dev/
 */
const router = Router();

/**
 * Route for the `/` endpoint.  This is used to verify that the webhook is
 * configured properly.
 *
 * @param {Request} request - the request object
 * @param {Object} env - the environment object
 * @return {Response} an object containing the result of the verification
 */
router.get("/", (_, env) => {
	return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for the application.  This is used to handle
 * incoming requests from Discord.
 *
 * @param {Request} request - the request object
 * @param {Object} env - the environment object
 * @return {Response} an object containing the result of the verification
 */
router.post("/", async (request, env) => {
	const { isValid, interaction } = await server.verifyDiscordRequest(request, env);
	if (!isValid || !interaction) {
		return new Response("Bad request signature.", { status: 401 });
	}

	switch (interaction.type) {
		case dsi.InteractionType.PING: {
			// The `PING` message is used during the initial webhook handshake, and is
			// required to configure the webhook in the developer portal.
			return new JsonResponse({
				type: dsi.InteractionResponseType.PONG,
			});
		}
		case dsi.InteractionType.APPLICATION_COMMAND:
			return await act.handleApplicationCommand(interaction, env);
		case dsi.InteractionType.MESSAGE_COMPONENT:
		case dsi.InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
		default:
			return new Response("Unsupported interaction type.", { status: 400 });
	}

	// Most user commands will come as `APPLICATION_COMMAND`.
	if (interaction.type === dsi.InteractionType.APPLICATION_COMMAND) {
		switch (interaction.data.name.toLowerCase()) {
			// These commands are just for testing.
			case command.HAD_IT_COMMAND.name.toLowerCase(): {
				return new JsonResponse({
					type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: "https://i.pinimg.com/736x/f2/c0/1a/f2c01a4cc18f18b16f4adb71e1835314.jpg",
						flags: dsi.InteractionResponseFlags.EPHEMERAL,
					},
				});
			}
			// commands for inviting
			case command.INVITE_COMMAND.name.toLowerCase(): {
				const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION_ID}&scope=applications.commands`;
				return new JsonResponse({
					type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: INVITE_URL,
						flags: dsi.InteractionResponseFlags.EPHEMERAL,
					},
				});
			}
			// commands for searching cards
			case command.CARD_COMMAND.name.toLowerCase(): {
				const cardName = interaction?.data?.options[0]?.value ?? null;
				const set = interaction?.data?.options[1]?.value ?? null;
				if (set) {
					const { cardImages } = await getAutoCompleteSets(cardName);
					const card = cardImages.filter((card) => card.set === set);
					if (card.length > 0) {
						const { url, uri } = card[0];
						return new JsonResponse({
							type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								content: url,
								components: [
									{
										type: dsi.MessageComponentTypes.ACTION_ROW,
										components: [
											{
												type: dsi.MessageComponentTypes.BUTTON,
												style: dsi.ButtonStyleTypes.LINK,
												label: "View on Scryfall",
												url: uri,
											},
										],
									},
								],
							},
						});
					}
				}
				if (cardName) {
					const { namedUrl, externalUrl } = await getNamedUrl(cardName);
					console.log(namedUrl, externalUrl);
					if (!namedUrl) {
						return new JsonResponse({
							type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								content: "# No cards found\nYour search didn't match any cards.",
							},
						});
					}
					return new JsonResponse({
						type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: namedUrl,
							components: [
								{
									type: dsi.MessageComponentTypes.ACTION_ROW,
									components: [
										{
											type: dsi.MessageComponentTypes.BUTTON,
											style: dsi.ButtonStyleTypes.LINK,
											label: "View on Scryfall",
											url: externalUrl,
										},
									],
								},
							],
						},
					});
				}

				const randomUrl = await getRandomUrl();
				return new JsonResponse({
					type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: randomUrl,
					},
				});
			}
			// commands for starting a game
			case command.NEW_GAME_COMMAND.name.toLowerCase(): {
				// return response for new game
				return new JsonResponse({
					type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: "New Game Started",
						components: [
							{
								type: dsi.MessageComponentTypes.ACTION_ROW,
								components: [
									{
										type: 2,
										style: 1,
										label: "Join Game",
										custom_id: "join_game",
									},
									{
										type: 2,
										style: 2,
										label: "Start Game",
										custom_id: "start_game",
									},
								],
							},
						],
					},
				});
			}
			default:
				return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
		}
	}

	if (interaction.type === dsi.InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
		// Autocomplete interactions will come as `APPLICATION_COMMAND_AUTOCOMPLETE`.
		// console.log("Autocomplete", interaction.data);
		const searcher = interaction.data.options.filter((option) => option.focused)[0].name;
		switch (searcher) {
			case command.CARD_COMMAND.options[0].name: {
				const names = await getAutoCompleteNames(interaction.data?.options[0]?.value);
				return new JsonResponse({
					type: dsi.InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
					data: {
						choices: names.map((name) => ({
							name,
							value: name,
						})),
					},
				});
			}
			case command.CARD_COMMAND.options[1].name: {
				const { sets: mtgset } = await getAutoCompleteSets(interaction.data?.options[0]?.value);
				const filteredSet = mtgset.filter((s) => s.set.startsWith(interaction.data?.options[1]?.value));
				return new JsonResponse({
					type: dsi.InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
					data: {
						choices: filteredSet.map((s) => ({
							name: `${s.set.toUpperCase()} (${s.collector_number})`,
							value: s.set,
						})),
					},
				});
			}
		}
	}

	if (interaction.type === dsi.InteractionType.MESSAGE_COMPONENT) {
		switch (interaction.data?.custom_id) {
			case "join_game": {
				return new JsonResponse({
					type: dsi.InteractionResponseType.UPDATE_MESSAGE,
					data: {
						content: `${interaction.message.content}\n<@${interaction.member.user.id}> has joined the game`,
						components: [
							{
								type: 1,
								components: [
									{
										type: 2,
										style: 1,
										label: "Join Game",
										custom_id: "join_game",
									},
									{
										type: 2,
										style: 2,
										label: "Start Game",
										custom_id: "start_game",
									},
								],
							},
						],
					},
				});
			}
			case "start_game": {
				const players = interaction.message.content.match(/<@\d+>/g);
				console.log(players);
				return new JsonResponse({
					type: dsi.InteractionResponseType.UPDATE_MESSAGE,
					data: {
						content: `${players.map((p) => `${p} : 40\n`)}`,
						components: [
							{
								type: 1,
								components: [
									{
										type: 2,
										style: 4,
										label: "-10",
										custom_id: "sub_10",
									},
									{
										type: 2,
										style: 4,
										label: "-1",
										custom_id: "sub_1",
									},
									{
										type: 2,
										style: 3,
										label: "+1",
										custom_id: "add_1",
									},
									{
										type: 2,
										style: 3,
										label: "+10",
										custom_id: "add_10",
									},
								],
							},
						],
					},
				});
			}
			case "sub_10":
			case "sub_1":
			case "add_1":
			case "add_10":
				return new JsonResponse({
					type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: "test",
						components: [
							{
								type: 1,
								components: [
									{
										type: 2,
										style: 4,
										label: "-10",
										custom_id: "sub_10",
									},
									{
										type: 2,
										style: 4,
										label: "-1",
										custom_id: "sub_1",
									},
									{
										type: 2,
										style: 3,
										label: "+1",
										custom_id: "add_1",
									},
									{
										type: 2,
										style: 3,
										label: "+10",
										custom_id: "add_10",
									},
								],
							},
						],
					},
				});
			default:
				return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
		}
	}

	return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

/**
 * Asynchronously verifies a Discord request.
 *
 * @param {Object} request - the request object
 * @param {Object} env - the environment object
 * @return {Object} an object containing the result of the verification
 */
async function verifyDiscordRequest(request, env) {
	const signature = request.headers.get("x-signature-ed25519");
	const timestamp = request.headers.get("x-signature-timestamp");
	const body = await request.text();
	const isValidRequest = signature && timestamp && dsi.verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
	if (!isValidRequest) {
		return { isValid: false };
	}

	return { interaction: JSON.parse(body), isValid: true };
}

const server = {
	verifyDiscordRequest,
	fetch: async function (request, env) {
		return router.handle(request, env);
	},
};

export default server;
