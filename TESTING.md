# Auro Laundromat Testing Guide

This guide covers the steps to test the Auro laundromat application, including setting up the development environment, seeding test data, and verifying key functionality.

## Prerequisites

- Node.js 18+ and npm
- Supabase CLI
- Google Maps API key (for map functionality)

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Database Setup

1. Start Supabase locally:
   ```bash
   supabase start
   ```

2. Run migrations:
   ```bash
   supabase db reset
   ```

3. Seed test data:
   ```bash
   supabase db seed
   ```

## Running the Development Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

## Testing Key Features

### 1. Laundromat Listing

- [ ] Visit the homepage
- [ ] Click "View All Laundromats"
- [ ] Verify laundromats are displayed with:
  - Name, address, and borough
  - Machine availability counts
  - Map pins (if coordinates available)
- [ ] Test search functionality by name/address/borough
- [ ] Verify map updates when searching

### 2. Laundromat Details

- [ ] Click "View Details" on a laundromat
- [ ] Verify both map and grid views show machines
- [ ] Check machine status indicators (available, in use, out of order)
- [ ] Verify real-time updates (wait 10s)

### 3. Booking Flow

- [ ] Find an available machine
- [ ] Click to book
- [ ] Select date/time
- [ ] Submit booking
- [ ] Verify:
  - Success message
  - Machine status updates
  - Booking appears in "Next Laundry Session"

### 4. Booking Cancellation

- [ ] Find an active booking
- [ ] Click to cancel
- [ ] Verify:
  - Success message
  - Machine becomes available
  - Booking removed from "Next Laundry Session"

### 5. Row Level Security (RLS)

Test the following policies:

1. Public access to laundromats:
   ```sql
   -- Anyone can read laundromats
   CREATE POLICY "Public read access"
   ON laundromats FOR SELECT
   TO public
   USING (true);
   ```

2. Public access to machines:
   ```sql
   -- Anyone can read machines
   CREATE POLICY "Public read access"
   ON machines FOR SELECT
   TO public
   USING (true);
   ```

3. User-specific booking access:
   ```sql
   -- Users can only read their own bookings
   CREATE POLICY "Users can read own bookings"
   ON bookings FOR SELECT
   TO authenticated
   USING (auth.uid() = user_id);

   -- Users can create bookings for themselves
   CREATE POLICY "Users can create own bookings"
   ON bookings FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = user_id);

   -- Users can cancel their own bookings
   CREATE POLICY "Users can update own bookings"
   ON bookings FOR UPDATE
   TO authenticated
   USING (auth.uid() = user_id);
   ```

To test RLS:

1. Create two test users
2. Log in as User A and create a booking
3. Log in as User B and verify they cannot:
   - See User A's bookings
   - Cancel User A's bookings
   - Create bookings for User A

## Common Issues

1. Map not loading
   - Check Google Maps API key
   - Verify key has correct permissions
   - Check browser console for errors

2. Real-time updates not working
   - Check Supabase connection
   - Verify WebSocket connection
   - Check browser console for errors

3. Booking failures
   - Verify user is authenticated
   - Check RLS policies
   - Verify machine is actually available

## Reporting Issues

When reporting issues, please include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser console logs
5. Network request/response data
6. Screenshots if applicable 