import { IEnvironment } from '../../types/common';
import { IGuest } from '../../types/guests';
import { handleDbError } from '../utils/errorHandler';

/**
 * Find a guest by phone number and/or email address and update their information
 * if needed with any new details provided.
 *
 * Priority search logic:
 * 1. If phone is provided, search by phone first
 * 2. If email is provided but phone is not, search by email
 * 3. If guest found, update any provided fields that differ from current values
 *
 * @param env - Environment object with DB access
 * @param guestData - The guest data containing search criteria and potential updates
 * @returns The guest record (updated if needed) if found, or undefined if not found or error occurs
 */
export const findGuestAndUpdate = async (env: IEnvironment, guestData: Partial<IGuest>): Promise<IGuest | undefined> => {
	try {
		const { email, phone } = guestData;

		// At least one identifier must be provided
		if (!email && !phone) {
			return undefined;
		}

		let existingGuest: IGuest | undefined = undefined;

		// If phone is provided, search by phone first
		if (phone) {
			const phoneStmt = env.DB.prepare('SELECT * FROM guests WHERE phone = ? LIMIT 1');
			const phoneResult = await phoneStmt.bind(phone).first();
			existingGuest = phoneResult as unknown as IGuest;
		}

		// If phone search yielded no results but email is provided, search by email
		if (!existingGuest && email) {
			const emailStmt = env.DB.prepare('SELECT * FROM guests WHERE email = ? LIMIT 1');
			const emailResult = await emailStmt.bind(email).first();
			existingGuest = emailResult as unknown as IGuest;
		}

		// If guest found, check if any fields need updating
		if (existingGuest) {
			const fieldsToUpdate: string[] = [];
			const valuesToUpdate: any[] = [];

			// Check each field to see if it needs updating
			// Only update if new value is provided and different from existing value
			if (guestData.name && guestData.name !== existingGuest.name) {
				fieldsToUpdate.push('name = ?');
				valuesToUpdate.push(guestData.name);
			}

			if (email && email !== existingGuest.email) {
				fieldsToUpdate.push('email = ?');
				valuesToUpdate.push(email);
			}

			if (guestData.address && guestData.address !== existingGuest.address) {
				fieldsToUpdate.push('address = ?');
				valuesToUpdate.push(guestData.address);
			}

			if (guestData.id_proof_type && guestData.id_proof_type !== existingGuest.id_proof_type) {
				fieldsToUpdate.push('id_proof_type = ?');
				valuesToUpdate.push(guestData.id_proof_type);
			}

			if (guestData.id_proof_number && guestData.id_proof_number !== existingGuest.id_proof_number) {
				fieldsToUpdate.push('id_proof_number = ?');
				valuesToUpdate.push(guestData.id_proof_number);
			}

			if (guestData.date_of_birth && guestData.date_of_birth !== existingGuest.date_of_birth) {
				fieldsToUpdate.push('date_of_birth = ?');
				valuesToUpdate.push(guestData.date_of_birth);
			}

			// If there are fields to update, run the update query
			if (fieldsToUpdate.length > 0) {
				// Add the ID for the WHERE clause
				valuesToUpdate.push(existingGuest.id);

				const updateStmt = env.DB.prepare(`
					UPDATE guests 
					SET ${fieldsToUpdate.join(', ')} 
					WHERE id = ? 
					RETURNING *
				`);

				const updatedGuest = await updateStmt.bind(...valuesToUpdate).first();
				return updatedGuest as unknown as IGuest;
			}

			// If no updates needed, return the existing guest
			return existingGuest;
		}

		// No guest found
		return undefined;
	} catch (error) {
		return handleDbError(error, `Failed to find or update guest with provided information`);
	}
};
