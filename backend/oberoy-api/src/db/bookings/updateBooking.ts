import { IEnvironment } from '../../types/common';
import { IBooking } from '../../types/bookings';
import { handleDbError } from '../utils/errorHandler';

/**
 * Update details for an existing booking
 *
 * @param env - Environment object with DB access
 * @param pnr - The PNR code of the booking to update
 * @param updates - Object containing fields to update (only specific fields allowed)
 * @returns The updated booking object or undefined if not found or error occurs
 */
export const updateBooking = async (env: IEnvironment, pnr: string, updates: Partial<IBooking>): Promise<IBooking | undefined> => {
	try {
		// First check if the booking exists
		const checkStmt = env.DB.prepare('SELECT id FROM bookings WHERE pnr = ?');
		const booking = await checkStmt.bind(pnr).first();

		if (!booking) {
			return;
		}

		// Build the dynamic update query based on provided fields
		const updateFields: string[] = [];
		const values: any[] = [];

		for (const [key, value] of Object.entries(updates)) {
			// Only allow updating certain fields
			if (['special_requests', 'booking_status'].includes(key)) {
				updateFields.push(`${key} = ?`);
				values.push(value);
			}
		}

		if (updateFields.length === 0) {
			return; // No valid fields to update
		}

		values.push(pnr); // Add pnr for the WHERE clause

		const stmt = env.DB.prepare(`
			UPDATE bookings 
			SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
			WHERE pnr = ? 
			RETURNING *
		`);

		const result = await stmt.bind(...values).first();
		return result as unknown as IBooking;
	} catch (error) {
		return handleDbError(error, `Failed to update booking with PNR ${pnr}`);
	}
};
