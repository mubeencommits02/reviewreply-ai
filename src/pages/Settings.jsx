import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Briefcase, Building2, AlignLeft, Send, Check, Loader2, Save } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [profile, setProfile] = useState({
    business_name: '',
    industry_type: '',
    business_description: '',
    preferred_tone: 'Professional'
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile({
          business_name: data.business_name || '',
          industry_type: data.industry_type || '',
          business_description: data.business_description || '',
          preferred_tone: data.preferred_tone || 'Professional'
        });
      }
    } catch (err) {
      console.error(err);
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
          id: user.id, 
          ...profile,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      showToast("Profile updated successfully! ✨");
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
    <div className="max-w-2xl">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Business Profile</h1>
        <p className="text-slate-500 font-medium">Fine-tune your brand context for smarter AI generations.</p>
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
              placeholder="Joe's Coffee Corner"
              required
            />

            <InputGroup 
              icon={<Briefcase className="w-5 h-5" />} 
              label="Industry" 
              value={profile.industry_type}
              onChange={v => setProfile({...profile, industry_type: v})}
              placeholder="Hospitality / Cafe"
            />

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Business Description (AI Context)
              </label>
              <textarea 
                value={profile.business_description}
                onChange={e => setProfile({...profile, business_description: e.target.value})}
                placeholder="We specialize in organic Ethiopian beans and provide a cozy workspace for remote workers."
                className="w-full h-32 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm font-medium"
              />
              <p className="text-[10px] text-slate-400 font-medium italic">Describe what makes your business unique. AI will use this in replies.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Send className="w-3 h-3" /> Default Preference
              </label>
              <select 
                value={profile.preferred_tone}
                onChange={e => setProfile({...profile, preferred_tone: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option>Friendly</option>
                <option>Professional</option>
                <option>Apologetic</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:bg-slate-400"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Save Settings</>}
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

export default Settings;
