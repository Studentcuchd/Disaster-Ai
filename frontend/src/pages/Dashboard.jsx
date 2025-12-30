import { useEffect, useMemo, useState } from 'react';
import MetricCard from '../components/MetricCard';
import RiskCard from '../components/RiskCard';
import MapView from '../components/MapView';
import AlertsPanel from '../components/AlertsPanel';
import LivePredictionGraph from '../components/LivePredictionGraph';
import { useAppContext } from '../context/AppContext';
import { useLiveMonitoring } from '../hooks/useLiveMonitoring';
import { fetchLocations, createLocation, searchIndiaLocations, searchRealLocation, reverseGeocode } from '../services/api';

const riskToScore = (probabilities = {}) => {
  // Check if we have actual prediction data
  if (!probabilities || Object.keys(probabilities).length === 0) {
    return null; // No prediction yet
  }
  
  // Probabilities come as decimals (0-1) from ML model
  // Calculate weighted score: High=60%, Medium=40%, Low=20%
  const low = (probabilities.Low || 0);
  const medium = (probabilities.Medium || 0);
  const high = (probabilities.High || 0);
  
  // If all probabilities are 0, no valid prediction
  if (low === 0 && medium === 0 && high === 0) {
    return null;
  }
  
  // Weighted calculation: high risk weighted most heavily
  const rawScore = high * 0.6 + medium * 0.4 + low * 0.2;
  
  // Convert to 0-100 scale
  return Math.round(rawScore * 100);
};

const deriveFloodScore = (prediction) => {
  // Check if we have actual prediction data
  if (!prediction?.modelRequest) {
    return null; // No prediction yet
  }
  
  // Flood risk factors: rainfall, river level, and rise rate
  // Normalize each factor to 0-100 scale before calculating
  const rain = prediction?.modelRequest?.rainfall_1h_mm || 0;
  const river = prediction?.modelRequest?.river_level_m || 0;
  const rise = prediction?.modelRequest?.river_rise_rate_cmphr || 0;
  
  // If all values are 0, likely no real data
  if (rain === 0 && river === 0 && rise === 0) {
    return null;
  }
  
  // Normalize each factor to 0-100 scale
  const rainScore = Math.min(100, (rain / 50) * 100);        // Max: 50mm/hr
  const riverScore = Math.min(100, (river / 10) * 100);       // Max: 10m
  const riseScore = Math.min(100, (rise / 50) * 100);         // Max: 50cm/hr
  
  // Weighted average: rain=50%, river level=35%, rise rate=15%
  return Math.round(rainScore * 0.5 + riverScore * 0.35 + riseScore * 0.15);
};

const deriveEarthquakeScore = (prediction) => {
  // Check if we have actual prediction data
  if (!prediction?.modelRequest) {
    return null; // No prediction yet
  }
  
  // Earthquake risk factors: magnitude, acceleration, and distance from fault
  const mag = prediction?.modelRequest?.seismic_magnitude || 0;
  const accel = prediction?.modelRequest?.ground_acceleration_g || 0;
  const distance = prediction?.modelRequest?.distance_from_fault_km || 0;
  
  // If all values are 0, likely no real data
  if (mag === 0 && accel === 0 && distance === 0) {
    return null;
  }
  
  // Normalize each factor to 0-100 scale
  const magScore = Math.min(100, (mag / 9) * 100);            // Max: 9.0 magnitude
  const accelScore = Math.min(100, (accel / 2) * 100);         // Max: 2.0g acceleration
  // Only calculate distance score if distance is provided (> 0 means data exists)
  const distanceScore = distance > 0 ? Math.max(0, 100 - (distance / 100) * 100) : 0;
  
  // Weighted average: magnitude=50%, acceleration=30%, distance=20%
  return Math.round(magScore * 0.5 + accelScore * 0.3 + distanceScore * 0.2);
};

const deriveLandslideScore = (prediction) => {
  // Check if we have actual prediction data
  if (!prediction?.modelRequest) {
    return null; // No prediction yet
  }
  
  // Landslide risk factors: soil moisture, rainfall, and slope (via pressure proxy)
  const soil = prediction?.modelRequest?.soil_moisture_pct || 0;
  const rain = prediction?.modelRequest?.rainfall_1h_mm || 0;
  const pressure = prediction?.weatherSnapshot?.pressurehPa;
  
  // If all critical values are 0/missing, likely no real data
  if (soil === 0 && rain === 0 && !pressure) {
    return null;
  }
  
  // Soil moisture: 0-100% directly
  const soilScore = Math.min(100, soil);
  
  // Rainfall impact: 0-50mm/hr
  const rainScore = Math.min(100, (rain / 50) * 100);
  
  // Pressure as slope proxy: lower pressure = higher altitude/slope (rough estimate)
  // Only calculate if pressure data is available
  const slopeScore = pressure 
    ? Math.min(100, Math.max(0, (1013 - pressure) / 10) * 100)
    : 0;
  
  // Weighted average: soil=40%, rainfall=40%, slope=20%
  return Math.round(soilScore * 0.4 + rainScore * 0.4 + slopeScore * 0.2);
};

const Dashboard = () => {
  const { latestPrediction, alerts, selectedLocation, setSelectedLocation } = useAppContext();
  const { loading, error, triggerPrediction, retryLocation, requestGeolocation } = useLiveMonitoring();
  const [locations, setLocations] = useState([]);
  const [manual, setManual] = useState({ name: 'Custom location', latitude: '', longitude: '' });
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState('preset'); // 'preset' or 'real'
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (e) {
        // ignore
      }
    };
    load();
    // Don't auto-request geolocation - let user click button
  }, []);

  const handleLocationNameChange = async (e) => {
    const value = e.target.value;
    setManual((p) => ({ ...p, name: value }));

    if (value.trim().length > 2) {
      setIsSearching(true);
      try {
        let suggestions = [];
        if (searchMode === 'preset') {
          suggestions = await searchIndiaLocations(value);
          setSuggestedLocations(suggestions.slice(0, 8));
        } else {
          // Real-world search with OpenStreetMap
          suggestions = await searchRealLocation(value);
          setSuggestedLocations(suggestions.slice(0, 8));
        }
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestedLocations([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (location) => {
    setManual({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
    });
    setShowSuggestions(false);
  };

  const handleMapClick = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const result = await reverseGeocode(lat, lng);
      if (result) {
        setManual({
          name: result.name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          latitude: lat.toString(),
          longitude: lng.toString(),
        });
        // Optionally trigger prediction immediately
        const coords = { name: result.name, latitude: lat, longitude: lng };
        setSelectedLocation(coords);
        triggerPrediction(coords);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates
      setManual({
        name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        latitude: lat.toString(),
        longitude: lng.toString(),
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const onManualSubmit = async (e) => {
    e.preventDefault();
    if (!manual.latitude || !manual.longitude) return;
    const coords = { name: manual.name, latitude: Number(manual.latitude), longitude: Number(manual.longitude) };
    triggerPrediction(coords);
    setSelectedLocation(coords);
    try {
      await createLocation(coords);
    } catch (err) {
      // ignore
    }
  };

  const probabilities = latestPrediction?.modelResponse?.probabilities || {};
  const overallScore = riskToScore(probabilities);

  const floodScore = deriveFloodScore(latestPrediction);
  const earthquakeScore = deriveEarthquakeScore(latestPrediction);
  const landslideScore = deriveLandslideScore(latestPrediction);

  const confidencePct = latestPrediction?.modelResponse?.confidence ? Math.round(latestPrediction.modelResponse.confidence * 100) : 0;
  const uncertainty = 100 - confidencePct;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Risk Dashboard</h1>
          <p className="text-white/60">Live disaster risk monitoring with ML predictions</p>
        </div>
        <div className="badge bg-accent/15 text-accent text-sm">
          Overall Risk: {latestPrediction?.modelResponse?.risk_level || 'Pending'}
        </div>
      </div>

      {error && (
        <div className="card p-3 text-accentRed flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={retryLocation}
            className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-sm"
          >
            Retry location
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard label="Confidence Score" value={`${confidencePct}%`} sublabel="Model confidence" icon="%" />
        <MetricCard label="Active Alerts" value={alerts.length || 0} sublabel="Live triggers" icon="!" />
        <MetricCard label="Uncertainty" value={`${uncertainty}%`} sublabel="Prediction margin" icon="±" />
        <MetricCard label="Regions Monitored" value={locations.length || (selectedLocation ? 1 : 0)} sublabel="Tracked locations" icon="◎" />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <RiskCard title="Overall Risk" value={overallScore} subtitle="/ 100" riskLevel={overallScore === null ? 'N/A' : (latestPrediction?.modelResponse?.risk_level || 'N/A')} icon="🛡️" />
        <RiskCard title="Flood Risk" value={floodScore} subtitle="/ 100" riskLevel={floodScore === null ? 'N/A' : floodScore > 70 ? 'High' : floodScore > 40 ? 'Medium' : 'Low'} icon="💧" />
        <RiskCard title="Earthquake Risk" value={earthquakeScore} subtitle="/ 100" riskLevel={earthquakeScore === null ? 'N/A' : earthquakeScore > 70 ? 'High' : earthquakeScore > 40 ? 'Medium' : 'Low'} icon="📈" />
        <RiskCard title="Landslide Risk" value={landslideScore} subtitle="/ 100" riskLevel={landslideScore === null ? 'N/A' : landslideScore > 70 ? 'High' : landslideScore > 40 ? 'Medium' : 'Low'} icon="⛰️" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <MapView
            latitude={selectedLocation?.latitude}
            longitude={selectedLocation?.longitude}
            riskLevel={latestPrediction?.modelResponse?.risk_level}
            onLocationSelect={handleMapClick}
          />

          <LivePredictionGraph prediction={latestPrediction} />

          <form onSubmit={onManualSubmit} className="card p-4 space-y-3">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => { setSearchMode('preset'); setSuggestedLocations([]); setShowSuggestions(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  searchMode === 'preset' ? 'bg-accent text-black' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                📋 Preset Cities (250+)
              </button>
              <button
                type="button"
                onClick={() => { setSearchMode('real'); setSuggestedLocations([]); setShowSuggestions(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  searchMode === 'real' ? 'bg-accent text-black' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                🌍 Real-World Search
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-xs text-white/60">
                  {searchMode === 'preset' ? 'Search preset cities' : 'Search any real location'}
                </label>
                <input
                  value={manual.name}
                  onChange={handleLocationNameChange}
                  placeholder={searchMode === 'preset' ? 'e.g., Mumbai, Delhi, Bangalore...' : 'e.g., Connaught Place, Marine Drive...'}
                  className="w-full bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 mt-1 text-white placeholder:text-white/50 transition-colors"
                />
                {isSearching && (
                  <div className="absolute right-3 top-9 text-accent animate-spin">⏳</div>
                )}
                {isReverseGeocoding && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-accent rounded-xl px-3 py-2 text-sm text-accent">
                    🔍 Finding address from map location...
                  </div>
                )}
                {showSuggestions && suggestedLocations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-accent/30 rounded-xl shadow-lg max-h-64 overflow-y-auto z-10">
                    {suggestedLocations.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSuggestion(loc)}
                        className="w-full text-left px-3 py-2 hover:bg-accent/10 border-b border-white/5 last:border-0 transition-colors text-sm"
                      >
                        <p className="font-medium">{loc.name}</p>
                        <p className="text-xs text-white/50">
                          📍 {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                          {loc.type && ` • ${loc.type}`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-white/40 mt-1.5">
                  {searchMode === 'preset' ? (
                    <>🗺️ {showSuggestions && suggestedLocations.length > 0 ? `Showing ${suggestedLocations.length} of 250+ cities` : '250+ Indian cities available'}</>
                  ) : (
                    <>🌍 {showSuggestions ? `${suggestedLocations.length} real locations found` : 'Search any address, city, or landmark worldwide'}</>
                  )}
                </p>
              </div>
              <div>
                <label className="text-xs text-white/60">Region</label>
                <input
                  disabled
                  value={suggestedLocations.find(l => l.name === manual.name)?.region || ''}
                  placeholder="Region will auto-fill"
                  className="w-full bg-white/5 rounded-xl px-3 py-2 mt-1 text-white/50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manual.latitude}
                  onChange={(e) => setManual((p) => ({ ...p, latitude: e.target.value }))}
                  placeholder="Auto-fill or enter manually"
                  className="w-full bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 mt-1 text-white placeholder:text-white/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manual.longitude}
                  onChange={(e) => setManual((p) => ({ ...p, longitude: e.target.value }))}
                  placeholder="Auto-fill or enter manually"
                  className="w-full bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 mt-1 text-white placeholder:text-white/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || isReverseGeocoding}
                className="flex-1 bg-accent hover:brightness-110 text-black font-semibold rounded-xl py-3 transition disabled:opacity-50"
              >
                {loading ? '⏳ Predicting...' : '🔍 Predict for this location'}
              </button>
              <button
                type="button"
                onClick={requestGeolocation}
                disabled={loading || isReverseGeocoding}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 text-white font-semibold rounded-xl py-3 transition disabled:opacity-50"
              >
                {loading && !isReverseGeocoding ? '📡 Detecting...' : '📍 Auto-Detect My Location'}
              </button>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-sm text-red-400">
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>
        <AlertsPanel alerts={alerts} />
      </div>
    </div>
  );
};

export default Dashboard;
