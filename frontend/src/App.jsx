import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Navbar from './components/Navbar';
import { useSocket } from './hooks/useSocket';

const App = () => {
  useSocket();

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <main className="px-6 md:px-10 pb-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
