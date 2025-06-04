import { IApiResponse } from '../types';

export const createApiResponse = <T>(success: boolean, data?: T, error?: string, count?: number): IApiResponse<T> => {
	const response: IApiResponse<T> = { success };

	if (data !== undefined) response.data = data;
	if (error) response.error = error;
	if (count !== undefined) response.count = count;

	return response;
};

export const createResponse = (data: any, status: number = 200, headers: Record<string, string> = {}): Response => {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	});
};

export const createErrorResponse = (error: string, status: number = 400): Response => {
	return createResponse(createApiResponse(false, undefined, error), status);
};
