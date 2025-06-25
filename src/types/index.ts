export interface Survey {
  id: string;
  what_looking_for: string;
  room_type: string;
  budget_range: string;
  quality_level: string;
  additional_info: string;
  created_date: Date;
}

export interface Analysis {
  id: string;
  survey_id: string;
  ai_response: string;
  status: 'pending' | 'completed' | 'failed';
  created_date: Date;
}

export interface SurveyFormData {
  what_looking_for: string;
  room_type: string;
  budget_range: string;
  quality_level: string;
  additional_info: string;
}