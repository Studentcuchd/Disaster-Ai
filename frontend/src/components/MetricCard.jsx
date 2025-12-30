const MetricCard = ({ label, value, sublabel, icon }) => {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">{label}</div>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {sublabel && <div className="text-sm text-white/60">{sublabel}</div>}
    </div>
  );
};

export default MetricCard;
