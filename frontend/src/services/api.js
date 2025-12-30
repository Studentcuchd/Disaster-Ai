import axios from 'axios';

// API timeout for backend calls
const API_TIMEOUT = 15000;

// Nominatim API timeout (shorter to fail fast)
const NOMINATIM_TIMEOUT = 8000;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: API_TIMEOUT,
});

export const fetchPrediction = async ({ latitude, longitude, locationName }) => {
  const { data } = await api.post('/api/predictions', { latitude, longitude, locationName });
  return data;
};

export const fetchAlerts = async (params = {}) => {
  const { data } = await api.get('/api/alerts', { params });
  return data;
};

export const fetchHistory = async (limit = 50) => {
  const { data } = await api.get('/api/predictions/history', { params: { limit } });
  return data;
};

export const fetchLocations = async () => {
  const { data } = await api.get('/api/locations');
  return data;
};

export const createLocation = async (payload) => {
  const { data } = await api.post('/api/locations', payload);
  return data;
};

// Search India locations by name
export const searchIndiaLocations = async (query) => {
  const { INDIA_LOCATIONS } = await import('../data/indiaLocations');
  if (!query.trim()) return INDIA_LOCATIONS;
  const lowerQuery = query.toLowerCase();
  return INDIA_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(lowerQuery) ||
      loc.region.toLowerCase().includes(lowerQuery)
  );
};

// Geocoding service using OpenStreetMap Nominatim (free, no API key required)
export const searchRealLocation = async (query) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        countrycodes: 'in', // Focus on India, remove for global search
        limit: 10,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'DisasterAI/1.0', // Required by Nominatim
      },
      timeout: NOMINATIM_TIMEOUT,
    });
    return response.data.map((item) => ({
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.address,
      type: item.type,
      importance: item.importance,
    }));
  } catch (error) {
    console.warn('⚠️ Geocoding search failed:', error?.message);
    return [];
  }
};

// Reverse geocoding - get address from coordinates
export const reverseGeocode = async (latitude, longitude) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT);
  
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'DisasterAI/1.0',
      },
      timeout: NOMINATIM_TIMEOUT,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return {
      name: response.data.display_name || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      address: response.data.address,
      latitude,
      longitude,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('⚠️ Reverse geocoding timeout - using coordinates as fallback');
    } else {
      console.warn('⚠️ Reverse geocoding failed:', error?.message);
    }
    return null;
  }
};

export default api;
