import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { fetchAlerts } from '../services/api';
import { useAppContext } from '../context/AppContext';

const Alerts = () => {
  const { alerts: liveAlerts, setAlerts } = useAppContext();
  const [filters, setFilters] = useState({ riskLevel: '', start: '', end: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts(filters);
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-white/60">Live, filterable alerts stored in MongoDB</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="card p-4 grid md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-white/60">Risk level</label>
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters((p) => ({ ...p, riskLevel: e.target.value }))}
            className="w-full bg-white/5 rounded-xl px-3 py-2 mt-1"
          >
            <option value="">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-white/60">Start date</label>
          <input
            type="date"
            value={filters.start}
            onChange={(e) => setFilters((p) => ({ ...p, start: e.target.value }))}
            className="w-full bg-white/5 rounded-xl px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-white/60">End date</label>
          <input
            type="date"
            value={filters.end}
            onChange={(e) => setFilters((p) => ({ ...p, end: e.target.value }))}
            className="w-full bg-white/5 rounded-xl px-3 py-2 mt-1"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={load}
            className="w-full bg-accent text-black font-semibold rounded-xl py-3"
          >
            {loading ? 'Filtering...' : 'Apply filters'}
          </button>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        {liveAlerts.map((alert) => (
          <div key={alert._id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold">{alert.message}</p>
              <p className="text-xs text-white/60">
                {alert.location?.name || 'Location'} · {dayjs(alert.createdAt).format('DD MMM, HH:mm')}
              </p>
            </div>
            <span
              className={`badge ${
                alert.riskLevel === 'High'
                  ? 'bg-accentRed/20 text-accentRed'
                  : alert.riskLevel === 'Medium'
                  ? 'bg-accent/20 text-accent'
                  : 'bg-accentGreen/20 text-accentGreen'
              }`}
            >
              {alert.riskLevel}
            </span>
          </div>
        ))}
        {liveAlerts.length === 0 && <p className="text-sm text-white/60">No alerts recorded yet.</p>}
      </div>
    </div>
  );
};

export default Alerts;
