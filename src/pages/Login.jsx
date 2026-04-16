import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Loader2, Star } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await signIn({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Star className="text-white w-6 h-6 fill-current" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-900">ReviewReply <span className="text-blue-600">AI</span></span>
      </Link>

      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
      >
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Lock className="text-blue-600 w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Welcome Back</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Sign in to access your saved reviews and business settings.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm font-medium" 
                placeholder="you@company.com" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm font-medium" 
                placeholder="••••••••" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">
            Don't have an account? <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700">Create one for free</Link>
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default Login;
