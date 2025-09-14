import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";

import JsonResponse from "../response";
import type { Env } from "../types";

export default function handleInviteCommand(env: Env): JsonResponse {
	const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION_ID}&scope=applications.commands`;
	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: INVITE_URL,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	});
}
