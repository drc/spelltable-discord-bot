import JsonResponse from "../response";
import * as dsi from "discord-interactions";

// return response for new game
export default function handleGameCommand(): JsonResponse {
	return new JsonResponse({
		type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: "New Game Started",
			components: [
				{
					type: dsi.MessageComponentTypes.ACTION_ROW,
					components: [
						{
							type: 2,
							style: 1,
							label: "Join Game",
							custom_id: "join_game",
						},
						{
							type: 2,
							style: 2,
							label: "Start Game",
							custom_id: "start_game",
						},
					],
				},
			],
		},
	});
}
