import { DEFAULT_LIMIT, MAX_LIMIT } from '../CONFIG';

export const generatePNR = (): string => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let pnr = '';
	for (let i = 0; i < 6; i++) {
		pnr += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return pnr;
};

export const formatDate = (date: string): string => {
	return new Date(date).toISOString().split('T')[0];
};

export const isValidDate = (dateString: string): boolean => {
	const date = new Date(dateString);
	return date instanceof Date && !isNaN(date.getTime());
};

export const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
	return emailRegex.test(email);
};

export const parseQueryParams = (url: URL) => {
	const params = new URLSearchParams(url.search);

	return {
		offset: Math.max(0, parseInt(params.get('offset') || '0')),
		limit: Math.min(MAX_LIMIT, Math.max(1, parseInt(params.get('limit') || DEFAULT_LIMIT.toString()))),
		sort_by: params.get('sort_by') || '',
		sort_order: (params.get('sort_order') || 'asc').toLowerCase() as 'asc' | 'desc',
		q: params.get('q') || '',
		check_in: params.get('check_in') || '',
		check_out: params.get('check_out') || '',
		adults: Math.max(1, parseInt(params.get('adults') || '1')),
		children: Math.max(0, parseInt(params.get('children') || '0')),
		room_type_id: parseInt(params.get('room_type_id') || '0') || undefined,
	};
};
