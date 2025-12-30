# 🌍 DisasterAI - Real-Time Natural Disaster Risk Monitoring System

> A comprehensive AI-powered system for predicting and monitoring flood, earthquake, and landslide risks in real-time.

## � Live Demo

**Try it now!**
- 🌐 **Frontend**: https://disasterai.onrender.com
- 🔌 **Backend API**: https://disasteraibackend.onrender.com
- 📊 **API Docs**: https://disasteraibackend.onrender.com/api/predictions

> Note: Backend may take 30-60 seconds to start on first request (Render free tier). Subsequent requests will be instant.

---

## 📋 Table of Contents

- [Live Demo](#live-demo)
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Risk Scoring](#risk-scoring)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🌍 Overview

**DisasterAI** is a real-time natural disaster risk monitoring and prediction system that combines multiple data sources (weather, seismic activity, and machine learning) to provide accurate disaster risk assessments for any location in India.

### Supported Disaster Types
- 🌊 **Floods** - Based on rainfall, river levels, and rise rates
- 🏔️ **Earthquakes** - Based on seismic magnitude, ground acceleration, and fault distance
- ⛰️ **Landslides** - Based on soil moisture, rainfall, and atmospheric pressure

---

## ✨ Key Features

### Core Capabilities
✅ **Real-Time Predictions** - Instant risk assessment for any location  
✅ **Live Monitoring** - Auto-refresh every 5 minutes (configurable)  
✅ **Multi-Source Data** - Weather, seismic, and ML model integration  
✅ **Smart Alerts** - Automatic notifications for Medium/High risk levels  
✅ **Interactive Map** - Click-to-predict using OpenStreetMap  
✅ **Location Search** - 393+ preset India locations with autocomplete  
✅ **Analytics Dashboard** - Historical trends and confidence analysis  
✅ **Real-Time Streaming** - Socket.IO alerts to all connected clients  

### User Interface
- 🎨 Modern, responsive design with TailwindCSS
- 🌙 Dark mode optimized with gradients
- 📊 Live prediction graphs with animated bars
- 🎯 Risk cards with color-coded indicators (Low/Medium/High)
- 📱 Mobile-friendly and touch-optimized
- ⚡ Fast, smooth interactions with Vite

---

## ⚡ Quick Start (No Installation Required!)

### Try the Live App
1. **Open**: https://disasterai.onrender.com
2. **Select a location** from the map or search bar
3. **View real-time predictions** for Flood, Earthquake, and Landslide risks
4. **Check alerts** in real-time via Socket.IO

### Test the API
```bash
# Get prediction history
curl https://disasteraibackend.onrender.com/api/predictions/history?limit=5

# Create a prediction
curl -X POST https://disasteraibackend.onrender.com/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.6139,
    "longitude": 77.2090,
    "locationName": "New Delhi"
  }'

# Get all alerts
curl https://disasteraibackend.onrender.com/api/alerts

# Health check
curl https://disasteraibackend.onrender.com/health
```

---

## 🛠️ Tech Stack

### Backend
```
Node.js + Express.js
MongoDB + Mongoose
Socket.IO (Real-time events)
Axios (HTTP client)
Helmet + CORS (Security)
```

### Frontend
```
React 18 + Vite
TailwindCSS 3 (Styling)
React Router v6 (Navigation)
Leaflet + React-Leaflet (Maps)
Socket.IO Client (Real-time)
Axios (API calls)
```

### External APIs
- **OpenWeather API** - Weather data
- **USGS Earthquake API** - Seismic activity
- **Custom ML Model** - Risk predictions
- **OpenStreetMap Nominatim** - Geocoding

---

## 📁 Project Structure

```
DisasterAI/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/               # Request handlers
│   ├── models/                    # MongoDB schemas
│   ├── routes/                    # API endpoints
│   ├── services/                  # Business logic
│   ├── utils/                     # Helper functions
│   ├── server.js                  # Express app
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── context/               # Global state
│   │   ├── hooks/                 # Custom hooks
│   │   ├── pages/                 # Pages
│   │   ├── services/              # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md                      # This file
```

---

## 🚀 Installation

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- OpenWeather API key ([get here](https://openweathermap.org/api))

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/disasterai
OPENWEATHER_API_KEY=your_api_key_here
ML_API_URL=https://hackathon-model.onrender.com/predict
CLIENT_ORIGIN=http://localhost:5173
EOF

# Start server
npm start          # Production
npm run dev        # Development with nodemon
```

**Server runs on**: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional - defaults work with local backend)
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000
VITE_POLL_INTERVAL_MS=300000
EOF

# Start dev server
npm run dev        # Development server

# Build for production
npm run build
npm run preview
```

**Frontend runs on**: `http://localhost:5173`

---

## 📡 API Documentation

### Predictions

#### Create Prediction
```
POST /api/predictions
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "locationName": "New Delhi",
  "soil_moisture_pct": 45.5,
  "river_level_m": 2.3,
  "river_danger_level_m": 5.0,
  "river_rise_rate_cmphr": 12.5
}
```

**Response (200 OK)**:
```json
{
  "prediction": {
    "_id": "...",
    "location": {"name": "New Delhi", "latitude": 28.6139, "longitude": 77.2090},
    "weatherSnapshot": {...},
    "modelRequest": {...},
    "modelResponse": {
      "risk_level": "Medium",
      "confidence": 0.85,
      "probabilities": {"Low": 0.2, "Medium": 0.6, "High": 0.2}
    }
  },
  "alert": {...}
}
```

#### Get Prediction History
```
GET /api/predictions/history?limit=50
```

### Alerts

#### Get Alerts
```
GET /api/alerts?riskLevel=Medium&start=2025-12-25&end=2025-12-30
```

### Locations

#### List Locations
```
GET /api/locations
```

#### Create Location
```
POST /api/locations
{
  "name": "Mumbai",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "note": "Financial capital"
}
```

### Health Check
```
GET /health
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│       React Frontend (Vite)             │
│  - Dashboard, Alerts, Analytics         │
│  - Map, Risk Cards, Graphs              │
│  - Socket.IO Client                     │
└────────────────┬────────────────────────┘
                 │ HTTP + WebSocket
┌────────────────▼────────────────────────┐
│     Express.js Backend (Node.js)        │
│  - REST API Routes                      │
│  - Socket.IO Server                     │
│  - Controllers & Services               │
└──┬──────────┬──────────┬─────────────────┘
   │          │          │
   ▼          ▼          ▼
┌─────┐  ┌─────┐  ┌──────────┐
│USGS │  │Open  │  │ MongoDB  │
│API  │  │Weather API │      │
└─────┘  └─────┘  └──────────┘
```

### Data Flow
1. User selects location on map
2. Frontend sends prediction request
3. Backend fetches live weather + seismic data
4. ML model predicts risk level
5. Alert created if Medium/High risk
6. Real-time alert broadcast via Socket.IO
7. Frontend displays results

---

## 📊 Risk Scoring

### Overall Risk Score
**Formula**: `(Low*0.2 + Medium*0.4 + High*0.6) × 100`

### Flood Risk
- Rainfall: 50% weight
- River Level: 35% weight  
- Rise Rate: 15% weight

### Earthquake Risk
- Magnitude: 50% weight
- Ground Acceleration: 30% weight
- Distance from Fault: 20% weight

### Landslide Risk
- Soil Moisture: 40% weight
- Rainfall: 40% weight
- Atmospheric Pressure: 20% weight

---

## 🔐 Environment Variables

### Backend
| Variable | Required | Default |
|----------|----------|---------|
| `PORT` | No | 5000 |
| `MONGO_URI` | ✅ Yes | - |
| `OPENWEATHER_API_KEY` | ✅ Yes | - |
| `ML_API_URL` | No | https://hackathon-model.onrender.com/predict |
| `CLIENT_ORIGIN` | No | * |

### Frontend
| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | http://localhost:5000 |
| `VITE_POLL_INTERVAL_MS` | 300000 (5 minutes) |

---

## 🚀 Deployment

### Deploy Backend (Render/Heroku)
1. Set environment variables in platform dashboard
2. Use MongoDB Atlas for cloud database
3. Deploy with command: `npm start`
4. Update `CLIENT_ORIGIN` to production frontend URL

### Deploy Frontend (Vercel/Netlify)
1. Set `VITE_API_BASE_URL` to production backend
2. Run `npm run build`
3. Deploy `dist/` folder
4. Enable HTTPS for geolocation

### Deploy ML Model
- Uses default: `https://hackathon-model.onrender.com/predict`
- Includes automatic retry logic (exponential backoff)
- Fallback to safe defaults on timeout

---

## 🔄 Error Handling

### Automatic Retry Logic
When ML service fails (502/503 or timeout):
- **Attempt 1**: Wait 2 seconds, retry
- **Attempt 2**: Wait 4 seconds, retry
- **Attempt 3**: Return detailed error to client

### Graceful Degradation
- Missing weather data? Uses safe defaults
- Missing seismic data? Sets values to 0
- ML service down? Returns proper error with full retry info

---

## 🎯 Key Improvements in Latest Update

✅ **Removed fallback mechanism** - Only exact live predictions  
✅ **Enhanced error detection** - Clear error types (TIMEOUT, HTTP_ERROR, NETWORK_ERROR)  
✅ **Retry logic** - Automatic recovery from 502/503 errors  
✅ **Better validation** - ML response validation before processing  
✅ **Status codes** - Proper HTTP status codes in all responses  

---

## 🧪 Testing

Run comprehensive test suite:
1. Open browser console on Dashboard
2. Execute: `runAllTests()`
3. Review pass/fail results

Tests cover:
- No prediction handling
- All disaster types (Flood, Earthquake, Landslide)
- Edge cases (missing data, extreme values)
- Risk scoring algorithms

---

## 📈 Features Roadmap

- [ ] User authentication
- [ ] Email/SMS notifications
- [ ] PDF report export
- [ ] Mobile app (React Native)
- [ ] Multi-country support
- [ ] Advanced ML with explanations
- [ ] Historical comparison analysis
- [ ] CI/CD automation

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use this project for any purpose.

---

## 👥 Team

Built for **Google GDG Hackathon** 🎉

---

## 🙏 Acknowledgments

- **OpenWeather** - Weather data API
- **USGS** - Earthquake data API
- **Leaflet** - Interactive mapping
- **TailwindCSS** - Beautiful styling
- **Socket.IO** - Real-time communication
- **MongoDB** - NoSQL database

---

## 📞 Support

- 🐛 Found a bug? Open an issue
- 💡 Have an idea? Create a discussion
- 📧 Email: [Add contact]

---

**Last Updated**: December 30, 2025  
**Version**: 1.1.0 (Latest with error handling improvements)
