import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Settings2, 
  Download, 
  Loader2, 
  Image as ImageIcon, 
  ChevronDown, 
  Maximize2,
  Zap,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateImage, enhancePrompt } from './services/geminiService';

type AspectRatio = '1:1' | '16:9' | '4:3' | '9:16';

const BuriBuriIcon = () => (
  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-black shadow-lg bg-[#D8B4FE] overflow-hidden flex items-center justify-center relative">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Purple Pig Head */}
      <circle cx="50" cy="50" r="48" fill="#D8B4FE" stroke="black" strokeWidth="4" />
      {/* Ears */}
      <path d="M25 25 Q15 5 35 15" fill="#D8B4FE" stroke="black" strokeWidth="4" />
      <path d="M75 25 Q85 5 65 15" fill="#D8B4FE" stroke="black" strokeWidth="4" />
      {/* Eyes (Black Mask) */}
      <rect x="20" y="40" width="60" height="20" rx="4" fill="black" />
      <circle cx="35" cy="50" r="3.5" fill="white" />
      <circle cx="65" cy="50" r="3.5" fill="white" />
      {/* Snout */}
      <ellipse cx="50" cy="70" rx="16" ry="12" fill="#F9A8D4" stroke="black" strokeWidth="4" />
      <circle cx="42" cy="70" r="3" fill="black" />
      <circle cx="58" cy="70" r="3" fill="black" />
      {/* Katana Handle */}
      <rect x="75" y="15" width="8" height="35" transform="rotate(35 75 15)" fill="#475569" stroke="black" strokeWidth="3" />
    </svg>
  </div>
);

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedPromptEnabled, setEnhancedPromptEnabled] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [showSettings, setShowSettings] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate some petals
  const petals = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${5 + Math.random() * 10}s`,
    delay: `${Math.random() * 5}s`,
    size: `${10 + Math.random() * 15}px`,
  }));
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      let finalPrompt = prompt;
      
      if (enhancedPromptEnabled) {
        setIsEnhancing(true);
        try {
          finalPrompt = await enhancePrompt(prompt);
        } catch (e) {
          console.error("Prompt enhancement failed", e);
          // Fallback to original prompt if enhancement fails
        } finally {
          setIsEnhancing(false);
        }
      }
      
      const imageUrl = await generateImage(finalPrompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `buri-buri-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-20 relative overflow-hidden">
      {/* Top Left Header Icon */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-black shadow-md bg-[#D8B4FE] overflow-hidden flex items-center justify-center relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#D8B4FE" stroke="black" strokeWidth="4" />
            <path d="M25 25 Q15 5 35 15" fill="#D8B4FE" stroke="black" strokeWidth="4" />
            <path d="M75 25 Q85 5 65 15" fill="#D8B4FE" stroke="black" strokeWidth="4" />
            <rect x="20" y="40" width="60" height="20" rx="4" fill="black" />
            <circle cx="35" cy="50" r="3.5" fill="white" />
            <circle cx="65" cy="50" r="3.5" fill="white" />
            <ellipse cx="50" cy="70" rx="16" ry="12" fill="#F9A8D4" stroke="black" strokeWidth="4" />
            <circle cx="42" cy="70" r="3" fill="black" />
            <circle cx="58" cy="70" r="3" fill="black" />
            <rect x="75" y="15" width="8" height="35" transform="rotate(35 75 15)" fill="#475569" stroke="black" strokeWidth="3" />
          </svg>
        </div>
        <span className="font-black text-red-500 text-sm md:text-base drop-shadow-sm hidden sm:block">Buri Buri Zaimon</span>
      </div>

      {/* Petal Decorations */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal animate-fall"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
          }}
        />
      ))}

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-400/20 border border-red-400/30 text-red-600 text-xs font-bold mb-4 uppercase tracking-widest">
          <Zap size={14} />
          <span>Buri Buri Power!</span>
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <BuriBuriIcon />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-red-500 drop-shadow-md">
            Buri Buri Zaimon
          </h1>
          <BuriBuriIcon />
        </div>
        
        <p className="text-zinc-700 text-xl max-w-2xl mx-auto font-medium">
          Transform your wildest ideas into Shinchan-style art with the power of Buri Buri Zaimon!
        </p>
      </motion.header>

      <main className="w-full max-w-4xl space-y-8 relative z-10">
        {/* Input Section */}
        <section className="glass rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border-4 border-white">
          <div className="space-y-6">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your Shinchan adventure..."
                className="w-full bg-zinc-900 border-4 border-zinc-800 rounded-2xl p-5 text-lg min-h-[120px] focus:outline-none focus:ring-4 focus:ring-emerald-400 transition-all resize-none placeholder:text-zinc-600 text-white font-sans"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <button
                  onClick={() => setEnhancedPromptEnabled(!enhancedPromptEnabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                    enhancedPromptEnabled 
                      ? 'bg-red-500 text-white border-red-600' 
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}
                >
                  <Sparkles size={14} />
                  Heroic Enhancement
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/60 hover:bg-white text-sm font-bold transition-all border-2 border-white"
                >
                  <Settings2 size={18} />
                  Secret Settings
                  <ChevronDown size={16} className={`transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="relative group overflow-hidden px-10 py-4 rounded-2xl bg-[#39FF14] text-black font-black text-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.4)] border-4 border-black"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    {isEnhancing ? 'Summoning...' : 'Drawing...'}
                  </>
                ) : (
                  <>
                    GENERATE!
                    <Zap size={24} fill="currentColor" />
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t-2 border-white/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                        <Maximize2 size={14} />
                        Canvas Size
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['1:1', '16:9', '4:3', '9:16'] as AspectRatio[]).map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`py-2 rounded-lg text-sm font-bold transition-all border-2 ${
                              aspectRatio === ratio
                                ? 'bg-red-500 border-red-600 text-white'
                                : 'bg-white/40 border-white/60 text-zinc-600 hover:border-white'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                        <Info size={14} />
                        Hero Info
                      </label>
                      <p className="text-sm text-zinc-600 font-medium">
                        Buri Buri Zaimon uses the legendary Gemini 2.5 engine to sketch your dreams!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500 text-white p-4 rounded-2xl text-center font-bold border-4 border-red-700 shadow-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Gallery View */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black flex items-center gap-2 text-red-600">
              <ImageIcon size={24} />
              Your Masterpiece
            </h2>
            {generatedImage && (
              <button 
                onClick={() => setGeneratedImage(null)}
                className="text-sm font-bold text-zinc-600 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Start Over
              </button>
            )}
          </div>

          <div className="relative min-h-[400px] rounded-3xl glass overflow-hidden flex items-center justify-center group border-4 border-white shadow-2xl">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 border-8 border-red-200 border-t-red-500 rounded-full animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 animate-pulse" size={32} />
                </div>
                <p className="text-red-600 font-black text-xl animate-bounce">
                  {isEnhancing ? 'Summoning the Hero...' : 'Drawing Shinchan Style...'}
                </p>
              </div>
            ) : generatedImage ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full relative"
              >
                <img 
                  src={generatedImage} 
                  alt="Generated masterpiece" 
                  className="w-full h-full object-contain max-h-[70vh]"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={handleDownload}
                    className="bg-[#39FF14] text-black p-5 rounded-full hover:scale-110 transition-transform shadow-2xl border-4 border-black"
                    title="Save to Gallery"
                  >
                    <Download size={32} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="w-24 h-24 bg-white/40 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-inner">
                  <ImageIcon size={40} className="text-red-300" />
                </div>
                <div>
                  <p className="text-red-600 font-black text-2xl">Ready for Action!</p>
                  <p className="text-zinc-600 font-bold">Tell Buri Buri Zaimon what to draw!</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-20 text-zinc-600 text-sm pb-12 font-bold relative z-10">
        &copy; {new Date().getFullYear()} Buri Buri Zaimon &bull; Hero for Hire!
      </footer>
    </div>
  );
}
