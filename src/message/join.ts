import { InteractionResponseType, MessageComponentTypes, ButtonStyleTypes } from "discord-interactions";
import JsonResponse from "../response";
import { DiscordInteraction } from "../types";

export default function handleJoinMessage(interaction: DiscordInteraction): JsonResponse {
	return new JsonResponse({
		type: InteractionResponseType.UPDATE_MESSAGE,
		data: {
			content: `${interaction.message.content}\n<@${interaction.member.user.id}> has joined the game`,
			components: [
				{
					type: MessageComponentTypes.ACTION_ROW,
					components: [
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.PRIMARY,
							label: "Join Game",
							custom_id: "join_game",
						},
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.SECONDARY,
							label: "Start Game",
							custom_id: "start_game",
						},
					],
				},
			],
		},
	});
}
