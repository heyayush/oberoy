import { IEnvironment, IPaginatedResult } from '../../types/common';
import { IAddon } from '../../types/addons';
import { handleDbError } from '../utils/errorHandler';

/**
 * Get a paginated list of active addons
 *
 * @param env - Environment object with DB access
 * @param offset - Number of records to skip
 * @param limit - Maximum number of records to return
 * @returns A paginated result of addons or undefined if error occurs
 */
export const getAddons = async (
	env: IEnvironment,
	offset: number = 0,
	limit: number = 10
): Promise<IPaginatedResult<IAddon> | undefined> => {
	try {
		const stmt = env.DB.prepare(`
      SELECT * FROM addons 
      WHERE is_active = TRUE 
      ORDER BY id ASC 
      LIMIT ? OFFSET ?
    `);
		const result = await stmt.bind(limit, offset).all();

		const countStmt = env.DB.prepare(`
      SELECT COUNT(*) as count FROM addons WHERE is_active = TRUE
    `);
		const countResult = await countStmt.first();

		return {
			data: result.results as unknown as IAddon[],
			count: countResult?.count ? Number(countResult.count) : 0,
		};
	} catch (error) {
		handleDbError(error, 'Failed to fetch addons');
	}
};
