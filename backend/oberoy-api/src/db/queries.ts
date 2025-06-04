import { IEnvironment, IPaginatedResult } from '../types/common';
import { IRoomType, IRoomTypeImage } from '../types/roomTypes';
import { IAddon } from '../types/addons';
import { IBooking, IBookingDetails } from '../types/bookings';
import { IGuest } from '../types/guests';

// Helper for handling DB errors
const handleDbError = (error: unknown, message: string): never => {
	console.error(`Database Error: ${message}`, error);
	if (error instanceof Error) {
		throw new Error(`${message}: ${error.message}`);
	}
	throw new Error(`${message}: An unknown error occurred`);
};

// Room Types Queries
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

// Availability Queries
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

// Room Pricing Queries
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

// Addons Queries
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

// Booking Queries
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

export const createBooking = async (env: IEnvironment, booking: IBooking): Promise<IBooking | undefined> => {
	try {
		const stmt = env.DB.prepare(`
      INSERT INTO bookings (
        pnr, guest_id, room_type_id, check_in_date, check_out_date,
        adults, children, total_rooms, room_price, total_amount,
        booking_status, booking_source, special_requests
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
		const result = await stmt
			.bind(
				booking.pnr,
				booking.guest_id,
				booking.room_type_id,
				booking.check_in_date,
				booking.check_out_date,
				booking.adults,
				booking.children,
				booking.total_rooms,
				booking.room_price,
				booking.total_amount,
				booking.booking_status || 'confirmed',
				booking.booking_source || 'website',
				booking.special_requests || null
			)
			.first();
		return result as unknown as IBooking;
	} catch (error) {
		handleDbError(error, 'Failed to create booking');
	}
};

export const addBookingAddons = async (
	env: IEnvironment,
	bookingId: number,
	addons: { addon_id: number; quantity: number }[]
): Promise<void> => {
	try {
		// Using a transaction to ensure all addons are added
		await env.DB.batch(
			addons.map((addon) => {
				const stmt = env.DB.prepare(`
          INSERT INTO booking_addons (booking_id, addon_id, quantity)
          VALUES (?, ?, ?)
        `);
				return stmt.bind(bookingId, addon.addon_id, addon.quantity);
			})
		);
	} catch (error) {
		handleDbError(error, 'Failed to add booking addons');
	}
};

export const getBookingByPnr = async (env: IEnvironment, pnr: string): Promise<IBookingDetails | undefined> => {
	try {
		const stmt = env.DB.prepare(`
      SELECT b.*, g.*, rt.*,
        b.id as booking_id,
        g.id as guest_id,
        rt.id as room_type_id
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
				name: String(result.name),
				email: result.email ? String(result.email) : undefined,
				phone: result.phone ? String(result.phone) : undefined,
				address: result.address ? String(result.address) : undefined,
				id_proof_type: result.id_proof_type ? String(result.id_proof_type) : undefined,
				id_proof_number: result.id_proof_number ? String(result.id_proof_number) : undefined,
				date_of_birth: result.date_of_birth ? String(result.date_of_birth) : undefined,
			},
			room_type: {
				id: Number(result.room_type_id),
				hotel_id: Number(result.hotel_id),
				name: String(result.name),
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

export const updateBooking = async (env: IEnvironment, pnr: string, updates: Partial<IBooking>): Promise<IBooking | undefined> => {
	try {
		// First check if the booking exists
		const checkStmt = env.DB.prepare('SELECT id FROM bookings WHERE pnr = ?');
		const booking = await checkStmt.bind(pnr).first();

		if (!booking) {
			return;
		}

		// Build the dynamic update query based on provided fields
		const updateFields: string[] = [];
		const values: any[] = [];

		for (const [key, value] of Object.entries(updates)) {
			// Only allow updating certain fields
			if (['special_requests', 'booking_status'].includes(key)) {
				updateFields.push(`${key} = ?`);
				values.push(value);
			}
		}

		if (updateFields.length === 0) {
			return; // No valid fields to update
		}

		values.push(pnr); // Add pnr for the WHERE clause

		const stmt = env.DB.prepare(`
			UPDATE bookings 
			SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
			WHERE pnr = ? 
			RETURNING *
		`);

		const result = await stmt.bind(...values).first();
		return result as unknown as IBooking;
	} catch (error) {
		handleDbError(error, `Failed to update booking with PNR ${pnr}`);
	}
};

export const cancelBooking = async (env: IEnvironment, pnr: string): Promise<boolean | undefined> => {
	try {
		const stmt = env.DB.prepare(`
			UPDATE bookings 
			SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
			WHERE pnr = ? 
			RETURNING id
		`);

		const result = await stmt.bind(pnr).first();
		return result !== null;
	} catch (error) {
		handleDbError(error, `Failed to cancel booking with PNR ${pnr}`);
	}
};
