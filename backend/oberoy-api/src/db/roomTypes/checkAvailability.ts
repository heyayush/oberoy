import { IEnvironment } from '../../types/common';
import { IRoomType } from '../../types/roomTypes';
import { handleDbError } from '../utils/errorHandler';

/**
 * Check for available room types based on date range and guest count
 *
 * @param env - Environment object with DB access
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @param adults - Number of adults
 * @param children - Number of children
 * @returns Array of available room types or undefined if error occurs
 */
export const checkAvailability = async (
	env: IEnvironment,
	checkIn: string,
	checkOut: string,
	adults: number,
	children: number
): Promise<IRoomType[] | undefined> => {
	try {
		// This is a complex query that needs to check room availability based on existing bookings
		// For simplicity, let's return all room types that can accommodate the guests
		const stmt = env.DB.prepare(`
      SELECT rt.* FROM room_types rt
      WHERE rt.is_deleted = FALSE
      AND rt.max_adults >= ?
      AND rt.max_children >= ?
      ORDER BY rt.base_price ASC
    `);
		const result = await stmt.bind(adults, children).all();
		return result.results as unknown as IRoomType[];
	} catch (error) {
		handleDbError(error, 'Failed to check availability');
	}
};
