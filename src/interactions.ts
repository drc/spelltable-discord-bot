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

export const handleApplicationAutoComplete = async (interaction, env): Promise<Response> => {
	console.log("Autocomplete", interaction.data);
	// Autocomplete interactions will come as `APPLICATION_COMMAND_AUTOCOMPLETE`.
	// console.log("Autocomplete", interaction.data);
	const { name: autoCompleteCommand } = interaction.data;
	switch (autoCompleteCommand) {
		case command.CARD_COMMAND.name: {
			return await handleCardAutocompleteCommand(interaction);
		}
	}
	const searcher = interaction.data.options.filter((option) => option.focused)[0].name;
	switch (searcher) {
		case command.CARD_COMMAND.options?.[0]?.name: {
			const names = await scry.getAutoCompleteNames(interaction.data?.options[0]?.value);
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
		case command.CARD_COMMAND.options?.[1]?.name:
			{
				const acResult = await scry.getAutoCompleteSets(interaction.data?.options[0]?.value);
				if (acResult) {
					const { sets: mtgset } = acResult;
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
			return new Response("Command not found", { status: 404 });
	}
	return new Response("Command not found", { status: 404 });
};
