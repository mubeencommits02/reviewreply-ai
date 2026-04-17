import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Loader2, Star, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signUp({ email, password });
        if (error) throw error;
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setIsLogin(true);
        }, 5000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center p-4">
        <Motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-sm border border-slate-200 text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-500" size={40} strokeWidth={1.75} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h3>
          <p className="text-slate-500 leading-relaxed mb-6">
            We've sent a confirmation link to <span className="font-bold text-slate-900">{email}</span>. Please verify your email to continue.
          </p>
          <div className="flex justify-center gap-2 items-center text-sm text-slate-400 font-medium">
            <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
            Waiting for verification...
          </div>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center p-4">
      <div className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Star className="text-white fill-current" size={20} strokeWidth={1.75} />
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-900">ReviewReply <span className="text-indigo-600">AI</span></span>
      </div>

      <Motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-sm border border-slate-200"
      >
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
          {isLogin ? (
            <Lock className="text-indigo-600" size={24} strokeWidth={1.75} />
          ) : (
            <UserPlus className="text-indigo-600" size={24} strokeWidth={1.75} />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          {isLogin 
            ? 'Sign in to access your saved reviews and business settings.' 
            : 'Unlock unlimited history and personalized business contexts.'}
        </p>

        <AnimatePresence mode="wait">
          {error && (
            <Motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium overflow-hidden"
            >
              {error}
            </Motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={1.75} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400" 
                placeholder="you@company.com" 
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={1.75} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400" 
                placeholder={isLogin ? "••••••••" : "Minimum 6 characters"} 
                minLength={!isLogin ? 6 : undefined}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} strokeWidth={1.75} />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Get Started'} 
                <ArrowRight size={18} strokeWidth={1.75} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={toggleMode}
              className="font-bold text-indigo-600 hover:text-indigo-700 focus:outline-none"
            >
              {isLogin ? 'Create one for free' : 'Sign in here'}
            </button>
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default Auth;
