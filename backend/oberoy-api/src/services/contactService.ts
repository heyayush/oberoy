import { IApiResponse } from '../types/common';
import { createApiResponse, isValidEmail } from '../utils';

export interface IContactForm {
	name: string;
	email: string;
	phone?: string;
	subject: string;
	message: string;
}

export const submitContactFormService = async (contactData: IContactForm): Promise<IApiResponse<{ message: string }>> => {
	try {
		// Validate required fields
		if (!contactData.name?.trim()) {
			return createApiResponse(false, { message: '' }, 'Name is required');
		}

		if (!contactData.email?.trim()) {
			return createApiResponse(false, { message: '' }, 'Email is required');
		}

		if (!isValidEmail(contactData.email)) {
			return createApiResponse(false, { message: '' }, 'Invalid email format');
		}

		if (!contactData.subject?.trim()) {
			return createApiResponse(false, { message: '' }, 'Subject is required');
		}

		if (!contactData.message?.trim()) {
			return createApiResponse(false, { message: '' }, 'Message is required');
		}

		// Here you would typically save to database or send email
		// For now, we'll just return success
		console.log('Contact form submitted:', {
			name: contactData.name,
			email: contactData.email,
			phone: contactData.phone,
			subject: contactData.subject,
			message: contactData.message,
			timestamp: new Date().toISOString(),
		});

		return createApiResponse(true, {
			message: 'Thank you for your inquiry. We will get back to you soon.',
		});
	} catch (error) {
		console.error('Error submitting contact form:', error);
		return createApiResponse(false, { message: '' }, 'Failed to submit contact form');
	}
};
