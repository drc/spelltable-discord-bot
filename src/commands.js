export const HAD_IT_COMMAND = {
	name: "hadit",
	description: "When you've just about had it.",
};

export const RANDOM_COMMAND = {
	name: "random",
	description: "Get a random card image",
	options: [
		{
			type: 3,
			name: "text",
			description: "tesing input",
		},
	],
};

export const NEW_GAME_COMMAND = {
	name: "newgame",
	description: "Start a new game",
};

export const INVITE_COMMAND = {
	name: "invite",
	description: "Get an invite link to add the bot to your server",
};

export const COMMAND_LIST = [HAD_IT_COMMAND, RANDOM_COMMAND, INVITE_COMMAND, NEW_GAME_COMMAND];
