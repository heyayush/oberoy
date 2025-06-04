import { IEnvironment, IApiResponse } from '../types/common';
import { IBooking, ICreateBooking, IBookingDetails } from '../types/bookings';
import { createApiResponse, generatePNR } from '../utils';
import {
	createGuest,
	createBooking,
	addBookingAddons,
	getBookingByPnr,
	updateBooking,
	cancelBooking,
	findPnr,
	findGuestAndUpdate,
} from '../db';

export const createBookingService = async (
	env: IEnvironment,
	bookingData: ICreateBooking
): Promise<IApiResponse<{ pnr: string; booking_id: number }>> => {
	try {
		// Validate guest data
		if (!bookingData.guest?.name) {
			return createApiResponse(false, { pnr: '', booking_id: 0 }, 'Guest name is required');
		}

		// Validate booking data
		if (
			!bookingData.booking?.room_type_id ||
			!bookingData.booking?.check_in_date ||
			!bookingData.booking?.check_out_date ||
			!bookingData.booking?.adults ||
			!bookingData.booking?.total_rooms
		) {
			return createApiResponse(false, { pnr: '', booking_id: 0 }, 'Missing required booking information');
		}

		// Validate check-in/check-out dates
		const checkInDate = new Date(bookingData.booking.check_in_date);
		const checkOutDate = new Date(bookingData.booking.check_out_date);

		if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
			return createApiResponse(false, { pnr: '', booking_id: 0 }, 'Invalid date format. Please use YYYY-MM-DD format');
		}

		if (checkInDate >= checkOutDate) {
			return createApiResponse(false, { pnr: '', booking_id: 0 }, 'Check-out date must be after check-in date');
		}

		// Generate PNR and check if it already exists
		let pnr = generatePNR();
		let pnrExists = await findPnr(env, pnr);

		// Keep generating until a unique PNR is found
		while (pnrExists) {
			pnr = generatePNR();
			pnrExists = await findPnr(env, pnr);
		}

		// Check if guest with the same email or phone already exists
		// If found, update with any new information provided
		let guest = await findGuestAndUpdate(env, bookingData.guest);

		// If guest doesn't exist, create a new guest record
		if (!guest) {
			guest = await createGuest(env, bookingData.guest);

			// Double check that the guest was created successfully
			if (!guest || !guest.id) {
				return createApiResponse(false, { pnr: '', booking_id: 0 }, 'Failed to create guest record');
			}
		}

		if (!guest || !guest.id) {
			return createApiResponse(false, { pnr: '', booking_id: 0 }, 'Failed to create guest record');
		}

		// Create booking record
		const booking = await createBooking(
			env,
			{
				...bookingData.booking,
				pnr,
				guest_id: guest.id,
			},
			bookingData.addons // Pass addons to calculate total_amount
		);

		if (!booking || !booking.id) {
			return createApiResponse(false, { pnr: '', booking_id: 0 }, 'Failed to create booking');
		}

		// Add addons if provided
		if (bookingData.addons && bookingData.addons.length > 0) {
			await addBookingAddons(env, booking.id, bookingData.addons);
		}

		return createApiResponse(true, { pnr, booking_id: booking.id });
	} catch (error) {
		console.error('Error creating booking:', error);
		return createApiResponse(false, { pnr: '', booking_id: 0 }, 'Failed to create booking');
	}
};

export const getBookingByPnrService = async (env: IEnvironment, pnr: string): Promise<IApiResponse<IBookingDetails>> => {
	try {
		if (!pnr) {
			return createApiResponse(false, {} as IBookingDetails, 'PNR is required');
		}

		const booking = await getBookingByPnr(env, pnr);

		if (!booking) {
			return createApiResponse(false, {} as IBookingDetails, `No booking found with PNR ${pnr}`);
		}

		return createApiResponse(true, booking);
	} catch (error) {
		console.error(`Error getting booking with PNR ${pnr}:`, error);
		return createApiResponse(false, {} as IBookingDetails, `Failed to fetch booking with PNR ${pnr}`);
	}
};

export const updateBookingService = async (env: IEnvironment, pnr: string, updates: Partial<IBooking>): Promise<IApiResponse<IBooking>> => {
	try {
		if (!pnr) {
			return createApiResponse(false, {} as IBooking, 'PNR is required');
		}

		// Only allow updating certain fields
		const allowedUpdates: Partial<IBooking> = {};

		if (updates.special_requests !== undefined) {
			allowedUpdates.special_requests = updates.special_requests;
		}

		if (Object.keys(allowedUpdates).length === 0) {
			return createApiResponse(false, {} as IBooking, 'No valid fields to update');
		}

		const updatedBooking = await updateBooking(env, pnr, allowedUpdates);

		if (!updatedBooking) {
			return createApiResponse(false, {} as IBooking, `No booking found with PNR ${pnr}`);
		}

		return createApiResponse(true, updatedBooking);
	} catch (error) {
		console.error(`Error updating booking with PNR ${pnr}:`, error);
		return createApiResponse(false, {} as IBooking, `Failed to update booking with PNR ${pnr}`);
	}
};

export const cancelBookingService = async (env: IEnvironment, pnr: string): Promise<IApiResponse<{ success: boolean }>> => {
	try {
		if (!pnr) {
			return createApiResponse(false, { success: false }, 'PNR is required');
		}

		const success = await cancelBooking(env, pnr);

		if (!success) {
			return createApiResponse(false, { success: false }, `No booking found with PNR ${pnr}`);
		}

		return createApiResponse(true, { success: true });
	} catch (error) {
		console.error(`Error cancelling booking with PNR ${pnr}:`, error);
		return createApiResponse(false, { success: false }, `Failed to cancel booking with PNR ${pnr}`);
	}
};
