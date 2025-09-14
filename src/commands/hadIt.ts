import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import JsonResponse from "../response";

export default function handleHadItCommand(): JsonResponse {
	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content:
				"https://i.pinimg.com/736x/f2/c0/1a/f2c01a4cc18f18b16f4adb71e1835314.jpg",
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
}
