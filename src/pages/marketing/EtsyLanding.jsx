import { Link } from 'react-router-dom';
import { Heart, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';

const EtsyLanding = () => {
  return (
    <div className="bg-[#FFF9F5] min-h-screen">
      <SEO 
        title="Etsy Review Automation - AI Replies for Handmade Shops"
        description="Empathetic AI replies for your Etsy business. Automate customer service and boost shop trust with ReviewReply AI."
      />
      
      <header className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
          Handmade <span className="text-[#F1641E]">Empathy</span> at Scale
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Your Etsy customers value the personal touch. Our AI generates warm, empathetic replies that reflect your unique craftsmanship.
        </p>
        <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-[#F1641E] text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all">
          Scale Your Etsy Shop <ArrowRight size={20} />
        </Link>
      </header>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Why Etsy Sellers Love ReviewReply</h2>
            <div className="space-y-6">
              <EtsyBenefit icon={<Heart fill="#F1641E" color="#F1641E" />} title="Personalized for Makers" text="We inject your specific business story into every reply." />
              <EtsyBenefit icon={<Sparkles className="text-amber-500" />} title="Magic Review Detection" text="The extension lives inside Etsy.com. No more switching tabs." />
              <EtsyBenefit icon={<MessageCircle className="text-indigo-600" />} title="Multi-lingual Support" text="Reply to global customers in their native language fluently." />
            </div>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 rotate-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div>
                <p className="font-bold text-slate-900">Emma S.</p>
                <p className="text-xs text-slate-400 font-medium">Shop Owner</p>
              </div>
            </div>
            <p className="text-lg text-slate-600 italic leading-relaxed">
              "ReviewReply changed how I handle my shop. I used to spend my entire Sunday replying to reviews. Now it takes 10 minutes."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const EtsyBenefit = ({ icon, title, text }) => (
  <div className="flex gap-5">
    <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">{icon}</div>
    <div>
      <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
    </div>
  </div>
);

export default EtsyLanding;
