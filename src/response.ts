/**
 * Class for creating a JSON response.
 *
 * @extends {Response}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
 */
export default class JsonResponse extends Response {
	/**
	 * Constructor for initializing the class with the given body and optional init object.
	 *
	 * @param {Object} body - The body to be converted to JSON and sent in the request.
	 * @param {Object} init - (Optional) The initialization object including headers and other configurations.
	 */
	constructor(body: Object, init?: ResponseInit) {
		const jsonBody = JSON.stringify(body);
		let localInit = init || {
			headers: {
				"content-type": "application/json;charset=UTF-8",
			},
		};
		super(jsonBody, localInit);
	}
}
