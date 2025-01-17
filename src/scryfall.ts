export const scryfallUrl: string = "https://api.scryfall.com/cards/random";
export const scryfallNamedUrl: string = "https://api.scryfall.com/cards/named";
export const scryfallAutoCompleteUrl: string = "https://api.scryfall.com/cards/autocomplete";
/**
 * Reach out to the Scryfall API to get a random card.
 * @returns The url of an image of a card.
 */
export async function getRandomUrl(): Promise<string> {
	const response: Response = await fetch(scryfallUrl, {
		headers: {
			"User-Agent": "spelltable-discord-bot",
		},
	});
	if (!response.ok) {
		let errorText = `Error fetching ${response.url}: ${response.status} ${response.statusText}`;
		try {
			const error = await response.text();
			if (error) {
				errorText = `${errorText} \n\n ${error}`;
			}
		} catch {
			// ignore
		}
		throw new Error(errorText);
	}
	const data = await response.json();
	return data.image_uris.large; // url for a random card
}

interface CardResponse {
	card_faces: Array<{ image_uris: { large: string } }>;
	scryfall_uri: string;
	prints_search_uri: string;
	image_uris: { large: string; normal: string; small: string } | null;
	layout: string;
}

export async function getNamedUrl(query: string) {
	const response: Response = await fetch(`${scryfallNamedUrl}?exact=${query}`, {
		headers: {
			"User-Agent": "spelltable-discord-bot",
		},
	});
	if (!response.ok) {
		return null;
	}
	const data: CardResponse = await response.json();
	if (data.card_faces?.every((face) => face.image_uris)) {
		return {
			namedUrl: [data.card_faces[0].image_uris?.large, data.card_faces[1].image_uris?.large].join(" "),
			externalUrl: data.scryfall_uri,
			printsSearchUri: data.prints_search_uri,
		};
	}
	return {
		namedUrl: data.image_uris?.large || data.image_uris?.normal || data.image_uris?.small,
		externalUrl: data.scryfall_uri,
		printsSearchUri: data.prints_search_uri,
	}; // url for a named card
}

export async function getAutoCompleteNames(query: string) {
	const response = await fetch(`${scryfallAutoCompleteUrl}?q=${query}`, {
		headers: {
			"User-Agent": "spelltable-discord-bot",
		},
	});
	if (!response.ok) {
		return null;
	}
	const result = await response.json();
	return result.data;
}

interface SetResponse {
	data: Array<{
		set: string;
		collector_number: string;
		image_uris: { large: string; normal: string; small: string } | null;
		scryfall_uri: string;
	}>;
}
export async function getAutoCompleteSets(query: string) {
	const namedObj = await getNamedUrl(query);
	if (!namedObj) {
		return null;
	}
	const { printsSearchUri } = namedObj;
	const response = await fetch(printsSearchUri, {
		headers: {
			"User-Agent": "spelltable-discord-bot",
		},
	});
	if (!response.ok) {
		return null;
	}
	const result: SetResponse = await response.json();
	return {
		sets: result.data.map((x) => ({
			set: x.set,
			collector_number: x.collector_number,
		})),
		cardImages: result.data.map((x) => ({
			set: x.set,
			collector_number: x.collector_number,
			url: (x.image_uris?.large || x.image_uris?.normal || x.image_uris?.small) ?? "",
			uri: x.scryfall_uri,
		})),
	};
}
