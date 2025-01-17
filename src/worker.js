/**
 * The core server that runs on a Cloudflare worker.
 */
import { Router } from "itty-router";
import { InteractionType, verifyKey, InteractionResponseType } from "discord-interactions";
import { handleApplicationCommand, handleApplicationAutoComplete, handleMessageCommand } from "./interactions.js";
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

router.get("/:user", async (request, env) => {
	const headers = { "Content-Type": "image/jpeg", "Cache-Control": "no-cache" };
	const user = request.params.user;
	const card = await env["spelltable-spelltable"].get(user);
	if (!card) {
		const card_back_request = await fetch("https://gamepedia.cursecdn.com/mtgsalvation_gamepedia/f/f8/Magic_card_back.jpg");
		const card_back_blob = await card_back_request.blob();
		return new Response(card_back_blob, { headers });
	}
	const card_image_request = await fetch(card);
	const card_image_data = await card_image_request.blob();
	return new Response(card_image_data, { headers });
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
			return await handleMessageCommand(interaction, env);
		default:
			return new Response("Unsupported interaction type.", { status: 400 });
	}
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
