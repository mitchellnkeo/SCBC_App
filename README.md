# 📚 Seattle Chinatown Book Club App

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)

**A comprehensive mobile application for the Seattle Chinatown Book Club community**

*Connecting AANHPI voices through literature and community events*

</div>

## 🌟 **Overview**

The Seattle Chinatown Book Club App is a production-ready React Native application designed for a growing community of 300+ members. Built with modern technologies and scalable architecture, it provides a complete platform for book club management, community interaction, and event coordination.

## ✨ **Key Features**

### 📅 **Event Management**
- **Create & Host Events** - Members can create book club events with rich details
- **Admin Approval System** - All member-created events require admin approval
- **RSVP System** - Going/Maybe/Not Going with real-time attendee counts
- **Event Comments** - Threaded discussions with @mentions and notifications
- **Calendar Integration** - Add events directly to device calendars
- **Image Support** - Upload event header images

### 👥 **User System**
- **Role-Based Access** - Admin and Member roles with different permissions
- **Rich Profiles** - Bio, hobbies, favorite books, profile pictures
- **@Mention System** - Tag users in comments with real-time notifications
- **User Discovery** - Search and view other member profiles

### 📖 **Monthly Book Management**
- **Admin-Editable Books** - Complete monthly book selection management
- **Book Cover Upload** - Upload and manage book cover images
- **Discussion Sheets** - Link to Google Docs for reading guides
- **Book Details** - Title, author, genre, pages, awards, selection reasoning

### 🔔 **Notification System**
- **Real-Time Notifications** - Instant updates for mentions, comments, events
- **Push Notifications** - Cross-platform notification support
- **Notification Center** - In-app notification management
- **Smart Batching** - Efficient notification delivery

### 🛡️ **Admin Panel**
- **Event Approval** - Review and approve/reject member events
- **User Management** - Manage user roles and permissions
- **Monthly Book Control** - Full CRUD operations for book selections
- **Content Moderation** - Admin oversight of community content

### 🎨 **User Experience**
- **Modern UI** - Clean, intuitive design with consistent styling
- **Responsive Design** - Optimized for all screen sizes
- **Loading States** - Smooth loading indicators throughout
- **Error Handling** - User-friendly error messages and recovery
- **Offline Resilience** - Graceful handling of network issues

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build system
- **TypeScript** - Type-safe development
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - Lightweight state management
- **React Navigation** - Navigation and routing
- **React Hook Form** - Form handling and validation

### **Backend & Services**
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Authentication** - User authentication and management
- **Firebase Storage** - Image and file storage with CDN
- **Firebase Analytics** - User behavior and app performance tracking
- **Expo Notifications** - Cross-platform push notifications

### **Development Tools**
- **EAS Build** - Cloud-based build service
- **TypeScript Strict Mode** - Enhanced type checking
- **ESLint & Prettier** - Code quality and formatting
- **Git** - Version control with conventional commits

## 📱 **User Roles & Permissions**

### 👑 **Admin Users**
- ✅ All member capabilities
- ✅ Approve/reject member-created events
- ✅ Create auto-approved events
- ✅ Manage monthly book selections
- ✅ Upload book cover images
- ✅ Access admin panel and analytics
- ✅ User management capabilities

### 👤 **Member Users**
- ✅ Create events (pending admin approval)
- ✅ RSVP to events
- ✅ Comment on events with @mentions
- ✅ Customize profile (bio, hobbies, books)
- ✅ Upload profile pictures
- ✅ View monthly book selections
- ✅ Receive real-time notifications

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator
- Firebase project with Firestore, Auth, and Storage enabled

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SCBCApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file with Firebase configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Set up Firebase Security Rules**
   
   **Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null;
       }
       match /events/{eventId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       match /rsvps/{rsvpId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       match /comments/{commentId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       match /monthlyBooks/{bookId} {
         allow read: if request.auth != null;
         allow create, update, delete: if request.auth != null 
           && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

   **Storage Rules:**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /profile-pictures/{allPaths=**} {
         allow read: if true;
       }
       match /profile-pictures/{fileName} {
         allow write, delete: if request.auth != null 
           && fileName.matches('.*' + request.auth.uid + '.*');
       }
       match /monthlyBooks/{bookId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write, delete: if request.auth != null 
           && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

### **Development Commands**

```bash
# Start development server
npm start

# Start with specific platform
npm run ios
npm run android

# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

## 📁 **Project Structure**

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   ├── events/              # Event-related components
│   ├── navigation/          # Navigation components
│   └── user/                # User/profile components
├── screens/
│   ├── admin/               # Admin panel screens
│   ├── auth/                # Authentication screens
│   ├── books/               # Monthly book screens
│   ├── events/              # Event management screens
│   ├── info/                # Information screens
│   └── profile/             # User profile screens
├── services/
│   ├── authService.ts       # Authentication logic
│   ├── eventService.ts      # Event management
│   ├── monthlyBookService.ts # Book management
│   ├── notificationService.ts # Push notifications
│   └── userService.ts       # User operations
├── stores/
│   ├── authStore.ts         # Authentication state
│   └── eventStore.ts        # Event state
├── navigation/              # Navigation configuration
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
├── types/                   # TypeScript definitions
└── config/                  # App configuration
```

## 🔧 **Configuration**

### **Key Configuration Files**
- `src/config/constants.ts` - App-wide constants and limits
- `src/config/firebase.ts` - Firebase initialization
- `app.json` - Expo configuration
- `eas.json` - Build configuration

### **Environment Variables**
All sensitive configuration is managed through environment variables. See `.env.example` for required variables.

## 🧪 **Testing**

```bash
# Run unit tests (when implemented)
npm test

# Run E2E tests (when implemented)
npm run test:e2e

# Type checking
npx tsc --noEmit
```

## 📦 **Deployment**

### **Build Process**
1. **Development Build**
   ```bash
   eas build --profile development
   ```

2. **Preview Build**
   ```bash
   eas build --profile preview
   ```

3. **Production Build**
   ```bash
   eas build --profile production
   ```

### **App Store Submission**
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## 🔒 **Security**

- **Firebase Security Rules** - Comprehensive database and storage protection
- **Role-Based Access Control** - Admin/member permission system
- **Input Validation** - Client and server-side validation
- **Environment Variables** - Secure configuration management
- **Authentication** - Firebase Auth with email/password

## 📊 **Performance**

- **Optimized Queries** - Efficient Firestore queries with pagination
- **Image Optimization** - Compressed uploads and CDN delivery
- **Real-time Updates** - Efficient WebSocket connections
- **Caching Strategy** - Smart caching for improved performance
- **Bundle Size** - Optimized for fast app startup

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Seattle Chinatown Book Club community
- AANHPI literary community
- Open source contributors
- Firebase and Expo teams

## 📞 **Support**

For support, email seattlechinatownbookclub@gmail.com or create an issue in this repository.

---

<div align="center">

**Built with ❤️ for the Seattle Chinatown Book Club community**

*Connecting readers, celebrating AANHPI voices, building community*

</div>