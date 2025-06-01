Development Notes & Context
Project Genesis

Purpose: Mobile app for Seattle Chinatown Book Club (~300 members)
Developer Background: Familiar with TypeScript, React, Tailwind CSS
IDE: Using Cursor with Claude-4-Sonnet integration

Technical Decisions Made
Why React Native + Expo?

Cross-platform development (iOS + Android)
Leverages existing React/TypeScript knowledge
Expo simplifies mobile-specific features (calendar, notifications, camera)
Good for rapid prototyping and deployment

Why Firebase?

Real-time database perfect for comments/RSVPs
Built-in authentication with role management
File storage for profile pictures
Generous free tier suitable for initial 300 users
Scales well as user base grows

Why NativeWind?

Leverages existing Tailwind CSS knowledge
Consistent styling approach with web development
Good performance on mobile

Architecture Decisions
User Role System

Two-tier system: Admin vs Member
Admins inherit all member permissions plus moderation
Role-based UI rendering and API access

Event System Design

Events created by any member
RSVP system with attendance tracking
Comment threads with reply functionality
Calendar integration for reminders

State Management Strategy

Zustand for global state (user session, cached data)
React Hook Form for form state
Firebase real-time listeners for live data

Cost Considerations

Development Phase: Essentially free
Production Costs:

Apple Developer: $99/year
Google Play: $25 one-time
Firebase: Likely $10-30/month with 300 active users



Development Environment Setup Completed

✅ React Native + Expo project created
✅ TypeScript configuration
✅ NativeWind (Tailwind) integration
✅ Project structure established
✅ iOS testing (physical iPhone) working
✅ Android testing (emulator) working
✅ Basic dependencies installed

Immediate Next Steps

Firebase project setup and configuration
Authentication flow implementation
Navigation structure with React Navigation
Core screen implementations
Database schema design for users/events/comments

Key Files Created

tailwind.config.js - Tailwind configuration
metro.config.js - Metro bundler config for NativeWind
global.css - Tailwind imports
src/types/index.ts - TypeScript type definitions
Folder structure for organized development

Testing Strategy

Development: Expo Go on physical devices
Pre-production: EAS Build for testing
Production: App Store deployment via EAS Submit