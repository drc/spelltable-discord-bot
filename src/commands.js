export const HAD_IT_COMMAND = {
	name: "hadit",
	description: "When you've just about had it.",
};

export const CARD_COMMAND = {
	name: "card",
	description: "Search for a card image.",
	options: [
		{
			type: 3,
			name: "name",
			description: "The name of the card",
			required: true,
			autocomplete: true,
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

export const COMMAND_LIST = [HAD_IT_COMMAND, CARD_COMMAND, INVITE_COMMAND, NEW_GAME_COMMAND];
