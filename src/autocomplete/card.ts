import JsonResponse from "../response";
import * as dsi from "discord-interactions";
export  default async function  handleCardAutocompleteCommand(interaction): Promise<JsonResponse> {
	return new JsonResponse({
		type: dsi.InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
		data: {
			choices: [],
		},
	});
}
