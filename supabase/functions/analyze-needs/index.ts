import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SurveyData {
  what_looking_for: string;
  room_type: string;
  budget_range: string;
  quality_level: string;
  additional_info: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { surveyData }: { surveyData: SurveyData } = await req.json()

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.log('OpenAI API key not configured, using fallback response')
      return new Response(
        JSON.stringify({ 
          response: generateFallbackResponse(surveyData),
          source: 'fallback'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Generate prompt for OpenAI
    const prompt = generatePrompt(surveyData)
    
    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        source: 'openai'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in analyze-needs function:', error)
    
    // Return fallback response on error
    const { surveyData } = await req.json().catch(() => ({ surveyData: null }))
    
    if (surveyData) {
      return new Response(
        JSON.stringify({ 
          response: generateFallbackResponse(surveyData),
          source: 'fallback',
          error: 'API temporarily unavailable'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function getSystemPrompt(): string {
  return `ROLA I CELE
Jesteś ekspertem ds. analizy potrzeb klientów i rekomendacji zakupowych w branży budowlanej. Twoim zadaniem jest przeprowadzenie trzystopniowej analizy potrzeb klienta i dostarczenie konkretnych, praktycznych rekomendacji produktowych.

KROK 1: ANALIZA POTRZEB KLIENTA
Zadania w tym kroku:
- Przeanalizuj potrzeby klienta na podstawie podanych informacji
- Zidentyfikuj kluczowe wymagania techniczne
- Określ specyfikę pomieszczenia i jego wymagania
- Uwzględnij budżet i oczekiwania jakościowe
- Zidentyfikuj potencjalne wyzwania i ograniczenia

Format outputu Kroku 1:
## ANALIZA POTRZEB KLIENTA

**Identyfikacja potrzeb:**
- [szczegółowa analiza tego czego szuka klient]

**Wymagania techniczne:**
- [specyfikacja techniczna dla danego pomieszczenia]

**Budżet i jakość:**
- [analiza budżetu w kontekście oczekiwań jakościowych]

**Potencjalne wyzwania:**
- [identyfikacja możliwych problemów i ograniczeń]

KROK 2: PROPOZYCJE PRODUKTOWE
Zadania w tym kroku:
- Zaproponuj 3 warianty produktowe (ekonomiczny, optymalny, premium)
- Dla każdego wariantu podaj konkretne produkty dostępne w Polsce
- Uwzględnij sklepy budowlane: Castorama, Leroy Merlin, OBI
- Podaj realistyczne ceny w złotych polskich
- Uwzględnij materiały główne i pomocnicze

Format outputu Kroku 2:
## PROPOZYCJE PRODUKTOWE

### WARIANT EKONOMICZNY
**Całkowity koszt: [X PLN]**

| Produkt | Model/Marka | Cena | Sklep | Uwagi |
|---------|-------------|------|-------|-------|
| [nazwa] | [model]     | [PLN]| [sklep]| [uwagi]|

### WARIANT OPTYMALNY (POLECANY)
**Całkowity koszt: [X PLN]**

[analogiczna tabela]

### WARIANT PREMIUM
**Całkowity koszt: [X PLN]**

[analogiczna tabela]

KROK 3: REKOMENDACJE PRODUKTOWE
Zadania w tym kroku:
- Wybierz najlepszy wariant dla klienta
- Uzasadnij wybór
- Podaj szczegółowe instrukcje zakupu i montażu
- Uwzględnij aspekty bezpieczeństwa
- Dodaj praktyczne porady

Format outputu Kroku 3:
## REKOMENDACJE PRODUKTOWE

### NAJLEPSZA OPCJA DLA CIEBIE
**Wybrany wariant:** [ekonomiczny/optymalny/premium]

**Uzasadnienie wyboru:**
[dlaczego ten wariant jest najlepszy dla klienta]

### SZCZEGÓŁOWE INSTRUKCJE

#### LISTA ZAKUPÓW
1. [produkt 1] - [ilość] - [sklep] - [cena]
2. [produkt 2] - [ilość] - [sklep] - [cena]

#### PRZYGOTOWANIE
- [kroki przygotowawcze]

#### MONTAŻ
- [instrukcje montażu krok po kroku]

#### BEZPIECZEŃSTWO
- [zasady bezpieczeństwa]

#### KONSERWACJA
- [porady dotyczące konserwacji]

DODATKOWE WYTYCZNE:
- Używaj konkretnych nazw produktów i marek dostępnych w Polsce
- Podawaj realistyczne ceny aktualne na rok 2024/2025
- Uwzględniaj polskie normy i przepisy budowlane
- Pisz w sposób zrozumiały dla laika
- Dodawaj praktyczne porady i wskazówki
- Uwzględniaj sezonowość i dostępność produktów`
}

function generatePrompt(data: SurveyData): string {
  return `WYWIAD Z KLIENTEM:

DANE KLIENTA:
- Czego szuka: ${data.what_looking_for}
- Pomieszczenie: ${data.room_type}
- Budżet: ${data.budget_range}
- Poziom jakości: ${data.quality_level}
- Dodatkowe informacje: ${data.additional_info || 'Brak'}

Przeprowadź kompletną trzystopniową analizę zgodnie z instrukcjami systemowymi. Uwzględnij wszystkie 3 kroki:
1. ANALIZA POTRZEB KLIENTA
2. PROPOZYCJE PRODUKTOWE
3. REKOMENDACJE PRODUKTOWE

Pamiętaj o:
- Konkretnych produktach dostępnych w Polsce
- Realistycznych cenach w złotych
- Praktycznych instrukcjach montażu
- Aspektach bezpieczeństwa
- Polskich przepisach i normach`
}

function generateFallbackResponse(data: SurveyData): string {
  const { what_looking_for, room_type, budget_range, quality_level } = data
  
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

Szczegółowe instrukcje znajdziesz w pliku \`SUPABASE_SETUP.md\`.`
}

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
  }

  const key = Object.keys(productMap[tier]).find(k => 
    product.toLowerCase().includes(k.toLowerCase())
  ) || 'płytki'
  
  return productMap[tier][key]
}

const getPrice = (budget: string, tier: string): string => {
  const priceMap: { [key: string]: { [key: string]: string } } = {
    'do 1000zł': { low: '25-35', mid: '40-55', high: '60-80' },
    '1000-5000zł': { low: '35-45', mid: '50-70', high: '80-120' },
    '5000-10000zł': { low: '45-60', mid: '70-90', high: '120-180' },
    'powyżej 10000zł': { low: '60-80', mid: '90-130', high: '180-250' },
    'nie wiem': { low: '30-40', mid: '50-70', high: '80-120' }
  }

  return priceMap[budget]?.[tier] || '40-60'
}

const getTotalCost = (budget: string, tier: string): string => {
  const costMap: { [key: string]: { [key: string]: string } } = {
    'do 1000zł': { low: '800-1200', mid: '1200-1800', high: '1800-2500' },
    '1000-5000zł': { low: '1500-2500', mid: '2500-4000', high: '4000-6000' },
    '5000-10000zł': { low: '4000-6000', mid: '6000-8500', high: '8500-12000' },
    'powyżej 10000zł': { low: '8000-12000', mid: '12000-18000', high: '18000-25000' },
    'nie wiem': { low: '2000-3000', mid: '3000-5000', high: '5000-8000' }
  }

  return costMap[budget]?.[tier] || '2000-4000'
}

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
  }

  return tips[type][room] || tips[type]['Inne']
}