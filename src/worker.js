/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from "itty-router";
import { InteractionType, verifyKey } from "discord-interactions";
import {handleApplicationCommand, handleApplicationAutoComplete}  from "./interactions.js";
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
		case InteractionType.PING: {
			// The `PING` message is used during the initial webhook handshake, and is
			// required to configure the webhook in the developer portal.
			return new JsonResponse({
				type: InteractionResponseType.PONG,
			});
		}
		case InteractionType.APPLICATION_COMMAND:
			return await handleApplicationCommand(interaction, env);
		case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
			return await handleApplicationAutoComplete(interaction, env);
		case InteractionType.MESSAGE_COMPONENT:
		default:
			return new Response("Unsupported interaction type.", { status: 400 });
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
