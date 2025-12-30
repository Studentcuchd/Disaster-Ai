import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { searchIndiaLocations, searchRealLocation, fetchPrediction } from '../services/api';

const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
        isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
      }`
    }
  >
    {label}
  </NavLink>
);

const Navbar = () => {
  const { selectedLocation, socketConnected, setSelectedLocation, setLatestPrediction, setAlerts } = useAppContext();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length > 2) {
      setIsSearching(true);
      
      // Debounce search - wait 300ms before searching
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // First get preset cities (cached, fast)
          const presetResults = await searchIndiaLocations(query);
          
          // Then get real-time results (from OpenStreetMap)
          const realtimeResults = await searchRealLocation(query);
          
          // Combine and deduplicate results
          const combined = [...presetResults, ...realtimeResults];
          
          // Remove duplicates by name
          const seen = new Set();
          const unique = combined.filter((loc) => {
            const key = `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          
          setSuggestions(unique.slice(0, 10)); // Limit to 10 suggestions
          setShowSuggestions(unique.length > 0);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSelectLocation = useCallback((location) => {
    setSelectedLocation(location);
    // Trigger prediction directly instead of using the hook
    fetchPrediction({
      latitude: location.latitude,
      longitude: location.longitude,
      locationName: location.name,
    }).then((data) => {
      if (data?.prediction) {
        setLatestPrediction(data.prediction);
      }
      if (data?.alert) {
        setAlerts((prev) => [data.alert, ...prev]);
      }
    }).catch(() => {
      // Error handled silently
    });
    setQuery('');
    setShowSuggestions(false);
  }, [setSelectedLocation, setLatestPrediction, setAlerts]);

  const handleClickOutside = (e) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-background/70 backdrop-blur border-b border-white/5">
      <div className="flex items-center gap-4 px-6 md:px-10 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent font-extrabold text-lg">DA</div>
          <div>
            <p className="text-lg font-bold">DisasterAI</p>
            <p className="text-xs text-white/60">Real-time Risk Intelligence</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 ml-6">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/alerts" label="Alerts" />
          <NavItem to="/analytics" label="Analytics" />
        </nav>

        <div className="flex items-center ml-auto relative w-80" ref={suggestionsRef}>
          <div className="relative w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setShowSuggestions(true)}
              placeholder="🔍 Search locations (real-time)..."
              className="w-full bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 text-sm outline-none text-white placeholder:text-white/50 transition-colors"
            />
            {isSearching && query.trim().length > 2 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin">⏳</div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-xl shadow-lg max-h-72 overflow-y-auto z-50">
                {suggestions.map((location, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLocation(location)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                  >
                    <p className="text-sm font-medium text-white">{location.name}</p>
                    <p className="text-xs text-white/50">📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                    {location.type && <p className="text-xs text-accent/70">• {location.type}</p>}
                  </button>
                ))}
              </div>
            )}
            {!isSearching && query.trim().length > 2 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 z-50">
                ❌ No locations found for "{query}"
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="relative bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-sm transition-colors"
          >
            Live Alerts
          </button>
          <div className="px-3 py-2 rounded-xl bg-white/5 text-xs uppercase font-semibold truncate max-w-xs">
            {selectedLocation?.name || 'Auto locating...'}
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
              socketConnected ? 'bg-accentGreen/20 text-accentGreen' : 'bg-accentRed/20 text-accentRed'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {socketConnected ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
