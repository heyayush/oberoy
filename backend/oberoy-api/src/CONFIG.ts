export const BASE = '/api';
export const ALLOWED_ORIGINS: string[] = ['http://localhost:5173']; // Add allowed origins here, empty array allows all
export const DEFAULT_LIMIT = 10;
export const DEFAULT_OFFSET = 0;
export const MAX_LIMIT = 100;

// Additional CORS settings that may be needed
export const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
export const ALLOWED_HEADERS = 'Content-Type, Authorization';
export const MAX_AGE_SECONDS = 86400;
