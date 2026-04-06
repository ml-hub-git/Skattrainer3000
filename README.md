# Skat Trainer

Ein Kopfrechentrainer für das Skatblatt – portiert aus Excel/VBA nach HTML/CSS/JavaScript.

## Spielregeln

1. Klicke **Start** – 32 Karten werden gemischt
2. Jede Runde werden **3 Karten** in die Tischmitte gelegt
3. Der rote Pfeil zeigt, welcher Partei die Punkte dieser Runde gutgeschrieben werden
4. Nach **10 Runden** erscheint der **Lösen**-Button
5. Trage deine geschätzten Punkte für beide Parteien ein und klicke **Lösen**
6. Nur bei exaktem Treffer beider Parteien zählt es als Sieg!

## Kartenpunkte

| Karte | Punkte |
|-------|--------|
| A     | 11     |
| 10    | 10     |
| K     | 4      |
| D     | 3      |
| B     | 2      |
| 7,8,9 | 0      |

**Gesamtpunkte immer: 120** (verteilt auf Partei A, Partei B und den Skat)

## Rangsystem

| Rang               | Benötigte Siege in Serie |
|--------------------|--------------------------|
| Anfänger           | 0                        |
| Skat-Bauer         | 1                        |
| Kneipen-Dübler     | 6                        |
| Kreuz-Bube         | 12                       |
| Skat-Meister       | 36                       |
| Skat-Großmeister   | 72                       |
| König Skat der I.  | 180                      |

---

## 🚀 Deployment auf GitHub Pages

### Schritt 1 – Repository erstellen

1. Gehe zu [github.com](https://github.com) und melde dich an
2. Klicke oben rechts auf **+** → **New repository**
3. Name: z. B. `skat-trainer`
4. Sichtbarkeit: **Public** (für kostenloses GitHub Pages)
5. Klicke **Create repository**

### Schritt 2 – Dateien hochladen

**Option A – per Browser (einfach):**
1. Im Repository-Bereich auf **Add file** → **Upload files** klicken
2. Die drei Dateien hochladen:
   - `index.html`
   - `style.css`
   - `app.js`
3. Commit-Nachricht eingeben und **Commit changes** klicken

**Option B – per Git (empfohlen):**
```bash
git init
git add index.html style.css app.js README.md
git commit -m "Initial commit: Skat Trainer"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/skat-trainer.git
git push -u origin main
```

### Schritt 3 – GitHub Pages aktivieren

1. Im Repository auf **Settings** klicken
2. Im linken Menü: **Pages**
3. Unter *Source*: **Deploy from a branch**
4. Branch: **main**, Ordner: **/ (root)**
5. Auf **Save** klicken

### Schritt 4 – Fertig! 🎉

Nach ca. 1–2 Minuten ist das Spiel erreichbar unter:
```
https://DEIN-NAME.github.io/skat-trainer/
```

---

## Technische Details

- **Kein Backend** – rein statisch, funktioniert ohne Server
- **Fortschritt** wird im Browser-Speicher (localStorage) gespeichert
- **Mobil-optimiert** – Touch-freundliche Buttons, responsives Layout
- **Vanilla JS** – keine Frameworks oder externe Abhängigkeiten (außer Google Fonts)
