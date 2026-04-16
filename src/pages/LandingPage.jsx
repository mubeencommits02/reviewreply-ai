import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ArrowRight, 
  Zap, 
  Target, 
  Clipboard, 
  TrendingUp, 
  Clock,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Star className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight">ReviewReply <span className="text-blue-600">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <Link to="/dashboard" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-500 font-bold text-sm hover:text-blue-600">Sign In</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-xs uppercase tracking-widest mb-8 border border-blue-100">
              <Zap className="w-3 h-3 fill-current" /> Trusted by 100+ local businesses
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
              Human-Like <span className="text-blue-600">AI Replies</span> <br /> for Google Reviews
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Stop wasting 30 minutes daily. Let AI craft personal, context-aware replies that build customer loyalty instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/signup')} 
                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-3"
              >
                Try It For Free <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 text-slate-400 font-bold text-sm px-6">
                <ShieldCheck className="w-5 h-5" /> No Credit Card Required
              </div>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-24 grid grid-cols-2 md:grid-cols-3 max-w-3xl mx-auto gap-8">
              <Stat icon={<TrendingUp className="text-emerald-500" />} label="Replies Generated" val="5,000+" />
              <Stat icon={<Clock className="text-blue-500" />} label="Hours Saved" val="2,500+" />
              <div className="hidden md:block">
                <Stat icon={<MessageSquare className="text-indigo-500" />} label="Supported Languages" val="4+" />
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Features Preview */}
        <section className="mt-40 grid md:grid-cols-3 gap-10">
          <Feature 
            title="Context-Aware" 
            desc="Our AI learns your business details, USPs, and industry to write replies that sound like YOU." 
            icon={<Target className="text-blue-600" />} 
          />
          <Feature 
            title="Multilingual" 
            desc="Reply in English, Arabic, Urdu, or Hindi effortlessly with native-level fluency." 
            icon={<Zap className="text-blue-600" />} 
          />
          <Feature 
            title="One-Click Sync" 
            desc="Save your history to the cloud and access your business settings from any device." 
            icon={<Clipboard className="text-blue-600" />} 
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Star className="text-white w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-lg">ReviewReply AI</span>
          </div>
          <div className="text-slate-400 text-sm font-medium italic">
            Built for local heroes by ReviewReply AI Team.
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">&copy; 2026 All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const Stat = ({ icon, label, val }) => (
  <div className="text-center group">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="text-3xl font-black text-slate-800 tracking-tighter mb-1">{val}</div>
    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-tight">{label}</div>
  </div>
);

const Feature = ({ title, desc, icon }) => (
  <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-blue-50/50 transition-all group">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default LandingPage;
