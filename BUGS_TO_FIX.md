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

### ✅ Event Card Time Display Issue
**Fixed:** Current Session  
**Issue:** Event cards were displaying incorrect single times (e.g., "9:47pm") instead of proper time ranges (e.g., "11:00am-12:00pm")  
**Solution:** 
- Fixed `formatTime` functions in `PastEventsTab.tsx` and `AllEventsTab.tsx` to use new `startTime` and `endTime` fields
- Updated time display calls from `formatTime(event.date)` to `formatTime(event.startTime, event.endTime)`
- Cleaned up unused `formatPSTTime` imports
- Now correctly shows time ranges like "11:00 AM - 1:00 PM" throughout the app

### ✅ Date Picker Auto-Selection Issue
**Fixed:** Current Session  
**Issue:** Date picker automatically selected dates while user was scrolling/browsing, making it difficult to choose specific dates  
**Solution:** 
- Added temporary date state for browsing on iOS
- Implemented manual confirmation buttons (Cancel/Confirm) for iOS  
- Maintained Android default behavior while improving iOS UX
- Users can now scroll through dates freely and confirm their selection manually
- Updated both CreateEventScreen and EditEventScreen

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