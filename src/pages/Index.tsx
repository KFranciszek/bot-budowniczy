import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Target } from 'lucide-react';
import Layout from '../components/Layout';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Eksperci materiałów',
      description: 'AI przeszkolone przez specjalistów branży budowlanej'
    },
    {
      icon: Clock,
      title: 'Dostępne 24/7',
      description: 'Uzyskaj rekomendacje o każdej porze dnia i nocy'
    },
    {
      icon: Target,
      title: 'Spersonalizowane',
      description: 'Dopasowane do Twojego budżetu i wymagań'
    }
  ];

  return (
    <Layout>
      <div className="text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            BOT Budowniczy
            <span className="block text-3xl md:text-4xl text-blue-600 mt-2">
              Inteligentny dobór materiałów budowlanych
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Eliminujemy bariery wiedzy technicznej - dostępne 24/7
          </p>
          
          <div className="pt-6">
            <button
              onClick={() => navigate('/survey')}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Rozpocznij ankietę
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 pt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Gotowy na inteligentne rekomendacje?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Wypełnij krótką ankietę i otrzymaj spersonalizowane porady
          </p>
          <button
            onClick={() => navigate('/survey')}
            className="inline-flex items-center px-6 py-3 text-lg font-semibold text-blue-600 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Zacznij teraz
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Index;