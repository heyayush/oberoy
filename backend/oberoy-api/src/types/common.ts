export interface IEnvironment {
	DB: D1Database;
}

export interface IApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	status?: number;
	count?: number;
}

export interface IPaginatedResult<T> {
	data: T[];
	count: number;
}
