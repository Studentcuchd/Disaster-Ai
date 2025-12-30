import dayjs from 'dayjs';

const pillClass = {
  High: 'bg-accentRed/20 text-accentRed',
  Medium: 'bg-accentOrange/20 text-accentOrange',
  Low: 'bg-accentGreen/20 text-accentGreen',
};

const AlertsPanel = ({ alerts = [] }) => {
  const latest = alerts.slice(0, 5);
  return (
    <div className="card p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold">Live Alerts</p>
        <span className="text-xs text-white/60">Real-time updates</span>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {latest.map((alert) => (
          <div key={alert._id || alert.id} className="flex items-start justify-between gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-3 transition-colors border border-white/5">
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">{alert.message}</p>
              <p className="text-xs text-white/60 mt-1">
                {alert.location?.name || 'Location'} · {dayjs(alert.createdAt).format('HH:mm, DD MMM')}
              </p>
            </div>
            <span className={`badge text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap ${pillClass[alert.riskLevel] || 'bg-white/10 text-white/70'}`}>
              {alert.riskLevel}
            </span>
          </div>
        ))}
        {latest.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-white/60">✓ No alerts yet</p>
            <p className="text-xs text-white/40 mt-1">System is monitoring all regions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
