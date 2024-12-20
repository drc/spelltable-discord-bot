import { COMMAND_LIST } from "./commands.js";
import dotenv from "dotenv";
import process from "node:process";

/**
 * This file is meant to be run from the command line, and is not used by the
 * application server.  It's allowed to use node.js primitives, and only needs
 * to be run once.
 */
dotenv.config({ path: ".dev.vars" });

const token: string = process.env.DISCORD_TOKEN ?? "";
const applicationId: string = process.env.DISCORD_APPLICATION_ID ?? "";

if (!token) {
	throw new Error("The DISCORD_TOKEN environment variable is required.");
}
if (!applicationId) {
	throw new Error("The DISCORD_APPLICATION_ID environment variable is required.");
}

/**
 * Register all commands globally.  This can take o(minutes), so wait until
 * you're sure these are the commands you want.
 */
async function registerGlobalCommands() {
	const url: string = `https://discord.com/api/v10/applications/${applicationId}/commands`;
	await registerCommands(url);
}

/**
 * Asynchronously registers commands using the provided URL.
 *
 * @param {string} url - The URL to register the commands.
 * @return {Promise<Response>} The response from the registration request.
 */
async function registerCommands(url: string): Promise<Response> {
	const response: Response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bot ${token}`,
		},
		method: "PUT",
		body: JSON.stringify(COMMAND_LIST),
	});

	if (response.ok) {
		console.log("Registered all commands");
	} else {
		console.error("Error registering commands");
		const text = await response.text();
		console.error(text);
	}
	return response;
}

await registerGlobalCommands();
