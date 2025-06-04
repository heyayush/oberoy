import { IEnvironment, IApiResponse } from '../types/common';
import { IAddon } from '../types/addons';
import { createApiResponse } from '../utils';
import { getAddons } from '../db';

export const getAddonsService = async (env: IEnvironment, offset: number, limit: number): Promise<IApiResponse<IAddon[]>> => {
	try {
		const result = await getAddons(env, offset, limit);
		return createApiResponse(true, result?.data, undefined, result?.count);
	} catch (error) {
		console.error('Error getting addons:', error);
		return createApiResponse(false, [], 'Failed to fetch addons');
	}
};
