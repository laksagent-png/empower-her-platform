

## Plan: Event Navigation, Pagination, and Gallery Improvements

### 1. Clickable Upcoming Event Tiles
**File:** `src/components/UpcomingEvents.tsx`

Wrap the entire event card in a `<Link to={/events/${id}}>`. Register and Share buttons use `e.stopPropagation()` to prevent navigation.

### 2. Upcoming Events — Vertical Pagination (10 per page)
**File:** `src/components/UpcomingEvents.tsx`

- Keep the existing grid layout (not horizontal scroll).
- Show only the first 10 upcoming events initially.
- Add a "Load More Events" button that reveals 10 more each click.
- Hide button when all events are shown.

### 3. Past Events — Remove Inline Gallery, Add "View Gallery" Link
**File:** `src/components/PastEvents.tsx`

- Remove the inline gallery grid and lightbox entirely from homepage.
- If event has images, show a "View Gallery →" link pointing to `/events/${event.id}`.

### 4. Past Events — Vertical Pagination (5 per page)
**File:** `src/components/PastEvents.tsx`

- Show only the first 5 past events initially.
- "Load More Events" button reveals 5 more each click.

### 5. Event Detail Page — Lazy-Load Gallery
**File:** `src/pages/EventDetail.tsx`

- Show first 4 gallery images. "Load More Photos" button reveals 8 more per click.
- Keep existing lightbox on detail page.

### 6. "Back to Home" Navigates to Originating Section
**File:** `src/pages/EventDetail.tsx`

- Link to `/#events` for upcoming events, `/#past-events` for completed events.

