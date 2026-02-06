# Payment & QR Scanner Features

## Overview

The event management system now includes integrated payment processing and QR code scanning/validation for ticket check-ins.

## Payment Features

### Payment Methods Supported

1. **Card Payment**
   - Credit/Debit card processing
   - Secure card number formatting
   - Expiry date validation (MM/YY)
   - CVV verification
   - Real-time form validation

2. **Wallet Payment**
   - Digital wallet integration
   - Payment confirmation at venue
   - Transaction tracking

3. **Cash Payment**
   - On-site cash collection
   - Payment at check-in
   - Manual verification

### Payment Flow

1. User selects tickets and quantity
2. If tickets are paid, payment modal appears
3. User selects payment method
4. For card payments, user enters card details
5. Payment is processed
6. Transaction ID is generated
7. Tickets are booked with payment information
8. Confirmation page shows payment details

### Backend Endpoints

- `POST /api/payments/process` - Process payment
- `GET /api/payments/verify/:transactionId` - Verify payment status

### Frontend Components

- `PaymentModal.jsx` - Payment form and processing UI
- Updated `EventDetails.jsx` - Integrated payment flow

## QR Code Features

### QR Code Generation

- Secure QR codes generated using HMAC-SHA256
- Format: `eventId:userId:ticketId:timestamp:hash`
- Includes security hash to prevent tampering
- Unique for each ticket

### QR Code Validation

- Validates QR code format and signature
- Checks ticket status (valid, used, cancelled)
- Verifies ticket belongs to event
- Returns detailed ticket and user information

### QR Scanner

- Real-time camera-based scanning
- Manual QR code entry option
- Visual feedback for valid/invalid tickets
- Check-in functionality integrated
- Displays ticket and attendee information

### Check-In Flow

1. Organizer/admin accesses check-in page
2. QR scanner is activated
3. Attendee presents QR code
4. QR code is scanned or manually entered
5. System validates QR code
6. Ticket information is displayed
7. Organizer can check in the attendee
8. Ticket status is updated to "used"
9. Check-in confirmation is shown

### Backend Endpoints

- `POST /api/tickets/validate-qr` - Validate QR code
- `POST /api/tickets/check-in/:ticketId` - Check in ticket

### Frontend Components

- `QRScanner.jsx` - QR code scanning component
- Updated `CheckIn.jsx` - Integrated QR scanning and validation

## Security Features

### Payment Security

- Secure payment processing
- Transaction ID tracking
- Payment information encrypted
- No card details stored (mock implementation)

### QR Code Security

- HMAC-based signature verification
- Tamper-proof QR codes
- Unique codes per ticket
- Expiry validation (1 year)

## Installation

### Frontend Dependencies

```bash
npm install html5-qrcode
```

### Backend Dependencies

Already included in `backend/package.json`:
- `crypto` (Node.js built-in) - For QR code hashing

## Usage Examples

### Payment Processing (Frontend)

```javascript
// In EventDetails.jsx
const handlePaymentSuccess = async (payment) => {
  const result = await api.bookTicketWithPayment(
    user.id,
    event.id,
    selectedTicket,
    quantity,
    payment.id,
    payment.transactionId
  );
  // Navigate to confirmation
};
```

### QR Validation (Frontend)

```javascript
// In CheckIn.jsx
const handleQRScan = async (qrCode, eventId, checkIn = false) => {
  const validation = await api.validateQRCode(qrCode, eventId);
  
  if (validation.valid && checkIn && !validation.alreadyUsed) {
    await api.checkInTicket(validation.ticket.id, eventId);
  }
};
```

### QR Validation (Backend)

```javascript
// POST /api/tickets/validate-qr
{
  "qrCode": "e1:1:t-123456789:1234567890:abc123def456",
  "eventId": "e1" // optional
}

// Response
{
  "valid": true,
  "ticket": { ... },
  "event": { ... },
  "user": { ... },
  "alreadyUsed": false,
  "message": "Ticket is valid"
}
```

## Testing

### Test Payment Cards

For mock payment processing:
- Card starting with `4242` - Success
- Card starting with `5555` - Success
- Card starting with `4000` - Success
- Card starting with `0000` - Success (test card)
- Other cards - Decline

### Test QR Codes

QR codes are automatically generated when tickets are booked. To test:

1. Book a ticket through the frontend
2. Get the QR code from the ticket (in MyTickets or confirmation)
3. Use the QR scanner to scan the code
4. Validate the ticket

## Future Enhancements

- Real payment gateway integration (Stripe, PayPal, etc.)
- Email/SMS ticket delivery with QR codes
- QR code generation as images/PDFs
- Batch QR code scanning
- Offline QR validation
- Payment refund functionality
- Multi-currency support
