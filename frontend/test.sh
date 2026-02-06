#!/bin/bash
set -e  # Exit if any command fails
set -x  # Show each command being executed

# ==============================
# Terminal Backend Test Script (Auto-register user if needed)
# ==============================

# ------------------------------
# 1. Organizer Login
# ------------------------------
echo "Logging in as organizer..."
ORG_LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "org@example.com",
    "password": "password123"
  }')

ORG_TOKEN=$(echo $ORG_LOGIN | jq -r '.token')
if [ "$ORG_TOKEN" == "null" ] || [ -z "$ORG_TOKEN" ]; then
  echo "Organizer login failed. Response:"
  echo $ORG_LOGIN
  exit 1
fi
echo "Organizer token: $ORG_TOKEN"
echo

# ------------------------------
# 2. Create Event
# ------------------------------
echo "Creating a new event..."
EVENT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORG_TOKEN" \
  -d '{
    "title": "Terminal Test Event",
    "description": "Created via terminal script",
    "category": "Tech",
    "date": "2024-12-31",
    "time": "18:00",
    "location": "Kathmandu",
    "image": "https://example.com/image.jpg",
    "isOnline": false,
    "ticketTypes": [
      {"name": "General Admission", "price": 1000, "quantity": 50}
    ]
  }')

EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.id')
TICKET_TYPE_ID=$(echo $EVENT_RESPONSE | jq -r '.ticketTypes[0].id')

if [ "$EVENT_ID" == "null" ] || [ -z "$EVENT_ID" ]; then
  echo "Event creation failed. Response:"
  echo $EVENT_RESPONSE
  exit 1
fi
echo "Event created! ID: $EVENT_ID, Ticket Type ID: $TICKET_TYPE_ID"
echo

# ------------------------------
# 3. User Login (auto-register if fails)
# ------------------------------
echo "Logging in as user..."
USER_LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }')

USER_TOKEN=$(echo $USER_LOGIN | jq -r '.token')

if [ -z "$USER_TOKEN" ] || [ "$USER_TOKEN" == "null" ]; then
  echo "User login failed, registering user..."
  REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test User",
      "email": "user@example.com",
      "password": "password123",
      "role": "user"
    }')

  USER_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')

  if [ -z "$USER_TOKEN" ] || [ "$USER_TOKEN" == "null" ]; then
    echo "User registration failed. Response:"
    echo $REGISTER_RESPONSE
    exit 1
  fi
  echo "User registered and token obtained!"
fi

echo "User token: $USER_TOKEN"
echo

# ------------------------------
# 4. Book Tickets
# ------------------------------
echo "Booking 2 tickets for the new event..."
BOOK_RESPONSE=$(curl -s -X POST http://localhost:5000/api/tickets/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"ticketTypeId\": \"$TICKET_TYPE_ID\",
    \"quantity\": 2
  }")

echo "Booking response:"
echo $BOOK_RESPONSE | jq
echo
echo "✅ Test completed successfully!"

