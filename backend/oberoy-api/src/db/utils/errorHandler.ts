/**
 * Helper for handling DB errors consistently across all queries
 *
 * @param error - The error object thrown during database operation
 * @param message - A descriptive message about the failed operation
 * @returns Never returns, always throws an error
 */
export const handleDbError = (error: unknown, message: string): never => {
	console.error(`Database Error: ${message}`, error);
	if (error instanceof Error) {
		throw new Error(`${message}: ${error.message}`);
	}
	throw new Error(`${message}: An unknown error occurred`);
};
