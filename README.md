# Beanio - Coffee Bean Rating App

Beanio is a mobile app that helps coffee enthusiasts discover, rate, and track their coffee bean experiences. Inspired by wine apps like Vivino, Beanio allows users to scan coffee bean bags, get detailed information about the beans, and maintain a personal collection of ratings and tasting notes.

## Features

- **Scan Coffee Beans**: Use your camera to scan coffee bean bags and get detailed information
- **AI-Powered Analysis**: Leverages Google Gemini Cloud Vision AI to extract information from coffee bean packaging
- **Rate and Review**: Rate coffee beans and add personal tasting notes
- **Track Your Collection**: Keep a record of all your scanned and rated coffee beans
- **Discover Similar Beans**: Get recommendations for similar beans based on your preferences
- **User-Friendly Interface**: Beautiful coffee-themed design for an immersive experience

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development framework and tools
- **Expo Router**: File-based routing system
- **Google Gemini AI**: For image analysis and bean identification
- **AsyncStorage**: For local data persistence
- **React Navigation**: For app navigation
- **React Native Elements**: UI component library

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Rockaroni/beanio.git
   cd beanio
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

4. Scan the QR code with the Expo Go app on your mobile device to launch the app.

## Project Structure

```
beanio/
├── app/                   # Main app screens using Expo Router
│   ├── (tabs)/            # Tab-based screens
│   ├── bean-detail.tsx    # Bean detail screen
│   ├── profile.tsx        # User profile screen
│   ├── rating.tsx         # Bean rating screen
│   └── scan.tsx           # Scan screen
├── src/
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Screen components
│   ├── services/          # API and data services
│   └── styles/            # Styling and theme
├── assets/                # Images, fonts, etc.
└── ...
```

## Usage

1. **Home Screen**: View your recently scanned and top-rated coffee beans
2. **Scan Screen**: Capture an image of a coffee bean bag to analyze
3. **Bean Detail Screen**: View detailed information about a coffee bean
4. **Rating Screen**: Rate coffee beans and add tasting notes
5. **Profile Screen**: View your coffee journey stats and app settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by wine apps like Vivino
- Coffee bean information powered by Google Gemini AI
- Special thanks to all coffee enthusiasts who contributed to testing and feedback
