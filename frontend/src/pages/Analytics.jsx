import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import TrendChart from '../components/TrendChart';
import { fetchHistory } from '../services/api';

const Analytics = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  const [limit, setLimit] = useState(50);

  const load = async (overrideLimit) => {
    setLoading(true);
    setError(null);
    try {
      const effectiveLimit = overrideLimit ?? limit;
      const data = await fetchHistory(effectiveLimit);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to load analytics:', err);
      setError(err.message || 'Failed to load analytics data');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    return item.modelResponse?.risk_level?.toLowerCase() === filter;
  });

  const avgConfidence = history.length > 0 ? Math.round(
    (history.reduce((sum, item) => sum + (item.modelResponse?.confidence || 0), 0) / history.length) * 100
  ) : 0;

  const highRiskCount = history.filter((item) => item.modelResponse?.risk_level === 'High').length;
  const mediumRiskCount = history.filter((item) => item.modelResponse?.risk_level === 'Medium').length;
  const lowRiskCount = history.filter((item) => item.modelResponse?.risk_level === 'Low').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-white/60">Historical predictions, trends, and confidence analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/60">Limit</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-white/10 hover:bg-white/20 px-2 py-2 rounded-xl text-sm transition-colors outline-none"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
          <button
            type="button"
            onClick={() => load(limit)}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-accentRed/10 border border-accentRed/20">
          <p className="text-accentRed font-medium">❌ {error}</p>
          <button
            onClick={() => load(limit)}
            className="mt-2 text-sm text-accentRed hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-white/60 text-sm">Total Predictions</p>
          <p className="text-3xl font-bold">{history.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-white/60 text-sm">Avg Confidence</p>
          <p className="text-3xl font-bold text-accent">{avgConfidence}%</p>
        </div>
        <div className="card p-4">
          <p className="text-white/60 text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accentRed" />
            High Risk
          </p>
          <p className="text-3xl font-bold text-accentRed">{highRiskCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-white/60 text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accentGreen" />
            Low Risk
          </p>
          <p className="text-3xl font-bold text-accentGreen">{lowRiskCount}</p>
        </div>
      </div>

      {/* Confidence Trend Chart */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold">Confidence Trend Over Time</p>
          <p className="text-xs text-white/60">Last {history.length} predictions</p>
        </div>
        {history.length > 0 ? (
          <TrendChart data={history} />
        ) : (
          <p className="text-sm text-white/60 py-8 text-center">No data yet. Make some predictions to see trends.</p>
        )}
      </div>

      {/* Risk Distribution Chart */}
      {history.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">Risk Level Distribution</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accentRed" />
                  High Risk
                </label>
                <span className="font-bold text-accentRed">{highRiskCount}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-accentRed transition-all duration-300"
                  style={{ width: `${(highRiskCount / history.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accentOrange" />
                  Medium Risk
                </label>
                <span className="font-bold text-accentOrange">{mediumRiskCount}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-accentOrange transition-all duration-300"
                  style={{ width: `${(mediumRiskCount / history.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accentGreen" />
                  Low Risk
                </label>
                <span className="font-bold text-accentGreen">{lowRiskCount}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-accentGreen transition-all duration-300"
                  style={{ width: `${(lowRiskCount / history.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      {history.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-accent text-black' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            All Predictions
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'high' ? 'bg-accentRed text-white' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            High Risk
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'medium' ? 'bg-accentOrange text-white' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Medium Risk
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'low' ? 'bg-accentGreen text-white' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Low Risk
          </button>
        </div>
      )}

      {/* Historical Data Table */}
      <div className="card p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr className="text-left border-b border-white/5">
              <th className="py-3 px-2">Timestamp</th>
              <th className="py-3 px-2">Location</th>
              <th className="py-3 px-2">Risk Level</th>
              <th className="py-3 px-2">Confidence</th>
              <th className="py-3 px-2">Rainfall (1h)</th>
              <th className="py-3 px-2">Region</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <tr key={item._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-white/80">{dayjs(item.createdAt).format('DD MMM, HH:mm')}</td>
                  <td className="py-3 px-2">
                    <div className="font-medium">{item.location?.name || 'Location'}</div>
                    <div className="text-xs text-white/50">
                      {item.location?.latitude?.toFixed(2)}°, {item.location?.longitude?.toFixed(2)}°
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        item.modelResponse?.risk_level === 'High'
                          ? 'bg-accentRed/20 text-accentRed'
                          : item.modelResponse?.risk_level === 'Medium'
                          ? 'bg-accentOrange/20 text-accentOrange'
                          : 'bg-accentGreen/20 text-accentGreen'
                      }`}
                    >
                      {item.modelResponse?.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-medium">
                    {Math.round((item.modelResponse?.confidence || 0) * 100)}%
                  </td>
                  <td className="py-3 px-2">{item.modelRequest?.rainfall_1h_mm || 0} mm</td>
                  <td className="py-3 px-2 text-white/60 text-xs">{item.location?.region || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-2 text-white/60 text-center" colSpan={6}>
                  No predictions found for selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
