import JsonResponse from "../response";
import { ButtonStyleTypes, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { DiscordInteraction } from "../types";

export default function handleStartMessage(interaction: DiscordInteraction): JsonResponse {
	const players = interaction.message.content?.match(/<@\d+>/g) ?? [];
	return new JsonResponse({
		type: InteractionResponseType.UPDATE_MESSAGE,
		data: {
			content: `${players?.map((p: string) => `${p} : 40\n`)}`,
			components: [
				{
					type: MessageComponentTypes.ACTION_ROW,
					components: [
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.DANGER,
							label: "-10",
							custom_id: "sub_10",
						},
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.DANGER,
							label: "-1",
							custom_id: "sub_1",
						},
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.SUCCESS,
							label: "+1",
							custom_id: "add_1",
						},
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.SUCCESS,
							label: "+10",
							custom_id: "add_10",
						},
					],
				},
			],
		},
	});
}
