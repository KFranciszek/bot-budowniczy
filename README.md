# BOT Budowniczy - Inteligentny dobór materiałów budowlanych

Aplikacja webowa pomagająca klientom indywidualnym w doborze odpowiednich materiałów budowlanych na podstawie ich potrzeb, budżetu i preferencji.

## Funkcjonalności

- 📋 **Ankieta potrzeb** - szczegółowy formularz zbierający informacje o projekcie
- 🤖 **Analiza AI** - inteligentne rekomendacje oparte na GPT-4 (backend)
- 💰 **Opcje cenowe** - propozycje w trzech kategoriach: ekonomiczna, optymalna, premium
- 🏪 **Konkretne sklepy** - rekomendacje z Castorama, Leroy Merlin, OBI
- 🛠️ **Praktyczne porady** - wskazówki dotyczące przygotowania, montażu i konserwacji

## Architektura

Aplikacja wykorzystuje **Supabase Edge Functions** do bezpiecznego przetwarzania zapytań AI:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **AI**: OpenAI GPT-4o-mini API (wywoływane z backendu)

## Konfiguracja backendu

### 1. Supabase Setup

Aby skonfigurować backend z funkcjami AI:

1. Utwórz projekt na [Supabase](https://supabase.com)
2. Zainstaluj Supabase CLI
3. Zaloguj się: `supabase login`
4. Połącz projekt: `supabase link --project-ref YOUR_PROJECT_ID`

### 2. Konfiguracja OpenAI API

W panelu Supabase, w sekcji **Settings > Edge Functions**, dodaj zmienną środowiskową:

```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Deploy Edge Function

```bash
supabase functions deploy analyze-needs
```

### 4. Konfiguracja frontendu

Utwórz plik `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Instalacja i uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Budowanie do produkcji
npm run build
```

## Struktura aplikacji

- `/` - Strona główna z opisem usługi
- `/survey` - Formularz ankiety potrzeb
- `/loading` - Strona przetwarzania z animacją ładowania
- `/results` - Wyniki analizy z rekomendacjami

## Bezpieczeństwo

✅ **Klucz OpenAI API** jest bezpiecznie przechowywany na backendzie  
✅ **Wszystkie wywołania AI** przechodzą przez Supabase Edge Functions  
✅ **Brak wrażliwych danych** w kodzie frontendu  
✅ **CORS** skonfigurowany dla bezpiecznych zapytań  

## Tryb offline

Aplikacja działa również bez konfiguracji backendu, używając wówczas przygotowanych szablonów odpowiedzi jako fallback.

## Deployment

### Frontend
- Netlify
- Vercel
- GitHub Pages

### Backend
- Supabase Edge Functions (automatyczny deploy)

Pamiętaj o skonfigurowaniu zmiennych środowiskowych na platformie hostingowej.

## Rozwój

Aby dodać nowe funkcjonalności AI:

1. Edytuj `supabase/functions/analyze-needs/index.ts`
2. Deploy: `supabase functions deploy analyze-needs`
3. Testuj endpoint w aplikacji

## Monitoring

Logi Edge Functions są dostępne w panelu Supabase w sekcji **Edge Functions > Logs**.