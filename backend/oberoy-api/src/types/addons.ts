export interface IAddon {
	id: number;
	name: string;
	description?: string;
	price: number;
	unit: string;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}
