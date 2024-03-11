export const scryfallUrl = "https://api.scryfall.com/cards/random";
export const scryfallNamedUrl = "https://api.scryfall.com/cards/named";
export const scryfallAutoCompleteUrl = "https://api.scryfall.com/cards/autocomplete";
/**
 * Reach out to the Scryfall API to get a random card.
 * @returns The url of an image of a card.
 */
export async function getRandomUrl() {
	const response = await fetch(scryfallUrl, {
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

export async function getNamedUrl(query) {
	const response = await fetch(`${scryfallNamedUrl}?exact=${query}`, {
		headers: {
			"User-Agent": "spelltable-discord-bot",
		},
	});
	if (!response.ok) {
		return null;
	}
	const data = await response.json();
	return { namedUrl: data.image_uris.large, externalUrl: data.scryfall_uri, printsSearchUri: data.prints_search_uri }; // url for a named card
}

export async function getAutoCompleteNames(query) {
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

export async function getAutoCompleteSets(query) {
	const { printsSearchUri } = await getNamedUrl(query);
	const response = await fetch(printsSearchUri, {
		headers: {
			"User-Agent": "spelltable-discord-bot",
		},
	});
	if (!response.ok) {
		return null;
	}
	const result = await response.json();
	return {
		sets: result.data.map((x) => ({
			set: x.set,
			collector_number: x.collector_number,
		})),
		cardImages: result.data.map((x) => ({
			set: x.set,
			collector_number: x.collector_number,
			url: x.image_uris.large,
			uri: x.scryfall_uri,
		})),
	};
}
