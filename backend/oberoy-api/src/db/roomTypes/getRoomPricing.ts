import { IEnvironment } from '../../types/common';
import { IRoomType } from '../../types/roomTypes';
import { handleDbError } from '../utils/errorHandler';

/**
 * Get pricing for a room type for specific dates
 *
 * @param env - Environment object with DB access
 * @param roomTypeId - ID of the room type
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @param adults - Number of adults
 * @param children - Number of children
 * @returns Object with base price and total price or undefined if error occurs
 */
export const getRoomPricing = async (
	env: IEnvironment,
	roomTypeId: number,
	checkIn: string,
	checkOut: string,
	adults: number,
	children: number
): Promise<{ base_price: number; total_price: number } | undefined> => {
	try {
		// Get the room type details first
		const roomTypeStmt = env.DB.prepare(`
      SELECT * FROM room_types WHERE id = ? AND is_deleted = FALSE
    `);
		const roomType = (await roomTypeStmt.bind(roomTypeId).first()) as IRoomType;

		if (!roomType) {
			throw new Error(`Room type with id ${roomTypeId} not found`);
		}

		// For simplicity, we'll just use the base price
		// In a real application, you would fetch dynamic pricing from the room_pricing table
		// based on the dates and occupancy
		return {
			base_price: roomType.base_price,
			total_price: roomType.base_price, // This would normally include calculations based on stay duration, etc.
		};
	} catch (error) {
		handleDbError(error, `Failed to get pricing for room type with id ${roomTypeId}`);
	}
};
