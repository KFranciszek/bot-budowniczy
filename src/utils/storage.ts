import { Survey, Analysis } from '../types';

const SURVEYS_KEY = 'bot_budowniczy_surveys';
const ANALYSES_KEY = 'bot_budowniczy_analyses';

export const saveSurvey = (survey: Survey): void => {
  const surveys = getSurveys();
  surveys.push(survey);
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
};

export const getSurveys = (): Survey[] => {
  const data = localStorage.getItem(SURVEYS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAnalysis = (analysis: Analysis): void => {
  const analyses = getAnalyses();
  analyses.push(analysis);
  localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
};

export const getAnalyses = (): Analysis[] => {
  const data = localStorage.getItem(ANALYSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getAnalysisBySurveyId = (surveyId: string): Analysis | null => {
  const analyses = getAnalyses();
  return analyses.find(analysis => analysis.survey_id === surveyId) || null;
};

export const updateAnalysis = (id: string, updates: Partial<Analysis>): void => {
  const analyses = getAnalyses();
  const index = analyses.findIndex(analysis => analysis.id === id);
  if (index !== -1) {
    analyses[index] = { ...analyses[index], ...updates };
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
  }
};