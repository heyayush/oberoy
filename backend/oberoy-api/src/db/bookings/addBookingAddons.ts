import { IEnvironment } from '../../types/common';
import { handleDbError } from '../utils/errorHandler';

/**
 * Add addons to a booking
 *
 * @param env - Environment object with DB access
 * @param bookingId - ID of the booking to add addons to
 * @param addons - Array of addons with quantity to add
 * @returns void or throws an error
 */
export const addBookingAddons = async (
	env: IEnvironment,
	bookingId: number,
	addons: { addon_id: number; quantity: number }[]
): Promise<void> => {
	try {
		// Using a transaction to ensure all addons are added
		await env.DB.batch(
			addons.map((addon) => {
				const stmt = env.DB.prepare(`
          INSERT INTO booking_addons (booking_id, addon_id, quantity)
          VALUES (?, ?, ?)
        `);
				return stmt.bind(bookingId, addon.addon_id, addon.quantity);
			})
		);
	} catch (error) {
		handleDbError(error, 'Failed to add booking addons');
	}
};
