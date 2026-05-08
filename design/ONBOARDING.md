# Design Document: Falcon Fitness Onboarding Flow

## Overview
Implement a mandatory onboarding step that requires users to complete their profile information immediately after signing in and before accessing any part of the application.

## Key Objectives
1. **Mandatory Profile Completion:** Gate the entire tab navigation behind a profile check.
2. **Premium Aesthetic:** Create a "Gym Poster" style onboarding screen with a dark, high-contrast background and glassmorphic inputs.
3. **Data Integrity:** Ensure that `full_name`, `username`, `height`, and `fitness_goal` are captured and stored in the Supabase `profiles` table.

## Architecture

### 1. Centralized Layout Guard (`app/(tabs)/_layout.tsx`)
Update the layout to handle three distinct states:
- **Unauthenticated:** Show the `Auth` (Login) screen.
- **Authenticated but Incomplete:** Show the `Onboarding` screen.
- **Authenticated and Complete:** Show the main `Tabs` interface.

### 2. Onboarding Component (`components/Onboarding.tsx`)
- **Visuals:** Use a high-quality gym-themed background image (`ImageBackground`).
- **Interaction:** A multi-step or single-form experience that collects:
  - Full Name
  - Username
  - Height (Numeric)
  - Fitness Goal (Text)
- **Action:** A "COMPLETE SETUP" button with a gold gradient that saves the data and "unlocks" the app.

## Implementation Steps
1. **Develop the `Onboarding` Component:** Build the UI with the requested aesthetic and form logic.
2. **Integrate into `TabLayout`:** 
   - Implement a `checkProfile` function using Supabase.
   - Update the conditional rendering logic in `_layout.tsx`.
3. **Refine Individual Screens:** Ensure individual screens (`index.tsx`, `two.tsx`) don't interfere with the new layout-level guard.

## Success Criteria
- A new user logs in and is immediately presented with the Profile Completion screen.
- The user cannot navigate to Home, Food, or Booking until they submit the form.
- Upon submission, the app seamlessly transitions to the Home screen.
