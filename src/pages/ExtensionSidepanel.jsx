import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  ArrowDownToLine,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processReviewEnterprise } from '../lib/ai-engine';

const ExtensionSidepanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedReply, setGeneratedReply] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  useEffect(() => {
    const handleStorageChange = (changes) => {
      if (changes.currentReview) {
        processNewReview(changes.currentReview.newValue);
      }
    };

    chrome.storage.local.get(['currentReview'], (result) => {
      if (result.currentReview) {
        processNewReview(result.currentReview);
      }
    });

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const processNewReview = async (review) => {
    if (!review || review.status === 'processed') {
      if (review) {
        // Just load existing data if already processed
        setData(review);
        // We might need to fetch from history if it's not in the object
      }
      return;
    }
    
    setData(review);
    setLoading(true);
    setError(null);
    setGeneratedReply("");
    
    try {
      const result = await processReviewEnterprise(
        review.text,
        "English",
        review.platform
      );

      setGeneratedReply(result.replies[0] + (result.cta ? `\n\n${result.cta}` : ""));
      setAnalysis(result.analysis);
      
      chrome.storage.local.set({ 
        currentReview: { ...review, status: 'processed', analysis: result.analysis, reply: result.replies[0] } 
      });
    } catch (err) {
      console.error(err);
      setError("AI Engine Error. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    chrome.runtime.sendMessage({
      type: 'INSERT_REPLY',
      payload: { text: generatedReply }
    }, (response) => {
      if (response?.status === 'success') {
        setInserted(true);
        setTimeout(() => setInserted(false), 2000);
      } else {
        setError("Could not find reply box on the page. Try copying manually.");
      }
    });
  };

  const getSentimentConfig = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return { icon: <ThumbsUp size={14} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Positive' };
      case 'Negative': return { icon: <ThumbsDown size={14} />, color: 'bg-rose-50 text-rose-700 border-rose-100', label: 'Negative' };
      default: return { icon: <Minus size={14} />, color: 'bg-slate-50 text-slate-700 border-slate-100', label: 'Neutral' };
    }
  };

  if (!data && !loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6"
        >
          <MessageSquare size={32} strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to Reply</h2>
        <p className="text-slate-500 text-sm">Click the AI button on any review to generate a response instantly.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F9FAFB] font-sans selection:bg-indigo-100">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 bg-linear-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"
          >
            <Sparkles size={20} fill="currentColor" />
          </motion.div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">ReviewReply AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Engine</p>
            </div>
          </div>
        </div>
        {loading && <Loader2 size={18} className="animate-spin text-indigo-600" />}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Source Review */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Detected Review</h3>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <ExternalLink size={8} /> {data?.platform}
            </span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 italic leading-relaxed shadow-sm">
            "{data?.text}"
          </div>
        </section>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              <div className="relative">
                <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" strokeWidth={1.5} />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-20"
                />
              </div>
              <p className="text-slate-900 font-bold">Generating Brilliance...</p>
              <p className="text-slate-500 text-xs mt-1 italic">Our AI is crafting the perfect response</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-rose-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-900">Engine Stall</p>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
            </motion.div>
          ) : analysis && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Analysis Grid */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div 
                  whileHover={{ y: -2 }}
                  className={`p-3 rounded-2xl border ${getSentimentConfig(analysis.sentiment).color} flex flex-col gap-1 shadow-sm`}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Sentiment</span>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {getSentimentConfig(analysis.sentiment).icon}
                    {getSentimentConfig(analysis.sentiment).label}
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col gap-1 shadow-sm"
                >
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence</span>
                  <div className="font-bold text-sm text-slate-900">{Math.round(analysis.score * 100)}%</div>
                </motion.div>
              </div>

              {/* Primary Issue */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Primary Issue</span>
                <p className="text-sm font-bold text-slate-900">{analysis.category || 'General Feedback'}</p>
              </div>

              {/* Generated Reply */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">AI Generated Reply</h3>
                  <button 
                    onClick={() => processNewReview(data)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
                  >
                    <RefreshCw size={10} /> Regenerate
                  </button>
                </div>
                <div className="relative group">
                  <textarea 
                    value={generatedReply}
                    onChange={(e) => setGeneratedReply(e.target.value)}
                    className="w-full h-64 p-5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 leading-relaxed focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none resize-none shadow-sm font-medium"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300 pointer-events-none group-focus-within:opacity-0 transition-opacity">
                    EDITABLE
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!loading && !error && generatedReply && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 bg-white border-t border-slate-100 space-y-3 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]"
        >
          <div className="grid grid-cols-5 gap-3">
            <button 
              onClick={handleInsert}
              className={`col-span-3 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                inserted 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {inserted ? <><Check size={18} /> Inserted!</> : <><ArrowDownToLine size={18} /> Insert to Site</>}
            </button>
            <button 
              onClick={handleCopy}
              className={`col-span-2 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                copied 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">Enterprise Cognitive Layer Active</p>
        </motion.div>
      )}
    </div>
  );
};

export default ExtensionSidepanel;

