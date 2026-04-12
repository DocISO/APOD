# 🌌 APOD – Astronomy Picture of the Day

Eine installierbare Web-App (PWA) für das tägliche NASA-Astronomie-Bild – mit Erinnerungsfunktion.

---

## Installation auf Android (in 3 Schritten)

### Option A – GitHub Pages (kostenlos, empfohlen)

1. **GitHub-Konto erstellen** (falls noch nicht vorhanden): https://github.com
2. **Neues Repository anlegen** → „apod-app" → Public
3. **Alle Dateien hochladen** (index.html, sw.js, manifest.json, icon-192.png, icon-512.png)
4. **Settings → Pages → Branch: main → Save**
5. **URL aufrufen** (z. B. `https://deinname.github.io/apod-app`)
6. In Chrome: **Menü (⋮) → „Zum Startbildschirm hinzufügen"**

### Option B – Netlify Drop (noch einfacher)

1. Gehe zu https://app.netlify.com/drop
2. **Ziehe den apod-app-Ordner** auf die Seite
3. Netlify gibt dir sofort eine HTTPS-URL
4. Diese URL in Chrome öffnen → installieren

---

## Features

- 🌠 **Tägliches APOD-Bild** direkt von der NASA API
- 🔔 **Tägliche Erinnerung** zur selbst gewählten Uhrzeit
- 📵 **Offline-fähig** – zuletzt geladenes Bild bleibt verfügbar
- 🔑 **Kostenloser NASA-API-Key** bei api.nasa.gov (optional)
- 📱 **Installierbar** auf Android-Homescreen

---

## NASA API-Key (optional)

Der Standard-Key `DEMO_KEY` ist auf 30 Anfragen/Stunde limitiert.  
Für unbegrenzte Nutzung: Kostenlosen Key auf https://api.nasa.gov generieren,  
dann in der App unter ⚙ Einstellungen eintragen.

---

## Dateien

| Datei | Beschreibung |
|-------|-------------|
| index.html | Haupt-App |
| sw.js | Service Worker (Offline + Notifications) |
| manifest.json | PWA-Manifest |
| icon-192.png | App-Icon 192×192 |
| icon-512.png | App-Icon 512×512 |
