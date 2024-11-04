import JsonResponse from "../response";
import { InteractionResponseType } from "discord-interactions";
import { CARD_COMMAND } from "../commands";
import { getAutoCompleteNames, getAutoCompleteSets } from "../scryfall";
import type { DiscordInteraction } from "../types";
export default async function handleCardAutocompleteCommand(interaction: DiscordInteraction): Promise<JsonResponse> {
	const searcher: string = interaction.data.options.filter((option) => option.focused)[0].name;
	switch (searcher) {
		case CARD_COMMAND.options?.[0]?.name: {
			const names = await getAutoCompleteNames(interaction.data?.options[0]?.value);
			return new JsonResponse({
				type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
				data: {
					choices: names.map((name: string) => ({
						name,
						value: name,
					})),
				},
			});
		}
		case CARD_COMMAND.options?.[1]?.name:
			{
				const acResult = await getAutoCompleteSets(interaction.data?.options[0]?.value);
				if (acResult) {
					const { sets: mtgset } = acResult;
					const filteredSet = mtgset.filter((s) => s.set.startsWith(interaction.data?.options[1]?.value));
					return new JsonResponse({
						type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
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
}
