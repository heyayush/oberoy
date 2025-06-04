export interface IRoomType {
	id: number;
	hotel_id: number;
	name: string;
	description?: string;
	max_adults: number;
	max_children: number;
	base_price: number;
	main_image_url?: string;
	is_deleted?: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface IRoomTypeImage {
	id: number;
	room_type_id: number;
	image_url: string;
	alt_text?: string;
	display_order: number;
	created_at?: string;
}

export interface IAvailabilityQuery {
	check_in: string;
	check_out: string;
	adults: number;
	children: number;
}

export interface IPricingQuery extends IAvailabilityQuery {
	room_type_id: number;
}
