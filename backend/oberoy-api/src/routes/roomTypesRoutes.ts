import { IEnvironment } from '../types/common';
import { createErrorResponse, createResponse, parseQueryParams } from '../utils';
import {
	getRoomTypesService,
	getRoomTypeByIdService,
	getRoomTypeImagesService,
	checkAvailabilityService,
	getRoomPricingService,
} from '../services/roomTypesService';

export const handleRoomTypesRoutes = async (request: Request, env: IEnvironment, routePath: string, method: string): Promise<Response> => {
	// Parse URL and path for more targeted routing
	const url = new URL(request.url);
	const pathParts = routePath.split('/').filter(Boolean);
	const params = parseQueryParams(url);

	// /room-types
	if (pathParts.length === 1 && method === 'GET') {
		const result = await getRoomTypesService(env, params.offset, params.limit);
		return createResponse(result, 200);
	}

	// /room-types/availability
	if (pathParts.length === 2 && pathParts[1] === 'availability' && method === 'GET') {
		const checkIn = params.check_in;
		const checkOut = params.check_out;
		const adults = params.adults;
		const children = params.children;

		if (!checkIn || !checkOut) {
			return createErrorResponse('Check-in and check-out dates are required', 400);
		}

		const result = await checkAvailabilityService(env, checkIn, checkOut, adults, children);
		return createResponse(result, 200);
	}

	// /room-types/pricing
	if (pathParts.length === 2 && pathParts[1] === 'pricing' && method === 'GET') {
		const roomTypeId = params.room_type_id;
		const checkIn = params.check_in;
		const checkOut = params.check_out;
		const adults = params.adults;
		const children = params.children;

		if (!roomTypeId || !checkIn || !checkOut) {
			return createErrorResponse('Room type ID, check-in, and check-out dates are required', 400);
		}

		const result = await getRoomPricingService(env, roomTypeId, checkIn, checkOut, adults, children);
		return createResponse(result, 200);
	}

	// /room-types/:id/images
	if (pathParts.length === 3 && pathParts[2] === 'images' && method === 'GET') {
		const id = parseInt(pathParts[1], 10);

		if (isNaN(id) || id <= 0) {
			return createErrorResponse('Invalid room type ID', 400);
		}

		const result = await getRoomTypeImagesService(env, id);
		return createResponse(result, 200);
	}

	// /room-types/:id
	if (pathParts.length === 2 && method === 'GET') {
		const id = parseInt(pathParts[1], 10);

		if (isNaN(id) || id <= 0) {
			return createErrorResponse('Invalid room type ID', 400);
		}

		const result = await getRoomTypeByIdService(env, id);
		return createResponse(result, 200);
	}

	return createErrorResponse('Not Found', 404);
};
