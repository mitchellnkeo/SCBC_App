# 🐛 SCBC App - Bugs to Fix

This file tracks known bugs and issues that need to be addressed in future development cycles.

## 🔴 High Priority

### Keyboard "Done" Button Not Appearing
**Status:** 🔍 Needs Investigation  
**Reported:** Current  
**Component:** `src/components/common/KeyboardToolbar.tsx`  

**Issue:**
The iOS keyboard toolbar with "Done" button implementation may not be showing up as expected in the app. The `InputAccessoryView` with unique `nativeID` may not be properly connecting to the TextInput on all devices/simulators.

**Expected Behavior:**
- "Done" button should appear in top-right corner of iOS keyboard
- Button should dismiss keyboard when tapped
- Should maintain theme-aware styling
- Should work across all TextInput components using the toolbar

**Current Implementation:**
```typescript
// New reusable KeyboardToolbar component
<KeyboardToolbar 
  nativeID={uniqueToolbarID}
  onDone={handleKeyboardDone}
/>

// TextInput with toolbar
<TextInput
  inputAccessoryViewID={Platform.OS === 'ios' ? uniqueToolbarID : undefined}
  // ... other props
/>
```

**Testing Tools Created:**
- ✅ `src/components/common/KeyboardToolbar.tsx` - Reusable, theme-aware toolbar component
- ✅ `src/screens/KeyboardTestScreen.tsx` - Comprehensive test screen for debugging
- ✅ Test screen accessible via side menu (🔧 Keyboard Test) in development mode
- ✅ Updated `MentionInput.tsx` to use new reusable component

**Next Steps:**
- [ ] Test on physical iOS device (may not work in simulator)
- [ ] Test different iOS versions and device sizes
- [ ] Verify React Native version compatibility with InputAccessoryView
- [ ] Test keyboard toolbar with different keyboard types
- [ ] Check if issue is specific to certain TextInput configurations

**Alternative Solutions (if current approach fails):**
1. Use third-party library like `react-native-keyboard-accessory`
2. Implement custom modal-based keyboard dismissal
3. Add floating "Done" button overlay
4. Use KeyboardAvoidingView with custom controls

---

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

### ✅ Keyboard returnKeyType Implementation
**Fixed:** Current  
**Issue:** TextInput fields didn't have proper "Done" buttons for keyboard dismissal  
**Solution:** Added `returnKeyType="done"` and `onSubmitEditing` handlers to major forms

### ✅ Deprecated blurOnSubmit Warning
**Fixed:** Current  
**Issue:** React Native warning about deprecated `blurOnSubmit` prop  
**Solution:** Replaced with `submitBehavior` prop

### ✅ Reusable Keyboard Toolbar Component
**Fixed:** Current  
**Issue:** Inconsistent keyboard toolbar implementation across components  
**Solution:** Created reusable `KeyboardToolbar.tsx` with theme support and proper TypeScript types

---

*Last Updated: [Current Date]*  
*Maintainer: Development Team* 