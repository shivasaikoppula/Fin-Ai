# Design Guidelines: AdventureSync - Outdoor Adventurer Meeting Scheduler

## Design Approach

**Selected Approach**: Reference-Based with Adventure Theme
- Primary inspiration: Airbnb (trust and community), Notion (clean scheduling interface), AllTrails (outdoor aesthetic)
- Purpose: Experience-focused app combining utility with adventure brand identity
- Key principle: Make timezone scheduling feel like planning an outdoor expedition

## Typography

**Font Families** (via Google Fonts):
- Primary: 'Inter' - Clean, professional for UI elements and body text
- Accent: 'Montserrat' - Bold, adventurous for headers and CTAs
- Monospace: 'JetBrains Mono' - For timezone/time displays

**Hierarchy**:
- Hero Headlines: Montserrat Bold, 4xl-6xl
- Section Headers: Montserrat SemiBold, 2xl-3xl  
- Body Text: Inter Regular, base-lg
- UI Labels: Inter Medium, sm
- Time Displays: JetBrains Mono Medium, lg

## Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, and 8 as primary rhythm
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, m-4, gap-4 (cards, form fields)
- Section spacing: p-6, py-8 (between major sections)
- Page margins: px-8, py-12 (outer containers)

**Grid System**:
- Container: max-w-7xl mx-auto
- Dashboard: 3-column grid (lg:grid-cols-3) for upcoming meetings
- Meeting details: 2-column split (form/participants + timezone map)
- Mobile: Single column stack

## Component Library

**Navigation**:
- Top bar with logo, main nav links, user profile dropdown
- Sticky positioning on scroll
- Mountain peak icon as logo element

**Dashboard Cards**:
- Meeting cards with elevated shadow (shadow-lg)
- Rounded corners (rounded-xl)
- Icon badges for meeting type (hike, climb, camp)
- Time displayed in user's timezone with conversion indicator

**Meeting Creator**:
- Multi-step form wizard with progress indicator
- Participant selector with timezone chips
- Visual timezone converter showing all participant times simultaneously
- Map component displaying participant locations with markers

**Timezone Display**:
- Horizontal timeline showing 24-hour cycle
- Highlighted overlap zones for optimal meeting times
- Participant avatars positioned at their local times

**Notification Panel**:
- Slide-out panel from right side
- Reminder list with countdown timers
- Adventure-themed icons (compass for upcoming, flag for completed)

**Calendar View**:
- Month grid with meeting dots
- Color-coded by meeting type
- Click to expand day details

## Images

**Hero Section**:
- Large, immersive hero image (h-[600px]) featuring mountain peaks at sunrise/sunset or group of hikers on summit
- Overlay with semi-transparent gradient (from-black/60 to-transparent)
- Centered headline and CTA over image
- Blurred background buttons for primary actions

**Supporting Images**:
- Feature section: Small square images (300x300) showing people using app in outdoor settings
- Team avatars: Circular, bordered profile images throughout
- Timezone map: Embedded interactive map component (use Leaflet.js)
- Empty states: Illustrated graphics of compass/backpack when no meetings scheduled

## Interactions

**Minimal Animations**:
- Card hover: Subtle lift (translate-y-1) and shadow increase
- Button press: Scale down slightly (scale-95 active state)
- Form validation: Shake animation on error
- Meeting creation success: Confetti burst (use canvas-confetti library)
- NO scroll-triggered animations
- NO parallax effects

## Special Features

**Timezone Intelligence**:
- Auto-detect user timezone
- Smart suggestions for meeting times based on participant locations
- Visual conflict indicators when times don't overlap well
- "Golden hour" highlighting for optimal meeting windows

**Adventure Branding Elements**:
- Compass rose icon for timezone selector
- Mountain peak dividers between sections
- Trail marker icons for progress indicators
- Topographic line patterns as subtle backgrounds (very light opacity)

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation for meeting creation flow
- High contrast mode support
- Screen reader announcements for timezone conversions
- Focus indicators on all inputs (ring-2 ring-offset-2)

## Page Structure

**Landing Page** (5 sections):
1. Hero with mountain backdrop and value proposition
2. Key features grid (3-col: timezone magic, notifications, team collaboration)
3. Visual demo of timezone converter in action
4. Social proof - testimonials from outdoor groups/companies
5. CTA section with signup form

**Dashboard** (authenticated):
- Top navigation
- Quick action bar (Create Meeting, View Calendar)
- Upcoming meetings grid
- Timezone world clock widget
- Recent activity feed

**Meeting Detail Page**:
- Meeting header with adventure type icon
- Left column: Meeting info, participant list
- Right column: Interactive timezone map, suggested times
- Bottom: Reminder settings, actions (edit, delete, share)