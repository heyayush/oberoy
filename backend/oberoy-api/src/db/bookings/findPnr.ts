import { IEnvironment } from '../../types/common';
import { handleDbError } from '../utils/errorHandler';

/**
 * Check if a PNR already exists in the database
 *
 * @param env - Environment object with DB access
 * @param pnr - The PNR code to check
 * @returns Boolean indicating if the PNR exists (true) or not (false)
 */
export const findPnr = async (env: IEnvironment, pnr: string): Promise<boolean> => {
	try {
		const stmt = env.DB.prepare(`
            SELECT 1 FROM bookings WHERE pnr = ? LIMIT 1
        `);
		const result = await stmt.bind(pnr).first();

		// If result is not null, the PNR exists
		return result !== null;
	} catch (error) {
		handleDbError(error, `Failed to check if PNR ${pnr} exists`);
		return false; // Default to false to avoid potential duplicates
	}
};
