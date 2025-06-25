import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { SurveyFormData, Survey } from '../types';
import { saveSurvey } from '../utils/storage';

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SurveyFormData>({
    what_looking_for: '',
    room_type: '',
    budget_range: '',
    quality_level: '',
    additional_info: ''
  });

  const [errors, setErrors] = useState<Partial<SurveyFormData>>({});

  const roomOptions = [
    { value: '', label: 'Wybierz pomieszczenie' },
    { value: 'Łazienka', label: 'Łazienka' },
    { value: 'Kuchnia', label: 'Kuchnia' },
    { value: 'Salon', label: 'Salon' },
    { value: 'Sypialnia', label: 'Sypialnia' },
    { value: 'Inne', label: 'Inne' }
  ];

  const budgetOptions = [
    { value: '', label: 'Wybierz budżet' },
    { value: 'do 1000zł', label: 'do 1000zł' },
    { value: '1000-5000zł', label: '1000-5000zł' },
    { value: '5000-10000zł', label: '5000-10000zł' },
    { value: 'powyżej 10000zł', label: 'powyżej 10000zł' },
    { value: 'nie wiem', label: 'nie wiem' }
  ];

  const qualityOptions = [
    { value: 'Podstawowa', label: 'Podstawowa' },
    { value: 'Dobra', label: 'Dobra' },
    { value: 'Premium', label: 'Premium' }
  ];

  const handleInputChange = (field: keyof SurveyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SurveyFormData> = {};

    if (!formData.what_looking_for.trim()) {
      newErrors.what_looking_for = 'To pole jest wymagane';
    }
    if (!formData.room_type) {
      newErrors.room_type = 'Wybierz pomieszczenie';
    }
    if (!formData.budget_range) {
      newErrors.budget_range = 'Wybierz budżet';
    }
    if (!formData.quality_level) {
      newErrors.quality_level = 'Wybierz poziom jakości';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const survey: Survey = {
      id: Date.now().toString(),
      ...formData,
      created_date: new Date()
    };

    saveSurvey(survey);
    localStorage.setItem('current_survey_id', survey.id);
    navigate('/loading');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ankieta potrzeb
          </h1>
          <p className="text-gray-600">
            Odpowiedz na kilka pytań, aby otrzymać spersonalizowane rekomendacje
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* What looking for */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Czego szukasz? *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="np. płytki łazienkowe, farba do salonu"
                value={formData.what_looking_for}
                onChange={(e) => handleInputChange('what_looking_for', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  errors.what_looking_for ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.what_looking_for && (
              <p className="mt-1 text-sm text-red-600">{errors.what_looking_for}</p>
            )}
          </div>

          {/* Room type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pomieszczenie *
            </label>
            <div className="relative">
              <select
                value={formData.room_type}
                onChange={(e) => handleInputChange('room_type', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none ${
                  errors.room_type ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {roomOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.room_type && (
              <p className="mt-1 text-sm text-red-600">{errors.room_type}</p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Budżet *
            </label>
            <div className="relative">
              <select
                value={formData.budget_range}
                onChange={(e) => handleInputChange('budget_range', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none ${
                  errors.budget_range ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {budgetOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.budget_range && (
              <p className="mt-1 text-sm text-red-600">{errors.budget_range}</p>
            )}
          </div>

          {/* Quality level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Jakość *
            </label>
            <div className="space-y-3">
              {qualityOptions.map(option => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="quality_level"
                    value={option.value}
                    checked={formData.quality_level === option.value}
                    onChange={(e) => handleInputChange('quality_level', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.quality_level && (
              <p className="mt-1 text-sm text-red-600">{errors.quality_level}</p>
            )}
          </div>

          {/* Additional info */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dodatkowe informacje
            </label>
            <textarea
              placeholder="Opisz dodatkowe wymagania..."
              value={formData.additional_info}
              onChange={(e) => handleInputChange('additional_info', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Przeanalizuj potrzeby
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SurveyPage;