import { IEnvironment } from '../types/common';
import { createErrorResponse, createResponse, parseQueryParams } from '../utils';
import { getAddonsService } from '../services/addonsService';

export const handleAddonsRoutes = async (request: Request, env: IEnvironment, routePath: string, method: string): Promise<Response> => {
	// Parse URL and path for more targeted routing
	const url = new URL(request.url);
	const pathParts = routePath.split('/').filter(Boolean);
	const params = parseQueryParams(url);

	// /addons
	if (pathParts.length === 1 && method === 'GET') {
		const result = await getAddonsService(env, params.offset, params.limit);
		return createResponse(result, 200);
	}

	return createErrorResponse('Not Found', 404);
};
