# Oberoy Hotel API Documentation

This document provides detailed information about the Oberoy Hotel API endpoints. You can use these endpoints to manage room types, bookings, addons, and contact form submissions.

## Base URL

```
http://localhost:8787/api
```

You can modify this in your Postman environment variables.

## Authentication

Currently, the API does not require authentication.

## API Endpoints

### Room Types

#### Get All Room Types

Retrieves a list of all room types with pagination.

- **URL**: `/room-types`
- **Method**: `GET`
- **Query Parameters**:
  - `offset` (optional): Number of items to skip (default: 0)
  - `limit` (optional): Maximum number of items to return (default: 10)
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": [
  		{
  			"id": 1,
  			"hotel_id": 1,
  			"name": "Deluxe Room",
  			"description": "Spacious room with king bed and city view",
  			"max_adults": 2,
  			"max_children": 2,
  			"base_price": 150,
  			"main_image_url": "https://example.com/images/deluxe.jpg",
  			"is_deleted": false,
  			"created_at": "2023-01-01T00:00:00.000Z",
  			"updated_at": "2023-01-01T00:00:00.000Z"
  		}
  		// More room types...
  	],
  	"count": 5
  }
  ```

#### Get Room Type by ID

Retrieves details of a specific room type.

- **URL**: `/room-types/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Room type ID
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": {
  		"id": 1,
  		"hotel_id": 1,
  		"name": "Deluxe Room",
  		"description": "Spacious room with king bed and city view",
  		"max_adults": 2,
  		"max_children": 2,
  		"base_price": 150,
  		"main_image_url": "https://example.com/images/deluxe.jpg",
  		"is_deleted": false,
  		"created_at": "2023-01-01T00:00:00.000Z",
  		"updated_at": "2023-01-01T00:00:00.000Z"
  	}
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
  	"success": false,
  	"error": "Room type not found"
  }
  ```

#### Get Room Type Images

Retrieves all images for a specific room type.

- **URL**: `/room-types/:id/images`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Room type ID
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": [
  		{
  			"id": 1,
  			"room_type_id": 1,
  			"image_url": "https://example.com/images/deluxe-1.jpg",
  			"alt_text": "Room interior",
  			"display_order": 1,
  			"created_at": "2023-01-01T00:00:00.000Z"
  		}
  		// More images...
  	]
  }
  ```

#### Check Availability

Checks room availability for given dates and guest count.

- **URL**: `/room-types/availability`
- **Method**: `GET`
- **Query Parameters**:
  - `check_in`: Check-in date (YYYY-MM-DD)
  - `check_out`: Check-out date (YYYY-MM-DD)
  - `adults`: Number of adults (default: 1)
  - `children`: Number of children (default: 0)
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": [
  		{
  			"id": 1,
  			"hotel_id": 1,
  			"name": "Deluxe Room",
  			"description": "Spacious room with king bed and city view",
  			"max_adults": 2,
  			"max_children": 2,
  			"base_price": 150,
  			"main_image_url": "https://example.com/images/deluxe.jpg"
  		}
  		// More available room types...
  	],
  	"count": 3
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
  	"success": false,
  	"error": "Check-in and check-out dates are required"
  }
  ```

#### Get Room Pricing

Gets pricing details for a specific room type and dates.

- **URL**: `/room-types/pricing`
- **Method**: `GET`
- **Query Parameters**:
  - `room_type_id`: Room type ID
  - `check_in`: Check-in date (YYYY-MM-DD)
  - `check_out`: Check-out date (YYYY-MM-DD)
  - `adults`: Number of adults (default: 1)
  - `children`: Number of children (default: 0)
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": {
  		"base_price": 150,
  		"total_price": 750
  	}
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
  	"success": false,
  	"error": "Room type ID, check-in, and check-out dates are required"
  }
  ```

### Bookings

#### Create Booking

Creates a new booking with guest information and room details.

- **URL**: `/bookings`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
  	"guest": {
  		"name": "John Doe",
  		"email": "john@example.com",
  		"phone": "+1-555-123-4567",
  		"address": "123 Main St, Anytown, USA",
  		"id_proof_type": "passport",
  		"id_proof_number": "AB123456",
  		"date_of_birth": "1985-05-15"
  	},
  	"booking": {
  		"room_type_id": 1,
  		"check_in_date": "2023-07-15",
  		"check_out_date": "2023-07-20",
  		"adults": 2,
  		"children": 1,
  		"total_rooms": 1,
  		"room_price": 150,
  		"total_amount": 750,
  		"special_requests": "Need a quiet room away from elevator"
  	},
  	"addons": [
  		{
  			"addon_id": 1,
  			"quantity": 2
  		},
  		{
  			"addon_id": 3,
  			"quantity": 1
  		}
  	]
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
  	"success": true,
  	"data": {
  		"pnr": "ABC123",
  		"booking_id": 42
  	}
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
  	"success": false,
  	"error": "Missing required booking information"
  }
  ```

#### Get Booking by PNR

Retrieves booking details by PNR (Passenger Name Record).

- **URL**: `/bookings/:pnr`
- **Method**: `GET`
- **URL Parameters**:
  - `pnr`: Booking PNR code
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": {
  		"id": 42,
  		"pnr": "ABC123",
  		"guest_id": 56,
  		"room_type_id": 1,
  		"check_in_date": "2023-07-15",
  		"check_out_date": "2023-07-20",
  		"adults": 2,
  		"children": 1,
  		"total_rooms": 1,
  		"room_price": 150,
  		"total_amount": 750,
  		"booking_status": "confirmed",
  		"booking_source": "website",
  		"special_requests": "Need a quiet room away from elevator",
  		"created_at": "2023-07-01T12:34:56.789Z",
  		"updated_at": "2023-07-01T12:34:56.789Z",
  		"guest": {
  			"id": 56,
  			"name": "John Doe",
  			"email": "john@example.com",
  			"phone": "+1-555-123-4567",
  			"address": "123 Main St, Anytown, USA",
  			"id_proof_type": "passport",
  			"id_proof_number": "AB123456",
  			"date_of_birth": "1985-05-15"
  		},
  		"room_type": {
  			"id": 1,
  			"hotel_id": 1,
  			"name": "Deluxe Room",
  			"description": "Spacious room with king bed and city view",
  			"max_adults": 2,
  			"max_children": 2,
  			"base_price": 150,
  			"main_image_url": "https://example.com/images/deluxe.jpg",
  			"is_deleted": false
  		},
  		"addons": [
  			{
  				"id": 1,
  				"name": "Breakfast",
  				"description": "Continental breakfast for one person",
  				"price": 15,
  				"unit": "per person per day",
  				"quantity": 2,
  				"total_price": 150,
  				"is_active": true
  			},
  			{
  				"id": 3,
  				"name": "Airport Transfer",
  				"description": "One-way airport transfer",
  				"price": 50,
  				"unit": "per trip",
  				"quantity": 1,
  				"total_price": 50,
  				"is_active": true
  			}
  		]
  	}
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
  	"success": false,
  	"error": "No booking found with PNR ABC123"
  }
  ```

#### Update Booking

Updates specific fields of an existing booking.

- **URL**: `/bookings/:pnr`
- **Method**: `PATCH`
- **URL Parameters**:
  - `pnr`: Booking PNR code
- **Content-Type**: `application/json`
- **Request Body** (only fields to update):
  ```json
  {
  	"special_requests": "Need a quiet room away from elevator and extra towels please"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": {
  		"id": 42,
  		"pnr": "ABC123",
  		"special_requests": "Need a quiet room away from elevator and extra towels please"
  		// Other booking fields...
  	}
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
  	"success": false,
  	"error": "No booking found with PNR ABC123"
  }
  ```

#### Cancel Booking

Cancels an existing booking.

- **URL**: `/bookings/:pnr`
- **Method**: `DELETE`
- **URL Parameters**:
  - `pnr`: Booking PNR code
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": {
  		"success": true
  	}
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
  	"success": false,
  	"error": "No booking found with PNR ABC123"
  }
  ```

### Addons

#### Get All Addons

Retrieves a list of all available addons with pagination.

- **URL**: `/addons`
- **Method**: `GET`
- **Query Parameters**:
  - `offset` (optional): Number of items to skip (default: 0)
  - `limit` (optional): Maximum number of items to return (default: 10)
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": [
  		{
  			"id": 1,
  			"name": "Breakfast",
  			"description": "Continental breakfast for one person",
  			"price": 15,
  			"unit": "per person per day",
  			"is_active": true,
  			"created_at": "2023-01-01T00:00:00.000Z",
  			"updated_at": "2023-01-01T00:00:00.000Z"
  		}
  		// More addons...
  	],
  	"count": 5
  }
  ```

### Contact

#### Submit Contact Form

Submits a contact form with inquiry details.

- **URL**: `/contact`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
  	"name": "Jane Smith",
  	"email": "jane@example.com",
  	"phone": "+1-555-987-6543",
  	"subject": "Inquiry about Special Events",
  	"message": "I'm planning a wedding and would like information about your venue and catering services."
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
  	"success": true,
  	"data": {
  		"message": "Thank you for your inquiry. We will get back to you soon."
  	}
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
  	"success": false,
  	"error": "Email is required"
  }
  ```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
	"success": true,
	"data": {
		/* Response data */
	},
	"count": 10 // Only for collection endpoints
}
```

### Error Response

```json
{
	"success": false,
	"error": "Error message describing the issue"
}
```

## Common Error Codes

- `400 Bad Request`: Invalid input parameters or data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

Currently, there are no rate limits implemented on the API.
