Seattle Chinatown Book Club App
Project Overview
A React Native mobile application for the Seattle Chinatown Book Club with ~300 members and growing. The app enables event management, user accounts, and community interaction.
Core Features

User Management: Admin and member accounts with role-based permissions
Event System: Create, host, and RSVP to book club events
Social Features: Comments, replies, and user profiles
Calendar Integration: Add events to device calendars
Profile Customization: Bio, hobbies, favorite books, profile pictures

Tech Stack

Framework: React Native with Expo
Language: TypeScript
Styling: NativeWind (Tailwind CSS for React Native)
Backend: Firebase (Firestore, Auth, Storage, Functions)
State Management: Zustand
Navigation: React Navigation v6
Forms: React Hook Form
Date Handling: date-fns

User Roles & Permissions
Admin Accounts

All member account abilities
Remove comments and events from other users
User management capabilities

Member Accounts

Create and host events
RSVP to events
Save events to account
Upload profile pictures
Customize profile (bio, hobbies, favorite books)
Comment on events and reply to comments

Project Structure
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── events/          # Event-related components
│   └── user/            # User/profile components
├── screens/
│   ├── auth/            # Login/register screens
│   ├── events/          # Event listing, details, creation
│   ├── profile/         # User profiles and settings
│   └── admin/           # Admin-only screens
├── navigation/          # Navigation configuration
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── stores/              # Zustand store definitions
Development Setup

Uses Expo for development and building
NativeWind configured for Tailwind CSS
TypeScript strict mode enabled
Testing on both iOS (physical device) and Android (emulator)

Key Dependencies
json{
  "@react-navigation/native": "navigation",
  "@react-navigation/stack": "stack navigation",
  "@react-navigation/bottom-tabs": "tab navigation",
  "nativewind": "tailwind for react native",
  "react-hook-form": "form handling",
  "zustand": "state management",
  "date-fns": "date utilities"
}
Development Commands
bash# Start development server
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android

# Build for production (when ready)
eas build --platform all
Next Development Steps

Set up Firebase backend integration
Implement authentication system
Create navigation structure
Build core screens (events, profile, auth)
Add real-time features (comments, RSVPs)
Implement admin functionality

Design Considerations

Mobile-first responsive design
Accessibility compliance
Scalable architecture for 300+ users
Real-time updates for social features
Offline capability considerations

Deployment

Target: iOS App Store and Google Play Store
Using Expo Application Services (EAS) for builds
Firebase for backend infrastructure