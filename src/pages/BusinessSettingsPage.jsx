import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Briefcase, Building2, AlignLeft, Send, Check, Loader2, Save, ArrowLeft } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BusinessSettingsPage = () => {
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
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfile({
          business_name: data.business_name || '',
          industry: data.industry || '',
          usps: data.usps || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_profiles')
        .upsert({ 
          user_id: user.id, 
          ...profile,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      showToast("Settings saved successfully! ✨");
    } catch (err) {
      showToast("Error: " + err.message);
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
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Business Settings</h1>
          <p className="text-slate-500 font-medium">Define your business identity for personalized AI replies.</p>
        </div>
      </header>

      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm"
      >
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid gap-6">
            <InputGroup 
              icon={<Building2 className="w-5 h-5" />} 
              label="Business Name" 
              value={profile.business_name}
              onChange={v => setProfile({...profile, business_name: v})}
              placeholder="e.g. Blue Bottle Coffee"
              required
            />

            <InputGroup 
              icon={<Briefcase className="w-5 h-5" />} 
              label="Industry" 
              value={profile.industry}
              onChange={v => setProfile({...profile, industry: v})}
              placeholder="e.g. Specialty Coffee / Hospitality"
            />

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Unique Selling Points (USPs)
              </label>
              <textarea 
                value={profile.usps}
                onChange={e => setProfile({...profile, usps: e.target.value})}
                placeholder="e.g. Organic beans, artisan roasting, cozy workspace, free high-speed wifi..."
                className="w-full h-32 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm font-medium"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium italic">What makes you special? AI will inject this context into every reply.</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:bg-slate-400"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Save Profile</>}
          </button>
        </form>
      </Motion.div>

      {/* Toast */}
      {toast.show && (
        <Motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 font-bold flex items-center gap-3 border border-slate-700"
        >
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4" /></div>
          {toast.message}
        </Motion.div>
      )}
    </div>
  );
};

const InputGroup = ({ icon, label, value, onChange, placeholder, required = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type="text" 
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm font-medium"
    />
  </div>
);

export default BusinessSettingsPage;
