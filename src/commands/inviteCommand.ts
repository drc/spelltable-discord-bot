import JsonResponse from "../response";
import * as dsi from "discord-interactions";

export default function handleInviteCommand(env): JsonResponse {
	const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION_ID}&scope=applications.commands`;
	return new JsonResponse({
		type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: INVITE_URL,
			flags: dsi.InteractionResponseFlags.EPHEMERAL,
		},
	});
}
