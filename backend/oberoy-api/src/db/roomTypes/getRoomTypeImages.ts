import { IEnvironment } from '../../types/common';
import { IRoomTypeImage } from '../../types/roomTypes';
import { handleDbError } from '../utils/errorHandler';

/**
 * Get all images for a specific room type
 *
 * @param env - Environment object with DB access
 * @param roomTypeId - ID of the room type to get images for
 * @returns Array of room type images
 */
export const getRoomTypeImages = async (env: IEnvironment, roomTypeId: number): Promise<IRoomTypeImage[]> => {
	try {
		const stmt = env.DB.prepare(`
      SELECT * FROM room_type_images 
      WHERE room_type_id = ? 
      ORDER BY display_order ASC, id ASC
    `);
		const result = await stmt.bind(roomTypeId).all();
		return result.results as unknown as IRoomTypeImage[];
	} catch (error) {
		handleDbError(error, `Failed to fetch images for room type with id ${roomTypeId}`);
		return []; // Add this return to fix the Function lacks ending return statement error
	}
};
