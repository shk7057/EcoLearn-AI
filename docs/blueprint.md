# **App Name**: EcoLearn AI

## Core Features:

- Real-time Location-based AQI & Historical Data: Automatically detect user's GPS location, display current Air Quality Index (AQI) with city and area details, and save daily AQI readings to Firestore for historical tracking.
- Personalized AQI Trend Analysis & Smart Tips: Utilize historical data from Firestore to train a custom model, providing weekly AQI trend analysis, current comparisons, and actionable smart tips generated from the analysis.
- AI-Personalized Environmental Lessons: Generate customized 5-minute environmental science lessons from a Groq AI tool, contextualized by the user's current AQI, location, and weekly trend analysis, including practical actions and reflection questions.
- 24-Hour Predictive AQI Forecast: Display a visual 24-hour AQI forecast using a pre-defined hourly pattern, indicating best and worst times for outdoor activities with color-coded zones.
- AI Plant Disease Detection: Allow users to upload or capture plant images for TensorFlow.js-powered disease classification, providing a diagnosis, confidence score, and recommended actions.
- Gamified Eco Challenges & Progress Tracking: Engage users with both pre-defined and AI-generated eco challenges, awarding points for completion, tracking streaks, and saving user progress to Firestore.
- Teacher Dashboard with Real-time Analytics: Provide a secure, real-time dashboard for educators using Firebase Authentication to view student leaderboards, monitor class AQI history, and assign challenges.

## Style Guidelines:

- Light color scheme emphasizing environmental themes and clarity.
- Primary color: Deep forest green (#2d6a4f) to represent nature and stability.
- Secondary color: Vibrant medium green (#52b788) for emphasis and interactive elements.
- Background color: Very pale green (#f0faf4) to ensure a clean, airy, and uncluttered interface.
- Sidebar color: Very dark green (#1a3a2a) providing strong contrast for navigation elements and secondary information.
- All text uses 'DM Sans', a clean sans-serif font, for clear readability and a modern aesthetic. Note: currently only Google Fonts are supported.
- Utilize a modern, rounded aesthetic with a consistent border-radius of 16px for cards and interactive elements.
- Fully responsive design ensuring optimal viewing and interaction across all device sizes, especially mobile.
- Employ a consistent set of line-art or filled icons with a clear and modern style, specifically designed for environmental and educational themes.
- Incorporate subtle feedback animations, such as confetti on challenge completion, and smooth transitions for data updates or navigation, enhancing user engagement without distraction.