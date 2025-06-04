import { IEnvironment } from '../../types/common';
import { IAddon } from '../../types';
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
		if (!addons || addons.length === 0) {
			throw new Error('No addons provided to add to the booking');
		}
		if (!bookingId || bookingId <= 0) {
			throw new Error('Invalid booking ID provided');
		}
		// Validate that each addon has a valid ID and quantity
		for (const addon of addons) {
			if (!addon.addon_id || addon.addon_id <= 0) {
				throw new Error(`Invalid addon ID provided: ${addon.addon_id}`);
			}
			if (!addon.quantity || addon.quantity <= 0) {
				throw new Error(`Invalid quantity provided for addon ID ${addon.addon_id}: ${addon.quantity}`);
			}
		}

		const addedAt = new Date().toISOString();

		// First, fetch the unit prices for all addon_ids
		const addonPrices = new Map<number, number>();

		// Create parameterized query with the correct number of placeholders
		const placeholders = addons.map(() => '?').join(',');
		const addonIdsArray = addons.map((addon) => addon.addon_id);

		const priceQuery = env.DB.prepare(`
			SELECT id, price 
			FROM addons 
			WHERE id IN (${placeholders}) AND is_active = TRUE
		`);

		const priceResults = await priceQuery.bind(...addonIdsArray).all();

		// Store the prices in a map for quick lookup
		for (const row of priceResults.results) {
			addonPrices.set(Number(row.id), Number(row.price));
		}

		// Check if all addon IDs were found
		for (const addon of addons) {
			if (!addonPrices.has(addon.addon_id)) {
				throw new Error(`Addon with ID ${addon.addon_id} not found or is inactive`);
			}
		}

		// Using a transaction to ensure all addons are added
		await env.DB.batch(
			addons.map((addon) => {
				const unitPrice = addonPrices.get(addon.addon_id) || 0;
				const totalPrice = unitPrice * addon.quantity;

				const stmt = env.DB.prepare(`
	  INSERT INTO booking_addons (booking_id, addon_id, quantity, unit_price, total_price, added_at)
	  VALUES (?, ?, ?, ?, ?, ?)
        `);
				return stmt.bind(bookingId, addon.addon_id, addon.quantity, unitPrice, totalPrice, addedAt);
			})
		);
	} catch (error) {
		handleDbError(error, 'Failed to add booking addons');
	}
};
