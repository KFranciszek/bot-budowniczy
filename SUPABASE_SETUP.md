# Przewodnik konfiguracji Supabase dla BOT Budowniczy

## 1. Utworzenie projektu Supabase

### Krok 1: Rejestracja i utworzenie projektu
1. Idź na [supabase.com](https://supabase.com)
2. Kliknij **"Start your project"**
3. Zaloguj się przez GitHub lub utwórz konto
4. Kliknij **"New project"**
5. Wybierz organizację (lub utwórz nową)
6. Wypełnij dane projektu:
   - **Name:** `bot-budowniczy`
   - **Database Password:** (wygeneruj silne hasło)
   - **Region:** `Central EU (Frankfurt)` (najbliżej Polski)
7. Kliknij **"Create new project"**

### Krok 2: Pobranie kluczy API
Po utworzeniu projektu:
1. Idź do **Settings > API**
2. Skopiuj:
   - **Project URL** (np. `https://abcdefgh.supabase.co`)
   - **anon public** key (zaczyna się od `eyJ...`)

## 2. Konfiguracja zmiennych środowiskowych

### Dla rozwoju lokalnego
Utwórz plik `.env.local` w głównym katalogu projektu:

```env
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Dla produkcji (Netlify/Vercel)
Dodaj te same zmienne w panelu administracyjnym platformy hostingowej.

## 3. Konfiguracja OpenAI API

### Krok 1: Uzyskanie klucza OpenAI
1. Idź na [platform.openai.com](https://platform.openai.com)
2. Zaloguj się lub utwórz konto
3. Idź do **API Keys**
4. Kliknij **"Create new secret key"**
5. Skopiuj klucz (zaczyna się od `sk-`)

### Krok 2: Dodanie klucza do Supabase
W panelu Supabase:
1. Idź do **Settings > Edge Functions**
2. W sekcji **Environment Variables** kliknij **"Add variable"**
3. Dodaj:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-twoj-klucz-openai`
4. Kliknij **"Save"**

## 4. Deploy Edge Function

### Opcja A: Przez Supabase CLI (zalecane)

#### Instalacja CLI
```bash
# macOS
brew install supabase/tap/supabase

# Windows (przez Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -fsSL https://github.com/supabase/cli/releases/download/v1.123.4/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

#### Logowanie i deploy
```bash
# Logowanie
supabase login

# Połączenie z projektem
supabase link --project-ref twoj-project-ref

# Deploy funkcji
supabase functions deploy analyze-needs
```

### Opcja B: Przez panel Supabase
1. Idź do **Edge Functions** w panelu Supabase
2. Kliknij **"Create a new function"**
3. Nazwij funkcję: `analyze-needs`
4. Skopiuj kod z pliku `supabase/functions/analyze-needs/index.ts`
5. Kliknij **"Deploy function"**

## 5. Testowanie konfiguracji

### Test 1: Sprawdzenie połączenia
W konsoli przeglądarki na stronie aplikacji:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing');
```

### Test 2: Test Edge Function
```bash
curl -X POST 'https://twoj-projekt.supabase.co/functions/v1/analyze-needs' \
  -H 'Authorization: Bearer twoj-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "surveyData": {
      "what_looking_for": "płytki łazienkowe",
      "room_type": "Łazienka",
      "budget_range": "1000-5000zł",
      "quality_level": "Dobra",
      "additional_info": "Mała łazienka 4m²"
    }
  }'
```

### Test 3: Test w aplikacji
1. Wypełnij ankietę w aplikacji
2. Sprawdź w **Edge Functions > Logs** czy funkcja się wykonała
3. Sprawdź czy otrzymujesz odpowiedź AI (nie fallback)

## 6. Monitorowanie i debugowanie

### Logi Edge Functions
1. Idź do **Edge Functions > analyze-needs**
2. Kliknij **"Logs"** aby zobaczyć wykonania funkcji
3. Sprawdź błędy i wydajność

### Metryki użycia
1. **Edge Functions > Usage** - liczba wywołań
2. **Settings > Usage** - zużycie zasobów
3. **Settings > Billing** - koszty

## 7. Bezpieczeństwo

### Row Level Security (RLS)
Jeśli planujesz przechowywać dane użytkowników:
```sql
-- Włącz RLS dla tabel
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Dodaj polityki bezpieczeństwa
CREATE POLICY "Users can read own surveys" ON surveys
  FOR SELECT USING (auth.uid() = user_id);
```

### Ograniczenia CORS
Edge Functions mają skonfigurowane CORS dla wszystkich domen (`*`). 
W produkcji rozważ ograniczenie do konkretnej domeny.

## 8. Optymalizacja kosztów

### Limity OpenAI
- Ustaw limity wydatków w OpenAI Dashboard
- Monitoruj użycie w **Usage** tab

### Limity Supabase
- Plan darmowy: 500,000 wywołań Edge Functions/miesiąc
- Plan Pro: $25/miesiąc za nieograniczone wywołania

## 9. Backup i monitoring

### Automatyczne backupy
Supabase automatycznie tworzy backupy bazy danych.

### Monitoring
- Skonfiguruj alerty w **Settings > Alerts**
- Monitoruj wydajność w **Reports**

## 10. Troubleshooting

### Częste problemy:

**Problem:** "Function not found"
**Rozwiązanie:** Sprawdź czy funkcja została wdrożona i czy URL jest poprawny

**Problem:** "Invalid API key"
**Rozwiązanie:** Sprawdź czy `OPENAI_API_KEY` jest poprawnie ustawiony w Edge Functions

**Problem:** "CORS error"
**Rozwiązanie:** Sprawdź czy nagłówki CORS są poprawnie ustawione w funkcji

**Problem:** "Timeout"
**Rozwiązanie:** OpenAI API może być wolne, zwiększ timeout lub dodaj retry logic

## 11. Następne kroki

Po skonfigurowaniu Supabase możesz:
1. Dodać autentykację użytkowników
2. Przechowywać historię analiz w bazie danych
3. Dodać więcej Edge Functions
4. Skonfigurować webhooks
5. Dodać real-time features

---

## Szybki checklist ✅

- [ ] Utworzony projekt Supabase
- [ ] Skopiowane klucze API
- [ ] Skonfigurowane zmienne środowiskowe (.env.local)
- [ ] Uzyskany klucz OpenAI API
- [ ] Dodany klucz OpenAI do Supabase Edge Functions
- [ ] Wdrożona funkcja analyze-needs
- [ ] Przetestowane połączenie
- [ ] Sprawdzone logi funkcji
- [ ] Aplikacja działa z prawdziwym AI (nie fallback)

Po wykonaniu wszystkich kroków aplikacja będzie w pełni funkcjonalna z prawdziwymi rekomendacjami AI!