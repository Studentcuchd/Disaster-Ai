import { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const value = useMemo(
    () => ({
      selectedLocation,
      setSelectedLocation,
      latestPrediction,
      setLatestPrediction,
      alerts,
      setAlerts,
      socketConnected,
      setSocketConnected,
    }),
    [selectedLocation, latestPrediction, alerts, socketConnected]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
