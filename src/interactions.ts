import * as command from "./commands.js";
import handleHadItCommand from "./commands/hadIt.ts";
import handleInviteCommand from "./commands/invite.ts";
import handleCardCommand from "./commands/card.ts";
import handleNewGameCommand from "./commands/game.ts";

export const handleApplicationCommand = async (interaction, env): Promise<Response> => {
	const { name: commandName } = interaction.data;
	switch (commandName.toLowerCase()) {
		case command.HAD_IT_COMMAND.name.toLowerCase(): {
			return handleHadItCommand();
		}
		// commands for inviting
		case command.INVITE_COMMAND.name.toLowerCase(): {
			return handleInviteCommand(env);
		}
		case command.CARD_COMMAND.name.toLowerCase(): {
			return await handleCardCommand(interaction);
		}
		// commands for starting a game
		case command.NEW_GAME_COMMAND.name.toLowerCase(): {
			return handleNewGameCommand();
		}
	}
	return new Response("Command not found", { status: 404 });
};
