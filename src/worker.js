/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from "itty-router";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import * as command from "./commands.js";
import { InteractionResponseFlags } from "discord-interactions";
import { getRandomUrl, getNamedUrl, getAutoCompleteNames } from "./scryfall.js";

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
				// const cuteUrl = await getCuteUrl();
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
				const query = interaction.data?.options ? interaction?.data?.options[0]?.value : null;
				if (query) {
					const { namedUrl, externalUrl } = await getNamedUrl(query);
					if (!namedUrl) {
						return new JsonResponse({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								content: "# No cards found\nYour search didn’t match any cards.",
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
						flags: InteractionResponseFlags.EPHEMERAL,
					},
				});
			}
			default:
				return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
		}
	}

	if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
		// Autocomplete interactions will come as `APPLICATION_COMMAND_AUTOCOMPLETE`.
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

	console.error("Unknown Type");
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
