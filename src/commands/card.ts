import JsonResponse from "../response";
import { InteractionResponseType, MessageComponentTypes, ButtonStyleTypes } from "discord-interactions";
import { getRandomUrl, getNamedUrl, getAutoCompleteSets } from "./../scryfall.js";
import type { DiscordInteraction, Env } from "../types.js";

export default async function handleCardCommand(interaction: DiscordInteraction, env: Env): Promise<JsonResponse> {
	const set: string = interaction?.data?.options[1]?.value ?? "";
	const cardName: string = interaction?.data?.options[0]?.value ?? "";
	const userID: string = interaction?.member?.user?.username ?? "card";

	if (set) {
		return await handleSetCondition(set, cardName, userID, env);
	}

	if (cardName) {
		return await handleJustTheCardName(cardName, userID, env);
	}

	const randomUrl = await getRandomUrl();
	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: randomUrl,
		},
	});
}

async function handleJustTheCardName(cardName: string, userID: string, env: Env): Promise<Response> {
	const result = await getNamedUrl(cardName);
	if (result) {
		const { namedUrl, externalUrl } = result;
		if (!namedUrl) {
			return new JsonResponse({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: "# No cards found\nYour search didn't match any cards.",
				},
			});
		}
		// put the searched card in user's KV
		await env["spelltable-spelltable"].put(userID, namedUrl);
		return new JsonResponse({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: namedUrl,
				components: [
					{
						type: MessageComponentTypes.ACTION_ROW,
						components: [
							{
								type: MessageComponentTypes.BUTTON,
								style: ButtonStyleTypes.LINK,
								label: "View on Scryfall",
								url: externalUrl,
							},
						],
					},
				],
			},
		});
	}
	return new Response("Card not found", { status: 404 });
}

async function handleSetCondition(set: string, cardName: string, userID: string, env: Env): Promise<Response> {
	const result = await getAutoCompleteSets(cardName);
	if (result) {
		const { cardImages } = result;
		const card = cardImages.filter((card) => card.set === set);
		if (card.length > 0) {
			const { url, uri } = card[0];
			await env["spelltable-spelltable"].put(userID, url, { expirationTtl: 60 * 60 });
			return new JsonResponse({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: url,
					components: [
						{
							type: MessageComponentTypes.ACTION_ROW,
							components: [
								{
									type: MessageComponentTypes.BUTTON,
									style: ButtonStyleTypes.LINK,
									label: "View on Scryfall",
									url: uri,
								},
							],
						},
					],
				},
			});
		}
	}
	return new Response("Set not found", { status: 404 });
}
