import JsonResponse from "../response";
import { InteractionResponseType, InteractionResponseFlags } from "discord-interactions";
import { Environment } from "../types";

export default function handleInviteCommand(env: Environment): JsonResponse {
	const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION_ID}&scope=applications.commands`;
	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: INVITE_URL,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
}
