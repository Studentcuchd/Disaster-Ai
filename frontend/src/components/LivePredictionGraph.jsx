import { useEffect, useState } from 'react';

const LivePredictionGraph = ({ prediction }) => {
  const [animatedValues, setAnimatedValues] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  useEffect(() => {
    if (!prediction?.modelResponse?.probabilities) return;

    const { Low = 0, Medium = 0, High = 0 } = prediction.modelResponse.probabilities;
    const interval = setInterval(() => {
      setAnimatedValues((prev) => ({
        low: prev.low < Low * 100 ? prev.low + (Low * 100 - prev.low) * 0.1 : prev.low,
        medium: prev.medium < Medium * 100 ? prev.medium + (Medium * 100 - prev.medium) * 0.1 : prev.medium,
        high: prev.high < High * 100 ? prev.high + (High * 100 - prev.high) * 0.1 : prev.high,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [prediction?.modelResponse?.probabilities]);

  const probabilities = prediction?.modelResponse?.probabilities || { Low: 0, Medium: 0, High: 0 };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Live Prediction Distribution</p>
        <p className="text-xs text-white/60">Risk Probabilities</p>
      </div>

      <div className="space-y-4">
        {/* High Risk */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accentRed" />
              High Risk
            </label>
            <span className="text-lg font-bold text-accentRed">
              {Math.round(animatedValues.high)}%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accentRed to-accentOrange transition-all duration-300"
              style={{ width: `${animatedValues.high}%` }}
            />
          </div>
        </div>

        {/* Medium Risk */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accentOrange" />
              Medium Risk
            </label>
            <span className="text-lg font-bold text-accentOrange">
              {Math.round(animatedValues.medium)}%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accentOrange to-yellow-400 transition-all duration-300"
              style={{ width: `${animatedValues.medium}%` }}
            />
          </div>
        </div>

        {/* Low Risk */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accentGreen" />
              Low Risk
            </label>
            <span className="text-lg font-bold text-accentGreen">
              {Math.round(animatedValues.low)}%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accentGreen to-emerald-400 transition-all duration-300"
              style={{ width: `${animatedValues.low}%` }}
            />
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent" />
            Model Confidence
          </label>
          <span className="text-lg font-bold text-accent">
            {Math.round((prediction?.modelResponse?.confidence || 0) * 100)}%
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accentBlue transition-all duration-300"
            style={{ width: `${(prediction?.modelResponse?.confidence || 0) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LivePredictionGraph;
