# DB Query Summary

## Structure

The queries have been organized into the following directory structure:

```
src/db/
├── index.ts                 # Main export file
├── addons/
│   ├── getAddons.ts         # Addon query functions
│   └── index.ts             # Re-exports addon functions
├── bookings/
│   ├── addBookingAddons.ts  # Functions for adding addons to bookings
│   ├── cancelBooking.ts     # Functions for cancelling bookings
│   ├── createBooking.ts     # Functions for creating bookings
│   ├── getBookingByPnr.ts   # Functions for retrieving bookings
│   ├── updateBooking.ts     # Functions for updating bookings
│   └── index.ts             # Re-exports booking functions
├── guests/
│   ├── createGuest.ts       # Guest management functions
│   └── index.ts             # Re-exports guest functions
├── roomTypes/
│   ├── checkAvailability.ts # Room availability functions
│   ├── getRoomPricing.ts    # Room pricing functions
│   ├── getRoomTypeById.ts   # Single room type retrieval
│   ├── getRoomTypeImages.ts # Room images retrieval
│   ├── getRoomTypes.ts      # Room listing functions
│   └── index.ts             # Re-exports room type functions
└── utils/
    └── errorHandler.ts      # Shared error handling utilities
```
