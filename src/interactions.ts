import * as command from "./commands.js";
import { handleHadItCommand, handleInviteCommand, handleCardCommand, handleNewGameCommand } from "./commands/commands.js";
import { handleCardAutocompleteCommand } from "./autocomplete/commands.js";
import { handleJoinMessage, handleLifeCounter, handleStartMessage } from "./message/commands.js";
import JsonResponse from "./response.js";
import type { DiscordInteraction, Environment } from "./types.js";

/**
 * Handles incoming application commands and routes them to the appropriate handler.
 *
 * @param {DiscordInteraction} interaction - The interaction object containing the command data.
 * @param {Object} env - The environment object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object.
 *
 * This function handles commands such as "hadit", "invite", "card", and "newgame",
 * routing them to their corresponding handlers. If the command is not recognized,
 * it responds with a "Command not found" message.
 */
export const handleApplicationCommand = async (interaction: DiscordInteraction, env: Environment): Promise<Response> => {
	const { name: commandName } = interaction.data;
	switch (commandName.toLowerCase()) {
		case command.HAD_IT_COMMAND.name.toLowerCase(): {
			return handleHadItCommand();
		}
		// commands for inviting
		case command.INVITE_COMMAND.name.toLowerCase(): {
			return handleInviteCommand(env);
		}
		case command.CARD_COMMAND.name.toLowerCase(): {
			return await handleCardCommand(interaction);
		}
		// commands for starting a game
		case command.NEW_GAME_COMMAND.name.toLowerCase(): {
			return handleNewGameCommand();
		}
	}
	return new Response("Command not found", { status: 404 });
};

/**
 * Handles incoming autocomplete commands and routes them to the appropriate handler.
 *
 * @param {DiscordInteraction} interaction - The interaction object containing the autocomplete command data.
 * @returns {Promise<Response>} - A promise that resolves to a Response object.
 *
 * This function handles autocomplete commands such as "card", and routes them to
 * their corresponding handlers. If the command is not recognized, it responds with
 * a "Command not found" message.
 */
export const handleApplicationAutoComplete = async (interaction: DiscordInteraction): Promise<Response> => {
	const { name: autoCompleteCommand } = interaction.data;
	switch (autoCompleteCommand) {
		case command.CARD_COMMAND.name: {
			return await handleCardAutocompleteCommand(interaction);
		}
	}

	return new Response("Command not found", { status: 404 });
};

/**
 * Handles incoming message commands and routes them to the appropriate handler.
 *
 * @param {DiscordInteraction} interaction - The interaction object containing the message command data.
 * @returns {Promise<Response>} - A promise that resolves to a Response object.
 *
 * This function handles message commands such as "join_game", "start_game", and
 * the 4 life counter commands, routing them to their corresponding handlers. If
 * the command is not recognized, it responds with an "Unknown Type" message.
 */
export const handleMessageCommand = async (interaction: DiscordInteraction): Promise<Response> => {
	switch (interaction.data?.custom_id) {
		case "join_game": {
			return handleJoinMessage(interaction);
		}
		case "start_game": {
			return handleStartMessage(interaction);
		}
		case "sub_10":
		case "sub_1":
		case "add_1":
		case "add_10":
			return handleLifeCounter(interaction);
		default:
			return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
	}
};
