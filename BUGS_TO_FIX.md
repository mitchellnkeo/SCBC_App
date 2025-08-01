# 🐛 SCBC App - Bugs to Fix

This file tracks known bugs and issues that need to be addressed in future development cycles.

## 🟡 Medium Priority

### Theme System Edge Cases
**Status:** 📋 To Do  
**Component:** `src/contexts/ThemeContext.tsx`  

**Issue:**
Some edge cases in theme switching may not update all UI elements immediately.

**Next Steps:**
- [ ] Audit all screens for theme consistency
- [ ] Test rapid theme switching
- [ ] Ensure proper cleanup of theme listeners

---

## 🟢 Low Priority

### Performance Optimizations
**Status:** 📋 To Do  

**Potential Areas:**
- [ ] Event list virtualization for large datasets
- [ ] Image caching optimization
- [ ] Reduce re-renders in complex forms

---

## 🔧 Development Notes

### Bug Report Template
When adding new bugs, please include:

1. **Status:** 🔴 Critical / 🟡 Medium / 🟢 Low / 🔍 Investigating / ✅ Fixed
2. **Component/File:** Specific location of the issue
3. **Steps to Reproduce:** Clear reproduction steps
4. **Expected vs Actual Behavior:** What should happen vs what happens
5. **Device/Platform:** iOS/Android specific issues
6. **Attempted Fixes:** What has been tried
7. **Next Steps:** Action items for resolution

### Labels
- 🔴 **Critical:** App-breaking, user-facing issues
- 🟡 **Medium:** Functionality issues, UX problems
- 🟢 **Low:** Nice-to-have improvements, minor issues
- 🔍 **Investigating:** Currently being researched
- ✅ **Fixed:** Resolved and tested

---

## 📝 Fixed Issues

### ✅ Date Picker Auto-Selection Issue
**Fixed:** Current Session  
**Issue:** Date picker automatically selected dates while user was scrolling/browsing, making it difficult to choose specific dates  
**Solution:** 
- Added temporary date state for browsing on iOS
- Implemented manual confirmation buttons (Cancel/Confirm) for iOS
- Maintained Android default behavior while improving iOS UX
- Users can now scroll through dates freely and confirm their selection manually

### ✅ Keyboard returnKeyType Implementation
**Fixed:** Current  
**Issue:** TextInput fields didn't have proper "Done" buttons for keyboard dismissal  
**Solution:** Added `returnKeyType="done"` and `onSubmitEditing` handlers to major forms

### ✅ Deprecated blurOnSubmit Warning
**Fixed:** Current  
**Issue:** React Native warning about deprecated `blurOnSubmit` prop  
**Solution:** Replaced with `submitBehavior` prop

### ~~Time Input UX Enhancement~~ ✅ FIXED  
**Priority**: Medium  
**Status**: ✅ Fixed - January 2025

**Problem Description**:
- ~~Single time input field was insufficient for events with clear start/end times~~
- ~~Users had to manually type time strings without validation~~
- ~~No clear indication of event duration for attendees~~
- ~~Inconsistent time formatting across the app~~

**Impact**:
- ~~Unclear event duration for attendees making it hard to plan~~
- ~~Potential for time input errors and inconsistent formatting~~
- ~~Poor user experience when creating/editing events~~

**Solution Implemented**:
- ✅ **Replaced single time input with start/end time picker component**
- ✅ **Native time picker integration**: iOS spinner and Android clock interfaces
- ✅ **Smart time validation**: Prevents end time before start time
- ✅ **Auto-suggestion**: 2-hour duration suggested when start time is selected
- ✅ **Visual time range display**: Shows "7:00 PM - 9:00 PM" format throughout app
- ✅ **Platform-optimized UX**: iOS modal with Cancel/Confirm, Android direct selection
- ✅ **Backward compatibility**: Seamless migration from old single time field
- ✅ **Comprehensive time formatting**: Consistent display across all components

**Technical Details**:
- Created new `TimePicker` component with full time management capabilities
- Updated data structure from `time: string` to `startTime: string, endTime: string`
- Implemented backward compatibility for existing events with legacy time field
- Updated all display components to handle both old and new time formats

**Files Modified**:
- `src/components/common/TimePicker.tsx` (NEW)
- `src/types/index.ts` (data structure updates)
- All event screens and components updated for new time structure

**Result**: Professional time range display with intuitive native time selection, making events much clearer for both organizers and attendees.

---

*Last Updated: [Current Date]*  
*Maintainer: Development Team*

---

## 🆕 Recently Fixed Issues

### ✅ TimePicker UX Improvements
**Fixed:** Current Session  
**Issue:** TimePicker had poor user experience with auto-selection on scroll and unreliable time setting  
**Solution:** 
- **iOS**: Restored modal with Cancel/Confirm buttons to prevent auto-selection while scrolling
- **Android**: Maintained native behavior with immediate selection 
- **Direct picker access**: Time picker opens immediately when input field is tapped (no intermediate dialogs)
- **Reliable time setting**: Eliminated buggy temp state management that caused blank fields
- **Platform-optimized behavior**: iOS spinner with manual confirmation, Android clock with auto-confirm
- **Smart auto-suggestion**: End time suggestion only when needed, doesn't interfere with manual selection

### ✅ TimePicker Final Fixes - Complete Resolution
**Fixed:** Current Session  
**Issue:** Final bugs with TimePicker including start time not displaying in UI and unwanted auto-suggestion  
**Solution:** 
- **Fixed start time display**: Resolved state update timing issue where start time wasn't appearing in UI field after selection
- **Removed auto-suggestion**: Eliminated automatic end time suggestion feature per user preference
- **Eliminated circular parsing**: Fixed buggy parsing loop that caused random end time values
- **Direct Date object usage**: Modified confirmStartTime to use tempStartTime Date object directly instead of re-parsing formatted strings
- **Enhanced debugging**: Added comprehensive logging to track state flow and identify issues
- **Clean validation**: Fixed time range validation to properly handle "9:30 AM to 11:00 AM" format
- **Result**: TimePicker now works perfectly with reliable time setting, no auto-suggestion, and proper validation

### ✅ TimePicker Unicode Whitespace Parsing Bug
**Fixed:** Current Session  
**Issue:** Time validation was failing with "End time must be after start time" error even for valid ranges like "4:00 PM to 6:00 PM"  
**Root Cause:** The `toLocaleTimeString` function was producing time strings with Unicode whitespace characters (like non-breaking space U+00A0) instead of regular ASCII spaces, causing `split(' ')` to fail  
**Solution:** 
- **Fixed parsing regex**: Changed from `split(' ')` to `split(/\s+/)` to handle any Unicode whitespace characters
- **Robust time parsing**: Now correctly splits "4:00 PM" into ["4:00", "PM"] regardless of whitespace type
- **Eliminated false validation errors**: Time range validation now works correctly for all time formats
- **Platform compatibility**: Handles different locale formatting across iOS/Android devices
- **Result**: No more false "End time must be after start time" errors, reliable time validation for all Unicode whitespace variants

### ✅ Address Action Feature - New UX Enhancement
**Added:** Current Session  
**Feature:** Enhanced address interaction with multiple mapping and copy options  
**Implementation:** 
- **Created AddressAction component**: Reusable component that wraps any address display element
- **Three action options**: Google Maps, Apple Maps, and Copy to Clipboard when address is tapped
- **Smart app detection**: Tries to open native apps first, falls back to web versions if apps not installed
- **Platform optimization**: Uses appropriate URL schemes for iOS and Android
- **Cross-platform compatibility**: Works consistently across all devices and platforms
- **Applied globally**: Integrated in EventDetailsScreen and PendingEventsScreen (admin)
- **User-friendly feedback**: Shows confirmation when address is copied to clipboard
- **Result**: Users can now easily navigate to event locations using their preferred mapping app or copy addresses for external use

### ✅ Past Date/Time Validation
**Fixed:** Current Session  
**Issue:** Users could create or edit events with dates/times that had already passed, leading to invalid events  
**Solution:** 
- Added comprehensive validation to prevent past date/time selection
- Date pickers already had `minimumDate={new Date()}` to prevent past dates
- Enhanced form validation to check same-day events with past start/end times
- Added `eventDate` prop to TimePicker component for context-aware validation
- Shows specific error messages: "Start time cannot be in the past" and "End time cannot be in the past"
- Applied to both CreateEventScreen and EditEventScreen
- Example: If it's September 9th, 2025 11am, users cannot create events starting before 11am that same day

### ✅ Event Card Time Layout Overflow
**Fixed:** Current Session  
**Issue:** Date and time text was overflowing in event cards when displayed in card view, making text unreadable  
**Solution:** 
- Separated date and time into separate lines instead of concatenating them into one long string
- Added proper flex styling with `flex: 1` and `numberOfLines={1}` to prevent overflow
- Used consistent indentation with `marginLeft: 26` for time alignment
- Applied fix to `AllEventsTab.tsx`, `PastEventsTab.tsx`, and `MyEventsTab.tsx`
- Now displays cleanly with date on first line and time range on second line

### ✅ Event Card Time Display Issue
**Fixed:** Current Session  
**Issue:** Event cards were displaying incorrect single times (e.g., "9:47pm") instead of proper time ranges (e.g., "11:00am-12:00pm")  
**Solution:** 
- Fixed `formatTime` functions in `PastEventsTab.tsx` and `AllEventsTab.tsx` to use new `startTime` and `endTime` fields
- Updated time display calls from `formatTime(event.date)` to `formatTime(event.startTime, event.endTime)`
- Cleaned up unused `formatPSTTime` imports
- Now correctly shows time ranges like "11:00 AM - 1:00 PM" throughout the app

### ✅ Admin User Management System
**Added:** Current Session  
**Feature:** Complete admin role management system for promoting/demoting users  
**Implementation:** 
- **Created UserManagementScreen**: Full-featured admin interface for managing user roles
- **User statistics dashboard**: Shows total users, admin count, member count, and recent signups
- **Search and filter functionality**: Find users by name/email and filter by role (All/Admins/Members)
- **Role management actions**: Promote members to admin or demote admins to member with confirmation dialogs
- **Security safeguards**: Prevents admins from demoting themselves to avoid lockout
- **Real-time updates**: Local state updates immediately reflect changes without requiring page refresh
- **User service integration**: Uses existing `getAllUsers`, `updateUserRole`, and `getUserStats` functions
- **Navigation integration**: Added to MainNavigator and connected from AdminScreen "User Management" card
- **Responsive design**: Clean card-based interface with user info, role badges, and action buttons
- **Default role assignment**: New user registration defaults to 'member' role for security
- **Admin email system**: Existing hardcoded admin emails in `adminUtils.ts` remain for initial admin setup
- **Result**: Admins can now easily manage user permissions through an intuitive interface, with new users defaulting to member status until promoted by existing admins

### ✅ FAQ System (NEW FEATURE) 🆕

**Status**: ✅ **COMPLETED**
**Priority**: High
**Component**: FAQ Management
**Screens**: `src/screens/info/FAQScreen.tsx`
**Services**: `src/services/faqService.ts`

### Description
Complete FAQ system with public viewing and admin management capabilities.

### Implementation Details
**✅ FAQ Service** (`src/services/faqService.ts`):
- ✅ Complete Firebase CRUD operations
- ✅ FAQ types with question, answer, created by, published status, ordering
- ✅ Functions: `getPublishedFAQs`, `getAllFAQs`, `createFAQ`, `updateFAQ`, `deleteFAQ`, `reorderFAQs`, `getFAQStats`
- ✅ `createDefaultFAQs` function that generates 8 sample book club FAQs
- ✅ Optimized queries to avoid Firebase composite index requirements

**✅ FAQ Screen** (`src/screens/info/FAQScreen.tsx`):
- ✅ Public viewing mode with expand/collapse FAQ interface
- ✅ Admin mode toggle for content management
- ✅ Statistics dashboard for admins (Total and Published counts)
- ✅ Modal editing interface for creating/editing FAQs
- ✅ Draft/published system
- ✅ Sample content creation button
- ✅ Comprehensive error handling and validation
- ✅ Streamlined creation flow: "Publish" button for new FAQs (auto-published)
- ✅ Published/Draft toggle only shown when editing existing FAQs
- ✅ Role-based default view: Regular users see public view, Admins see admin view by default

**✅ Navigation Integration**:
- ✅ Added FAQ route to `MainNavigator.tsx`
- ✅ Added "Frequently Asked Questions" to TopNavbar menu

### Firebase Configuration Required
**✅ COMPLETED**: Firebase Security Rules updated in README.md

### **Meeting Details Management System (2024-12-19)**
- **Feature**: Replaced "Join the Discussion" section with admin-editable meeting details
- **Implementation**: 
  - Removed "Join the Discussion" box from Monthly Book screen
  - Added "In-Person Meeting Details" card with location, day, and time fields
  - Added "Virtual Meeting Details" card with Zoom link, day, and time fields
  - Admin-only edit functionality with modal forms
  - Added meeting details fields to EditMonthlyBookScreen admin form
  - Updated MonthlyBook interface to include nested meeting objects
- **Files modified**: 
  - `src/screens/books/MonthlyBookScreen.tsx` - New meeting details UI
  - `src/screens/admin/EditMonthlyBookScreen.tsx` - Admin form fields
  - `src/services/monthlyBookService.ts` - Updated interfaces
- **Status**: ✅ **COMPLETE**
- **Features**: 
  - Admin can set/edit in-person meeting location, day, and time
  - Admin can set/edit virtual meeting Zoom link, day, and time
  - Clickable Zoom links for users to join virtual meetings
  - Empty state messages for when no meeting details are set
  - Role-based permissions (only admins can edit)
- **UI**: Clean card-based interface with proper spacing and responsive design

### **Firebase Auth Persistence (2024-12-19)**
- **Issue**: Firebase Auth warning about missing AsyncStorage persistence
- **Impact**: Auth state not persisting between app sessions
- **Solution**: 
  - Installed `@react-native-async-storage/async-storage` package
  - Updated Firebase configuration to use AsyncStorage for auth persistence
  - Added proper TypeScript typing for Development Build environment
- **Files modified**: `src/config/firebase.ts`, `package.json`
- **Status**: ✅ **RESOLVED**
- **Testing**: Auth state now persists between app restarts
- **Warning elimination**: Resolved Firebase Auth warning about missing AsyncStorage

### **Event Header Image Upload System (2024-12-19)**
- **Issue**: Event header images were not being uploaded to Firebase Storage
- **Impact**: Images from previous sessions were lost, only local URIs were stored
- **Solution**: 
  - Added Firebase Storage imports to `eventService.ts`
  - Created `uploadEventHeaderImage()` function for React Native image uploads
  - Created `deleteEventHeaderImage()` function for cleanup
  - Updated `createEvent()` to upload images after event creation
  - Updated `updateEvent()` to handle image uploads, updates, and deletions
  - Updated `deleteEvent()` to clean up header images from storage
  - Updated Firebase Storage security rules to allow event header uploads
- **Files modified**: `src/services/eventService.ts`, `README.md`
- **Status**: ✅ **RESOLVED**
- **Features**: 
  - Event images now persist in Firebase Storage
  - Automatic image cleanup when events are deleted or images are changed
  - Proper error handling for image upload failures
- **Security**: Added `/event-headers/` path to Firebase Storage rules

## Recently Fixed Issues ✅

### ~~Date Picker Auto-Selection Issue~~ ✅ FIXED
**Priority**: Medium  
**Status**: ✅ Fixed - January 2025  

**Problem Description**:
- ~~The date picker had poor UX with a two-step process: tap form → dialog → tap again for calendar~~
- ~~Users found the indirect calendar access confusing and cumbersome~~

**Impact**:
- ~~Frustrating event creation/editing experience~~
- ~~Extra unnecessary taps to select dates~~

**Solution Implemented**:
- ✅ **Streamlined to direct calendar access**: Single tap on date form now opens calendar immediately
- ✅ **Enhanced visual design**: Added calendar icon (📅) for clarity
- ✅ **Platform-optimized behavior**:
  - **Android**: Direct selection with auto-close
  - **iOS**: Browse freely with manual Cancel/Confirm buttons
- ✅ **Modal overlay interface**: Clean bottom-up modal on iOS
- ✅ **Improved date formatting**: Shows "Wednesday, January 15, 2025" format
- ✅ **Applied to both Create and Edit Event screens**

**Technical Details**:
- Removed intermediate dialog step
- Implemented `openDatePicker()` function that directly shows DateTimePicker
- Added `datePickerOverlay` and `datePickerModal` styling for better UX
- Enhanced cross-platform date picker experience

**Files Modified**:
- `src/screens/events/CreateEventScreen.tsx`
- `src/screens/events/EditEventScreen.tsx`

**Result**: Much more intuitive and efficient date selection process for all users. 

### ✅ Text Size Setting Removal

**Added:** Current Session  
**Feature:** Removed Text Size setting from Settings screen  
**Implementation:** 
- **Removed Text Size section**: Eliminated the entire "Text Size" section with Small/Medium/Large options
- **Removed handleFontSizeChange function**: Cleaned up unused function from SettingsScreen
- **Updated AppSettings interface**: Removed fontSize property from types/settings.ts
- **Updated DEFAULT_SETTINGS**: Removed fontSize default value
- **Simplified settings UI**: Settings now only show Appearance (theme) and Profile Privacy options
- **Maintained functionality**: All other settings continue to work as expected
- **Result**: Cleaner, more focused settings interface without unused text size options

### ✅ My Events Categorization & Status Fix

**Added:** Current Session  
**Feature:** Improved My Events tab with proper event categorization and status handling  
**Implementation:** 
- **Event categorization**: Events are now properly divided into "Upcoming Events" and "Past Events" sections
- **Section dividers**: Clear visual separation with section headers showing event counts
- **Smart date logic**: Events are categorized based on date and time, considering end times when available
- **Dynamic status**: Events now show "Active" or "Past" status instead of always showing "Active"
- **Proper sorting**: Upcoming events sorted by earliest first, past events by most recent first
- **Event duration logic**: Uses end time if available, or adds 2 hours to start time for past event detection
- **Visual improvements**: Updated event cards and list items with proper status colors
- **Better UX**: Users can easily distinguish between events they need to attend vs. events they've already attended
- **Result**: Much more organized and useful My Events tab that properly handles event lifecycle

### ✅ Admin Panel Placeholder Cleanup

**Added:** Current Session  
**Feature:** Removed placeholder sections from Admin Panel  
**Implementation:** 
- **Removed Analytics button**: Eliminated "View app usage and engagement metrics" placeholder card
- **Removed App Settings button**: Eliminated "Configure app-wide settings and features" placeholder card
- **Removed Recent Activity section**: Eliminated "Activity feed coming soon..." placeholder section
- **Cleaner admin interface**: Admin Panel now focuses on functional features only
- **Maintained working features**: Kept Pending Events, Monthly Book, User Management, and Content Moderation
- **Better UX**: Admins no longer see non-functional placeholder sections
- **Reduced confusion**: Interface now only shows features that actually work
- **Streamlined layout**: More focused and professional admin panel design
- **Result**: Clean, professional admin panel with only working functionality

### ✅ Firebase Auth Persistence Fix for Development Build

**Added:** Current Session  
**Feature:** Fixed Firebase Auth persistence warning for Expo Development Build  
**Implementation:** 
- **AsyncStorage integration**: Installed and configured @react-native-async-storage/async-storage package
- **Custom persistence**: Created custom persistence object that uses AsyncStorage for auth state
- **Development Build optimization**: Configured Firebase Auth specifically for Expo Development Build environment
- **Session persistence**: User authentication state now persists between app restarts
- **Warning elimination**: Resolved Firebase Auth warning about missing AsyncStorage
- **Type safety**: Added proper TypeScript typing for Auth instance export
- **Backward compatibility**: Maintains compatibility with existing auth workflows
- **Better UX**: Users no longer need to re-login every time they restart the app
- **Result**: Seamless authentication experience with proper session persistence in Development Build