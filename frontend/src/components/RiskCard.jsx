const badgeClass = {
  Low: 'bg-accentGreen/15 text-accentGreen',
  Medium: 'bg-accentOrange/20 text-accentOrange',
  High: 'bg-accentRed/20 text-accentRed',
  'N/A': 'bg-white/10 text-white/80',
};

const RiskCard = ({ title, value, subtitle, riskLevel, icon }) => {
  // Handle null or undefined values - show as N/A
  const displayValue = value === null || value === undefined ? 'N/A' : value;
  const displayRiskLevel = value === null || value === undefined ? 'N/A' : riskLevel;
  
  return (
    <div className="card p-5 flex flex-col gap-4 min-h-[150px] hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">{title}</div>
        <div className={`badge ${badgeClass[displayRiskLevel] || 'bg-white/10 text-white/80'}`}>{displayRiskLevel}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold">{displayValue}</div>
          <div className="text-sm text-white/60">{subtitle}</div>
        </div>
        {icon && <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">{icon}</div>}
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${displayRiskLevel === 'High' ? 'bg-accentRed' : displayRiskLevel === 'Medium' ? 'bg-accentOrange' : 'bg-accentGreen'}`}
          style={{ 
            width: typeof displayValue === 'number' ? `${Math.min(100, displayValue)}%` : '0%'
          }}
        />
      </div>
    </div>
  );
};

export default RiskCard;
