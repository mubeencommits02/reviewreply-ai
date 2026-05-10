import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart3, ArrowRight, MessageSquare } from 'lucide-react';
import SEO from '../../components/SEO';

const AmazonLanding = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ReviewReply AI Amazon Assistant",
    "operatingSystem": "Chrome",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="Amazon Review Assistant - Automate Seller Central Replies"
        description="Save hours on Amazon Seller Central. Automate Amazon feedback and reviews with our AI-powered Chrome extension."
        schema={schema}
      />
      
      {/* Hero Section */}
      <header className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
          Master <span className="text-indigo-600">Amazon Seller</span> Reviews
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop wasting hours on manual feedback. Automate your Amazon reputation management with one-click, high-conversion AI replies.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
            Get Started Free <ArrowRight size={20} />
          </Link>
          <a href="#" className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all">
            Watch Demo
          </a>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Zap className="text-amber-500" />}
            title="Instant Analysis"
            description="Deep sentiment analysis detects pain points in Amazon reviews instantly."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-indigo-600" />}
            title="Brand Safe"
            description="Our AI learns your specific brand tone and Amazon compliance rules."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-emerald-600" />}
            title="Boost Rankings"
            description="Faster reply times are proven to improve your Amazon seller rating."
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">Trusted by 500+ Amazon Sellers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale">
          <div className="font-black text-2xl">LOGOHERE</div>
          <div className="font-black text-2xl">LOGOHERE</div>
          <div className="font-black text-2xl">LOGOHERE</div>
          <div className="font-black text-2xl">LOGOHERE</div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 bg-white rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </div>
);

export default AmazonLanding;
