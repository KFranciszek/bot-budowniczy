import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { Analysis } from '../types';
import { getSurveys, getAnalyses } from '../utils/storage';
import { analyzeNeeds } from '../utils/ai';

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const processAnalysis = async () => {
      const surveyId = localStorage.getItem('current_survey_id');
      if (!surveyId) {
        navigate('/survey');
        return;
      }

      const surveys = getSurveys();
      const survey = surveys.find(s => s.id === surveyId);
      if (!survey) {
        navigate('/survey');
        return;
      }

      try {
        // Create analysis record
        const analysis: Analysis = {
          id: Date.now().toString(),
          survey_id: surveyId,
          ai_response: '',
          status: 'pending',
          created_date: new Date()
        };

        // Update progress
        setProgress(25);

        // Save initial analysis
        const analyses = getAnalyses();
        analyses.push(analysis);
        localStorage.setItem('bot_budowniczy_analyses', JSON.stringify(analyses));

        setProgress(50);

        // Perform AI analysis via backend
        const aiResponse = await analyzeNeeds({
          what_looking_for: survey.what_looking_for,
          room_type: survey.room_type,
          budget_range: survey.budget_range,
          quality_level: survey.quality_level,
          additional_info: survey.additional_info
        });

        setProgress(75);

        // Update analysis with response
        const updatedAnalysis: Analysis = {
          ...analysis,
          ai_response: aiResponse,
          status: 'completed'
        };

        // Update the analysis in storage
        const updatedAnalyses = analyses.map(a => 
          a.id === analysis.id ? updatedAnalysis : a
        );
        localStorage.setItem('bot_budowniczy_analyses', JSON.stringify(updatedAnalyses));
        
        setProgress(100);
        localStorage.setItem('current_analysis_id', analysis.id);
        
        // Small delay to show completion
        setTimeout(() => {
          navigate('/results');
        }, 500);
      } catch (error) {
        console.error('Analysis failed:', error);
        setError('Wystąpił błąd podczas analizy. Spróbuj ponownie.');
      }
    };

    processAnalysis();
  }, [navigate]);

  const handleRetry = () => {
    setError(null);
    setProgress(0);
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate('/survey');
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-900 mb-2">
                Wystąpił błąd
              </h1>
              <p className="text-red-700 mb-4">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Spróbuj ponownie
                </button>
                <button
                  onClick={handleGoBack}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Wróć do ankiety
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Analizujemy Twoje potrzeby...
          </h1>
          <p className="text-lg text-gray-600">
            Nasz AI ekspert przygotowuje spersonalizowane rekomendacje
          </p>
        </div>

        <div className="py-12">
          <LoadingSpinner />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Analiza potrzeb</span>
              <span className="text-sm text-blue-600">
                {progress >= 25 ? '✓ Zakończona' : '⏳ W trakcie'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Wywołanie AI</span>
              <span className="text-sm text-blue-600">
                {progress >= 50 ? '✓ Zakończona' : progress >= 25 ? '⏳ W trakcie' : '⏳ Oczekuje'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Przygotowanie rekomendacji</span>
              <span className="text-sm text-blue-600">
                {progress >= 75 ? '✓ Zakończona' : progress >= 50 ? '⏳ W trakcie' : '⏳ Oczekuje'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Finalizacja</span>
              <span className="text-sm text-blue-600">
                {progress >= 100 ? '✓ Zakończona' : progress >= 75 ? '⏳ W trakcie' : '⏳ Oczekuje'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>✓ Bezpieczeństwo:</strong> Wszystkie wywołania AI są przetwarzane na bezpiecznym backendzie
          </p>
        </div>

        <p className="text-sm text-gray-500">
          Proces może potrwać do 30 sekund...
        </p>
      </div>
    </Layout>
  );
};

export default LoadingPage;