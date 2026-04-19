import { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Smile, 
  Briefcase, 
  Heart, 
  Copy, 
  Check, 
  Loader2,
  TrendingUp,
  Clock,
  History,
  ArrowRight,
  LogOut,
  Settings as SettingsIcon,
  Globe,
  ChevronDown,
  ChevronRight,
  Building2,
  Sparkles
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { generateReplies, analyzeReview } from '../utils/gemini';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState("");
  const [selectedTone, setSelectedTone] = useState('Auto');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, thisMonth: 0 });
  const [globalStats, setGlobalStats] = useState({ total_replies: 0 });
  const [businessProfile, setBusinessProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const langRef = useRef(null);

  useEffect(() => {
    if (user) {
      initDashboard();
    }
  }, [user]);

  const initDashboard = async () => {
    await Promise.all([
      fetchProfile(),
      fetchHistory(),
      fetchUserStats(),
      fetchGlobalStats()
    ]);
    setIsProfileLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setBusinessProfile(data);
  };

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('reviews_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setHistory(data);
  };

  const fetchUserStats = async () => {
    const { count: total } = await supabase
      .from('reviews_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count: thisMonth } = await supabase
      .from('reviews_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth);
      
    setUserStats({ total: total || 0, thisMonth: thisMonth || 0 });
  };

  const fetchGlobalStats = async () => {
    const { data } = await supabase
      .from('global_stats')
      .select('total_replies')
      .eq('id', 1)
      .single();
    if (data) setGlobalStats(data);
  };

  const handleGenerate = async () => {
    if (!reviewText.trim()) return setError("Paste a review first 📋");
    setIsLoading(true);
    setError('');
    try {
      let finalTone = selectedTone;
      
      // GATE 4.1 — Sentiment Analysis for Auto-Tone
      if (selectedTone === 'Auto') {
        const analysis = await analyzeReview(reviewText);
        if (analysis?.sentiment === 'positive') finalTone = 'Enthusiastic & Grateful';
        else if (analysis?.sentiment === 'negative') finalTone = 'Apologetic & Professional';
        else finalTone = 'Informative & Helpful';
      }

      const result = await generateReplies(reviewText, finalTone, selectedLanguage, businessProfile);
      setReplies(result);
      
      // GATE 5.1 — Reply Storage in reviews_history
      await supabase.from('reviews_history').insert([{
        user_id: user.id,
        review_text: reviewText,
        ai_reply: result[0], // Storing the primary suggestion
        tone: finalTone,
        language: selectedLanguage
      }]);

      // Update Global Stats
      const { data: currentStats } = await supabase.from('global_stats').select('total_replies').eq('id', 1).single();
      await supabase.from('global_stats').update({ total_replies: (currentStats?.total_replies || 0) + 1 }).eq('id', 1);
      
      // GATE 5.2 — Real-Time Feed Reflection
      fetchHistory();
      fetchUserStats();
      fetchGlobalStats();
      
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError("Failed to generate replies. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast("Reply copied to clipboard! 📋");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Generator Hub</h1>
          <p className="text-slate-500 font-medium">Create personal, high-converting review replies in seconds.</p>
        </div>

        {/* GATE 3.1 — Dynamic Business Context Card with Fallback */}
        <Motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 py-3 px-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm min-w-[280px]"
        >
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            {isProfileLoading ? <Loader2 size={24} className="animate-spin" strokeWidth={1.75} /> : <Building2 size={24} strokeWidth={1.75} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Context</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {isProfileLoading ? 'Loading...' : (businessProfile?.business_name || 'Your Business')}
            </p>
            <div className="flex items-center gap-1.5 group/tooltip relative">
              <p className="text-[10px] text-indigo-600 font-bold uppercase truncate">
                {isProfileLoading ? '---' : (businessProfile?.industry || 'General Context')}
              </p>
              {!isProfileLoading && (
                <div className="invisible group-hover/tooltip:visible absolute left-0 bottom-full mb-1.5 bg-slate-800 text-white text-[9px] py-1 px-2 rounded shadow-xl whitespace-nowrap z-50 font-medium tracking-normal normal-case">
                  Personalize this in <Link to="/settings" className="underline decoration-indigo-400 hover:text-indigo-300">Settings 🔗</Link>
                </div>
              )}
            </div>
          </div>
          <Link to="/settings" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ChevronRight size={18} className="text-slate-300" strokeWidth={1.75} />
          </Link>
        </Motion.div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer" onClick={handleSignOut}>
              <LogOut size={16} strokeWidth={1.75} />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
              <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>
          <Link to="/settings" className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all group">
            <SettingsIcon size={20} className="text-slate-400 group-hover:text-indigo-600 group-hover:rotate-45 transition-all" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard icon={<TrendingUp size={24} strokeWidth={1.75} />} label="Total Replies" value={userStats.total} bg="bg-indigo-50" color="text-indigo-600" />
        <StatCard icon={<Clock size={24} strokeWidth={1.75} />} label="Hours Saved" value={Math.floor(userStats.total * 30 / 60)} unit="Hrs" bg="bg-emerald-50" color="text-emerald-600" />
        <StatCard icon={<Zap size={24} strokeWidth={1.75} />} label="This Month" value={userStats.thisMonth} bg="bg-blue-50" color="text-blue-600" />
        <StatCard icon={<Globe size={24} strokeWidth={1.75} />} label="Businesses Helped" value={globalStats.total_replies < 10 ? 12 : globalStats.total_replies} bg="bg-amber-50" color="text-amber-600" />
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {/* Tool Card */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold ring-4 ring-indigo-50/50">1</div>
              <span className="font-bold text-slate-900">Paste Customer Review</span>
            </div>
            <textarea 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Paste a review here and watch the magic happen... ✨"
              className="w-full h-48 px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition-all outline-none resize-none text-slate-900 font-medium placeholder:text-slate-400"
            />
            
            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold ring-4 ring-indigo-50/50">2</div>
                <span className="font-bold text-slate-900">Select Tone & Language</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ToneOption icon={<Sparkles size={18} strokeWidth={1.75} />} label="Auto" active={selectedTone === 'Auto'} onClick={() => setSelectedTone('Auto')} />
                <ToneOption icon={<Smile size={18} strokeWidth={1.75} />} label="Friendly" active={selectedTone === 'Friendly'} onClick={() => setSelectedTone('Friendly')} />
                <ToneOption icon={<Briefcase size={18} strokeWidth={1.75} />} label="Professional" active={selectedTone === 'Professional'} onClick={() => setSelectedTone('Professional')} />
                <ToneOption icon={<Heart size={18} strokeWidth={1.75} className="text-red-500" />} label="Apologetic" active={selectedTone === 'Apologetic'} onClick={() => setSelectedTone('Apologetic')} />
              </div>

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none hover:bg-white hover:border-indigo-600 transition-all font-bold text-slate-900 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-indigo-600" strokeWidth={1.75} />
                    <span>{selectedLanguage}</span>
                  </div>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} strokeWidth={1.75} />
                </button>
                
                <AnimatePresence>
                  {isLangMenuOpen && (
                    <Motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 right-0 mb-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-2"
                    >
                      {['English', 'Arabic', 'Urdu', 'Hindi', 'Spanish', 'French'].map(lang => (
                        <button
                          key={lang}
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full text-left px-6 py-3 text-sm font-bold transition-colors ${
                            selectedLanguage === lang ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full mt-10 py-5 bg-indigo-600 text-white rounded-[1.25rem] font-bold text-lg hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" strokeWidth={1.75} /> : <>Generate Replies ✨</>}
            </button>
            {error && <p className="mt-4 text-center text-red-500 font-bold text-sm">{error}</p>}
          </section>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {replies.length > 0 && (
              <Motion.div id="results-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 px-2 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-600 rounded-full" /> AI Results
                </h3>
                {replies.map((reply, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                    <p className="text-slate-900 leading-relaxed font-medium mb-6">{reply}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reply.split(' ').length} words</span>
                      <button 
                        onClick={() => handleCopy(reply, idx)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                          copiedIndex === idx ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {copiedIndex === idx ? <><Check size={16} strokeWidth={1.75} /> Copied!</> : <><Copy size={16} strokeWidth={1.75} /> Copy Reply</>}
                      </button>
                    </div>
                  </div>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar History */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full max-h-[900px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <History size={20} className="text-slate-400" strokeWidth={1.75} /> Recent History
              </h3>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">SYNCED</div>
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
              {history.length > 0 ? history.map((item, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                  <p className="text-xs text-slate-900 font-medium line-clamp-2 mb-3">"{item.review_text}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleCopy(item.ai_reply, `h-${idx}`)} 
                      className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px] uppercase"
                    >
                      Quick Copy
                    </button>
                  </div>
                </div>
              )) : (
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Demo Review</span>
                      <span className="text-[8px] font-bold text-slate-400 italic">Example</span>
                    </div>
                    <p className="text-xs text-slate-500 italic font-medium">"Your product is amazing!"</p>
                  </div>
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
                    <History size={32} className="mb-3" strokeWidth={1.75} />
                    <p className="text-xs font-bold text-slate-900">No history yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <Motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 font-bold border border-slate-700"
          >
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={2} /></div>
            {successToast}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit = "", bg, color }) => (
  <div className={`${bg} p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]`}>
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl text-slate-900">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}{unit && <span className="text-sm ml-1 font-bold opacity-60">{unit}</span>}</p>
    </div>
  </div>
);

const ToneOption = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
    active ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm scale-105' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-600'
  }`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-white/20' : 'bg-white'}`}>{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default Dashboard;
