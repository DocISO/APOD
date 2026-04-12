# 🌌 APOD – Astronomy Picture of the Day

Eine installierbare Web-App (PWA) für das tägliche NASA-Astronomie-Bild – mit Erinnerungsfunktion.

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
