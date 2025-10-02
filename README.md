# Weather App - React + Node.js

A beautiful, full-stack weather application built with React frontend and Express.js backend.

## Features

- 🌤️ Real-time weather data for any city worldwide
- 🔍 Smart city search with autocomplete suggestions
- 📱 Fully responsive design
- 🎨 Dynamic backgrounds based on weather conditions
- ⚡ Fast and lightweight
- 🛡️ Error handling and loading states

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for development and building
- Lucide React for icons

**Backend:**
- Node.js with Express
- Axios for HTTP requests
- CORS enabled
- OpenWeatherMap API integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenWeatherMap API key (free at https://openweathermap.org/api)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   OPENWEATHER_API_KEY=your_api_key_here
   PORT=5000
   ```

### Running the Application

1. Start the backend server:
   ```bash
   npm run dev:server
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run server` - Start the backend server
- `npm run dev:server` - Start the backend server with auto-reload
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build

## API Endpoints

- `POST /api/weather` - Get weather data for a city
- `POST /api/cities` - Get city suggestions for autocomplete
- `GET /api/health` - Health check endpoint

## Environment Variables

- `OPENWEATHER_API_KEY` - Your OpenWeatherMap API key
- `PORT` - Backend server port (default: 5000)

## Demo Mode

The app works with mock data when no API key is provided, perfect for testing and development.

## License

MIT License