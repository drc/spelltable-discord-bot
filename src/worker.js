/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from "itty-router";
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
	InteractionResponseFlags,
	MessageComponentTypes,
	ButtonStyleTypes,
} from "discord-interactions";
import * as command from "./commands.js";
import { getRandomUrl, getNamedUrl, getAutoCompleteNames, getAutoCompleteSets } from "./scryfall.js";

class JsonResponse extends Response {
	/**
	 * Constructor for initializing the class with the given body and optional init object.
	 *
	 * @param {Object} body - The body to be converted to JSON and sent in the request.
	 * @param {Object} init - (Optional) The initialization object including headers and other configurations.
	 */
	constructor(body, init) {
		const jsonBody = JSON.stringify(body);
		let localInit = init || {
			headers: {
				"content-type": "application/json;charset=UTF-8",
			},
		};
		super(jsonBody, localInit);
	}
}

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get("/", (_, env) => {
	return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post("/", async (request, env) => {
	const { isValid, interaction } = await server.verifyDiscordRequest(request, env);
	if (!isValid || !interaction) {
		return new Response("Bad request signature.", { status: 401 });
	}

	if (interaction.type === InteractionType.PING) {
		// The `PING` message is used during the initial webhook handshake, and is
		// required to configure the webhook in the developer portal.
		return new JsonResponse({
			type: InteractionResponseType.PONG,
		});
	}

	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		// Most user commands will come as `APPLICATION_COMMAND`.
		switch (interaction.data.name.toLowerCase()) {
			case command.HAD_IT_COMMAND.name.toLowerCase(): {
				return new JsonResponse({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: "https://i.pinimg.com/736x/f2/c0/1a/f2c01a4cc18f18b16f4adb71e1835314.jpg",
						flags: InteractionResponseFlags.EPHEMERAL,
					},
				});
			}
			case command.INVITE_COMMAND.name.toLowerCase(): {
				const applicationId = env.DISCORD_APPLICATION_ID;
				const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
				return new JsonResponse({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: INVITE_URL,
						flags: InteractionResponseFlags.EPHEMERAL,
					},
				});
			}
			case command.CARD_COMMAND.name.toLowerCase(): {
				const cardName = interaction.data?.options ? interaction?.data?.options[0]?.value : null;
				const set = interaction.data?.options ? interaction?.data?.options[1]?.value : null;
				if (set) {
					const { cardImages } = await getAutoCompleteSets(cardName);
					const card = cardImages.filter((card) => card.set === set);
					if (card.length > 0) {
						const { url, uri } = card[0];
						return new JsonResponse({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								content: url,
								components: [
									{
										type: MessageComponentTypes.ACTION_ROW,
										components: [
											{
												type: MessageComponentTypes.BUTTON,
												style: ButtonStyleTypes.LINK,
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
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								content: "# No cards found\nYour search didn't match any cards.",
							},
						});
					}
					return new JsonResponse({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: namedUrl,
							components: [
								{
									type: 1,
									components: [
										{
											type: 2,
											style: 5,
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
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: randomUrl,
					},
				});
			}
			case command.NEW_GAME_COMMAND.name.toLowerCase(): {
				// generate a new game object and send it back
				return new JsonResponse({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: "New Game Started",
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
			default:
				return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
		}
	}

	if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
		// Autocomplete interactions will come as `APPLICATION_COMMAND_AUTOCOMPLETE`.
		// console.log("Autocomplete", interaction.data);
		const searcher = interaction.data.options.filter((option) => option.focused)[0].name;
		switch (searcher) {
			case command.CARD_COMMAND.options[0].name: {
				const names = await getAutoCompleteNames(interaction.data?.options[0]?.value);
				return new JsonResponse({
					type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
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
					type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
					data: {
						choices: filteredSet.map((set) => ({
							name: `${set.set.toUpperCase()} (${set.collector_number})`,
							value: set.set,
						})),
					},
				});
			}
		}
	}

	if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
		console.log(interaction.data?.custom_id);
		switch (interaction.data?.custom_id) {
			case "join_game": {
				return new JsonResponse({
					type: InteractionResponseType.UPDATE_MESSAGE,
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
					type: InteractionResponseType.UPDATE_MESSAGE,
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
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
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
	const isValidRequest = signature && timestamp && verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
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
