import JsonResponse from "../response";
import { InteractionResponseType, MessageComponentTypes, ButtonStyleTypes } from "discord-interactions";
import { getRandomUrl, getNamedUrl, getAutoCompleteSets } from "./../scryfall.js";

export default async function handleCardCommand(interaction): Promise<JsonResponse> {
	const set: string = interaction?.data?.options[1]?.value ?? "";
	const cardName: string = interaction?.data?.options[0]?.value ?? "";
	if (set) {
		// break early with the custom card
		return await handleSetCondition(set, cardName);
	}

	if (cardName) {
		return await handleJustTheCardName(cardName);
	}

	const randomUrl = await getRandomUrl();
	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: randomUrl,
		},
	});
}

async function handleJustTheCardName(cardName: string): Promise<Response> {
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

async function handleSetCondition(set: string, cardName: string): Promise<Response> {
	const result = await getAutoCompleteSets(cardName);
	if (result) {
		const { cardImages } = result;
		const card = cardImages.filter((card) => card.set === set);
		if (card.length > 0) {
			const { url, uri } = card[0];
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
