import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAlerts, fetchPrediction } from '../services/api';
import { useAppContext } from '../context/AppContext';

const DEFAULT_NAME = import.meta.env.VITE_DEFAULT_LOCATION_NAME || 'Detected location';
const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS || 300000);

export const useLiveMonitoring = () => {
  const { selectedLocation, setSelectedLocation, setLatestPrediction, setAlerts } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const runPrediction = useCallback(
    async ({ latitude, longitude, locationName }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPrediction({ latitude, longitude, locationName });
        if (data?.prediction) {
          setLatestPrediction(data.prediction);
        }
        if (data?.alert) {
          setAlerts((prev) => [data.alert, ...prev]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [setAlerts, setLatestPrediction]
  );

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('❌ Geolocation not supported by your browser.');
      return;
    }
    
    const insecure = !window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (insecure) {
      setError('🔒 Geolocation requires HTTPS. Please use https:// or localhost.');
      return;
    }
    
    setLoading(true);
    setError(null);
    console.log('🔍 Requesting geolocation...');
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log('✅ Location detected:', lat, lng);
        
        // Update selected location immediately with coordinates (non-blocking)
        const fallbackCoords = {
          latitude: lat,
          longitude: lng,
          name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
        setSelectedLocation(fallbackCoords);
        
        // Get address using reverse geocoding (non-blocking fallback)
        import('../services/api').then(({ reverseGeocode }) => {
          reverseGeocode(lat, lng)
            .then((result) => {
              if (result?.name) {
                const coords = {
                  latitude: lat,
                  longitude: lng,
                  name: result.name,
                };
                console.log('📍 Address found:', result.name);
                setSelectedLocation(coords);
                runPrediction({ latitude: lat, longitude: lng, locationName: result.name });
              } else {
                // If no name returned, use fallback
                console.log('📍 Using coordinate-based name');
                runPrediction({ latitude: lat, longitude: lng, locationName: fallbackCoords.name });
              }
              setError(null);
            })
            .catch((err) => {
              console.warn('⚠️ Reverse geocoding failed, using coordinate fallback:', err?.message);
              // Use fallback coordinates that were already set
              runPrediction({ latitude: lat, longitude: lng, locationName: fallbackCoords.name });
              setError(null);
            })
            .finally(() => {
              setLoading(false);
            });
        }).catch(() => {
          // If module import fails, use fallback
          setLoading(false);
          runPrediction({ latitude: lat, longitude: lng, locationName: fallbackCoords.name });
        });
      },
      (err) => {
        console.error('❌ Geolocation error:', err);
        
        if (err.code === 1) { // PERMISSION_DENIED
          setError('❌ Location permission denied. Please allow location access in your browser and try again.');
          setLoading(false);
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          setError('📍 Location unavailable. Please check if GPS/location services are enabled.');
          setLoading(false);
        } else if (err.code === 3) { // TIMEOUT
          console.log('⏱️ High accuracy timeout. Retrying with lower accuracy...');
          setError('⏱️ Trying with lower accuracy...');
          // Retry with lower accuracy for faster response
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              console.log('✅ Location detected (low accuracy):', lat, lng);
              
              const coords = {
                latitude: lat,
                longitude: lng,
                name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              };
              setSelectedLocation(coords);
              runPrediction({ latitude: lat, longitude: lng, locationName: coords.name });
              setError(null);
              setLoading(false);
            },
            (retryErr) => {
              console.error('❌ Low accuracy retry also failed:', retryErr);
              setLoading(false);
              setError('❌ Location detection failed. Please enter coordinates manually or try again.');
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        } else {
          setError(`❌ Location error: ${err.message}`);
          setLoading(false);
        }
      },
      { 
        enableHighAccuracy: true,    // Try high accuracy first
        timeout: 12000,              // 12 seconds timeout
        maximumAge: 0                // Don't use cached location initially
      }
    );
  }, [runPrediction, setSelectedLocation, setError, setLoading]);

  // Initial geolocation - do NOT auto-trigger to avoid blocking app load
  useEffect(() => {
    // Only request geolocation if explicitly enabled via env variable
    const autoGeolocate = import.meta.env.VITE_AUTO_GEOLOCATION === 'true';
    if (!autoGeolocate || selectedLocation) return;
    
    // Defer geolocation request to not block initial render
    const timer = setTimeout(() => {
      requestGeolocation();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [requestGeolocation, selectedLocation]);

  // Polling interval
  useEffect(() => {
    if (!selectedLocation) return undefined;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      runPrediction({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        locationName: selectedLocation.name,
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [runPrediction, selectedLocation]);

  // Load initial alerts list
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (err) {
        // best effort
      }
    };
    loadAlerts();
  }, [setAlerts]);

  const triggerPrediction = useCallback(
    (coords) => {
      setSelectedLocation(coords);
      runPrediction({ latitude: coords.latitude, longitude: coords.longitude, locationName: coords.name });
    },
    [runPrediction, setSelectedLocation]
  );

  return { 
    loading, 
    error, 
    triggerPrediction, 
    retryLocation: requestGeolocation,
    requestGeolocation // ADD THIS - Dashboard uses this name
  };
};
