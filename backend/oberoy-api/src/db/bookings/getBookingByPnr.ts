import { IEnvironment } from '../../types/common';
import { IBookingDetails, IAddon } from '../../types';
import { handleDbError } from '../utils/errorHandler';

/**
 * Get a booking by its PNR (Passenger Name Record) code
 *
 * @param env - Environment object with DB access
 * @param pnr - The PNR code of the booking to retrieve
 * @returns The booking details or undefined if not found or error occurs
 */
export const getBookingByPnr = async (env: IEnvironment, pnr: string): Promise<IBookingDetails | undefined> => {
	try {
		const stmt = env.DB.prepare(`
      SELECT 
        b.*,
        g.id as guest_id,
        g.name as guest_name,
        g.email as guest_email,
        g.phone as guest_phone,
        g.address as guest_address,
        g.id_proof_type as guest_id_proof_type,
        g.id_proof_number as guest_id_proof_number,
        g.date_of_birth as guest_date_of_birth,
        rt.id as room_type_id,
        rt.name as room_type_name,
        rt.hotel_id,
        rt.description,
        rt.max_adults,
        rt.max_children,
        rt.base_price,
        rt.main_image_url,
        rt.is_deleted,
        b.id as booking_id
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE b.pnr = ?
    `);
		const result = await stmt.bind(pnr).first();

		if (!result) {
			return;
		}

		// Reshape the result to match IBookingDetails
		const booking: IBookingDetails = {
			id: Number(result.booking_id),
			pnr: String(result.pnr),
			guest_id: Number(result.guest_id),
			room_type_id: Number(result.room_type_id),
			check_in_date: String(result.check_in_date),
			check_out_date: String(result.check_out_date),
			adults: Number(result.adults),
			children: Number(result.children),
			total_rooms: Number(result.total_rooms),
			room_price: Number(result.room_price),
			total_amount: Number(result.total_amount),
			booking_status: String(result.booking_status),
			booking_source: String(result.booking_source),
			special_requests: result.special_requests ? String(result.special_requests) : undefined,
			created_at: String(result.created_at),
			updated_at: String(result.updated_at),
			addons: [] as (IAddon & { quantity: number; total_price: number })[],
			guest: {
				id: Number(result.guest_id),
				name: String(result.guest_name),
				email: result.guest_email ? String(result.guest_email) : undefined,
				phone: result.guest_phone ? String(result.guest_phone) : undefined,
				address: result.guest_address ? String(result.guest_address) : undefined,
				id_proof_type: result.guest_id_proof_type ? String(result.guest_id_proof_type) : undefined,
				id_proof_number: result.guest_id_proof_number ? String(result.guest_id_proof_number) : undefined,
				date_of_birth: result.guest_date_of_birth ? String(result.guest_date_of_birth) : undefined,
			},
			room_type: {
				id: Number(result.room_type_id),
				hotel_id: Number(result.hotel_id),
				name: String(result.room_type_name),
				description: String(result.description),
				max_adults: Number(result.max_adults),
				max_children: Number(result.max_children),
				base_price: Number(result.base_price),
				main_image_url: result.main_image_url ? String(result.main_image_url) : undefined,
				is_deleted: Boolean(result.is_deleted),
			},
		};

		// Get addons for this booking
		const addonsStmt = env.DB.prepare(`
      SELECT a.*, ba.quantity, (a.price * ba.quantity) as total_price
      FROM booking_addons ba
      JOIN addons a ON ba.addon_id = a.id
      WHERE ba.booking_id = ?
    `);
		const addonsResult = await addonsStmt.bind(result.booking_id).all();
		if (addonsResult.results.length > 0) {
			booking.addons = addonsResult.results as unknown as (IAddon & { quantity: number; total_price: number })[];
		}

		return booking;
	} catch (error) {
		handleDbError(error, `Failed to fetch booking with PNR ${pnr}`);
	}
};
