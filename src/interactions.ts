import * as command from "./commands.js";
import { handleHadItCommand, handleInviteCommand, handleCardCommand, handleNewGameCommand } from "./commands/commands.js";
import { handleCardAutocompleteCommand } from "./autocomplete/commands.js";
import JsonResponse from "./response.js";
import * as dsi from "discord-interactions";
import * as scry from "./scryfall.js";

export const handleApplicationCommand = async (interaction, env): Promise<Response> => {
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

export const handleApplicationAutoComplete = async (interaction): Promise<Response> => {
	const { name: autoCompleteCommand } = interaction.data;
	switch (autoCompleteCommand) {
		case command.CARD_COMMAND.name: {
			return await handleCardAutocompleteCommand(interaction);
		}
	}

	return new Response("Command not found", { status: 404 });
};
