import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown, 
  ChevronUp, 
  Loader2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateReplies, analyzeReview } from './utils/gemini';

const App = () => {
  const [activePage, setActivePage] = useState('landing');
  const [reviewText, setReviewText] = useState('');
  const [selectedTone, setSelectedTone] = useState('Friendly');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [replies, setReplies] = useState([]);
  const [generatedLanguage, setGeneratedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const [counter, setCounter] = useState(parseInt(localStorage.getItem('reply_counter')) || 127);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappSubmitted, setWhatsappSubmitted] = useState(false);
  const [sentiment, setSentiment] = useState(null);

  const toolRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('reply_counter', counter);
  }, [counter]);

  useEffect(() => {
    if (reviewText.trim()) {
      const result = analyzeReview(reviewText);
      setSentiment(result);
      setSelectedTone(result.suggestedTone);
    } else {
      setSentiment(null);
    }
  }, [reviewText]);

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
      setCounter(prev => prev + 1);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("DEBUG ERROR:", err);
      setError("Something went wrong — please try again ⏳");
    } finally {
      setIsLoading(false);
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
    } catch (err) {
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
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr);
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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Navigation / Logo Area */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('landing')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <Star className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-blue-600">ReviewReply AI</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTool}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            {activePage === 'landing' ? 'Try It Free' : 'Main Tool'}
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
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                
                <div className="mt-12 flex items-center justify-center gap-2 text-gray-400 font-medium">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200`} />
                    ))}
                  </div>
                  <span className="text-blue-600 font-bold ml-2">🎯 Replies Generated: {counter}</span>
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
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                  <span className="font-semibold text-gray-700">The Review</span>
                </div>
                <button 
                  onClick={handleSampleReview}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1 bg-blue-50 rounded-full transition-colors"
                >
                  Try a Sample Review
                </button>
              </div>
              <div className="relative">
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Paste your customer's Google review here..."
                  className="w-full h-40 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-white shadow-sm outline-none resize-none transition-all placeholder:text-slate-400"
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium">
                  {reviewText.length} characters
                </div>
              </div>
              {sentiment && (
                <div className={`mt-3 px-4 py-2 rounded-xl inline-flex items-center gap-2 text-sm font-bold border ${
                  sentiment.sentiment === 'negative' ? 'bg-red-50 text-red-600 border-red-100' :
                  sentiment.sentiment === 'positive' ? 'bg-green-50 text-green-600 border-green-100' :
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  <span>{sentiment.emoji}</span>
                  <span>
                    {sentiment.sentiment.charAt(0).toUpperCase() + sentiment.sentiment.slice(1)} Review Detected — {sentiment.suggestedTone} tone recommended
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Tone Selector */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                <span className="font-semibold text-gray-700">Choose Tone</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <ToneCard 
                  id="Friendly"
                  icon={<Smile className="w-5 h-5" />}
                  label="Friendly"
                  isSelected={selectedTone === 'Friendly'}
                  onClick={() => setSelectedTone('Friendly')}
                />
                <ToneCard 
                  id="Professional"
                  icon={<Briefcase className="w-5 h-5" />}
                  label="Professional"
                  isSelected={selectedTone === 'Professional'}
                  onClick={() => setSelectedTone('Professional')}
                />
                <ToneCard 
                  id="Apologetic"
                  icon={<Heart className="w-5 h-5 text-red-500" />}
                  label="Apologetic"
                  isSelected={selectedTone === 'Apologetic'}
                  onClick={() => setSelectedTone('Apologetic')}
                />
              </div>
            </div>

            {/* Step 3: Language Selector */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                <span className="font-semibold text-gray-700">Select Reply Language</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <LanguageCard 
                  id="English"
                  flag="🇬🇧"
                  label="English"
                  isSelected={selectedLanguage === 'English'}
                  onClick={() => setSelectedLanguage('English')}
                />
                <LanguageCard 
                  id="Arabic"
                  flag="🇸🇦"
                  label="Arabic"
                  isSelected={selectedLanguage === 'Arabic'}
                  onClick={() => setSelectedLanguage('Arabic')}
                />
                <LanguageCard 
                  id="Urdu"
                  flag="🇵🇰"
                  label="Urdu"
                  isSelected={selectedLanguage === 'Urdu'}
                  onClick={() => setSelectedLanguage('Urdu')}
                />
                <LanguageCard 
                  id="Hindi"
                  flag="🇮🇳"
                  label="Hindi"
                  isSelected={selectedLanguage === 'Hindi'}
                  onClick={() => setSelectedLanguage('Hindi')}
                />
              </div>

              {/* Coming Soon Section */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">More Languages Coming Soon!</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 opacity-50 grayscale pointer-events-none">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
                    <span className="text-xl mb-1">🇪🇸</span>
                    <span className="text-[10px] font-bold">Spanish</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
                    <span className="text-xl mb-1">🇫🇷</span>
                    <span className="text-[10px] font-bold">French</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
                    <span className="text-xl mb-1">🇩🇪</span>
                    <span className="text-[10px] font-bold">German</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
                    <span className="text-xl mb-1">🇹🇷</span>
                    <span className="text-[10px] font-bold">Turkish</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] text-slate-400 font-medium mb-2">Vote for your language!</span>
                  <div className="flex w-full max-w-xs gap-2">
                    <input 
                      type="tel" 
                      placeholder="WhatsApp number..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                    />
                    <button className="bg-slate-200 text-slate-500 px-3 py-2 rounded-lg text-xs font-bold">Vote</button>
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
              <div id="results-section" className="space-y-6 pt-8 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Your AI-Generated Replies</h3>
                {replies.map((reply, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all group relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          Reply {idx + 1}
                        </span>
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{generatedLanguage}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {reply.split(' ').length} words
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pr-12">
                      {reply}
                    </p>
                    <button 
                      onClick={() => handleCopy(reply, idx)}
                      className={`absolute bottom-4 right-4 p-2.5 rounded-xl transition-all flex items-center gap-2 group-hover:scale-105 active:scale-95 ${
                        copiedIndex === idx 
                        ? 'bg-green-100 text-green-600 border border-green-200' 
                        : 'bg-white border border-slate-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm hover:shadow-lg shadow-blue-100'
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-xs font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 transition-transform group-hover:-rotate-12" />
                          <span className="text-xs font-bold uppercase tracking-wider">Copy</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
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

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
              <h4 className="font-bold text-lg mb-4 text-center">Get updates & support on WhatsApp</h4>
              {whatsappSubmitted ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-600 w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-800">Thank You!</h5>
                  <p className="text-slate-500 text-sm">We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleWhatsappSubmit} className="flex gap-2">
                  <input 
                    type="tel"
                    placeholder="Enter your number..."
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
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
    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
      isSelected 
        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md shadow-blue-100' 
        : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-white hover:border-slate-200'
    }`}
  >
    {icon}
    <span className="font-bold text-xs uppercase tracking-wider">{label}</span>
  </button>
);

const LanguageCard = ({ flag, label, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
      isSelected 
        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md shadow-blue-100' 
        : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-white hover:border-slate-200'
    }`}
  >
    <span className="text-2xl">{flag}</span>
    <span className="font-bold text-[10px] uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
