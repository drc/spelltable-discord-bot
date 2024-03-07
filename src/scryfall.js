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

export const scryfallUrl = "https://api.scryfall.com/cards/random";
