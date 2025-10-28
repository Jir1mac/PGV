```markdown
# PGV — kompletní statický projekt (upravená verze)

Soubory v balíku:
- index.html
- clanky.html
- vzkazy.html
- odkazy.html
- styles.css
- script.js
- (přidejte) hero.jpg — obrázek pro hero (nahrané uživatelem)

Rychlý návod:
1. Vytvořte složku (např. `pgv-frontend`) a uložte do ní všechny výše uvedené soubory.
2. Přidejte svůj obrázek jako `hero.jpg` (přesný název).
3. Otevřete `index.html` v prohlížeči.
4. Pokud změníte CSS/JS, proveďte tvrdé obnovení (Ctrl+F5) nebo nastavte `link rel="stylesheet" href="styles.css?v=2"` pro vynucení nového souboru.

Poznámky:
- Tlačítka „Prozkoumat články“ a „Nejnovější videa“ používají proměnné a mění barvu podle `data-theme` (světlý / tmavý režim).
- Skript zabraňuje zobrazování kurzoru (caret) při jednoduchém kliknutí do needitovatelného textu, ale ponechává plnou funkčnost výběru (drag/double-click) a kopírování.
- Guestbook je demo (lokální storage). Pro produkci je třeba backend.
```
