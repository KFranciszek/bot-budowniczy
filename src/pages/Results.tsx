import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, Wifi, WifiOff } from 'lucide-react';
import Layout from '../components/Layout';
import { Analysis } from '../types';
import { getAnalyses } from '../utils/storage';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analysisId = localStorage.getItem('current_analysis_id');
    if (!analysisId) {
      navigate('/survey');
      return;
    }

    const analyses = getAnalyses();
    const foundAnalysis = analyses.find(a => a.id === analysisId);
    
    if (!foundAnalysis || foundAnalysis.status !== 'completed') {
      navigate('/survey');
      return;
    }

    setAnalysis(foundAnalysis);
    setLoading(false);
  }, [navigate]);

  const handleNewAnalysis = () => {
    localStorage.removeItem('current_survey_id');
    localStorage.removeItem('current_analysis_id');
    navigate('/survey');
  };

  const getAnalysisSource = (response: string) => {
    if (response.includes('TRYB OFFLINE') || response.includes('tryb lokalny')) {
      return { type: 'offline', icon: WifiOff, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    } else {
      return { type: 'online', icon: Wifi, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
  };

  const formatResponse = (response: string) => {
    // Convert markdown-like formatting to HTML-like JSX
    const lines = response.split('\n');
    const formatted = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('## ')) {
        formatted.push(
          <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
            {line.replace('## ', '').replace(/^🔍|💡|🛠️|💰|🌐/, '').trim()}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        formatted.push(
          <h3 key={i} className="text-lg font-semibold text-gray-800 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        formatted.push(
          <p key={i} className="font-semibold text-gray-900 mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      } else if (line.startsWith('- ')) {
        formatted.push(
          <div key={i} className="flex items-start mb-2">
            <span className="text-blue-600 mr-2 mt-1">•</span>
            <span className="text-gray-700">{line.replace('- ', '').replace(/\*\*/g, '')}</span>
          </div>
        );
      } else if (line.startsWith('| ') && line.includes(' | ')) {
        // Handle table rows
        const cells = line.split(' | ').map(cell => cell.replace(/^\||\|$/g, '').trim());
        if (cells.length > 1) {
          formatted.push(
            <div key={i} className="grid grid-cols-6 gap-2 py-2 border-b border-gray-200 text-sm">
              {cells.map((cell, cellIndex) => (
                <div key={cellIndex} className={cellIndex === 0 ? 'font-medium' : ''}>
                  {cell}
                </div>
              ))}
            </div>
          );
        }
      } else if (line.startsWith('---')) {
        formatted.push(<hr key={i} className="my-6 border-gray-300" />);
      } else if (line.trim() && !line.startsWith('*') && !line.startsWith('|')) {
        // Handle special formatting for warnings and notes
        if (line.includes('⚠️') || line.includes('Uwaga')) {
          formatted.push(
            <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
              <p className="text-yellow-800">{line.replace(/\*\*/g, '')}</p>
            </div>
          );
        } else if (line.includes('✅') || line.includes('Korzyści')) {
          formatted.push(
            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
              <p className="text-green-800">{line.replace(/\*\*/g, '')}</p>
            </div>
          );
        } else {
          formatted.push(
            <p key={i} className="text-gray-700 mb-3 leading-relaxed">
              {line.replace(/\*\*/g, '')}
            </p>
          );
        }
      }
    }
    
    return formatted;
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center">
          <p>Ładowanie wyników...</p>
        </div>
      </Layout>
    );
  }

  if (!analysis) {
    return (
      <Layout>
        <div className="text-center">
          <p>Nie znaleziono wyników analizy.</p>
          <button
            onClick={handleNewAnalysis}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Rozpocznij nową ankietę
          </button>
        </div>
      </Layout>
    );
  }

  const source = getAnalysisSource(analysis.ai_response);
  const SourceIcon = source.icon;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Twoje spersonalizowane rekomendacje
            </h1>
            <div className="flex items-center space-x-4">
              <p className="text-gray-600">
                Analiza przygotowana {new Date(analysis.created_date).toLocaleDateString('pl-PL')}
              </p>
              
              {/* Source indicator */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${source.bg} ${source.border} ${source.color} border`}>
                <SourceIcon className="w-4 h-4 mr-2" />
                {source.type === 'offline' && 'Tryb offline'}
                {source.type === 'online' && 'AI Online'}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Pobierz PDF
            </button>
            <button
              onClick={handleNewAnalysis}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Nowa analiza
            </button>
          </div>
        </div>

        {/* Source explanation */}
        {source.type === 'offline' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <WifiOff className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-900 mb-1">Tryb offline</h3>
                <p className="text-orange-800 text-sm">
                  Rekomendacje oparte na lokalnej bazie wiedzy. Aby otrzymać aktualne ceny i dostępność produktów, 
                  skonfiguruj połączenie z internetem w ustawieniach Supabase.
                </p>
              </div>
            </div>
          </div>
        )}

        {source.type === 'online' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Wifi className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">AI Online</h3>
                <p className="text-blue-800 text-sm">
                  Rekomendacje przygotowane przez sztuczną inteligencję na podstawie Twoich potrzeb. 
                  Ceny mogą być szacunkowe.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            {formatResponse(analysis.ai_response)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć na stronę główną
          </button>
          <button
            onClick={handleNewAnalysis}
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Przeprowadź nową analizę
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ResultsPage;