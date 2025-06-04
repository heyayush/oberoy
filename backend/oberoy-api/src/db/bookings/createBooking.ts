import { IEnvironment } from '../../types/common';
import { IBooking } from '../../types/bookings';
import { handleDbError } from '../utils/errorHandler';
import { getRoomPricing } from '../roomTypes/getRoomPricing';
import { IAddon } from '../../types';

/**
 * Create a new booking record
 *
 * @param env - Environment object with DB access
 * @param booking - Booking data to insert
 * @param addons - Optional array of addons to calculate into total amount
 * @returns The created booking record or undefined if error occurs
 */
export const createBooking = async (
	env: IEnvironment,
	booking: Omit<IBooking, 'room_price' | 'total_amount'>,
	addons?: { addon_id: number; quantity: number }[]
): Promise<IBooking | undefined> => {
	try {
		// Get room pricing based on room type and dates
		const pricingInfo = await getRoomPricing(
			env,
			booking.room_type_id,
			booking.check_in_date,
			booking.check_out_date,
			booking.adults,
			booking.children || 0
		);

		if (!pricingInfo) {
			throw new Error(`Failed to get pricing for room type with id ${booking.room_type_id}`);
		}

		// Calculate the total room price based on number of rooms
		const roomPrice = pricingInfo.base_price;
		const totalRoomPrice = roomPrice * booking.total_rooms;

		// Calculate total addon price if addons are provided
		let totalAddonPrice = 0;
		if (addons && addons.length > 0) {
			// Get pricing for all addon_ids
			const placeholders = addons.map(() => '?').join(',');
			const addonIdsArray = addons.map((addon) => addon.addon_id);

			const addonPricesQuery = env.DB.prepare(`
                SELECT id, price 
                FROM addons 
                WHERE id IN (${placeholders}) AND is_active = TRUE
            `);

			const addonPricesResult = await addonPricesQuery.bind(...addonIdsArray).all();
			const addonPricesMap = new Map<number, number>();

			for (const row of addonPricesResult.results) {
				addonPricesMap.set(Number(row.id), Number(row.price));
			}

			// Calculate total addon price
			for (const addon of addons) {
				const addonPrice = addonPricesMap.get(addon.addon_id) || 0;
				totalAddonPrice += addonPrice * addon.quantity;
			}
		}

		// Calculate final total amount
		const totalAmount = totalRoomPrice + totalAddonPrice;

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
				booking.children || 0,
				booking.total_rooms,
				roomPrice,
				totalAmount,
				booking.booking_status || 'confirmed',
				booking.booking_source || 'website',
				booking.special_requests || null
			)
			.first();
		return result as unknown as IBooking;
	} catch (error) {
		return handleDbError(error, 'Failed to create booking');
	}
};
