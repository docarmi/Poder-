
import React, { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer 
} from 'recharts';
import { QUESTIONNAIRE, COEFFICIENTS } from './constants';
import { UserAnswers, ScoreResult, GroundingChunk, Item } from './types';

// Mise à plat du questionnaire pour une navigation séquentielle par question
const ALL_ITEMS: (Item & { dimensionName: string })[] = [];
QUESTIONNAIRE.forEach(dim => {
  dim.items.forEach(item => {
    ALL_ITEMS.push({ ...item, dimensionName: dim.name });
  });
});

const App: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'survey' | 'results'>('intro');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({}); // État initial vide (aucune suggestion)
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sources, setSources] = useState<GroundingChunk[]>([]);

  const totalQuestions = ALL_ITEMS.length;
  const currentItem = ALL_ITEMS[currentItemIndex];
  
  // Vérifie si la question actuelle a reçu une réponse
  const isCurrentAnswered = currentItem && answers[currentItem.id] !== undefined;

  const handleSelect = (level: number) => {
    setAnswers(prev => ({ ...prev, [currentItem.id]: level }));
  };

  const handleNext = () => {
    if (currentItemIndex < totalQuestions - 1) {
      setCurrentItemIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep('results');
      generateAIInsight();
    }
  };

  const handleBack = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
    } else {
      setStep('intro');
    }
  };

  /**
   * Calcul du score d'utilité.
   * Utilisation d'un modèle multiplicatif (U = Prod(1 + coef)) 
   * pour éviter que l'accumulation de 33 coefficients négatifs ne sature à zéro prématurément.
   */
  const calculateScore = useCallback((): ScoreResult => {
    let utility = 1.0;
    const dimensionImpacts: Record<string, number> = {};

    // Initialisation
    QUESTIONNAIRE.forEach(d => {
      dimensionImpacts[d.name] = 1.0;
    });

    ALL_ITEMS.forEach(item => {
      const level = answers[item.id];
      if (level && level > 1) {
        const coef = COEFFICIENTS[item.id]?.[level] || 0;
        // On multiplie par (1 + coef) car les coefs sont négatifs (ex: -0.0126)
        const multiplier = Math.max(0.01, 1 + coef);
        utility *= multiplier;
        
        if (dimensionImpacts[item.dimensionName] !== undefined) {
          dimensionImpacts[item.dimensionName] *= multiplier;
        }
      }
    });

    const breakdown = Object.entries(dimensionImpacts).map(([name, val]) => ({
      dimensionName: name,
      score: val
    }));

    return { 
      utility: Math.max(0, Math.min(1, utility)), 
      breakdown 
    };
  }, [answers]);

  const scoreResult = useMemo(() => calculateScore(), [calculateScore]);

  const generateAIInsight = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `En tant qu'expert santé, analyse ces résultats 13-MD : Score d'utilité globale de ${scoreResult.utility.toFixed(3)}. Les dimensions les plus touchées sont celles avec les scores les plus bas dans cette liste : ${scoreResult.breakdown.map(d => `${d.dimensionName}: ${d.score.toFixed(2)}`).join(', ')}. Fournis une interprétation courte et 3 recommandations de bien-être.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      
      setAiInsight(response.text || "Analyse terminée.");
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (e) {
      setAiInsight("L'analyse personnalisée est temporairement indisponible.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 font-sans antialiased text-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
        
        {step === 'intro' && (
          <div className="p-10 text-center flex-grow flex flex-col justify-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100 rotate-3">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tight">Outil de Santé 13-MD</h1>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed max-w-md mx-auto">
              Évaluez votre qualité de vie avec précision à travers 33 indicateurs validés scientifiquement.
            </p>
            <button 
              onClick={() => setStep('survey')}
              className="bg-blue-600 text-white py-4 px-10 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
            >
              Démarrer le questionnaire
            </button>
          </div>
        )}

        {step === 'survey' && currentItem && (
          <div className="flex flex-col h-full flex-grow animate-in slide-in-from-right-8 duration-500">
            <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Progression</span>
                <span className="text-xs font-bold text-slate-400">Question {currentItemIndex + 1} sur {totalQuestions}</span>
              </div>
              <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${((currentItemIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-8 flex-grow">
              <span className="inline-block px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase mb-3">
                {currentItem.dimensionName}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
                {currentItem.title}
              </h2>
              
              <div className="space-y-3">
                {currentItem.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center group relative overflow-hidden ${
                      answers[currentItem.id] === opt.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                      answers[currentItem.id] === opt.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300 group-hover:border-slate-400'
                    }`}>
                      {answers[currentItem.id] === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-semibold text-sm sm:text-base relative z-10">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 bg-white border-t flex justify-between items-center mt-auto">
              <button 
                onClick={handleBack}
                className="text-slate-400 font-bold hover:text-slate-700 transition-colors text-sm px-4"
              >
                Précédent
              </button>
              <button 
                disabled={!isCurrentAnswered}
                onClick={handleNext}
                className={`py-3.5 px-10 rounded-2xl font-bold transition-all transform ${
                  isCurrentAnswered 
                  ? 'bg-slate-900 text-white hover:bg-black hover:-translate-y-0.5 shadow-lg' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {currentItemIndex === totalQuestions - 1 ? 'Voir les résultats' : 'Question suivante'}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Indice d'Utilité Globale</h2>
              <div className="text-7xl font-black text-slate-900 tracking-tighter mb-4">
                {scoreResult.utility.toFixed(3)}
              </div>
              <div className="text-sm font-medium text-slate-500 max-w-xs mx-auto">
                {scoreResult.utility > 0.8 ? "Votre état de santé est excellent." : 
                 scoreResult.utility > 0.5 ? "Votre santé est dans la moyenne." : 
                 "Certaines dimensions nécessitent une attention particulière."}
              </div>
            </div>

            <div className="h-64 mb-12 bg-slate-50 rounded-3xl p-4 border border-slate-100 shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreResult.breakdown}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimensionName" tick={{ fontSize: 7, fill: '#64748b', fontWeight: 'bold' }} />
                  <Radar name="Santé" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white mb-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h3 className="font-black text-lg mb-4 flex items-center text-blue-400">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Analyse de l'expert IA
              </h3>
              {isAiLoading ? (
                <div className="flex space-x-2 py-6 items-center justify-center">
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed opacity-90 italic">
                  {aiInsight}
                </div>
              )}
              
              {sources.length > 0 && !isAiLoading && (
                <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-2">
                  {sources.map((s, i) => s.web && (
                    <a key={i} href={s.web.uri} target="_blank" rel="noreferrer" className="text-[9px] bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition">
                      {s.web.title}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => { setStep('intro'); setAnswers({}); setCurrentItemIndex(0); }}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-all active:scale-95"
            >
              Réinitialiser le questionnaire
            </button>
          </div>
        )}
      </div>
      <footer className="text-center mt-8 space-y-2">
        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
          © 2026 • Modèle Scientifique 13-MD • Université de Montréal
        </p>
        <p className="text-[8px] text-slate-300 max-w-xs mx-auto">
          Cet outil est fourni à titre informatif et ne remplace pas un diagnostic médical professionnel.
        </p>
      </footer>
    </div>
  );
};

export default App;
