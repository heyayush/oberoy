import { IEnvironment } from '../../types/common';
import { handleDbError } from '../utils/errorHandler';

/**
 * Cancel a booking by updating its status to 'cancelled'
 *
 * @param env - Environment object with DB access
 * @param pnr - The PNR code of the booking to cancel
 * @returns A boolean indicating if the booking was successfully cancelled or undefined if error occurs
 */
export const cancelBooking = async (env: IEnvironment, pnr: string): Promise<boolean | undefined> => {
	try {
		const stmt = env.DB.prepare(`
			UPDATE bookings 
			SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
			WHERE pnr = ? 
			RETURNING id
		`);

		const result = await stmt.bind(pnr).first();
		return result !== null;
	} catch (error) {
		return handleDbError(error, `Failed to cancel booking with PNR ${pnr}`);
	}
};
