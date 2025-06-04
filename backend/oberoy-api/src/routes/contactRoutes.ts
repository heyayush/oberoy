import { createErrorResponse, createResponse } from '../utils';
import { submitContactFormService, IContactForm } from '../services/contactService';

export const handleContactRoutes = async (request: Request, routePath: string, method: string): Promise<Response> => {
	// Parse path for routing
	const pathParts = routePath.split('/').filter(Boolean);

	// POST /contact - Submit contact form
	if (pathParts.length === 1 && method === 'POST') {
		try {
			const contactData: IContactForm = await request.json();
			const result = await submitContactFormService(contactData);
			return createResponse(result, result.success ? 200 : 400);
		} catch (error) {
			console.error('Error parsing contact form data:', error);
			return createErrorResponse('Invalid contact form data format', 400);
		}
	}

	return createErrorResponse('Not Found', 404);
};
