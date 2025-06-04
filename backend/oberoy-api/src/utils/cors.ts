import { ALLOWED_ORIGINS, ALLOWED_METHODS, ALLOWED_HEADERS, MAX_AGE_SECONDS } from '../CONFIG';

/**
 * Handle CORS preflight OPTIONS requests
 * @param request The incoming request object
 * @param env Environment variables that may contain CORS configuration
 * @returns A Response configured for OPTIONS preflight request
 */
export const handleOptionsRequest = (request: Request, env?: any): Response => {
	const headers = new Headers();
	const origin = request.headers.get('Origin');
	const allowedOrigins = env?.ALLOWED_ORIGINS?.split(',') || ALLOWED_ORIGINS;

	if (origin && (allowedOrigins.includes(origin) || allowedOrigins.length === 0)) {
		headers.set('Access-Control-Allow-Origin', origin);
		headers.set('Vary', 'Origin'); // Indicate that the response varies based on the Origin header
	} else if (allowedOrigins.includes('*')) {
		headers.set('Access-Control-Allow-Origin', '*');
	}

	headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
	headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
	headers.set('Access-Control-Max-Age', MAX_AGE_SECONDS.toString());

	return new Response(null, { status: 204, headers }); // No content for OPTIONS
};

/**
 * Adds CORS headers to any Response object
 * @param request The incoming request object
 * @param response The response object to add headers to
 * @param env Environment variables that may contain CORS configuration
 * @returns A new Response with appropriate CORS headers
 */
export const addCORSHeaders = (request: Request, response: Response, env?: any): Response => {
	const newResponse = new Response(response.body, response);
	const origin = request.headers.get('Origin');
	const allowedOrigins = env?.ALLOWED_ORIGINS?.split(',') || ALLOWED_ORIGINS;

	if (origin && (allowedOrigins.includes(origin) || allowedOrigins.length === 0)) {
		newResponse.headers.set('Access-Control-Allow-Origin', origin);
		newResponse.headers.set('Vary', 'Origin');
	} else if (allowedOrigins.includes('*')) {
		newResponse.headers.set('Access-Control-Allow-Origin', '*');
	}

	return newResponse;
};
