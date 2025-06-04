import { IEnvironment } from '../../types/common';
import { IBooking } from '../../types/bookings';
import { handleDbError } from '../utils/errorHandler';

/**
 * Create a new booking record
 *
 * @param env - Environment object with DB access
 * @param booking - Booking data to insert
 * @returns The created booking record or undefined if error occurs
 */
export const createBooking = async (env: IEnvironment, booking: IBooking): Promise<IBooking | undefined> => {
	try {
		const stmt = env.DB.prepare(`
      INSERT INTO bookings (
        pnr, guest_id, room_type_id, check_in_date, check_out_date,
        adults, children, total_rooms, room_price, total_amount,
        booking_status, booking_source, special_requests
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
		const result = await stmt
			.bind(
				booking.pnr,
				booking.guest_id,
				booking.room_type_id,
				booking.check_in_date,
				booking.check_out_date,
				booking.adults,
				booking.children,
				booking.total_rooms,
				booking.room_price,
				booking.total_amount,
				booking.booking_status || 'confirmed',
				booking.booking_source || 'website',
				booking.special_requests || null
			)
			.first();
		return result as unknown as IBooking;
	} catch (error) {
		handleDbError(error, 'Failed to create booking');
	}
};
