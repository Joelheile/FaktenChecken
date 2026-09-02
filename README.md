# FaktenChecken

## 💡 Was ist das?

FaktenChecken ist ein kleines Projekt, das während einer spontanen Coding-Session entstanden ist. Wir haben uns die Frage gestellt: Wie können wir Kindern und Jugendlichen helfen, Fake News auf TikTok zu erkennen?

Das Ergebnis: Ein kostenloses Tool, mit dem du TikTok-Videos ganz einfach auf ihren Wahrheitsgehalt überprüfen kannst!

## 🎯 Warum wir das gemacht haben

Wir leben in einer Zeit, in der Falschinformationen überall sind - besonders in sozialen Medien wie TikTok. Für junge Menschen kann es echt schwer sein, zu erkennen, was wahr ist und was nicht.

Dieses Projekt soll:

- Kindern und Jugendlichen ein einfaches Werkzeug an die Hand geben
- Kritisches Denken fördern
- Spaß machen und gleichzeitig bilden
- Komplett kostenlos und für alle zugänglich sein

## 🚀 So funktioniert's

1. Kopiere einfach die URL eines TikTok-Videos
2. Füge sie in unser Tool ein
3. Klicke auf "Prüfen"
4. Schau dir an, was unser KI-System zum Inhalt sagt
5. Stelle Fragen, wenn du mehr wissen willst!

Das Tool analysiert, was im Video gesagt wird, und gibt dir eine Einschätzung, wie vertrauenswürdig die Informationen sind.

## 👋 Mach mit!

Dieses Projekt ist ein Herzensprojekt. Wenn du Ideen hast, wie wir es verbessern können, oder Fehler findest - lass es uns wissen!

Vielen Dank an die [Ernst-Schering-Schule Berlin](https://www.ernst-schering-schule.de/) für die Bildungspartnerschaft!

## 🤝 Hintergrund

Das Projekt ist im Reverse-Mentoring-Programm "Voneinander Lernen!" der [Liz Mohn Stiftung](https://liz-mohn-stiftung.de/projekt/voneinander-lernen/) entstanden. Junge Digital Natives aus dem Netzwerk [Digital8](https://www.digital8.ai/reversementoring) bilden dabei Tandems mit Lehrkräften und entwickeln gemeinsam ein digitales Projekt für die Schule. Dieses Tool ist das Ergebnis des Tandems an der Ernst-Schering-Schule Berlin.

## 🛠️ Lokal starten

```bash
npm install
cp .env.example .env
npm run dev:full
```

Trage in `.env` deine Keys ein: `APIFY_API_TOKEN` (TikTok-Transkript), `OPENAI_API_KEY` (Faktencheck). `DATABASE_URL` und `VITE_POSTHOG_API_KEY` sind optional (Analytics).

## 📄 Lizenz

MIT, siehe [LICENSE](LICENSE).

## 🔍 Hinweis

FaktenChecken ist ein Bildungsprojekt. Es hilft beim Nachdenken, ersetzt aber nicht dein eigenes kritisches Urteilsvermögen!
