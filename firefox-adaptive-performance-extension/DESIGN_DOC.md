# Firefox Adaptive Performance Extension - Design Doc

**Last Updated:** 2024-12-19 (Latest: Navigation, CSS Modules, Layout fixes)  
**Status:** 🟡 In Development

---

## 📋 Project Overview

A Firefox browser extension built with React that provides adaptive performance features. The extension uses a popup interface powered by React components.

---

## 🎯 Goals & Objectives

- [x] Set up basic Firefox extension structure
- [x] Integrate React for popup UI
- [x] Create build pipeline for extension
- [ ] Implement adaptive performance features
- [ ] Add user preferences/settings
- [ ] Test and optimize performance

---

## 🏗️ Architecture

### Current Structure

```
firefox-adaptive-performance-extension/
├── manifest.json          # Extension manifest (Firefox config)
├── popup.html             # Entry point HTML (loads React app)
├── src/
│   ├── App.jsx            # Main React component (wraps NavBar)
│   ├── App.module.css     # App styles (CSS modules)
│   ├── NavBar.jsx         # Navigation component with page routing
│   ├── NavBar.module.css  # NavBar styles (CSS modules)
│   ├── main.jsx           # React entry point
│   └── pages/
│       ├── home/
│       │   ├── Home.jsx
│       │   └── Home.module.css
│       ├── tabs/
│       │   ├── Tabs.jsx
│       │   └── Tabs.module.css
│       └── settings/
│           ├── Settings.jsx
│           └── Settings.module.css
├── dist/                  # Built extension (after npm run build)
└── copy-manifest.js       # Build script helper
```

### Technology Stack

- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.2
- **Extension API:** Firefox Manifest V2
- **Language:** JavaScript (ES Modules)

### Design Decisions

#### ✅ Completed Decisions

1. **Manifest Version:** Using Manifest V2 (standard for Firefox)

   - Reason: Better compatibility and simpler setup
   - Date: 2024-12-19

2. **Build System:** Vite for fast development and optimized builds

   - Reason: Modern, fast, great React support
   - Date: 2024-12-19

3. **UI Framework:** React for popup interface

   - Reason: Component-based, familiar, maintainable
   - Date: 2024-12-19

4. **Popup Structure:** Single HTML file (`popup.html`) that loads React app

   - Reason: Standard Firefox extension pattern
   - Date: 2024-12-19

5. **Styling Approach:** CSS Modules for all components

   - Reason: Scoped styles, type-safe, maintainable
   - Date: 2024-12-19

6. **Navigation Architecture:** NavBar component manages page state and routing

   - Reason: Self-contained navigation, simpler App component
   - Date: 2024-12-19

7. **Page Organization:** Each page in its own folder (home/, tabs/, settings/)

   - Reason: Better organization, easier to scale
   - Date: 2024-12-19

8. **Fixed Dimensions:** 422px × 555px popup size
   - Reason: Consistent UI, prevents layout shifts
   - Date: 2024-12-19

#### 🔄 Pending Decisions

- [ ] Choose state management solution (if needed beyond useState)
- [ ] Determine storage mechanism (localStorage, browser.storage, etc.)
- [ ] Plan background script architecture (if needed)

---

## 📝 Todo List

### 🚀 High Priority

- [ ] Define adaptive performance features to implement
- [ ] Design popup UI/UX
- [ ] Implement core performance monitoring
- [ ] Add settings/preferences UI
- [ ] Write tests

### 📦 Medium Priority

- [ ] Add extension icons (48x48, 96x96)
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Create user documentation
- [ ] Optimize bundle size

### 🔧 Low Priority

- [ ] Add keyboard shortcuts
- [ ] Implement analytics (if needed)
- [ ] Add internationalization (i18n)
- [ ] Create developer documentation

### ✅ Completed

- [x] Set up React app structure
- [x] Create manifest.json
- [x] Configure Vite for extension build
- [x] Create popup.html entry point
- [x] Set up build pipeline
- [x] Create basic popup UI
- [x] Implement NavBar component with navigation
- [x] Create three page components (Home, Tabs, Settings)
- [x] Organize pages into separate folders
- [x] Convert all styling to CSS modules
- [x] Set fixed popup dimensions (422px × 555px)
- [x] Fix horizontal scrolling issues
- [x] Implement page routing/switching

---

## 🎨 UI/UX Design

### Current State

- **Popup Size:** Fixed 422px × 555px
- **Styling:** CSS Modules throughout all components
- **Components:**
  - `App.jsx` - Main wrapper component
  - `NavBar.jsx` - Navigation bar with three buttons (Home, Tabs, Settings)
  - `Home.jsx` - Home page component
  - `Tabs.jsx` - Tabs management page component
  - `Settings.jsx` - Settings page component
- **Navigation:** Client-side routing managed by NavBar component state
- **Layout:** Flexbox-based layout with fixed dimensions
- **Overflow:** Horizontal scrolling disabled, vertical scrolling enabled for content

### Component Structure

```
App
└── NavBar
    ├── Navigation Buttons (Home, Tabs, Settings)
    └── Content Area
        ├── Home (when active)
        ├── Tabs (when active)
        └── Settings (when active)
```

### Planned Features

- [ ] Design system / component library
- [ ] Dark/light theme support
- [ ] Improve NavBar button styling
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Loading states for async operations

---

## 🔌 Extension APIs & Permissions

### Current Permissions

```json
"permissions": []
```

### Planned Permissions

- [ ] `storage` - For saving user preferences
- [ ] `tabs` - If we need to interact with tabs
- [ ] `activeTab` - For performance monitoring
- [ ] `webRequest` - If we need to monitor network (requires careful consideration)

---

## 🧪 Testing Strategy

### Planned Tests

- [ ] Unit tests for React components
- [ ] Integration tests for extension functionality
- [ ] E2E tests for user workflows
- [ ] Performance benchmarks

### Testing Tools

- [ ] Choose testing framework (Jest, Vitest, etc.)
- [ ] Set up test environment
- [ ] Create test utilities

---

## 📊 Performance Considerations

### Current

- Bundle size: TBD (measure after first build)
- Load time: TBD

### Optimization Goals

- [ ] Keep popup load time < 200ms
- [ ] Minimize bundle size
- [ ] Lazy load components if needed
- [ ] Optimize React rendering

---

## 🐛 Known Issues

- ✅ **Fixed:** Horizontal scrolling - Resolved by adding `overflow-x: hidden`, `box-sizing: border-box`, and proper width constraints
- ✅ **Fixed:** Missing `.content` class in NavBar - Added to NavBar.module.css
- ✅ **Fixed:** Width mismatch between popup.html and App - Updated to consistent 422px

_No current issues - add new issues as they arise_

---

## 💡 Ideas & Future Enhancements

- [ ] Background service worker for performance monitoring
- [ ] Options page for detailed settings
- [ ] Context menu integration
- [ ] Keyboard shortcuts
- [ ] Export/import settings
- [ ] Performance reports/history

---

## 📚 Resources & References

- [Firefox Extension Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Manifest V2 Reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)

---

## 📝 Notes

### Development Workflow

1. Make changes to React code in `src/`
2. Run `npm run build` to compile
3. Load extension in Firefox via `about:debugging`
4. Reload extension after each build to test changes

### Build Process

```bash
npm run build
# This runs:
# 1. vite build - compiles React app to dist/
# 2. node copy-manifest.js - copies manifest.json to dist/
```

### Extension Loading

1. Open Firefox → `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on..."
3. Select `dist/manifest.json`
4. Extension appears in toolbar

---

## 🔄 Changelog

### 2024-12-19

#### Initial Setup

- ✅ Initial project setup
- ✅ React + Vite configuration
- ✅ Firefox extension manifest
- ✅ Basic popup UI with counter demo
- ✅ Build pipeline setup

#### Navigation & Structure

- ✅ Created NavBar component with page switching functionality
- ✅ Implemented three pages: Home, Tabs, Settings
- ✅ Organized pages into separate folders (home/, tabs/, settings/)
- ✅ NavBar manages its own state for page routing

#### Styling & Layout

- ✅ Converted all styling to CSS Modules
- ✅ Set fixed popup dimensions: 422px × 555px
- ✅ Fixed horizontal scrolling issues
- ✅ Added proper overflow controls throughout
- ✅ Implemented `box-sizing: border-box` for consistent sizing
- ✅ Added word-wrap for long text content

#### Technical Improvements

- ✅ Updated popup.html to match app dimensions
- ✅ Added proper CSS constraints to prevent overflow
- ✅ Improved flexbox layout for NavBar buttons
- ✅ Added content area with proper scrolling behavior

---

## 🤝 Contributing

_Add contribution guidelines as needed_

---

**Note:** This is a living document. Update it as the project evolves!
