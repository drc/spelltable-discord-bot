export interface DiscordInteraction {
	app_permissions: string;
	application_id: string;
	authorizing_integration_owners: {
		[key: string]: string;
	};
	channel: {
		flags: number;
		guild_id: string;
		id: string;
		last_message_id: string;
		name: string;
		nsfw: boolean;
		parent_id: string;
		permissions: string;
		position: number;
		rate_limit_per_user: number;
		topic: null | string;
		type: number;
	};
	channel_id: string;
	context: number;
	data: {
		id: string;
		name: string;
		options: Array<{
			focused: boolean;
			name: string;
			type: number;
			value: string;
		}>;
		type: number;
		custom_id: string;
	};
	entitlement_sku_ids: string[];
	entitlements: any[];
	guild: {
		features: string[];
		id: string;
		locale: string;
	};
	guild_id: string;
	guild_locale: string;
	id: string;
	locale: string;
	message: {
		content: string | null;
	};
	member: {
		avatar: string | null;
		banner: string | null;
		communication_disabled_until: string | null;
		deaf: boolean;
		flags: number;
		joined_at: string;
		mute: boolean;
		nick: string | null;
		pending: boolean;
		permissions: string;
		premium_since: string | null;
		roles: string[];
		unusual_dm_activity_until: string | null;
		user: {
			avatar: string;
			avatar_decoration_data: null | any;
			clan: null | string;
			discriminator: string;
			global_name: string;
			id: string;
			public_flags: number;
			username: string;
		};
	};
	token: string;
	type: number;
	version: number;
}

import type { KVNamespace } from '@cloudflare/workers-types';

export interface Env {
	"spelltable-spelltable": KVNamespace;
	DISCORD_TOKEN: string;
	DISCORD_APPLICATION_ID: string;
	DISCORD_PUBLIC_KEY: string;
	DISCORD_TEST_GUILD_ID: string;
	client_id: string;
	client_secret: string;
	PRINTER_ENABLED: string;
}
