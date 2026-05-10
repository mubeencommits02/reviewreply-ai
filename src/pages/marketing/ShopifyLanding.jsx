import { Link } from 'react-router-dom';
import { ShoppingBag, Star, TrendingUp, ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';

const ShopifyLanding = () => {
  return (
    <div className="bg-[#f4f6f8] min-h-screen">
      <SEO 
        title="Shopify Reputation Management - SPR & Loox AI Integration"
        description="Boost Shopify store trust and conversions. One-click AI replies for Shopify Product Reviews (SPR) and popular review apps."
      />
      
      <header className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-8">
          <ShoppingBag size={14} /> Shopify Certified Partner
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter max-w-4xl">
          Scale Your Shopify Store's <span className="text-emerald-600">Social Proof</span>
        </h1>
        <p className="text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
          The fastest way to manage Shopify Product Reviews. Inject professional AI responses directly into your Shopify dashboard.
        </p>
        <Link to="/signup" className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl transition-all flex items-center gap-3">
          Install Extension Free <ArrowRight size={20} />
        </Link>
      </header>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-emerald-100 rounded-[4rem] -rotate-6" />
            <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                <Star fill="currentColor" size={16} />
                <Star fill="currentColor" size={16} />
                <Star fill="currentColor" size={16} />
                <Star fill="currentColor" size={16} />
                <Star fill="currentColor" size={16} />
              </div>
              <p className="text-slate-900 font-bold mb-4">"The direct injection into Shopify is a game-changer."</p>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-slate-900">Built for Conversion</h2>
              <p className="text-slate-500 leading-relaxed">Responding to reviews increases customer retention by 15%. We make it take 0 effort.</p>
            </div>
            
            <div className="space-y-8">
              <ShopifyFeature title="Native SPR Support" text="Works out of the box with the official Shopify Product Reviews app." />
              <ShopifyFeature title="SEO-Optimized Responses" text="AI naturally includes product keywords to help your search rankings." />
              <ShopifyFeature title="ROI Dashboard" text="Track how much time and money you save with built-in analytics." />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ShopifyFeature = ({ title, text }) => (
  <div className="flex gap-4">
    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
      <TrendingUp size={12} />
    </div>
    <div>
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  </div>
);

export default ShopifyLanding;
