# Availability Module

## Goal
API to check real-time room availability

## Endpoint
GET /availability?start=…&end=…

## Rules
- Must prevent overbooking
- Use Redis cache for performance
- Return list of available rooms + prices

## Edge Cases
- start >= end → error
- overlapping bookings