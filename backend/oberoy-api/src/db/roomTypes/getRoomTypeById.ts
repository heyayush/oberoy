import { IEnvironment } from '../../types/common';
import { IRoomType } from '../../types/roomTypes';
import { handleDbError } from '../utils/errorHandler';

/**
 * Get a room type by its ID
 *
 * @param env - Environment object with DB access
 * @param id - ID of the room type to retrieve
 * @returns The room type or undefined if not found
 */
export const getRoomTypeById = async (env: IEnvironment, id: number): Promise<IRoomType | undefined> => {
	try {
		const stmt = env.DB.prepare(`
      SELECT * FROM room_types WHERE id = ? AND is_deleted = FALSE
    `);
		return (await stmt.bind(id).first()) as IRoomType | undefined;
	} catch (error) {
		handleDbError(error, `Failed to fetch room type with id ${id}`);
	}
};
