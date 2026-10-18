import React from 'react';
import { Sparkles, ExternalLink, ArrowRight, Palette, Layers, Lightbulb, ShieldCheck } from 'lucide-react';

const AiCreativeDirectorPage = () => {
  const FESTIVE_AGENT_URL = 'https://festive-agent.vercel.app/';

  const handleLaunch = () => {
    window.open(FESTIVE_AGENT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-brand-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb / Category header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-brand-purple text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Creative Suite</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            AI Creative Director — FestiveAgent AI
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
            Design customized festival branding, banners, and promotional event creatives powered by our autonomous creative agent.
          </p>
        </div>

        {/* Transition Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-primary via-brand-purple to-purple-800 p-8 sm:p-12 text-white relative">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-brand-gold text-xs font-bold tracking-wide border border-white/20">
                External Production Tool
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                Launch FestiveAgent AI
              </h2>
              <p className="text-sm text-neutral-200 leading-relaxed">
                You are about to launch our dedicated AI Creative Director application. It transforms festival cultural references, business color palettes, and seasonal themes into ready-to-share promotional assets with persistent preference learning.
              </p>
              
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleLaunch}
                  className="px-6 py-3.5 bg-brand-gold text-neutral-950 font-bold rounded-2xl hover:bg-yellow-400 transition-all shadow-lg flex items-center gap-2.5 text-sm"
                >
                  <span>Open FestiveAgent AI</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <span className="text-xs text-neutral-300">
                  Opens in a new browser tab (festive-agent.vercel.app)
                </span>
              </div>
            </div>
          </div>

          {/* Capabilities breakdown */}
          <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center mb-3">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-neutral-800">Festival Themes</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Generate Diwali, Eid, Navratri, New Year, and wedding season promotional assets tailored to Indian celebrations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-neutral-800">Persistent Preferences</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Learns and saves your brand aesthetic, logo rules, and typography preferences across multiple creative sessions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-neutral-800">Direct Export</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Download high-resolution graphic designs ready for social media announcements, WhatsApp flyers, and print banners.
              </p>
            </div>
          </div>

          {/* Integration disclaimer */}
          <div className="bg-brand-cream/60 px-8 py-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-purple" />
              <span>Independent autonomous creative director by the founder of FestiveAgent AI</span>
            </div>
            <a
              href={FESTIVE_AGENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-purple hover:underline flex items-center gap-1"
            >
              <span>Direct Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiCreativeDirectorPage;
