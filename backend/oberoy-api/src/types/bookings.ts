import { IAddon } from './addons';
import { IGuest } from './guests';
import { IRoomType } from './roomTypes';

export interface IBooking {
	id?: number;
	pnr?: string;
	guest_id?: number;
	room_type_id: number;
	check_in_date: string;
	check_out_date: string;
	adults: number;
	children: number;
	total_rooms: number;
	room_price: number;
	total_amount: number;
	booking_status?: string;
	booking_source?: string;
	special_requests?: string;
	created_at?: string;
	updated_at?: string;
}

export interface ICreateBooking {
	guest: IGuest;
	booking: Omit<IBooking, 'id' | 'pnr' | 'guest_id'>;
	addons?: {
		addon_id: number;
		quantity: number;
	}[];
}

export interface IBookingDetails extends IBooking {
	guest: IGuest;
	room_type: IRoomType;
	addons?: (IAddon & { quantity: number; total_price: number })[];
}
