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

### ✅ Keyboard returnKeyType Implementation
**Fixed:** Current  
**Issue:** TextInput fields didn't have proper "Done" buttons for keyboard dismissal  
**Solution:** Added `returnKeyType="done"` and `onSubmitEditing` handlers to major forms

### ✅ Deprecated blurOnSubmit Warning
**Fixed:** Current  
**Issue:** React Native warning about deprecated `blurOnSubmit` prop  
**Solution:** Replaced with `submitBehavior` prop

---

*Last Updated: [Current Date]*  
*Maintainer: Development Team* 