import { useState } from 'react';
import { Search, Shield, Target, AlertTriangle, BarChart3, Loader2 } from 'lucide-react';
import { analyzeCompetitor } from '../lib/competitor-engine';
import { motion as Motion } from 'framer-motion';

const CompetitorInsight = () => {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const result = await analyzeCompetitor(url);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Competitor Intelligence</h1>
        <p className="text-slate-500 font-medium">Extract SWOT analysis and sentiment trends from any competitor profile.</p>
      </header>

      <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Google Maps or Yelp URL..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium"
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={isLoading}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-slate-200"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Run Intelligence Engine"}
          </button>
        </div>
      </div>

      {data && (
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* SWOT Card */}
          <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="text-indigo-600" /> SWOT Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <SwotBox title="Strengths" items={data.swot.strengths} icon={<Shield className="text-emerald-500" />} bg="bg-emerald-50" />
              <SwotBox title="Weaknesses" items={data.swot.weaknesses} icon={<AlertTriangle className="text-amber-500" />} bg="bg-amber-50" />
              <SwotBox title="Opportunities" items={data.swot.opportunities} icon={<Target className="text-blue-500" />} bg="bg-blue-50" />
              <SwotBox title="Threats" items={data.swot.threats} icon={<AlertTriangle className="text-red-500" />} bg="bg-red-50" />
            </div>
          </div>

          {/* Sentiment Stats */}
          <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold">Sentiment Comparison</h3>
            <div className="space-y-6">
              <SentimentBar label="Positive" value={data.sentimentStats.positive} color="bg-emerald-500" />
              <SentimentBar label="Neutral" value={data.sentimentStats.neutral} color="bg-slate-400" />
              <SentimentBar label="Negative" value={data.sentimentStats.negative} color="bg-red-500" />
            </div>
          </div>
        </Motion.div>
      )}
    </div>
  );
};

const SwotBox = ({ title, items, icon, bg }) => (
  <div className={`${bg} p-5 rounded-2xl border border-white shadow-sm`}>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="font-bold text-sm uppercase tracking-wider">{title}</span>
    </div>
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-xs font-medium text-slate-700">• {item}</li>
      ))}
    </ul>
  </div>
);

const SentimentBar = ({ label, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm font-bold">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
      <Motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

export default CompetitorInsight;
