import * as command from "./commands.js";
import * as dsi from "discord-interactions";
import JsonResponse from "./response.ts";
import handleHadItCommand from "./commands/hadItCommand.ts";
import handleInviteCommand from "./commands/inviteCommand.ts";

export const handleApplicationCommand = (interaction, env): Response => {
	const { name: commandName } = interaction.data;
	switch (commandName.toLowerCase()) {
		case command.HAD_IT_COMMAND.name.toLowerCase(): {
			return handleHadItCommand();
		}
		// commands for inviting
		case command.INVITE_COMMAND.name.toLowerCase(): {
			return handleInviteCommand(env);
		}
	}
	return new Response("Command not found", { status: 404 });
};
