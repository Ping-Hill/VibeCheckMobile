# VibeCheck Mobile

React Native mobile app for NYC VibeCheck - Find NYC restaurants by vibe using AI-powered semantic search.

## Features

- 🔍 Search NYC restaurants by vibe (e.g., "cozy romantic italian")
- 📱 Clean, native mobile interface
- 🖼️ Restaurant photos from S3
- 📍 Integrated Google Maps for directions
- ⭐ Restaurant ratings and reviews

## Getting Started

### Prerequisites

- Node.js installed
- Expo Go app on your phone (download from App Store/Play Store)

### Installation

```bash
cd VibeCheckMobile
npm install
```

### Running the App

```bash
npm start
```

This will start the Expo development server. Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

### Testing on Simulators

```bash
# iOS Simulator (requires macOS and Xcode)
npm run ios

# Android Emulator (requires Android Studio)
npm run android

# Web browser
npm run web
```

## Configuration

Update the API URL in `src/services/api.js` to point to your Railway backend:

```javascript
const API_URL = 'https://your-railway-url.up.railway.app';
```

## Project Structure

```
VibeCheckMobile/
├── App.js                 # Main app with navigation
├── src/
│   ├── screens/
│   │   ├── SearchScreen.js    # Main search interface
│   │   └── DetailsScreen.js   # Restaurant details
│   └── services/
│       └── api.js             # Backend API calls
```

## How It Works

1. User enters a search query describing the vibe they want
2. App sends request to Railway backend API
3. Backend uses AI embeddings to find matching restaurants
4. Results displayed with photos from AWS S3
5. Tap any restaurant for full details and directions

## Built With

- React Native + Expo
- React Navigation
- Axios for API calls
- AWS S3 for image hosting
