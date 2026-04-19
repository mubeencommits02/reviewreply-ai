import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Briefcase, Building2, AlignLeft, Check, Loader2, Save, ArrowLeft } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [profile, setProfile] = useState({
    business_name: '',
    industry: '',
    usps: ''
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Robust fetch: try to find by id or user_id (handles both schema variants)
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .maybeSingle();
      
      if (data) {
        setProfile({
          business_name: data.business_name || '',
          // Support both industry and industry_type column names
          industry: data.industry || data.industry_type || '',
          // Support both usps and business_description column names
          usps: data.usps || data.business_description || ''
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Fetch latest authenticated user ID
      const { data: { user: latestUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !latestUser) throw new Error("Authentication failed. Please sign in again.");

      // 2. Construct polyfilled payload (handles both schema variants)
      const payload = { 
        id: latestUser.id,
        user_id: latestUser.id, // Set both to be safe
        business_name: profile.business_name,
        industry: profile.industry,
        industry_type: profile.industry, // Polyfill
        usps: profile.usps,
        business_description: profile.usps, // Polyfill
        updated_at: new Date().toISOString()
      };

      // 3. URGENT DEBUG FIX: Upsert with multiple conflict targets
      // We try to upsert by id first, if that fails due to FK, it's likely the table structure
      const { error } = await supabase
        .from('business_profiles')
        .upsert(payload, { onConflict: 'id' });
      
      if (error) {
        console.warn("Retrying upsert with user_id conflict...");
        const { error: retryError } = await supabase
          .from('business_profiles')
          .upsert(payload, { onConflict: 'user_id' });
        if (retryError) throw retryError;
      }

      // 4. Local state update for immediate UI feedback
      setProfile({
        business_name: profile.business_name,
        industry: profile.industry,
        usps: profile.usps
      });

      showToast("Settings synced successfully! ✨");
    } catch (err) {
      showToast("Sync Error: " + (err.message || "Constraint violation"));
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-indigo-600" strokeWidth={1.75} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm mb-4 group"
          >
            <ArrowLeft size={16} strokeWidth={1.75} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Settings</h1>
          <p className="text-slate-500 font-medium">Define your brand context for smarter AI generations.</p>
        </div>
      </header>

      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm"
      >
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid gap-6">
            <InputGroup 
              icon={<Building2 size={18} strokeWidth={1.75} />} 
              label="Business Name" 
              value={profile.business_name}
              onChange={v => setProfile({...profile, business_name: v})}
              placeholder="e.g. Joe's Coffee Lab"
              required
            />

            <InputGroup 
              icon={<Briefcase size={18} strokeWidth={1.75} />} 
              label="Industry" 
              value={profile.industry}
              onChange={v => setProfile({...profile, industry: v})}
              placeholder="e.g. Hospitality / Bakery"
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <AlignLeft size={14} strokeWidth={1.75} /> Unique Selling Points (USPs)
              </label>
              <textarea 
                value={profile.usps}
                onChange={e => setProfile({...profile, usps: e.target.value})}
                placeholder="What makes your business special? e.g. Fresh ingredients, 24/7 support..."
                className="w-full h-32 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium italic ml-1">AI will inject these USPs into every generated reply.</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.25rem] font-bold text-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={24} className="animate-spin" strokeWidth={1.75} /> : <><Save size={20} strokeWidth={1.75} /> Update Context</>}
          </button>
        </form>
      </Motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <Motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 font-bold flex items-center gap-3 border border-slate-700"
          >
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={14} strokeWidth={2} /></div>
            {toast.message}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputGroup = ({ icon, label, value, onChange, placeholder, required = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
      {icon} {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type="text" 
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
    />
  </div>
);

export default Settings;
