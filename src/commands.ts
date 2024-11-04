interface Command {
	name: string;
	description: string;
	options?: Option[];
}

interface Option {
	type: number;
	name: string;
	description: string;
	required: boolean;
	autocomplete?: boolean;
}

export const HAD_IT_COMMAND: Command = {
	name: "hadit",
	description: "When you've just about had it.",
};

export const CARD_COMMAND: Command = {
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
		{
			type: 3,
			name: "set",
			description: "The set of the card",
			required: false,
			autocomplete: true,
		},
	],
};

export const NEW_GAME_COMMAND: Command = {
	name: "newgame",
	description: "Start a new game",
};

export const INVITE_COMMAND: Command = {
	name: "invite",
	description: "Get an invite link to add the bot to your server",
};

export const COMMAND_LIST = [HAD_IT_COMMAND, CARD_COMMAND, INVITE_COMMAND, NEW_GAME_COMMAND];
