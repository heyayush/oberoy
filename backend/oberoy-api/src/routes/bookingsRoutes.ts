import { IEnvironment } from '../types/common';
import { ICreateBooking, IBooking } from '../types/bookings';
import { createErrorResponse, createResponse } from '../utils';
import { createBookingService, getBookingByPnrService, updateBookingService, cancelBookingService } from '../services/bookingsService';

export const handleBookingsRoutes = async (request: Request, env: IEnvironment, routePath: string, method: string): Promise<Response> => {
	// Parse path for routing
	const pathParts = routePath.split('/').filter(Boolean);

	try {
		// POST /bookings - Create new booking
		if (pathParts.length === 1 && method === 'POST') {
			try {
				const bookingData: ICreateBooking = await request.json();
				const result = await createBookingService(env, bookingData);
				return createResponse(result, result.success ? 201 : 400);
			} catch (error) {
				console.error('Error parsing booking data:', error);
				return createErrorResponse('Invalid booking data format', 400);
			}
		}

		// GET /bookings/:pnr - Get booking details
		if (pathParts.length === 2 && method === 'GET') {
			const pnr = pathParts[1];
			const result = await getBookingByPnrService(env, pnr);
			return createResponse(result, result.success ? 200 : 404);
		} // PATCH /bookings/:pnr - Update booking
		if (pathParts.length === 2 && method === 'PATCH') {
			const pnr = pathParts[1];
			try {
				const updates: Partial<IBooking> = await request.json();
				const result = await updateBookingService(env, pnr, updates);
				return createResponse(result, result.success ? 200 : 404);
			} catch (error) {
				console.error('Error parsing update data:', error);
				return createErrorResponse('Invalid update data format', 400);
			}
		}

		// DELETE /bookings/:pnr - Cancel booking
		if (pathParts.length === 2 && method === 'DELETE') {
			const pnr = pathParts[1];
			const result = await cancelBookingService(env, pnr);
			return createResponse(result, result.success ? 200 : 404);
		}

		return createErrorResponse('Not Found', 404);
	} catch (error) {
		console.error('Unhandled error in bookings routes:', error);
		return createErrorResponse('Internal Server Error', 500);
	}
};
