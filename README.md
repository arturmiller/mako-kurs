# MaKo Campus

Interaktiver Kurs zur deutschen Marktkommunikation aus Sicht von Softwarearchitekten. Kein Build-Schritt, keine Abhängigkeiten.

## Lokal öffnen

```powershell
Start-Process .\docs\index.html
```

Für zuverlässiges Routing optional über einen lokalen Server:

```powershell
python -m http.server 8000 --directory docs
```

Dann `http://localhost:8000` öffnen.

## GitHub Pages

Der Kurs ist unter <https://arturmiller.github.io/mako-kurs/> erreichbar.

Der Workflow in `.github/workflows/pages.yml` veröffentlicht `docs/` bei jedem Push auf `main`. Im Repository unter **Settings → Pages → Source** einmalig **GitHub Actions** auswählen.
