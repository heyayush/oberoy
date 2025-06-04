import { IEnvironment } from './types/common';
import { BASE } from './CONFIG';
import { createErrorResponse } from './utils';
import { handleOptionsRequest, addCORSHeaders } from './utils/cors';
import { handleRoomTypesRoutes } from './routes/roomTypesRoutes';
import { handleBookingsRoutes } from './routes/bookingsRoutes';
import { handleAddonsRoutes } from './routes/addonsRoutes';
import { handleContactRoutes } from './routes/contactRoutes';

export default {
	async fetch(request: Request, env: IEnvironment): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname;
		const method = request.method;

		// Handle OPTIONS preflight requests for all paths
		if (method === 'OPTIONS') {
			return handleOptionsRequest(request, env);
		}

		let response: Response;

		// Check if request starts with BASE path
		if (!pathname.startsWith(BASE)) {
			response = createErrorResponse('Not Found', 404);
		} else {
			// Remove BASE from pathname for routing
			const routePath = pathname.substring(BASE.length);
			const pathParts = routePath.split('/').filter(Boolean);

			if (pathParts.length === 0) {
				response = createErrorResponse('Not Found', 404);
			} else {
				try {
					// Route to appropriate handler based on first path segment
					switch (pathParts[0]) {
						case 'room-types':
							response = await handleRoomTypesRoutes(request, env, routePath, method);
							break;

						case 'bookings':
							response = await handleBookingsRoutes(request, env, routePath, method);
							break;

						case 'addons':
							response = await handleAddonsRoutes(request, env, routePath, method);
							break;

						case 'contact':
							response = await handleContactRoutes(request, routePath, method);
							break;

						default:
							response = createErrorResponse('Not Found', 404);
							break;
					}
				} catch (error) {
					console.error('Unhandled error:', error);
					response = createErrorResponse('Internal Server Error', 500);
				}
			}
		}

		// Apply CORS headers to all responses
		return addCORSHeaders(request, response, env);
	},
} satisfies ExportedHandler<IEnvironment>;
