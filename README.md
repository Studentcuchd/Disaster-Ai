# DisasterAI - Real-Time Natural Disaster Risk Monitoring System

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Backend Services](#backend-services)
- [Risk Scoring Algorithm](#risk-scoring-algorithm)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## 🌍 Overview

**DisasterAI** is a comprehensive real-time natural disaster risk monitoring and prediction system designed to assess and predict risks for three major disaster types:
- 🌊 **Floods** - Based on rainfall, river levels, and rise rates
- 🏔️ **Earthquakes** - Based on seismic magnitude, ground acceleration, and fault distance
- ⛰️ **Landslides** - Based on soil moisture, rainfall, and atmospheric pressure

The system combines live weather data (OpenWeather API), seismic activity data (USGS Earthquake API), machine learning predictions, and real-time Socket.IO alerts to provide comprehensive disaster risk assessment.

---

## ✨ Features

### Core Capabilities
- **Real-Time Monitoring**: Live predictions updated every 5 minutes (configurable)
- **Interactive Map**: Click-to-select location with OpenStreetMap integration
- **Multi-Source Data**: Combines weather, seismic, and ML model predictions
- **Smart Alerts**: Automatic alert generation for Medium/High risk levels
- **Historical Analytics**: View prediction trends and confidence analysis
- **Location Search**: Search India locations with autocomplete + reverse geocoding
- **Socket.IO Integration**: Real-time alert streaming to all connected clients
- **Risk Scoring**: Custom scoring algorithms for each disaster type (0-100 scale)

### User Interface
- Modern, responsive design with TailwindCSS
- Dark mode optimized with gradient backgrounds
- Live prediction graphs with animated bars
- Risk cards with color-coded indicators
- Filterable alerts panel
- Analytics dashboard with trend charts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  - Dashboard, Alerts, Analytics Pages                       │
│  - MapView, RiskCards, Live Graphs                          │
│  - Socket.IO Client for Real-time Updates                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│  - REST API Routes                                           │
│  - Socket.IO Server                                          │
│  - Controllers & Services                                    │
└──┬──────────┬──────────┬──────────┬─────────────────────────┘
   │          │          │          │
   │          │          │          │
   ▼          ▼          ▼          ▼
┌─────┐  ┌─────┐  ┌──────────┐  ┌──────────┐
│ ML  │  │USGS │  │OpenWeather│ │ MongoDB  │
│ API │  │ API │  │   API     │  │ Database │
└─────┘  └─────┘  └──────────┘  └──────────┘
```

### Data Flow
1. **User** selects location via map click or search
2. **Frontend** sends prediction request to backend
3. **Backend** fetches live weather data (OpenWeather)
4. **Backend** fetches seismic data (USGS)
5. **Backend** builds feature payload and calls ML model
6. **Backend** stores prediction in MongoDB
7. **Backend** creates alert if risk is Medium/High
8. **Backend** emits Socket.IO alert to all clients
9. **Frontend** displays prediction, risk scores, and alerts

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v4.19.2
- **Database**: MongoDB (Mongoose v8.5.1)
- **WebSocket**: Socket.IO v4.7.5
- **HTTP Client**: Axios v1.6.8
- **Security**: Helmet, CORS
- **Logging**: Morgan

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite v5.4.0
- **Styling**: TailwindCSS v3.4.10
- **Routing**: React Router DOM v6.22.3
- **Map**: Leaflet v1.9.4 + React-Leaflet v4.2.1
- **HTTP Client**: Axios v1.6.8
- **WebSocket**: Socket.IO Client v4.7.5
- **Date Handling**: Day.js v1.11.13

### External APIs
- **Weather Data**: OpenWeather API
- **Seismic Data**: USGS Earthquake API
- **ML Predictions**: Custom ML Model (Render hosted)
- **Geocoding**: OpenStreetMap Nominatim API

---

## 📁 Project Structure

```
project/
├── backend/                      # Express.js backend server
│   ├── config/
│   │   └── db.js                # MongoDB connection setup
│   ├── controllers/
│   │   ├── alertController.js   # Alert listing with filters
│   │   ├── locationController.js # Location CRUD operations
│   │   └── predictionController.js # Prediction & history endpoints
│   ├── models/
│   │   ├── Alert.js             # Alert schema (risk level, message, location)
│   │   ├── Location.js          # Location schema (name, lat, lng)
│   │   └── Prediction.js        # Prediction schema (weather, seismic, ML response)
│   ├── routes/
│   │   ├── alertRoutes.js       # GET /api/alerts
│   │   ├── locationRoutes.js    # GET/POST /api/locations
│   │   └── predictionRoutes.js  # POST /api/predictions, GET /api/predictions/history
│   ├── services/
│   │   ├── alertService.js      # Create alerts and emit via Socket.IO
│   │   ├── mlService.js         # Call external ML API with retry logic
│   │   ├── seismicService.js    # Fetch USGS earthquake data
│   │   └── weatherService.js    # Fetch OpenWeather data
│   ├── utils/
│   │   ├── buildFeatures.js     # Build ML feature payload from raw data
│   │   └── haversine.js         # Calculate distance between coordinates
│   ├── package.json             # Backend dependencies
│   └── server.js                # Main server entry point
│
├── frontend/                     # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertsPanel.jsx  # Live alerts display (top 5)
│   │   │   ├── LivePredictionGraph.jsx # Animated probability bars
│   │   │   ├── MapView.jsx      # Leaflet map with click handler
│   │   │   ├── MetricCard.jsx   # Generic metric display card
│   │   │   ├── Navbar.jsx       # Navigation + location search
│   │   │   ├── RiskCard.jsx     # Risk score card with progress bar
│   │   │   └── TrendChart.jsx   # SVG-based confidence trend chart
│   │   ├── context/
│   │   │   └── AppContext.jsx   # Global state (location, prediction, alerts)
│   │   ├── data/
│   │   │   └── indiaLocations.js # 393 preset India locations
│   │   ├── hooks/
│   │   │   ├── useLiveMonitoring.js # Geolocation, polling, prediction
│   │   │   └── useSocket.js     # Socket.IO connection & alert handler
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main dashboard with risk scores
│   │   │   ├── Alerts.jsx       # Filterable alerts history
│   │   │   └── Analytics.jsx    # Historical trends and analytics
│   │   ├── services/
│   │   │   └── api.js           # API client (axios) + geocoding
│   │   ├── styles/
│   │   ├── App.jsx              # Root component with routing
│   │   ├── index.css            # Global styles + TailwindCSS imports
│   │   └── main.jsx             # React entry point
│   ├── index.html               # HTML template
│   ├── package.json             # Frontend dependencies
│   ├── postcss.config.js        # PostCSS configuration
│   ├── tailwind.config.js       # TailwindCSS theme customization
│   └── vite.config.js           # Vite build configuration
│
└── TEST_SUITE.js                # Comprehensive test suite for risk scoring
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v16+ and npm/yarn
- MongoDB instance (local or cloud)
- OpenWeather API key
- ML model endpoint (or use default: `https://hackathon-model.onrender.com/predict`)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/disasterai
   MONGO_DB_NAME=disasterai
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ML_API_URL=https://hackathon-model.onrender.com/predict
   CLIENT_ORIGIN=http://localhost:5173
   ```

4. **Start the server**:
   ```bash
   npm start         # Production
   npm run dev       # Development (with nodemon)
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional, defaults work with local backend):
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_DEFAULT_LOCATION_NAME=Detected location
   VITE_POLL_INTERVAL_MS=300000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

5. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📡 API Documentation

### Predictions

#### `POST /api/predictions`
Create a new disaster risk prediction for a location.

**Request Body**:
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "locationName": "New Delhi",
  "past_flood_event": 0,
  "past_earthquake_event": 0,
  "soil_moisture_pct": 45.5,
  "river_level_m": 2.3,
  "river_danger_level_m": 5.0,
  "river_rise_rate_cmphr": 12.5
}
```

**Response**:
```json
{
  "prediction": {
    "_id": "...",
    "location": {
      "name": "New Delhi",
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "weatherSnapshot": {
      "temperatureC": 32.5,
      "humidityPct": 65,
      "pressurehPa": 1013,
      "windSpeedMs": 3.2,
      "rainfall1hMm": 0,
      "cloudPct": 40
    },
    "modelRequest": { /* feature payload */ },
    "modelResponse": {
      "risk_level": "Medium",
      "confidence": 0.85,
      "probabilities": {
        "Low": 0.2,
        "Medium": 0.6,
        "High": 0.2
      },
      "timestamp": "2025-12-29T10:30:00Z"
    },
    "createdAt": "2025-12-29T10:30:00Z"
  },
  "alert": {
    "_id": "...",
    "riskLevel": "Medium",
    "message": "Risk level Medium detected at New Delhi",
    "location": { /* ... */ },
    "prediction": "...",
    "createdAt": "2025-12-29T10:30:00Z"
  }
}
```

#### `GET /api/predictions/history`
Get historical predictions with optional limit.

**Query Parameters**:
- `limit` (optional, default: 50) - Number of predictions to return

**Response**:
```json
[
  {
    "_id": "...",
    "location": { /* ... */ },
    "weatherSnapshot": { /* ... */ },
    "modelRequest": { /* ... */ },
    "modelResponse": { /* ... */ },
    "createdAt": "2025-12-29T10:30:00Z"
  }
]
```

### Alerts

#### `GET /api/alerts`
Get alerts with optional filters.

**Query Parameters**:
- `riskLevel` (optional) - Filter by: "Low", "Medium", "High"
- `start` (optional) - Start date (ISO 8601)
- `end` (optional) - End date (ISO 8601)

**Response**:
```json
[
  {
    "_id": "...",
    "riskLevel": "High",
    "message": "Risk level High detected at Mumbai",
    "location": {
      "name": "Mumbai",
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "prediction": "...",
    "createdAt": "2025-12-29T10:30:00Z"
  }
]
```

### Locations

#### `GET /api/locations`
Get all saved locations.

**Response**:
```json
[
  {
    "_id": "...",
    "name": "Mumbai",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "note": "Financial capital",
    "createdAt": "2025-12-29T10:30:00Z"
  }
]
```

#### `POST /api/locations`
Create a new location.

**Request Body**:
```json
{
  "name": "Mumbai",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "note": "Financial capital"
}
```

### Health Check

#### `GET /health`
Server health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "uptime": 12345.67
}
```

---

## 🎨 Frontend Components

### Pages

#### **Dashboard.jsx**
Main dashboard displaying real-time risk assessment.

**Features**:
- Location search and map selection
- Overall risk score (0-100)
- Individual disaster scores (Flood, Earthquake, Landslide)
- Live prediction probability graphs
- Recent alerts panel
- Auto-refresh with configurable polling interval

**Risk Calculation Functions**:
- `riskToScore(prediction)` - Overall risk from ML probabilities
- `deriveFloodScore(prediction)` - Flood risk from rainfall, river data
- `deriveEarthquakeScore(prediction)` - Earthquake risk from magnitude, acceleration
- `deriveLandslideScore(prediction)` - Landslide risk from soil moisture, rainfall, pressure

#### **Alerts.jsx**
Filterable alerts history page.

**Features**:
- Filter by risk level (Low/Medium/High)
- Filter by date range (start/end dates)
- Real-time updates via Socket.IO
- Responsive alert cards with timestamps

#### **Analytics.jsx**
Historical analytics and trends page.

**Features**:
- Total prediction count
- Average model confidence
- Risk level distribution (High/Medium/Low counts)
- Confidence trend chart
- Risk distribution visualization
- Filterable prediction history

### Components

#### **MapView.jsx**
Interactive Leaflet map with location selection.

**Props**:
- `latitude`, `longitude` - Current location coordinates
- `riskLevel` - Risk level to display
- `onLocationSelect(lat, lng)` - Callback for map clicks

**Features**:
- OpenStreetMap tiles
- Marker with popup
- Click-to-select location
- Auto-center on coordinate change

#### **RiskCard.jsx**
Risk score display card with progress bar.

**Props**:
- `title` - Card title (e.g., "Flood Risk")
- `value` - Score value (0-100 or null)
- `subtitle` - Additional info text
- `riskLevel` - "Low", "Medium", "High", "N/A"
- `icon` - Emoji or icon

**Features**:
- Color-coded badges (green/orange/red)
- Animated progress bar
- Null-safe rendering (shows "N/A")

#### **LivePredictionGraph.jsx**
Animated probability distribution bars.

**Props**:
- `prediction` - Prediction object with probabilities

**Features**:
- Smooth animation (10fps easing)
- Color-coded bars (red/orange/green)
- Model confidence indicator
- Gradient fill effects

#### **AlertsPanel.jsx**
Live alerts display (top 5 recent).

**Props**:
- `alerts` - Array of alert objects

**Features**:
- Real-time updates
- Risk level badges
- Formatted timestamps with Day.js
- Empty state message

#### **TrendChart.jsx**
SVG-based confidence trend visualization.

**Props**:
- `data` - Array of predictions

**Features**:
- Normalized data (0-100 scale)
- SVG path rendering
- Linear gradient fill
- Responsive sizing

#### **MetricCard.jsx**
Generic metric display card.

**Props**:
- `label` - Metric name
- `value` - Metric value
- `sublabel` - Additional info
- `icon` - Icon/emoji

#### **Navbar.jsx**
Navigation bar with location search.

**Features**:
- Route navigation (Dashboard, Alerts, Analytics)
- Live location search with autocomplete
- Preset India locations (393 cities)
- OpenStreetMap Nominatim geocoding
- Debounced search (300ms delay)
- Socket connection status indicator

### Hooks

#### **useLiveMonitoring.js**
Manages location selection, prediction requests, and auto-polling.

**Functions**:
- `runPrediction({ latitude, longitude, locationName })` - Fetch prediction
- `requestGeolocation()` - Get user location with reverse geocoding
- `startPolling()` / `stopPolling()` - Auto-refresh predictions

**Features**:
- Browser geolocation with fallback
- Reverse geocoding (coordinates → address)
- Configurable polling interval (default: 5 minutes)
- Error handling with user-friendly messages

#### **useSocket.js**
Manages Socket.IO connection and real-time alerts.

**Features**:
- Auto-connect to backend on mount
- Listen for 'alert' events
- Update global alert state
- Connection status tracking

### Context

#### **AppContext.jsx**
Global state management using React Context.

**State**:
- `selectedLocation` - Current location { name, latitude, longitude }
- `latestPrediction` - Most recent prediction object
- `alerts` - Array of alerts
- `socketConnected` - Socket connection status

---

## 🔧 Backend Services

### Controllers

#### **predictionController.js**
Handles prediction and history endpoints.

**Functions**:
- `predict(req, res, next)` - Create prediction with weather + seismic data
- `history(req, res, next)` - Get prediction history with limit

**Flow**:
1. Validate latitude/longitude
2. Fetch weather data (OpenWeather)
3. Fetch seismic data (USGS)
4. Build feature payload
5. Call ML model
6. Save prediction to MongoDB
7. Create alert if Medium/High risk
8. Emit Socket.IO alert
9. Return response

#### **alertController.js**
Handles alert listing with filters.

**Functions**:
- `listAlerts(req, res, next)` - Get alerts with optional filters

#### **locationController.js**
Handles location CRUD operations.

**Functions**:
- `listLocations(req, res, next)` - Get all locations
- `createLocation(req, res, next)` - Create new location

### Services

#### **mlService.js**
External ML model API client with retry logic.

**Functions**:
- `predictRisk(payload, retryCount)` - Call ML API with exponential backoff

**Features**:
- 3 retry attempts with exponential backoff (1s, 2s, 4s)
- 30-second timeout
- Fallback response on failure
- Detailed logging with timing

**Fallback Response**:
```json
{
  "risk_level": "medium",
  "flood_risk": 0.5,
  "earthquake_risk": 0.3,
  "fallback": true,
  "error": "Timeout error message"
}
```

#### **weatherService.js**
OpenWeather API client.

**Functions**:
- `fetchWeather(latitude, longitude)` - Get current weather

**Returns**:
```javascript
{
  temperatureC: 32.5,
  humidityPct: 65,
  pressurehPa: 1013,
  windSpeedMs: 3.2,
  rainfall1hMm: 0,
  cloudPct: 40,
  raw: { /* full API response */ }
}
```

#### **seismicService.js**
USGS Earthquake API client.

**Functions**:
- `fetchRecentEarthquake(latitude, longitude)` - Get recent earthquakes within 400km

**Returns**:
```javascript
{
  magnitude: 5.5,
  depthKm: 10,
  distanceFromFaultKm: 50,
  groundAccelerationG: 0.045
}
```

**Note**: Ground acceleration is estimated using simple attenuation formula (not scientific).

#### **alertService.js**
Alert creation and Socket.IO emission.

**Functions**:
- `createAlertIfNeeded({ predictionDoc, riskLevel, io })` - Create alert for Medium/High risk

**Behavior**:
- Only creates alerts for Medium/High risk levels
- Saves alert to MongoDB
- Emits 'alert' event via Socket.IO to all clients

### Utilities

#### **buildFeatures.js**
Constructs ML model feature payload from raw data.

**Function**:
- `buildFeatures({ weather, seismic, overrides, latitude, longitude })`

**Features**:
- Combines weather + seismic data
- Calculates derived features (soil moisture, river levels)
- Allows manual overrides for testing
- Returns normalized feature object

**Derived Calculations**:
- **Soil Moisture**: `humidity * 0.9 + cloud * 0.1`
- **River Level**: `rainfall * 0.25 + humidity * 0.02 + wind * 0.05`
- **River Danger Level**: `river_level + max(0.5, rainfall * 0.15 + wind * 0.05)`
- **River Rise Rate**: `rainfall * 1.8 + wind * 0.4`

#### **haversine.js**
Distance calculation between two coordinates.

**Function**:
- `haversineKm(lat1, lon1, lat2, lon2)` - Returns distance in kilometers

**Formula**: Haversine formula for great-circle distance on sphere.

### Models (MongoDB Schemas)

#### **Prediction.js**
Stores prediction data with nested schemas.

**Schema**:
```javascript
{
  location: {
    name: String,
    latitude: Number (required),
    longitude: Number (required)
  },
  weatherSnapshot: {
    temperatureC: Number,
    humidityPct: Number,
    pressurehPa: Number,
    windSpeedMs: Number,
    rainfall1hMm: Number,
    cloudPct: Number
  },
  modelRequest: {
    rainfall_1h_mm: Number,
    soil_moisture_pct: Number,
    river_level_m: Number,
    river_danger_level_m: Number,
    river_rise_rate_cmphr: Number,
    seismic_magnitude: Number,
    seismic_depth_km: Number,
    distance_from_fault_km: Number,
    ground_acceleration_g: Number,
    past_flood_event: Number,
    past_earthquake_event: Number
  },
  modelResponse: {
    risk_level: String (enum: Low/Medium/High),
    confidence: Number,
    probabilities: {
      Low: Number,
      Medium: Number,
      High: Number
    },
    timestamp: String
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### **Alert.js**
Stores alerts generated from predictions.

**Schema**:
```javascript
{
  riskLevel: String (enum: Low/Medium/High, required),
  message: String (required),
  location: {
    name: String,
    latitude: Number,
    longitude: Number
  },
  prediction: ObjectId (ref: Prediction),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### **Location.js**
Stores saved locations.

**Schema**:
```javascript
{
  name: String (required),
  latitude: Number (required),
  longitude: Number (required),
  note: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 📊 Risk Scoring Algorithm

### Overall Risk Score
Calculates weighted score from ML model probabilities.

**Formula**:
```
score = (Low * 0.2 + Medium * 0.4 + High * 0.6) * 100
```

**Example**:
- Low: 0.2, Medium: 0.5, High: 0.3
- Score: (0.2 * 0.2 + 0.5 * 0.4 + 0.3 * 0.6) * 100 = **42**

**Returns**: `null` if no prediction or all probabilities are 0

---

### Flood Risk Score
Derived from rainfall, river level, and rise rate.

**Formula**:
```
rainScore = min(100, (rainfall_1h_mm / 50) * 100)
riverScore = min(100, (river_level_m / 10) * 100)
riseScore = min(100, (river_rise_rate_cmphr / 50) * 100)

floodScore = rainScore * 0.5 + riverScore * 0.35 + riseScore * 0.15
```

**Weights**:
- Rainfall (1h): 50% weight, max 50mm/h
- River Level: 35% weight, max 10m
- Rise Rate: 15% weight, max 50cm/h

**Example**:
- Rainfall: 25mm/h → 50% normalized → 50 * 0.5 = 25
- River Level: 5m → 50% normalized → 50 * 0.35 = 17.5
- Rise Rate: 20cm/h → 40% normalized → 40 * 0.15 = 6
- **Total**: 25 + 17.5 + 6 = **48.5** (Medium Risk)

**Returns**: `null` if all values are 0

---

### Earthquake Risk Score
Derived from magnitude, ground acceleration, and fault distance.

**Formula**:
```
magScore = min(100, (magnitude / 9) * 100)
accelScore = min(100, (acceleration_g / 2) * 100)
distanceScore = distance > 0 ? max(0, 100 - (distance / 100) * 100) : 0

earthquakeScore = magScore * 0.5 + accelScore * 0.3 + distanceScore * 0.2
```

**Weights**:
- Magnitude: 50% weight, max 9.0
- Ground Acceleration: 30% weight, max 2.0g
- Distance (inverse): 20% weight, max 100km

**Example**:
- Magnitude: 5.5 → 61% normalized → 61 * 0.5 = 30.5
- Acceleration: 0.8g → 40% normalized → 40 * 0.3 = 12
- Distance: 30km → 70% inverse normalized → 70 * 0.2 = 14
- **Total**: 30.5 + 12 + 14 = **56.5** (Medium-High Risk)

**Returns**: `null` if all values are 0

---

### Landslide Risk Score
Derived from soil moisture, rainfall, and atmospheric pressure.

**Formula**:
```
soilScore = soil_moisture_pct
rainScore = min(100, (rainfall_1h_mm / 50) * 100)
slopeScore = pressure ? min(100, max(0, (1013 - pressure) / 10) * 100) : 0

landslideScore = soilScore * 0.4 + rainScore * 0.4 + slopeScore * 0.2
```

**Weights**:
- Soil Moisture: 40% weight (already 0-100%)
- Rainfall (1h): 40% weight, max 50mm/h
- Slope Proxy (pressure deviation): 20% weight
  - Lower pressure = steeper slope proxy
  - Deviation from standard 1013 hPa

**Example**:
- Soil Moisture: 75% → 75 * 0.4 = 30
- Rainfall: 30mm/h → 60% normalized → 60 * 0.4 = 24
- Pressure: 980 hPa → (1013-980)/10*100 = 33% → 33 * 0.2 = 6.6
- **Total**: 30 + 24 + 6.6 = **60.6** (High Risk)

**Returns**: `null` if all values are 0 or missing

---

## 🧪 Testing

### TEST_SUITE.js
Comprehensive test suite for risk scoring algorithms.

**Location**: Run in browser console on Dashboard page

**Test Cases** (10 total):
1. **No Prediction**: Null handling
2. **All Zeros**: Empty data handling
3. **Earthquake Medium (5.5)**: Moderate magnitude
4. **Earthquake High (7.5)**: High magnitude + acceleration
5. **Earthquake Low (2.5)**: Low magnitude + far distance
6. **Flood High**: Heavy rainfall + high river level
7. **Flood Low**: Light rainfall + low river level
8. **Landslide High**: High soil moisture + rain + low pressure
9. **Landslide Without Pressure**: Missing pressure data
10. **Multi-Disaster**: All disaster types combined

**Usage**:
1. Open browser console on Dashboard page
2. Run `runAllTests()`
3. Review pass/fail results for each test case

**Test Output**:
```
=== COMPREHENSIVE TEST SUITE ===

📋 Test 1: No Prediction
   Description: All scores should be null when no prediction exists
   Results: { overall: null, flood: null, earthquake: null, landslide: null }
   ✅ overall: null (as expected)
   ✅ flood: null (as expected)
   ✅ earthquake: null (as expected)
   ✅ landslide: null (as expected)
   ✅ PASS

...

=== FINAL RESULTS ===
✅ PASSED: 40
❌ FAILED: 0
🎉 ALL TESTS PASSED!
```

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `MONGO_DB_NAME` | Database name | No | - |
| `OPENWEATHER_API_KEY` | OpenWeather API key | Yes | - |
| `ML_API_URL` | ML model endpoint | No | `https://hackathon-model.onrender.com/predict` |
| `CLIENT_ORIGIN` | CORS allowed origin | No | `*` |

### Frontend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | No | `http://localhost:5000` |
| `VITE_DEFAULT_LOCATION_NAME` | Default location name | No | `Detected location` |
| `VITE_POLL_INTERVAL_MS` | Auto-refresh interval (ms) | No | 300000 (5 min) |

---

## 🎯 Key Features Explained

### Real-Time Monitoring
- Auto-polling every 5 minutes (configurable)
- Socket.IO for instant alert notifications
- Live prediction graph updates

### Smart Data Fusion
- Combines 3 external APIs (Weather, Seismic, ML)
- Derives missing features (soil moisture, river levels)
- Handles API failures gracefully with fallbacks

### Risk Assessment
- Custom scoring algorithms for each disaster type
- Null-safe calculations (no crashes on missing data)
- Color-coded indicators (green/orange/red)

### Location Intelligence
- 393 preset India locations
- Real-time geocoding (OpenStreetMap Nominatim)
- Reverse geocoding (coordinates → address)
- Click-to-select on interactive map

### Alert System
- Automatic alert generation for Medium/High risk
- Real-time broadcasting via Socket.IO
- Persistent storage in MongoDB
- Filterable by risk level and date range

---

## 🔍 Code Quality Features

### Backend
- Error handling middleware
- Input validation
- HTTP status codes (http-status-codes package)
- Retry logic with exponential backoff
- Detailed logging with timestamps
- CORS and security headers (Helmet)
- MongoDB connection pooling

### Frontend
- Context API for global state
- Custom hooks for reusable logic
- Null-safe rendering (handles missing data)
- Debounced search (prevents API spam)
- Responsive design (TailwindCSS)
- Code splitting with React Router
- Environment-based configuration

---

## 🐛 Common Issues & Solutions

### Backend Issues

#### MongoDB Connection Failed
```
Error: MONGO_URI is required
```
**Solution**: Add `MONGO_URI` to `.env` file

#### OpenWeather API Error
```
OPENWEATHER_API_KEY is required
```
**Solution**: Get API key from https://openweathermap.org/api and add to `.env`

#### ML Model Timeout
```
[ML Service] Retrying in 1000ms...
```
**Solution**: System uses fallback response automatically after 3 retries

### Frontend Issues

#### Map Not Loading
**Solution**: Check Leaflet CSS is loaded in `index.html`

#### Geolocation Not Working
```
🔒 Geolocation requires HTTPS
```
**Solution**: Use `https://` or `localhost` (not IP address)

#### Socket Connection Failed
**Solution**: Verify `VITE_API_BASE_URL` matches backend URL

---

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

1. Set environment variables in platform dashboard
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Update `CLIENT_ORIGIN` to production frontend URL
4. Deploy with `npm start` command

### Frontend Deployment (Vercel/Netlify)

1. Set `VITE_API_BASE_URL` to production backend URL
2. Build with `npm run build`
3. Deploy `dist/` folder
4. Ensure HTTPS for geolocation to work

---

## 📈 Future Enhancements

### Planned Features
- [ ] User authentication and saved preferences
- [ ] Email/SMS alert notifications
- [ ] Historical data comparison
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced ML model with retraining capability
- [ ] Integration with government alert systems
- [ ] Offline mode with service workers
- [ ] Export reports (PDF/CSV)
- [ ] Custom alert thresholds

### Potential Improvements
- [ ] Caching layer (Redis) for API responses
- [ ] GraphQL API for flexible queries
- [ ] WebSocket optimization (rooms for regions)
- [ ] Machine learning model explanations
- [ ] A/B testing for risk scoring formulas
- [ ] Performance monitoring (Sentry/New Relic)
- [ ] Automated testing (Jest/Cypress)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update README for new features
- Test thoroughly before submitting
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 👥 Team

Built for **Google GDG Hackathon**

---

## 📞 Support

For issues, questions, or suggestions:
- Open a GitHub Issue
- Contact: [Add your contact information]

---

## 🙏 Acknowledgments

- **OpenWeather API** for weather data
- **USGS Earthquake API** for seismic data
- **OpenStreetMap Nominatim** for geocoding
- **Leaflet** for mapping library
- **TailwindCSS** for styling framework
- **MongoDB** for database
- **Socket.IO** for real-time communication

---

**Last Updated**: December 29, 2025

**Version**: 1.0.0
