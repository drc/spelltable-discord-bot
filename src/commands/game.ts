import {
	ButtonStyleTypes,
	InteractionResponseType,
	MessageComponentTypes,
} from "discord-interactions";
import JsonResponse from "../response";

// return response for new game
export default function handleGameCommand(): JsonResponse {
	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: "New Game Started",
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
