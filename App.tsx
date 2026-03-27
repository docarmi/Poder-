
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from 'recharts';
import { QUESTIONNAIRE, COEFFICIENTS } from './constants';
import { UserAnswers, ScoreResult, GroundingChunk, Demographics, HealthData } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'demographics' | 'health' | 'survey' | 'results'>('intro');
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [demographics, setDemographics] = useState<Demographics>({ 
    gender: '', 
    ageRange: '', 
    maritalStatus: '', 
    occupation: '', 
    education: '', 
    income: '', 
    livesWithAdult: '', 
    region: '', 
    ethnicGroup: '', 
    responsibleForChildren: '',
    patientId: '' 
  });
  const [healthData, setHealthData] = useState<HealthData>({
    isSmoker: '',
    hasChronicCondition: '',
    conditions: [],
    generalHealth: '',
    consultations: {
      familyDoctor: '',
      specialist: '',
      nurse: '',
      pharmacist: '',
      dentist: '',
      other: '',
    }
  });
  const [answers, setAnswers] = useState<UserAnswers>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, currentDimensionIndex]);

  const totalDimensions = QUESTIONNAIRE.length;
  const currentDimension = QUESTIONNAIRE[currentDimensionIndex];
  
  const isDimensionAnswered = useMemo(() => {
    if (!currentDimension) return false;
    return currentDimension.items.every(item => answers[item.id] !== undefined);
  }, [currentDimension, answers]);

  const handleSelect = (itemId: string, level: number) => {
    setAnswers(prev => ({ ...prev, [itemId]: level }));
  };

  const handleNext = () => {
    if (step === 'demographics') {
      setStep('health');
      return;
    }
    if (step === 'health') {
      setStep('survey');
      return;
    }
    if (currentDimensionIndex < totalDimensions - 1) {
      setCurrentDimensionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep('results');
    }
  };

  const handleBack = () => {
    if (step === 'survey') {
      if (currentDimensionIndex > 0) {
        setCurrentDimensionIndex(prev => prev - 1);
      } else {
        setStep('health');
      }
    } else if (step === 'health') {
      setStep('demographics');
    } else if (step === 'demographics') {
      setStep('intro');
    }
  };

  const calculateScore = useCallback((): ScoreResult => {
    let utility = 1.0;
    const dimensionImpacts: Record<string, number> = {};

    QUESTIONNAIRE.forEach(d => {
      dimensionImpacts[d.name] = 1.0;
      d.items.forEach(item => {
        const level = answers[item.id];
        if (level && level > 1) {
          const coef = COEFFICIENTS[item.id]?.[level] || 0;
          utility += coef;
          dimensionImpacts[d.name] += coef;
        }
      });
    });

    const breakdown = Object.entries(dimensionImpacts).map(([name, val]) => ({
      dimensionName: name,
      score: Math.max(-1, val)
    }));

    return { utility, breakdown };
  }, [answers]);

  const scoreResult = useMemo(() => calculateScore(), [calculateScore]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 font-sans antialiased text-slate-900">
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
              onClick={() => setStep('demographics')}
              className="bg-blue-600 text-white py-4 px-10 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
            >
              Démarrer le questionnaire
            </button>
          </div>
        )}

        {step === 'demographics' && (
          <div key="demographics" className="p-8 flex-grow flex flex-col animate-in slide-in-from-right-8 duration-500 overflow-y-auto max-h-[80vh]">
            <h2 className="text-3xl font-black mb-8">Données Démographiques</h2>
            <div className="space-y-8 flex-grow">
              
              {/* Section 1: Identité et Âge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">ID Patient (Optionnel)</label>
                  <input 
                    type="text" 
                    value={demographics.patientId}
                    onChange={(e) => setDemographics(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="Ex: P-12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Âge</label>
                  <select 
                    value={demographics.ageRange}
                    onChange={(e) => setDemographics(prev => ({ ...prev, ageRange: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="17 ans et moins">17 ans et moins</option>
                    <option value="18-20">18-20 ans</option>
                    <option value="21-30">21-30 ans</option>
                    <option value="31-40">31-40 ans</option>
                    <option value="41-50">41-50 ans</option>
                    <option value="51-60">51-60 ans</option>
                    <option value="61-70">61-70 ans</option>
                    <option value="71-80">71-80 ans</option>
                    <option value="81-90">81-90 ans</option>
                    <option value="91 ans et plus">91 ans et plus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Genre</label>
                  <select 
                    value={demographics.gender}
                    onChange={(e) => setDemographics(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Un homme">Un homme</option>
                    <option value="Une femme">Une femme</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">État Civil</label>
                  <select 
                    value={demographics.maritalStatus}
                    onChange={(e) => setDemographics(prev => ({ ...prev, maritalStatus: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié(e)/Conjoint(e)">Marié(e)/Conjoint(e)</option>
                    <option value="Séparé(e)/divorcé(e)">Séparé(e)/divorcé(e)</option>
                    <option value="Veuf (veuve)">Veuf (veuve)</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Occupation et Éducation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Occupation Principale</label>
                  <select 
                    value={demographics.occupation}
                    onChange={(e) => setDemographics(prev => ({ ...prev, occupation: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Employé ou travailleur autonome">Employé ou travailleur autonome</option>
                    <option value="Retraité ou semi-retraité">Retraité ou semi-retraité</option>
                    <option value="À la maison">À la maison</option>
                    <option value="Étudiant">Étudiant</option>
                    <option value="Sans emploi">Sans emploi</option>
                    <option value="Congé maladie">Congé maladie</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Niveau d'Éducation</label>
                  <select 
                    value={demographics.education}
                    onChange={(e) => setDemographics(prev => ({ ...prev, education: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Primaire">Primaire</option>
                    <option value="Secondaire">Secondaire</option>
                    <option value="DEP">DEP</option>
                    <option value="Collégial">Collégial</option>
                    <option value="CÉGEP">CÉGEP</option>
                    <option value="Baccalauréat">Baccalauréat</option>
                    <option value="Certificat Universitaire">Certificat Universitaire</option>
                    <option value="Maîtrise">Maîtrise</option>
                    <option value="Doctorat universitaire">Doctorat universitaire</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Section 3: Revenu et Ménage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Revenu Annuel Brut</label>
                  <select 
                    value={demographics.income}
                    onChange={(e) => setDemographics(prev => ({ ...prev, income: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="< 5 000 $">&lt; 5 000 $</option>
                    <option value="5-9 999 $">5-9 999 $</option>
                    <option value="10-14 999 $">10-14 999 $</option>
                    <option value="15-19 999 $">15-19 999 $</option>
                    <option value="20-24 999 $">20-24 999 $</option>
                    <option value="25-34 999 $">25-34 999 $</option>
                    <option value="35-44 999 $">35-44 999 $</option>
                    <option value="45-54 999 $">45-54 999 $</option>
                    <option value="55-64 999 $">55-64 999 $</option>
                    <option value="65-74 999 $">65-74 999 $</option>
                    <option value="75-84 999 $">75-84 999 $</option>
                    <option value="85-99 999 $">85-99 999 $</option>
                    <option value="100-119 999 $">100-119 999 $</option>
                    <option value="120-149 900 $">120-149 900 $</option>
                    <option value="≥ 150 000 $">≥ 150 000 $</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Vivez-vous avec un autre adulte ?</label>
                  <div className="flex space-x-4">
                    {['Oui', 'Non'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setDemographics(prev => ({ ...prev, livesWithAdult: opt }))}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                          demographics.livesWithAdult === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Région et Identité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Région Administrative</label>
                  <select 
                    value={demographics.region}
                    onChange={(e) => setDemographics(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Bas-Saint-Laurent">Bas-Saint-Laurent</option>
                    <option value="Saguenay–Lac-Saint-Jean">Saguenay–Lac-Saint-Jean</option>
                    <option value="Capitale-Nationale">Capitale-Nationale</option>
                    <option value="Mauricie">Mauricie</option>
                    <option value="Estrie">Estrie</option>
                    <option value="Montréal">Montréal</option>
                    <option value="Outaouais">Outaouais</option>
                    <option value="Abitibi-Témiscamingue">Abitibi-Témiscamingue</option>
                    <option value="Côte-Nord">Côte-Nord</option>
                    <option value="Nord-du-Québec">Nord-du-Québec</option>
                    <option value="Gaspésie–Îles-de-la-Madeleine">Gaspésie–Îles-de-la-Madeleine</option>
                    <option value="Chaudière-Appalaches">Chaudière-Appalaches</option>
                    <option value="Laval">Laval</option>
                    <option value="Lanaudière">Lanaudière</option>
                    <option value="Laurentides">Laurentides</option>
                    <option value="Montérégie">Montérégie</option>
                    <option value="Centre-du-Québec">Centre-du-Québec</option>
                    <option value="Extérieur au Québec">Extérieur au Québec</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Groupe d'Identification</label>
                  <select 
                    value={demographics.ethnicGroup}
                    onChange={(e) => setDemographics(prev => ({ ...prev, ethnicGroup: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Blanc">Blanc</option>
                    <option value="Sud-Asiatique">Sud-Asiatique</option>
                    <option value="Chinois">Chinois</option>
                    <option value="Noir">Noir</option>
                    <option value="Philippin">Philippin</option>
                    <option value="Latino-Américain">Latino-Américain</option>
                    <option value="Arabe">Arabe</option>
                    <option value="Asiatique du Sud-Est">Asiatique du Sud-Est</option>
                    <option value="Asiatique occidental">Asiatique occidental</option>
                    <option value="Coréen">Coréen</option>
                    <option value="Japonais">Japonais</option>
                    <option value="Autochtone d’Amérique du Nord">Autochtone d’Amérique du Nord</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Section 5: Enfants */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Responsable d’enfants de moins de 18 ans ?</label>
                <div className="flex space-x-4">
                  {['Oui', 'Non'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setDemographics(prev => ({ ...prev, responsibleForChildren: opt }))}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                        demographics.responsibleForChildren === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

            </div>
            <div className="pt-10 flex justify-between items-center bg-white sticky bottom-0 py-4 border-t mt-4">
              <button onClick={() => setStep('intro')} className="text-slate-400 font-bold hover:text-slate-700">Retour</button>
              <button 
                disabled={Object.values(demographics).some(v => v === '' && v !== demographics.patientId)}
                onClick={handleNext}
                className={`py-4 px-10 rounded-2xl font-bold transition-all ${
                  !Object.values(demographics).some(v => v === '' && v !== demographics.patientId) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {step === 'health' && (
          <div key="health" className="p-8 flex-grow flex flex-col animate-in slide-in-from-right-8 duration-500 overflow-y-auto max-h-[80vh]">
            <h2 className="text-3xl font-black mb-8">Santé</h2>
            <div className="space-y-8 flex-grow">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Êtes-vous fumeur ?</label>
                  <div className="flex space-x-4">
                    {['Oui', 'Non'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setHealthData(prev => ({ ...prev, isSmoker: opt }))}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                          healthData.isSmoker === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Santé générale</label>
                  <select 
                    value={healthData.generalHealth}
                    onChange={(e) => setHealthData(prev => ({ ...prev, generalHealth: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Excellente">Excellente</option>
                    <option value="Très bonne">Très bonne</option>
                    <option value="Bonne">Bonne</option>
                    <option value="Passable">Passable</option>
                    <option value="Mauvaise">Mauvaise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Souffrez-vous d’une maladie ou d’un problème physique ou mental qui réduit votre qualité de vie ?</label>
                <div className="flex space-x-4 mb-4">
                  {['Oui', 'Non'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setHealthData(prev => ({ ...prev, hasChronicCondition: opt, conditions: opt === 'Non' ? [] : prev.conditions }))}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                        healthData.hasChronicCondition === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                
                {healthData.hasChronicCondition === 'Oui' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Cochez tout ce qui s’applique :</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Fatigue', 'Hypertension', 'Douleur', 'Maladie du cœur', 'Insomnie', 'Arthrose', 
                        'Anxiété/stress', 'Arthrite', 'Dépression', 'Accident vasculaire cérébral', 
                        'Autre trouble mental', 'Problème digestif', 'Problème musculosquelettique', 'Diabète', 
                        'Blessure non intentionnelle', 'Cancer', 'Maladie du système nerveux', 'MPOC', 
                        'Problème thyroïdien', 'Autre problème respiratoire', 'Problème génito-urinaire', 
                        'Allergie', 'Problème rénal', 'Problème dermatologique', 'Problème de vision', 'Autre problème médical'
                      ].map(cond => (
                        <label key={cond} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={healthData.conditions.includes(cond)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setHealthData(prev => ({ ...prev, conditions: [...prev.conditions, cond] }));
                              } else {
                                setHealthData(prev => ({ ...prev, conditions: prev.conditions.filter(c => c !== cond) }));
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-medium text-slate-600">{cond}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-4">Consultations au cours des six derniers mois :</label>
                <div className="space-y-3">
                  {[
                    { id: 'familyDoctor', label: 'Médecin de famille' },
                    { id: 'specialist', label: 'Médecin spécialiste' },
                    { id: 'nurse', label: 'Infirmière' },
                    { id: 'pharmacist', label: 'Pharmacien' },
                    { id: 'dentist', label: 'Dentiste' },
                    { id: 'other', label: 'Autre professionnel de la santé' }
                  ].map(prof => (
                    <div key={prof.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs font-bold text-slate-700">{prof.label}</span>
                      <div className="flex space-x-2">
                        {['Oui', 'Non'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setHealthData(prev => ({ 
                              ...prev, 
                              consultations: { ...prev.consultations, [prof.id]: opt } 
                            }))}
                            className={`px-4 py-1.5 rounded-lg border-2 text-[10px] font-black transition-all ${
                              healthData.consultations[prof.id as keyof typeof healthData.consultations] === opt 
                              ? 'border-blue-500 bg-blue-500 text-white' 
                              : 'border-slate-200 bg-white text-slate-400'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="pt-10 flex justify-between items-center bg-white sticky bottom-0 py-4 border-t mt-4">
              <button onClick={handleBack} className="text-slate-400 font-bold hover:text-slate-700">Retour</button>
              <button 
                disabled={!healthData.isSmoker || !healthData.generalHealth || !healthData.hasChronicCondition}
                onClick={handleNext}
                className={`py-4 px-10 rounded-2xl font-bold transition-all ${
                  (healthData.isSmoker && healthData.generalHealth && healthData.hasChronicCondition) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {step === 'survey' && currentDimension && (
          <div className="flex flex-col h-full flex-grow animate-in slide-in-from-right-8 duration-500">
            <div className="bg-slate-50 px-8 py-6 border-b flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dimension {currentDimensionIndex + 1} / {totalDimensions}</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">{currentDimension.name}</span>
              </div>
              <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${((currentDimensionIndex + 1) / totalDimensions) * 100}%` }}
                ></div>
              </div>
            </div>

            <div key={currentDimensionIndex} className="p-8 flex-grow overflow-y-auto max-h-[600px]">
              <div className="space-y-12">
                {currentDimension.items.map(item => (
                  <div key={item.id} className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
                    {item.description && <p className="text-sm text-slate-400 italic">{item.description}</p>}
                    <div className="grid grid-cols-1 gap-2">
                      {item.options.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(item.id, opt.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group ${
                            answers[item.id] === opt.id 
                            ? 'border-blue-500 bg-blue-50 text-blue-900' 
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            answers[item.id] === opt.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                          }`}>
                            {answers[item.id] === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                          </div>
                          <span className="text-sm font-semibold">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-white border-t flex justify-between items-center mt-auto">
              <button onClick={handleBack} className="text-slate-400 font-bold hover:text-slate-700 text-sm px-4">Précédent</button>
              <button 
                disabled={!isDimensionAnswered}
                onClick={handleNext}
                className={`py-3.5 px-10 rounded-2xl font-bold transition-all ${
                  isDimensionAnswered ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {currentDimensionIndex === totalDimensions - 1 ? 'Voir les résultats' : 'Dimension suivante'}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-10">
              <div className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                Rapport de Santé 13-MD
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Votre Score d'Utilité</h2>
              <div className="flex items-center justify-center space-x-4">
                <span className={`text-6xl font-black ${scoreResult.utility > 0.8 ? 'text-emerald-500' : scoreResult.utility > 0.5 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {scoreResult.utility.toFixed(3)}
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase">Échelle</p>
                  <p className="text-sm font-bold text-slate-600">1.000 = Santé Parfaite</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Explication du score au 13-MD</h3>
              <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                <p>
                  Le score que vous avez obtenu se situe entre <strong>-7,5 et 1</strong>.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 flex-shrink-0"></span>
                    <span><strong>1.000</strong> : État de santé parfait.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 flex-shrink-0"></span>
                    <span><strong>0.000</strong> : État de santé proche de la mort (ex. état végétatif, coma).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 flex-shrink-0"></span>
                    <span><strong>Score négatif</strong> : État de santé jugé par les Québécois comme <strong>pire que la mort</strong>.</span>
                  </li>
                </ul>
                <p className="pt-2 border-t border-slate-200 italic text-[10px]">
                  Pour vous aider à vous situer par rapport à une personne de la population générale du Québec ayant le même âge et genre que vous, veuillez consulter le tableau de référence.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Signification des Couleurs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-emerald-100">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs font-bold text-emerald-700">Excellent (&gt; 0.8)</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-amber-100">
                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                  <span className="text-xs font-bold text-amber-700">Moyen (0.5 - 0.8)</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-rose-100">
                  <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
                  <span className="text-xs font-bold text-rose-700">Critique (&lt; 0.5)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Équilibre de Vie</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreResult.breakdown}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dimensionName" tick={{ fontSize: 8, fill: '#94a3b8' }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button 
              onClick={() => {
                setStep('intro');
                setAnswers({});
                setCurrentDimensionIndex(0);
                setDemographics({ 
                  gender: '', 
                  ageRange: '', 
                  maritalStatus: '', 
                  occupation: '', 
                  education: '', 
                  income: '', 
                  livesWithAdult: '', 
                  region: '', 
                  ethnicGroup: '', 
                  responsibleForChildren: '',
                  patientId: '' 
                });
                setHealthData({
                  isSmoker: '',
                  hasChronicCondition: '',
                  conditions: [],
                  generalHealth: '',
                  consultations: {
                    familyDoctor: '',
                    specialist: '',
                    nurse: '',
                    pharmacist: '',
                    dentist: '',
                    other: '',
                  }
                });
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-[0.98]"
            >
              Recommencer l'évaluation
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
