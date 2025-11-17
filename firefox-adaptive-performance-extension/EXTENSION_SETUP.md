# Firefox Extension Setup Guide

## How It Works

Your React app is the **popup** that appears when you click the extension icon. Here's the structure:

1. **`manifest.json`** - Tells Firefox about your extension
2. **`popup.html`** - The HTML file that loads your React app (this is what Firefox shows)
3. **`src/App.jsx`** - Your React component (the actual UI)
4. **`dist/`** - The built extension files (after running `npm run build`)

## Building the Extension

1. **Build the extension:**
   ```bash
   npm run build
   ```

   This will:
   - Compile your React app
   - Bundle everything into the `dist/` folder
   - Copy the manifest.json

2. **Check the `dist/` folder** - This is your extension!

## Installing in Firefox

1. Open Firefox
2. Go to `about:debugging` in the address bar
3. Click **"This Firefox"** in the left sidebar
4. Click **"Load Temporary Add-on..."**
5. Navigate to your project folder
6. Go into the `dist/` folder
7. Select `manifest.json`
8. Click **"Open"**

Your extension should now appear in Firefox! Click the extension icon in the toolbar to see your React popup.

## Development Workflow

- **To develop:** Use `npm run dev` (but this won't work for extension testing)
- **To test changes:** 
  1. Make changes to your React code
  2. Run `npm run build`
  3. In Firefox `about:debugging`, click the **reload** button next to your extension

## Understanding the Structure

- **React App (`src/App.jsx`)**: This is your extension's UI - edit this to change what users see
- **Popup HTML (`popup.html`)**: This is the entry point that loads your React app
- **Manifest (`manifest.json`)**: Defines the extension (name, popup file, permissions, etc.)

The React app IS the popup - they're the same thing! When you build, Vite bundles your React app and puts it in `dist/popup.html`, which Firefox loads when you click the extension icon.

