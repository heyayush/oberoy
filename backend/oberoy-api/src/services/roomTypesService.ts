import { IEnvironment, IApiResponse } from '../types/common';
import { IRoomType, IRoomTypeImage } from '../types/roomTypes';
import { createApiResponse } from '../utils';
import { getRoomTypes, getRoomTypeById, getRoomTypeImages, checkAvailability, getRoomPricing } from '../db';

export const getRoomTypesService = async (env: IEnvironment, offset: number, limit: number): Promise<IApiResponse<IRoomType[]>> => {
	try {
		const result = await getRoomTypes(env, offset, limit);
		return createApiResponse(true, result.data, undefined, result.count);
	} catch (error) {
		console.error('Error getting room types:', error);
		return createApiResponse(false, [], 'Failed to fetch room types');
	}
};

export const getRoomTypeByIdService = async (env: IEnvironment, id: number): Promise<IApiResponse<IRoomType>> => {
	try {
		const result = await getRoomTypeById(env, id);
		if (!result) {
			return createApiResponse(false, {} as IRoomType, `Room type with ID ${id} not found`);
		}
		return createApiResponse(true, result);
	} catch (error) {
		console.error(`Error getting room type with ID ${id}:`, error);
		return createApiResponse(false, {} as IRoomType, `Failed to fetch room type with ID ${id}`);
	}
};

export const getRoomTypeImagesService = async (env: IEnvironment, roomTypeId: number): Promise<IApiResponse<IRoomTypeImage[]>> => {
	try {
		const roomType = await getRoomTypeById(env, roomTypeId);
		if (!roomType) {
			return createApiResponse(false, [], `Room type with ID ${roomTypeId} not found`);
		}

		const images = await getRoomTypeImages(env, roomTypeId);
		return createApiResponse(true, images, undefined, images.length);
	} catch (error) {
		console.error(`Error getting images for room type with ID ${roomTypeId}:`, error);
		return createApiResponse(false, [], `Failed to fetch images for room type with ID ${roomTypeId}`);
	}
};

export const checkAvailabilityService = async (
	env: IEnvironment,
	checkIn: string,
	checkOut: string,
	adults: number,
	children: number
): Promise<IApiResponse<IRoomType[]>> => {
	try {
		// Basic validation
		if (!checkIn || !checkOut) {
			return createApiResponse(false, [], 'Check-in and check-out dates are required');
		}

		const checkInDate = new Date(checkIn);
		const checkOutDate = new Date(checkOut);

		// Validate dates
		if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
			return createApiResponse(false, [], 'Invalid date format. Please use YYYY-MM-DD format');
		}

		if (checkInDate >= checkOutDate) {
			return createApiResponse(false, [], 'Check-out date must be after check-in date');
		}

		if (checkInDate < new Date()) {
			return createApiResponse(false, [], 'Check-in date cannot be in the past');
		}

		// Validate guest count
		if (adults < 1) {
			return createApiResponse(false, [], 'At least 1 adult is required');
		}

		if (children < 0) {
			return createApiResponse(false, [], 'Children count cannot be negative');
		}

		// Get available room types
		const availableRoomTypes = await checkAvailability(env, checkIn, checkOut, adults, children);
		return createApiResponse(true, availableRoomTypes, undefined, availableRoomTypes?.length);
	} catch (error) {
		console.error('Error checking availability:', error);
		return createApiResponse(false, [], 'Failed to check availability');
	}
};

export const getRoomPricingService = async (
	env: IEnvironment,
	roomTypeId: number,
	checkIn: string,
	checkOut: string,
	adults: number,
	children: number
): Promise<IApiResponse<{ base_price: number; total_price: number }>> => {
	try {
		// Basic validation
		if (!roomTypeId || !checkIn || !checkOut) {
			return createApiResponse(false, { base_price: 0, total_price: 0 }, 'Room type ID, check-in, and check-out dates are required');
		}

		const checkInDate = new Date(checkIn);
		const checkOutDate = new Date(checkOut);

		// Validate dates
		if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
			return createApiResponse(false, { base_price: 0, total_price: 0 }, 'Invalid date format. Please use YYYY-MM-DD format');
		}

		if (checkInDate >= checkOutDate) {
			return createApiResponse(false, { base_price: 0, total_price: 0 }, 'Check-out date must be after check-in date');
		}

		// Validate guest count
		if (adults < 1) {
			return createApiResponse(false, { base_price: 0, total_price: 0 }, 'At least 1 adult is required');
		}

		if (children < 0) {
			return createApiResponse(false, { base_price: 0, total_price: 0 }, 'Children count cannot be negative');
		}

		// Get pricing
		const pricing = await getRoomPricing(env, roomTypeId, checkIn, checkOut, adults, children);
		return createApiResponse(true, pricing);
	} catch (error) {
		console.error(`Error getting pricing for room type with ID ${roomTypeId}:`, error);
		return createApiResponse(false, { base_price: 0, total_price: 0 }, `Failed to get pricing for room type with ID ${roomTypeId}`);
	}
};
