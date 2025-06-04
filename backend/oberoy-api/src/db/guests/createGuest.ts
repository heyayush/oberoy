import { IEnvironment } from '../../types/common';
import { IGuest } from '../../types/guests';
import { handleDbError } from '../utils/errorHandler';

/**
 * Create a new guest record
 *
 * @param env - Environment object with DB access
 * @param guest - Guest data to insert
 * @returns The created guest record or undefined if error occurs
 */
export const createGuest = async (env: IEnvironment, guest: IGuest): Promise<IGuest | undefined> => {
	try {
		const stmt = env.DB.prepare(`
      INSERT INTO guests (name, email, phone, address, id_proof_type, id_proof_number, date_of_birth)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
		const result = await stmt
			.bind(
				guest.name,
				guest.email || null,
				guest.phone || null,
				guest.address || null,
				guest.id_proof_type || null,
				guest.id_proof_number || null,
				guest.date_of_birth || null
			)
			.first();
		return result as unknown as IGuest;
	} catch (error) {
		handleDbError(error, 'Failed to create guest');
	}
};
