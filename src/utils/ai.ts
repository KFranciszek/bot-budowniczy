import { SurveyFormData } from '../types';

// Call backend API for AI analysis
export const analyzeNeeds = async (surveyData: SurveyFormData): Promise<string> => {
  try {
    // Debug: sprawdź zmienne środowiskowe
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔍 Debug - Supabase URL:', supabaseUrl);
    console.log('🔍 Debug - Supabase Key exists:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Brak konfiguracji Supabase - używam fallback');
      return generateFallbackResponse(surveyData);
    }

    // Sprawdź czy URL kończy się poprawnie
    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
    const apiUrl = `${baseUrl}/functions/v1/analyze-needs`;
    
    console.log('🚀 Wywołuję API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ surveyData })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      
      // Jeśli funkcja nie istnieje, użyj fallback
      if (response.status === 404 || errorText.includes('requested path is invalid')) {
        console.warn('⚠️ Edge Function nie została znaleziona - używam fallback');
        return generateFallbackResponse(surveyData);
      }
      
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Otrzymano odpowiedź z API');
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.response;
  } catch (error) {
    console.error('💥 Backend API Error:', error);
    console.warn('⚠️ Przełączam na tryb fallback');
    // Fallback to local mock response if backend fails
    return generateFallbackResponse(surveyData);
  }
};

// Local fallback response when backend is unavailable
const generateFallbackResponse = (data: SurveyFormData): string => {
  const { what_looking_for, room_type, budget_range, quality_level } = data;
  
  return `## 🔍 ANALIZA POTRZEB (TRYB OFFLINE)

⚠️ **Uwaga**: Obecnie używamy trybu offline. Aby uzyskać prawdziwe rekomendacje AI, skonfiguruj Supabase Edge Function.

Szukasz **${what_looking_for}** do **${room_type.toLowerCase()}i** z budżetem **${budget_range}** w jakości **${quality_level.toLowerCase()}**.

## 💡 REKOMENDOWANE OPCJE

### 🥉 OPCJA EKONOMICZNA
**Produkt:** ${getProductName(what_looking_for, 'basic')}
**Cena:** ${getPrice(budget_range, 'low')} zł/m²
**Sklep:** Castorama
**Opis:** Solidna jakość w przystępnej cenie, idealna dla osób o ograniczonym budżecie.

### 🥈 OPCJA OPTYMALNA (POLECANA)
**Produkt:** ${getProductName(what_looking_for, 'optimal')}
**Cena:** ${getPrice(budget_range, 'mid')} zł/m²
**Sklep:** Leroy Merlin
**Opis:** Najlepszy stosunek jakości do ceny. Trwałość i estetyka w rozsądnej cenie.

### 🥇 OPCJA PREMIUM
**Produkt:** ${getProductName(what_looking_for, 'premium')}
**Cena:** ${getPrice(budget_range, 'high')} zł/m²
**Sklep:** OBI
**Opis:** Najwyższa jakość, długotrwałość i wyjątkowy design.

## 🛠️ PRAKTYCZNE PORADY

- **Przygotowanie:** ${getPracticalTip(room_type, 'preparation')}
- **Montaż:** ${getPracticalTip(room_type, 'installation')}
- **Konserwacja:** ${getPracticalTip(room_type, 'maintenance')}

## 💰 SZACUNKOWY KOSZT CAŁKOWITY

- **Opcja ekonomiczna:** ${getTotalCost(budget_range, 'low')} zł
- **Opcja optymalna:** ${getTotalCost(budget_range, 'mid')} zł
- **Opcja premium:** ${getTotalCost(budget_range, 'high')} zł

*Ceny zawierają materiały główne i pomocnicze. Koszt pracy może wynosić dodatkowo 30-50% wartości materiałów.*

---

## 🔧 JAK SKONFIGUROWAĆ PRAWDZIWE AI?

1. **Sprawdź plik .env.local** - czy zawiera poprawne klucze Supabase
2. **Wdróż Edge Function** - funkcja \`analyze-needs\` musi być aktywna w Supabase
3. **Dodaj klucz OpenAI** - w Settings → Edge Functions w panelu Supabase
4. **Przetestuj połączenie** - sprawdź logi w Edge Functions

Szczegółowe instrukcje znajdziesz w pliku \`SUPABASE_SETUP.md\`.`;
};

const getProductName = (product: string, tier: string): string => {
  const productMap: { [key: string]: { [key: string]: string } } = {
    basic: {
      'płytki': 'Ceramika Paradyż Basic',
      'farba': 'Farba Magnat Style',
      'panele': 'Panele Kronopol Basic'
    },
    optimal: {
      'płytki': 'Ceramika Tubądzin Royal',
      'farba': 'Farba Dulux EasyCare',
      'panele': 'Panele Quick-Step Impressive'
    },
    premium: {
      'płytki': 'Ceramika Marazzi Grande',
      'farba': 'Farba Benjamin Moore Advance',
      'panele': 'Panele Pergo Extreme'
    }
  };

  const key = Object.keys(productMap[tier]).find(k => 
    product.toLowerCase().includes(k.toLowerCase())
  ) || 'płytki';
  
  return productMap[tier][key];
};

const getPrice = (budget: string, tier: string): string => {
  const priceMap: { [key: string]: { [key: string]: string } } = {
    'do 1000zł': { low: '25-35', mid: '40-55', high: '60-80' },
    '1000-5000zł': { low: '35-45', mid: '50-70', high: '80-120' },
    '5000-10000zł': { low: '45-60', mid: '70-90', high: '120-180' },
    'powyżej 10000zł': { low: '60-80', mid: '90-130', high: '180-250' },
    'nie wiem': { low: '30-40', mid: '50-70', high: '80-120' }
  };

  return priceMap[budget]?.[tier] || '40-60';
};

const getTotalCost = (budget: string, tier: string): string => {
  const costMap: { [key: string]: { [key: string]: string } } = {
    'do 1000zł': { low: '800-1200', mid: '1200-1800', high: '1800-2500' },
    '1000-5000zł': { low: '1500-2500', mid: '2500-4000', high: '4000-6000' },
    '5000-10000zł': { low: '4000-6000', mid: '6000-8500', high: '8500-12000' },
    'powyżej 10000zł': { low: '8000-12000', mid: '12000-18000', high: '18000-25000' },
    'nie wiem': { low: '2000-3000', mid: '3000-5000', high: '5000-8000' }
  };

  return costMap[budget]?.[tier] || '2000-4000';
};

const getPracticalTip = (room: string, type: string): string => {
  const tips: { [key: string]: { [key: string]: string } } = {
    preparation: {
      'Łazienka': 'Sprawdź szczelność instalacji wodnej i wykonaj hydroizolację',
      'Kuchnia': 'Zabezpiecz instalację elektryczną i zaplanuj miejsca pod AGD',
      'Salon': 'Wyrównaj podłoże i sprawdź poziom podłogi',
      'Sypialnia': 'Zapewnij odpowiednią wentylację i izolację akustyczną',
      'Inne': 'Przygotuj podłoże zgodnie z wymaganiami producenta'
    },
    installation: {
      'Łazienka': 'Użyj wodoodpornych klejów i fug, zachowaj dylatacje',
      'Kuchnia': 'Zastosuj kleje odporne na tłuszcze i wysokie temperatury',
      'Salon': 'Rozpocznij montaż od środka pomieszczenia',
      'Sypialnia': 'Zachowaj ciszę podczas prac, pracuj etapami',
      'Inne': 'Przestrzegaj instrukcji producenta i norm bezpieczeństwa'
    },
    maintenance: {
      'Łazienka': 'Regularnie wietrz pomieszczenie i czyść fugi',
      'Kuchnia': 'Chroń przed tłuszczami i używaj odpowiednich środków',
      'Salon': 'Regularne odkurzanie i ochrona przed zarysowaniami',
      'Sypialnia': 'Utrzymuj odpowiednią wilgotność powietrza',
      'Inne': 'Regularna konserwacja zgodnie z zaleceniami producenta'
    }
  };

  return tips[type][room] || tips[type]['Inne'];
};