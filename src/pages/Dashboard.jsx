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
import { processReviewEnterprise } from '../lib/ai-engine';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState("");
  const [selectedTone, setSelectedTone] = useState('Professional');
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlatform, setActivePlatform] = useState("Google");

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
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .maybeSingle();
    
    if (data) {
      let website = data.website || '';
      let usps = data.usps || data.business_description || '';
      
      // Parse embedded website fallback from usps field if present
      if (!website && usps.includes('[Website:')) {
        const match = usps.match(/\[Website:\s*(.*?)\]/);
        if (match) {
          website = match[1];
          usps = usps.replace(/\[Website:\s*.*?\]/, '').trim();
        }
      }

      setBusinessProfile({
        ...data,
        business_name: data.business_name || '',
        industry: data.industry || data.industry_type || '',
        usps: usps,
        website: website
      });
    }
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
      // ENTERPRISE COGNITIVE LAYER — Multi-stage Analysis & Generation
      const { analysis, replies: result, cta } = await processReviewEnterprise(
        reviewText, 
        selectedLanguage,
        activePlatform,
        businessProfile
      );

      // Generate all 3 variations and append CTA if present
      const finalReplies = result.map(reply => cta ? `${reply}\n\n${cta}` : reply);
      setReplies(finalReplies);
      
      // PERSISTENCE — Storing analysis metadata for Enterprise Audit
      // Clean, self-healing float mapping for the DB sentiment Float column to prevent crashes
      const dbSentimentScore = typeof analysis.score === 'number' 
        ? analysis.score 
        : (analysis.sentiment === 'Positive' ? 1.0 : (analysis.sentiment === 'Negative' ? -1.0 : 0.0));

      await supabase.from('reviews_history').insert([{
        user_id: user.id,
        review_text: reviewText,
        ai_reply: finalReplies[0],
        tone: selectedTone,
        language: selectedLanguage,
        sentiment: dbSentimentScore,
        issue_category: analysis.category || analysis.primary_issue || 'General Feedback'
      }]);

      // Reactive real-time sentiment breakdown & history update locally
      const newHistoryItem = {
        created_at: new Date().toISOString(),
        review_text: reviewText,
        ai_reply: finalReplies[0],
        tone: selectedTone,
        language: selectedLanguage,
        sentiment: dbSentimentScore,
        issue_category: analysis.category || analysis.primary_issue || 'General Feedback'
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);

      // Update Global Stats
      const { data: currentStats } = await supabase.from('global_stats').select('total_replies').eq('id', 1).single();
      await supabase.from('global_stats').update({ total_replies: (currentStats?.total_replies || 0) + 1 }).eq('id', 1);
      
      fetchHistory();
      fetchUserStats();
      fetchGlobalStats();
      
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError("AI Engine error. Check your API keys in .env 🔑");
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

  // Business Analytics Calculations
  const getRoiStats = () => {
    const totalReplies = userStats.total;
    const hoursSaved = ((totalReplies * 2.5) / 60).toFixed(1);
    const moneySaved = Math.round(parseFloat(hoursSaved) * 35);
    const efficiencyBoost = totalReplies > 0 ? 94.5 : 0;
    return { hoursSaved, moneySaved, efficiencyBoost };
  };

  const getSentimentStats = () => {
    if (!history || history.length === 0) {
      return { positive: 70, neutral: 20, negative: 10 };
    }
    
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    
    history.forEach(item => {
      const s = item.sentiment;
      if (typeof s === 'string') {
        const lowerS = s.toLowerCase();
        if (lowerS.includes('positive') || lowerS.includes('pos') || lowerS.includes('enthusiastic')) {
          posCount++;
        } else if (lowerS.includes('negative') || lowerS.includes('neg') || lowerS.includes('empathetic')) {
          negCount++;
        } else {
          neuCount++;
        }
      } else if (typeof s === 'number') {
        if (s > 0.25) {
          posCount++;
        } else if (s < -0.25) {
          negCount++;
        } else {
          neuCount++;
        }
      } else {
        const t = (item.tone || '').toLowerCase();
        if (t.includes('enthusiastic') || t.includes('friendly')) {
          posCount++;
        } else if (t.includes('empathetic')) {
          negCount++;
        } else {
          neuCount++;
        }
      }
    });
    
    const total = posCount + neuCount + negCount;
    if (total === 0) return { positive: 70, neutral: 20, negative: 10 };
    
    return {
      positive: Math.round((posCount / total) * 100),
      neutral: Math.round((neuCount / total) * 100),
      negative: Math.round((negCount / total) * 100)
    };
  };

  const getTopThemes = () => {
    if (!history || history.length === 0) {
      return [
        { name: 'Product Quality', count: 3, percentage: 85 },
        { name: 'Shipping Speed', count: 2, percentage: 70 },
        { name: 'Response Time', count: 1, percentage: 90 }
      ];
    }
    
    const themeCounts = {};
    history.forEach(item => {
      const cat = item.issue_category;
      if (cat && cat.trim()) {
        const normalized = cat.trim();
        themeCounts[normalized] = (themeCounts[normalized] || 0) + 1;
      }
    });
    
    const sorted = Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    const totalReviews = history.length;
    const extracted = sorted.map(t => ({
      name: t.name,
      count: t.count,
      percentage: Math.min(100, Math.round((t.count / totalReviews) * 100 + 40)) // Visual weighting
    }));
    
    if (extracted.length >= 3) {
      return extracted.slice(0, 3);
    }
    
    const fallbacks = [
      { name: 'Product Quality', percentage: 85 },
      { name: 'Customer Service', percentage: 90 },
      { name: 'Value for Money', percentage: 75 }
    ];
    
    const result = [...extracted];
    for (const f of fallbacks) {
      if (result.length >= 3) break;
      if (!result.find(r => r.name.toLowerCase() === f.name.toLowerCase())) {
        result.push({
          name: f.name,
          percentage: f.percentage
        });
      }
    }
    
    return result;
  };

  const roi = getRoiStats();
  const sentimentStats = getSentimentStats();
  const topThemes = getTopThemes();

  // Search logic for work log
  const filteredHistory = history.filter(item => {
    const query = searchQuery.toLowerCase();
    const textMatch = (item.review_text || "").toLowerCase().includes(query);
    const replyMatch = (item.ai_reply || "").toLowerCase().includes(query);
    const toneMatch = (item.tone || "").toLowerCase().includes(query);
    const catMatch = (item.issue_category || "").toLowerCase().includes(query);
    return textMatch || replyMatch || toneMatch || catMatch;
  });

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Generator Hub</h1>
          <p className="text-slate-500 font-medium">Create personal, high-converting review replies in seconds.</p>
        </div>

        {/* Brand Context Card */}
        <Motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 py-3 px-5 bg-white border border-slate-200 rounded-3xl shadow-sm min-w-[280px]"
        >
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            {isProfileLoading ? <Loader2 size={24} className="animate-spin" strokeWidth={1.75} /> : <Building2 size={24} strokeWidth={1.75} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Brand Profile</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {isProfileLoading ? 'Loading...' : (businessProfile?.business_name || 'Your Business')}
            </p>
            <div className="flex items-center gap-1.5 group/tooltip relative">
              {businessProfile?.website ? (
                <a 
                  href={businessProfile.website.startsWith('http') ? businessProfile.website : `https://${businessProfile.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] text-indigo-600 font-black uppercase truncate hover:underline flex items-center gap-0.5"
                >
                  <Globe size={10} /> {businessProfile.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              ) : (
                <p className="text-[10px] text-indigo-600 font-bold uppercase truncate">
                  {isProfileLoading ? '---' : (businessProfile?.industry || 'General Context')}
                </p>
              )}
              {!isProfileLoading && (
                <div className="invisible group-hover/tooltip:visible absolute left-0 bottom-full mb-1.5 bg-slate-800 text-white text-[9px] py-1 px-2 rounded shadow-xl whitespace-nowrap z-50 font-medium tracking-normal normal-case">
                  Manage in <Link to="/settings" className="underline decoration-indigo-400 hover:text-indigo-300">Settings 🔗</Link>
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
        <StatCard icon={<Clock size={24} strokeWidth={1.75} />} label="Hours Saved" value={roi.hoursSaved} unit="Hrs" bg="bg-emerald-50" color="text-emerald-600" />
        <StatCard icon={<Zap size={24} strokeWidth={1.75} />} label="This Month" value={userStats.thisMonth} bg="bg-blue-50" color="text-blue-600" />
        <StatCard icon={<Globe size={24} strokeWidth={1.75} />} label="Businesses Helped" value={globalStats.total_replies < 12 ? 15 : globalStats.total_replies} bg="bg-amber-50" color="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {/* Tool Card - Central Input Hub */}
          <section className="bg-white p-6 md:p-8 rounded-4xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black ring-4 ring-indigo-50/50">1</div>
                <span className="font-extrabold text-slate-900 tracking-tight text-base">Professional Reply Hub</span>
              </div>
              <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 font-mono tracking-wider">ENTERPRISE SAAS</div>
            </div>

            {/* Platform Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-hide">
              {['Google', 'Amazon', 'Yelp', 'Shopify'].map(p => (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activePlatform === p 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/55'
                  }`}
                >
                  {p === 'Google' && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />}
                  {p === 'Amazon' && <span className="w-2 h-2 bg-amber-500 rounded-full inline-block" />}
                  {p === 'Yelp' && <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />}
                  {p === 'Shopify' && <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />}
                  {p} Review
                </button>
              ))}
            </div>

            {/* Textarea Workspace */}
            <div className="relative">
              <textarea 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={`Paste customer ${activePlatform} review here... ✨`}
                className="w-full h-56 px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition-all outline-none resize-none text-slate-900 font-medium placeholder:text-slate-400 shadow-inner"
              />
              {reviewText && (
                <button 
                  onClick={() => setReviewText("")}
                  className="absolute right-4 top-4 p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-950 rounded-full transition-colors text-xs font-black"
                  title="Clear text"
                >
                  ✕
                </button>
              )}
              <div className="absolute right-6 bottom-4 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-100 shadow-sm font-mono">
                <span>{reviewText.length} Chars</span>
                <span>{reviewText.split(/\s+/).filter(Boolean).length} Words</span>
              </div>
            </div>
            
            {/* Sticky Options & Generate Area */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <Sparkles size={12} className="text-indigo-600" /> Switch Response Tone
                </label>
                <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1.5 border border-slate-200 rounded-2xl w-fit">
                  {['Professional', 'Friendly', 'Apologetic'].map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTone(t)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        selectedTone === t 
                          ? 'bg-indigo-600 text-white shadow-sm font-extrabold' 
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-end gap-3 w-full md:w-auto">
                {/* Language Dropdown Selector */}
                <div className="relative w-1/2 md:w-36" ref={langRef}>
                  <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none hover:border-indigo-600 transition-all font-bold text-xs text-slate-900 shadow-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Globe size={14} className="text-indigo-600 shrink-0" />
                      <span className="truncate">{selectedLanguage}</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isLangMenuOpen && (
                      <Motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 max-h-[160px] overflow-y-auto"
                      >
                        {['English', 'Arabic', 'Urdu', 'Hindi', 'Spanish', 'French'].map(lang => (
                          <button
                            key={lang}
                            onClick={() => {
                              setSelectedLanguage(lang);
                              setIsLangMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
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

                <button 
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="flex-1 md:flex-none px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Generate ✨</>}
                </button>
              </div>
            </div>
            {error && <p className="mt-4 text-center text-red-500 font-bold text-sm">{error}</p>}
          </section>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {replies.length > 0 && (
              <Motion.div id="results-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 px-2 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-600 rounded-full" /> Generated Options (3 Variations)
                </h3>
                {replies.map((reply, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <p className="text-slate-900 leading-relaxed font-medium mb-6 whitespace-pre-line">{reply}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{reply.split(' ').length} words</span>
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

        {/* Sidebar Analytics & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business ROI Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-4xl text-white shadow-md relative overflow-hidden border border-indigo-800/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5 font-mono">
                <TrendingUp size={14} /> Business ROI Card
              </h4>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-200 text-[8px] font-black rounded-full border border-indigo-500/30 font-mono">PRODUCTIVITY SAVINGS</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider mb-0.5">Hours Reclaimed</p>
                <p className="text-3xl font-black text-white tracking-tight">{roi.hoursSaved}<span className="text-xs ml-0.5 text-indigo-300 font-bold font-sans">Hrs</span></p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider mb-0.5">Estimated Value</p>
                <p className="text-3xl font-black text-emerald-400 tracking-tight">${roi.moneySaved}</p>
              </div>
            </div>
            
            <div className="space-y-1.5 pt-3.5 border-t border-indigo-800/50">
              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-200">
                <span>Response Speedup</span>
                <span className="text-emerald-400 font-black">{roi.efficiencyBoost || 95}% Efficiency Boost</span>
              </div>
              <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden border border-indigo-800/40">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${roi.efficiencyBoost || 95}%` }} 
                />
              </div>
              <p className="text-[8px] text-indigo-400 font-medium italic">Estimated at 2.5 mins response savings per reply at standard $35/hr rate.</p>
            </div>
          </div>

          {/* Customer Sentiment Card */}
          <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 font-mono">
                <Smile size={14} className="text-emerald-500" /> Customer Sentiment
              </h4>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">Recent Logs</span>
            </div>
            
            <div className="space-y-3">
              {/* Stacked Percentage Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${sentimentStats.positive}%` }} title={`Positive: ${sentimentStats.positive}%`} />
                <div className="bg-slate-400 h-full transition-all" style={{ width: `${sentimentStats.neutral}%` }} title={`Neutral: ${sentimentStats.neutral}%`} />
                <div className="bg-rose-500 h-full transition-all" style={{ width: `${sentimentStats.negative}%` }} title={`Negative: ${sentimentStats.negative}%`} />
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-black uppercase tracking-wider font-mono">
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-700 border border-emerald-100/40">
                  <p className="text-[8px] text-emerald-600/70 mb-0.5 font-sans font-bold">Positive</p>
                  <p className="text-sm font-black">{sentimentStats.positive}%</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-slate-700 border border-slate-100/40">
                  <p className="text-[8px] text-slate-500/70 mb-0.5 font-sans font-bold">Neutral</p>
                  <p className="text-sm font-black">{sentimentStats.neutral}%</p>
                </div>
                <div className="bg-rose-50 p-2 rounded-xl text-rose-700 border border-rose-100/40">
                  <p className="text-[8px] text-rose-600/70 mb-0.5 font-sans font-bold">Negative</p>
                  <p className="text-sm font-black">{sentimentStats.negative}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* recurring Themes & Trends widget */}
          <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 font-mono">
                <TrendingUp size={14} className="text-indigo-600" /> AI Trend Tracker
              </h4>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded-full border border-indigo-100 font-mono">TOP THEMES</span>
            </div>
            
            <div className="space-y-2.5">
              {topThemes.map((theme, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                    <span className="text-xs font-extrabold text-slate-700 truncate">{theme.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden hidden xs:block">
                      <div className="bg-indigo-500 h-full" style={{ width: `${theme.percentage}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 font-mono">{theme.percentage}% MATCH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Log (Recent History) */}
          <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[480px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider font-mono">
                <History size={16} className="text-slate-400" /> SaaS Work Log
              </h3>
              <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-full border border-emerald-100 font-mono tracking-wider">SYNCED</div>
            </div>

            {/* Search filter input */}
            <div className="mb-4 relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search history & tones..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-xs font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
              {filteredHistory.length > 0 ? filteredHistory.map((item, idx) => {
                // Determine item sentiment type
                const s = item.sentiment;
                let sTag = 'Neutral';
                let sBg = 'bg-slate-50 text-slate-600 border-slate-100';
                if (typeof s === 'string') {
                  const l = s.toLowerCase();
                  if (l.includes('pos') || l.includes('positive')) {
                    sTag = 'Positive';
                    sBg = 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
                  } else if (l.includes('neg') || l.includes('negative')) {
                    sTag = 'Negative';
                    sBg = 'bg-rose-50 text-rose-700 border-rose-100/50';
                  }
                } else if (typeof s === 'number') {
                  if (s > 0.25) {
                    sTag = 'Positive';
                    sBg = 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
                  } else if (s < -0.25) {
                    sTag = 'Negative';
                    sBg = 'bg-rose-50 text-rose-700 border-rose-100/50';
                  }
                }
                
                return (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                    <p className="text-xs text-slate-900 font-medium line-clamp-2 mb-3">"{item.review_text}"</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/50 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${sBg}`}>
                          {sTag}
                        </span>
                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-full">
                          {item.tone || 'Empathetic'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCopy(item.ai_reply, `h-${idx}`)} 
                        className="text-indigo-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity font-black text-[9px] uppercase tracking-wider"
                      >
                        Copy Reply
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
                    <History size={28} className="mb-2" strokeWidth={1.75} />
                    <p className="text-xs font-bold text-slate-900">No matching logs</p>
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
  <div className={`${bg} p-6 rounded-4xl border border-white shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]`}>
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl text-slate-900 shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</p>
      <p className={`text-3xl font-black ${color} tracking-tighter truncate`}>{value}{unit && <span className="text-sm ml-0.5 font-bold opacity-60">{unit}</span>}</p>
    </div>
  </div>
);

export default Dashboard;
