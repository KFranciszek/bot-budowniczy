# Przewodnik migracji z Bolt do Supabase

## 🎯 Cel
Przeniesienie aplikacji BOT Budowniczy z Bolt do działającego projektu Supabase.

## 📋 Wymagania wstępne
- ✅ Projekt Supabase utworzony
- ✅ Konto OpenAI z kluczem API
- ✅ Supabase CLI zainstalowane (opcjonalnie)

## 🚀 Krok 1: Pobranie kluczy z Supabase

### W panelu Supabase:
1. Idź do **Settings → API**
2. Skopiuj:
   - **Project URL**: `https://twoj-projekt.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

## 🔧 Krok 2: Konfiguracja zmiennych środowiskowych

### Utwórz plik `.env.local` w głównym katalogu:
```env
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🤖 Krok 3: Konfiguracja OpenAI API

### W panelu Supabase:
1. Idź do **Settings → Edge Functions**
2. W sekcji **Environment Variables** dodaj:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-twoj-klucz-openai`

## 📁 Krok 4: Wdrożenie Edge Function

### Opcja A: Przez Supabase CLI (zalecane)

```bash
# 1. Zaloguj się do Supabase
supabase login

# 2. Połącz z projektem (znajdź Reference ID w Settings → General)
supabase link --project-ref twoj-reference-id

# 3. Wdróż funkcję
supabase functions deploy analyze-needs
```

### Opcja B: Przez panel webowy

1. W panelu Supabase idź do **Edge Functions**
2. Kliknij **Create a new function**
3. Nazwa: `analyze-needs`
4. Skopiuj cały kod z pliku `supabase/functions/analyze-needs/index.ts`
5. Kliknij **Deploy function**

## 🧪 Krok 5: Testowanie konfiguracji

### Test 1: Sprawdź zmienne środowiskowe
W konsoli przeglądarki:
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'BRAK');
```

### Test 2: Test Edge Function przez curl
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
      "additional_info": "test"
    }
  }'
```

### Test 3: Test w aplikacji
1. Uruchom aplikację: `npm run dev`
2. Wypełnij ankietę
3. Sprawdź czy otrzymujesz prawdziwą odpowiedź AI (nie "tryb offline")

## 🔍 Krok 6: Debugowanie

### Sprawdź logi Edge Function:
1. W panelu Supabase: **Edge Functions → analyze-needs → Logs**
2. Szukaj błędów lub ostrzeżeń

### Typowe problemy:

**Problem**: "Function not found"
**Rozwiązanie**: Sprawdź czy funkcja została wdrożona i czy URL jest poprawny

**Problem**: "OpenAI API error"  
**Rozwiązanie**: Sprawdź czy `OPENAI_API_KEY` jest poprawnie ustawiony

**Problem**: Aplikacja pokazuje "tryb offline"
**Rozwiązanie**: Sprawdź zmienne środowiskowe i połączenie z Supabase

## 🌐 Krok 7: Wdrożenie na produkcję

### Netlify (zalecane):
1. Połącz repozytorium z Netlify
2. W **Site settings → Environment variables** dodaj:
   ```
   VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```
3. Deploy automatycznie się uruchomi

### Vercel:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

## ✅ Checklist końcowy

- [ ] Klucze Supabase skopiowane
- [ ] Plik `.env.local` utworzony
- [ ] Klucz OpenAI dodany do Supabase
- [ ] Edge Function wdrożona
- [ ] Testy przeszły pomyślnie
- [ ] Aplikacja działa z prawdziwym AI
- [ ] Produkcja skonfigurowana (opcjonalnie)

## 📊 Monitorowanie

### W panelu Supabase sprawdzaj:
- **Edge Functions → Usage**: liczba wywołań
- **Settings → Usage**: zużycie zasobów  
- **Edge Functions → Logs**: błędy i wydajność

### W OpenAI Dashboard:
- **Usage**: zużycie tokenów
- **Billing**: koszty API

## 💡 Następne kroki

Po udanej migracji możesz:
1. Dodać autentykację użytkowników
2. Przechowywać historię analiz w bazie danych
3. Dodać więcej funkcji AI
4. Skonfigurować monitoring i alerty

---

## 🆘 Potrzebujesz pomocy?

Jeśli napotkasz problemy:
1. Sprawdź logi w Supabase
2. Sprawdź konsole przeglądarki
3. Sprawdź czy wszystkie zmienne są ustawione
4. Przetestuj Edge Function osobno przez curl

Powodzenia z migracją! 🚀