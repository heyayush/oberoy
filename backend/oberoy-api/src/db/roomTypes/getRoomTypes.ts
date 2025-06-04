import { IEnvironment, IPaginatedResult } from '../../types/common';
import { IRoomType } from '../../types/roomTypes';
import { handleDbError } from '../utils/errorHandler';

/**
 * Get a paginated list of room types
 *
 * @param env - Environment object with DB access
 * @param offset - Number of records to skip
 * @param limit - Maximum number of records to return
 * @returns A paginated result of room types
 */
export const getRoomTypes = async (env: IEnvironment, offset: number = 0, limit: number = 10): Promise<IPaginatedResult<IRoomType>> => {
	try {
		const stmt = env.DB.prepare(`
      SELECT * FROM room_types 
      WHERE is_deleted = FALSE 
      ORDER BY id ASC 
      LIMIT ? OFFSET ?
    `);
		const result = await stmt.bind(limit, offset).all();

		const countStmt = env.DB.prepare(`
      SELECT COUNT(*) as count FROM room_types WHERE is_deleted = FALSE
    `);
		const countResult = await countStmt.first();

		return {
			data: result.results as unknown as IRoomType[],
			count: countResult?.count ? Number(countResult.count) : 0,
		};
	} catch (error) {
		return handleDbError(error, 'Failed to fetch room types');
	}
};
