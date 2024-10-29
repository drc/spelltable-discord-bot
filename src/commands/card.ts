import JsonResponse from "../response";
import * as dsi from "discord-interactions";
import * as scry from "./../scryfall.js";

export default async function handleCardCommand(interaction): Promise<JsonResponse> {
	const set = interaction?.data?.options[1]?.value ?? null;
	const cardName = interaction?.data?.options[0]?.value ?? null;
	if (set) {
		handleSetCondition(set, cardName);
	}

	if (cardName) {
		handleJustTheCardName(cardName);
	}

	const randomUrl = await scry.getRandomUrl();
	return new JsonResponse({
		type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: randomUrl,
		},
	});
}

async function handleJustTheCardName(cardName) {
	const result = await scry.getNamedUrl(cardName);
	if (result) {
		const { namedUrl, externalUrl } = result;
		console.log(namedUrl, externalUrl);
		if (!namedUrl) {
			return new JsonResponse({
				type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: "# No cards found\nYour search didn't match any cards.",
				},
			});
		}
		return new JsonResponse({
			type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: namedUrl,
				components: [
					{
						type: dsi.MessageComponentTypes.ACTION_ROW,
						components: [
							{
								type: dsi.MessageComponentTypes.BUTTON,
								style: dsi.ButtonStyleTypes.LINK,
								label: "View on Scryfall",
								url: externalUrl,
							},
						],
					},
				],
			},
		});
	}
}

async function handleSetCondition(set, cardName) {
	const result = await scry.getAutoCompleteSets(cardName);
	if (result) {
		const { cardImages } = result;
		const card = cardImages.filter((card) => card.set === set);
		if (card.length > 0) {
			const { url, uri } = card[0];
			return new JsonResponse({
				type: dsi.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: url,
					components: [
						{
							type: dsi.MessageComponentTypes.ACTION_ROW,
							components: [
								{
									type: dsi.MessageComponentTypes.BUTTON,
									style: dsi.ButtonStyleTypes.LINK,
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
}
