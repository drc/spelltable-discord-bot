import JsonResponse from "../response";
import { ButtonStyleTypes, InteractionResponseType, MessageComponentTypes } from "discord-interactions";

/**
 * Handles the life counter interaction by sending a message with buttons
 * to adjust life totals.
 *
 * @param {Object} interaction - The interaction object containing the message command data.
 * @returns {JsonResponse} - A JsonResponse containing the message data with interactive components.
 *
 * This function creates a message with buttons labeled "-10", "-1", "+1", and "+10"
 * that allow users to decrease or increase life totals during a game. The interaction
 * is sent as a CHANNEL_MESSAGE_WITH_SOURCE response type.
 */
export default function handleLifeCounter(interaction): JsonResponse {
	return new JsonResponse({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: "test",
			components: [
				{
					type: MessageComponentTypes.ACTION_ROW,
					components: [
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.DANGER,
							label: "-10",
							custom_id: "sub_10",
						},
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.DANGER,
							label: "-1",
							custom_id: "sub_1",
						},
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.SUCCESS,
							label: "+1",
							custom_id: "add_1",
						},
						{
							type: MessageComponentTypes.BUTTON,
							style: ButtonStyleTypes.SUCCESS,
							label: "+10",
							custom_id: "add_10",
						},
					],
				},
			],
		},
	});
}
