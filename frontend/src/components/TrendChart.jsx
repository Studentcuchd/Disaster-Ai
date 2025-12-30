const normalize = (arr) => {
  const max = Math.max(...arr, 1);
  const min = Math.min(...arr, 0);
  return arr.map((v) => ((v - min) / (max - min || 1)) * 100);
};

const TrendChart = ({ data = [] }) => {
  if (!data.length) return <p className="text-sm text-white/60">No history yet.</p>;
  const points = normalize(data.map((d) => d.modelResponse?.confidence ?? 0));
  const path = points
    .map((y, idx) => {
      const x = (idx / Math.max(points.length - 1, 1)) * 100;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${100 - y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-40">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#grad)" strokeWidth="2" />
    </svg>
  );
};

export default TrendChart;
