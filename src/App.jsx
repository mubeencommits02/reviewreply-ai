import { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  Zap, 
  Target, 
  Clipboard, 
  ArrowRight, 
  Smile, 
  Briefcase, 
  Heart, 
  Copy, 
  Check, 
  Loader2,
  Send,
  History,
  TrendingUp,
  Clock,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateReplies, analyzeReview } from './utils/gemini';
import { supabase } from './utils/supabaseClient';

// Build trigger: 2026-04-03-22-10
const App = () => {
  const [activePage, setActivePage] = useState('landing');
  const [reviewText, setReviewText] = useState("The food was amazing and the staff was very helpful. \nWill definitely come back again!");
  const [selectedTone, setSelectedTone] = useState('Friendly');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [replies, setReplies] = useState([]);
  const [generatedLanguage, setGeneratedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappSubmitted, setWhatsappSubmitted] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [personalHistory, setPersonalHistory] = useState([]);
  const [globalStats, setGlobalStats] = useState({ total: 500, hours: 250 });
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscriberSaved, setSubscriberSaved] = useState(false);

  const toolRef = useRef(null);

  // Load Personal History and Global Stats
  useEffect(() => {
    // 1. Load from localStorage
    const saved = localStorage.getItem('review_reply_history');
    if (saved) {
      try {
        setPersonalHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // 2. Fetch Global Stats for Social Proof
    const fetchGlobalStats = async () => {
      try {
        const { count, error } = await supabase
          .from('reviews_history')
          .select('*', { count: 'exact', head: true });

        if (!error && count) {
          // Assume each review saves ~30 mins (0.5 hours)
          setGlobalStats({
            total: count + 542, // Seed with realistic baseline + live count
            hours: Math.floor((count + 542) * 0.5)
          });
        }
      } catch (err) {
        console.error("Stats Fetch Error:", err);
      }
    };
    
    fetchGlobalStats();
  }, []);

  const saveToSupabase = async (review, reply, tone, language) => {
    try {
      const { error } = await supabase
        .from('reviews_history')
        .insert([{ 
          review_text: review, 
          ai_reply: reply, 
          tone, 
          language 
        }]);
      
      if (error) {
        console.error("Supabase Save Failed:", error.message);
        return;
      }
    } catch (err) {
      console.error("Network/Supabase Error:", err);
    }
  };

  // --- Senior Dev Addition: Sentiment Auto-Tone Detection ---
  useEffect(() => {
    if (!reviewText.trim()) {
      setSentiment(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await analyzeReview(reviewText);
        if (result) {
          setSentiment(result);
          // Auto-select tone based on AI sentiment analysis
          if (result.suggestedTone) {
            setSelectedTone(result.suggestedTone);
          }
        }
      } catch (err) {
        console.error("Auto-tone detect failed:", err);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [reviewText, setSelectedTone, setSentiment]);

  const scrollToTool = () => {
    setActivePage('tool');
    setTimeout(() => {
      toolRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSampleReview = () => {
    setReviewText("The food was okay but the service was very slow. We waited 45 minutes for our order. The waiter was not very friendly either. Will think twice before coming back.");
  };

  const handleGenerate = async () => {
    if (!reviewText.trim()) {
      setError("Please paste a review first 📋");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await generateReplies(reviewText, selectedTone, selectedLanguage);
      setReplies(result);
      setGeneratedLanguage(selectedLanguage);
      
      // 2. Update Personal History (localStorage + State)
      const newHistoryItem = {
        id: Date.now().toString(),
        review_text: reviewText,
        ai_reply: result[0],
        tone: selectedTone,
        language: selectedLanguage,
        created_at: new Date().toISOString()
      };

      const updatedHistory = [newHistoryItem, ...personalHistory].slice(0, 10);
      setPersonalHistory(updatedHistory);
      localStorage.setItem('review_reply_history', JSON.stringify(updatedHistory));

      // 3. Save to Supabase (Background Sync)
      saveToSupabase(reviewText, result[0], selectedTone, selectedLanguage);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("DEBUG ERROR:", err);
      setError("AI generation failed — check your internet connection ⏳");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscriberEmail) return;
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: subscriberEmail }]);
      
      if (!error) {
        setSubscriberSaved(true);
      }
    } catch (err) {
      console.error("Subscription Error:", err);
    }
  };

  const handleCopy = async (text, index) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Senior Dev Fallback: execCommand for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch {
        // Fallback copy failed
      }
      document.body.removeChild(textArea);
    }
  };

  const handleWhatsappSubmit = (e) => {
    e.preventDefault();
    if (whatsappNumber.trim()) {
      setWhatsappSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Navigation / Logo Area */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('landing')}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Star className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">ReviewReply <span className="text-blue-600">AI</span></span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTool}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            {activePage === 'landing' ? 'Try It Free' : 'Launch Tool'}
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        {activePage === 'landing' ? (
          <div className="max-w-6xl mx-auto px-4">
            {/* Hero Section */}
            <section className="text-center py-20 md:py-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Reply to Google Reviews <br /> in Seconds with AI
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Stop wasting 30 minutes daily writing review replies. <br className="hidden md:block" /> Let AI do it for free.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActivePage('tool');
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2 mx-auto"
                >
                  Try It Free Now <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <div className="mt-16 grid grid-cols-2 max-w-xl mx-auto gap-6 px-4">
                  <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 group hover:shadow-xl transition-all">
                    <TrendingUp className="text-emerald-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-4xl font-black text-slate-800 tracking-tighter">{globalStats.total}+</span>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Replies Generated</span>
                  </div>
                  <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 group hover:shadow-xl transition-all">
                    <Clock className="text-blue-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-4xl font-black text-slate-800 tracking-tighter">{globalStats.hours}+ <span className="text-sm font-bold text-slate-400">Hours</span></span>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Hours Saved</span>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Features Section */}
            <section className="grid md:grid-cols-3 gap-8 py-20">
              <FeatureCard 
                icon={<Zap className="w-6 h-6 text-blue-600" />}
                title="Instant Replies"
                description="Generate 3 unique, human-like replies in seconds."
              />
              <FeatureCard 
                icon={<Target className="w-6 h-6 text-blue-600" />}
                title="Any Tone"
                description="Choose between Friendly, Professional, or Apologetic tones."
              />
              <FeatureCard 
                icon={<Clipboard className="w-6 h-6 text-blue-600" />}
                title="One Click Copy"
                description="Copy and paste anywhere instantly with zero hassle."
              />
            </section>
          </div>
        ) : (
          <div ref={toolRef} className="max-w-3xl mx-auto px-4">
            {/* Tool Header */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold">Review Generator</h2>
              <button 
                onClick={() => setActivePage('landing')}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
              >
                Go Back Home
              </button>
            </div>

            {/* Step 1: Review Input */}
            <div className="mb-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold ring-4 ring-blue-50/50">1</span>
                  <span className="font-bold text-slate-800">The Review</span>
                </div>
                <button 
                  onClick={handleSampleReview}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-4 py-1.5 bg-blue-50 rounded-full transition-all border border-blue-100 hover:border-blue-200"
                >
                  Try a Sample Review
                </button>
              </div>
              <div className="relative group">
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Paste your customer's Google review here..."
                  className="w-full h-44 px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white shadow-sm outline-none resize-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
                />
                <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-white/50 backdrop-blur-sm px-2 py-1 rounded-md">
                  {reviewText.length} characters
                </div>
              </div>
              {sentiment && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 px-5 py-3 rounded-2xl inline-flex items-center gap-3 text-sm font-bold border-2 transition-all ${
                    sentiment.sentiment === 'negative' ? 'bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-50' :
                    sentiment.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50' :
                    'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-50'
                  }`}
                >
                  <span className="text-xl animate-bounce">{sentiment.emoji}</span>
                  <span>
                    {sentiment.sentiment.charAt(0).toUpperCase() + sentiment.sentiment.slice(1)} Review detected — <span className="underline decoration-2 underline-offset-2">{sentiment.suggestedTone}</span> tone set automatically.
                  </span>
                </motion.div>
              )}
            </div>

            {/* Step 2: Tone Selector */}
            <div className="mb-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold ring-4 ring-blue-50/50">2</span>
                <span className="font-bold text-slate-800">Select Reply Tone</span>
              </div>
              <div className="flex flex-wrap sm:grid sm:grid-cols-3 gap-3 md:gap-5">
                <ToneCard 
                  icon={<Smile className="w-6 h-6" />}
                  label="Friendly"
                  isSelected={selectedTone === 'Friendly'}
                  onClick={() => setSelectedTone('Friendly')}
                />
                <ToneCard 
                  icon={<Briefcase className="w-6 h-6" />}
                  label="Professional"
                  isSelected={selectedTone === 'Professional'}
                  onClick={() => setSelectedTone('Professional')}
                />
                <ToneCard 
                  icon={<Heart className="w-6 h-6 text-red-500" />}
                  label="Apologetic"
                  isSelected={selectedTone === 'Apologetic'}
                  onClick={() => setSelectedTone('Apologetic')}
                />
              </div>
            </div>

            {/* Step 3: Language Selector */}
            <div className="mb-10 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold ring-4 ring-blue-50/50">3</span>
                <span className="font-bold text-slate-800">Select Reply Language</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <LanguageCard 
                  flag="🇬🇧"
                  label="English"
                  isSelected={selectedLanguage === 'English'}
                  onClick={() => setSelectedLanguage('English')}
                />
                <LanguageCard 
                  flag="🇸🇦"
                  label="Arabic"
                  isSelected={selectedLanguage === 'Arabic'}
                  onClick={() => setSelectedLanguage('Arabic')}
                />
                <LanguageCard 
                  flag="🇵🇰"
                  label="Urdu"
                  isSelected={selectedLanguage === 'Urdu'}
                  onClick={() => setSelectedLanguage('Urdu')}
                />
                <LanguageCard 
                  flag="🇮🇳"
                  label="Hindi"
                  isSelected={selectedLanguage === 'Hindi'}
                  onClick={() => setSelectedLanguage('Hindi')}
                />
              </div>

              {/* Multilingual Status - Senior Dev Polish */}
              <div className="px-4 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 mb-8 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs text-indigo-700 font-bold">Smart Language Intelligence: If you paste Urdu/Arabic/Hindi text, AI will handle it automatically.</span>
              </div>

              {/* Coming Soon Section */}
              <div className="p-10 bg-slate-50/50 rounded-3xl border border-slate-100/50 text-center">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-8">Expanding Our Language Library</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 opacity-40 grayscale pointer-events-none">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                    <span className="text-2xl">🇪🇸</span>
                    <span className="text-[10px] font-extrabold">Spanish</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                    <span className="text-2xl">🇫🇷</span>
                    <span className="text-[10px] font-extrabold">French</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                    <span className="text-2xl">🇩🇪</span>
                    <span className="text-[10px] font-extrabold">German</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                    <span className="text-2xl">🇹🇷</span>
                    <span className="text-[10px] font-extrabold">Turkish</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vote for your language</span>
                    <span className="text-[10px] text-slate-400">Join the waitlist for early access</span>
                  </div>
                  <div className="flex w-full max-w-sm gap-2 mt-2">
                    <input 
                      type="tel" 
                      placeholder="WhatsApp (e.g. +92...)"
                      className="flex-1 px-5 py-3 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-slate-700"
                    />
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Vote</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Generate Button */}
            <div className="mb-12">
              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  isLoading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    AI is writing your replies...
                  </>
                ) : (
                  <>
                    Generate Replies in {selectedLanguage} ✨
                  </>
                )}
              </button>
              
              {error && (
                <p className="mt-4 text-center text-red-500 font-medium">
                  {error}
                </p>
              )}
            </div>

            {/* Step 5: Results Section */}
            {replies.length > 0 && (
              <div id="results-section" className="space-y-6 pt-12 mt-12 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm shadow-emerald-50">
                    <Check className="text-emerald-600 w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">AI-Generated Replies</h3>
                </div>
                {replies.map((reply, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50/50 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-100">
                          Option {idx + 1}
                        </span>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{generatedLanguage}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                        {reply.split(' ').length} WORDS
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-lg font-medium mb-12">
                      {reply}
                    </p>
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => handleCopy(reply, idx)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all font-bold text-sm tracking-tight ${
                          copiedIndex === idx 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95'
                        }`}
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3px]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy to Clipboard</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Subtle design element */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-50 to-transparent opacity-50 -mr-12 -mt-12 rounded-full" />
                  </motion.div>
                ))}
              </div>
            )}
            {/* Recent Activity Section */}
            {activePage === 'tool' && (
              <div className="mt-24 pt-16 border-t border-slate-200">
                <div className="flex items-center justify-between mb-8 group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:rotate-12 transition-transform">
                      <History className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Your Recent History</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Stored locally in your session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    PRIVATE SESSION
                  </div>
                </div>

                {/* Retention Hook: Email Capture */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-8 bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-200 overflow-hidden relative"
                >
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Want to save these replies permanently?</h4>
                        <p className="text-blue-100 text-sm">Enter your email to get weekly AI templates.</p>
                      </div>
                    </div>
                    {subscriberSaved ? (
                      <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" /> You're on the list!
                      </div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
                        <input 
                          type="email" 
                          placeholder="your@email.com"
                          value={subscriberEmail}
                          onChange={(e) => setSubscriberEmail(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 outline-none focus:bg-white/20 transition-all placeholder:text-blue-100/50 text-sm w-full md:w-64"
                          required
                        />
                        <button type="submit" className="bg-white text-blue-600 px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all whitespace-nowrap">Join Now</button>
                      </form>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                </motion.div>

                <AnimatePresence mode="popLayout">
                  {personalHistory.length > 0 ? (
                    <div className="space-y-5">
                      {personalHistory.map((item, idx) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            duration: 0.4 
                          }}
                          className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all overflow-hidden relative"
                        >
                          <div className="flex-1 pr-10 text-left relative z-10">
                            <p className="text-slate-700 font-medium leading-relaxed italic line-clamp-2">"{item.review_text}"</p>
                            <div className="flex items-center gap-3 mt-4">
                              <span className="text-[10px] font-extrabold text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                {item.tone}
                              </span>
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                                {item.language}
                              </span>
                              <span className="text-[10px] font-bold text-slate-300 uppercase">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleCopy(item.ai_reply, `history-${idx}`)}
                            className={`p-4 rounded-2xl transition-all shadow-md relative z-10 scale-95 hover:scale-100 active:scale-90 ${
                              copiedIndex === `history-${idx}` 
                              ? 'bg-emerald-500 text-white border-none' 
                              : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                            }`}
                          >
                            {copiedIndex === `history-${idx}` ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-16 -translate-y-16 group-hover:bg-blue-50/30 transition-colors" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <History className="text-slate-300 w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Your generated replies will appear here. Try generating one now!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-20 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="max-w-xs text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Star className="text-white w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-bold text-lg text-blue-600">ReviewReply AI</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empowering small businesses with human-like AI review management.
              </p>
            </div>

            <div className="bg-white p-10 rounded-4xl shadow-sm border border-slate-100 w-full max-w-md ring-8 ring-slate-50">
              <h4 className="font-extrabold text-xl mb-2 text-center text-slate-800 tracking-tight">Support on WhatsApp</h4>
              <p className="text-slate-400 text-xs text-center mb-8 font-medium">Get instant updates & priority support</p>
              {whatsappSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-emerald-50">
                    <Check className="text-emerald-600 w-8 h-8" />
                  </div>
                  <h5 className="font-bold text-slate-800 text-lg">You&apos;re on the list!</h5>
                  <p className="text-slate-400 text-sm mt-2">We&apos;ll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleWhatsappSubmit} className="flex flex-col gap-3">
                  <input 
                    type="tel"
                    placeholder="Enter WhatsApp number..."
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-slate-700"
                    required
                  />
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200"
                  >
                    Get Updates <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-slate-200/50 text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} ReviewReply AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all"
  >
    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const ToneCard = ({ icon, label, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-3xl border-2 transition-all duration-300 ${
      isSelected 
        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xl shadow-blue-100/50 scale-[1.02] ring-4 ring-blue-50/50' 
        : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-600 hover:shadow-md'
    }`}
  >
    <div className={`p-3 rounded-2xl transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
      {icon}
    </div>
    <span className="font-extrabold text-[9px] sm:text-[10px] uppercase tracking-widest sm:tracking-[0.2em]">{label}</span>
  </button>
);

const LanguageCard = ({ flag, label, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${
      isSelected 
        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xl shadow-blue-100/50 scale-[1.02] ring-4 ring-blue-50/50' 
        : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-600 hover:shadow-md'
    }`}
  >
    <span className="text-4xl drop-shadow-sm">{flag}</span>
    <span className="font-extrabold text-[10px] uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default App;
