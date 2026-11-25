# TechVocab Pro · app móvil (PWA)

## Estructura
- `vocab.json` → **el contenido** (términos, categorías, versión, novedades). Es lo único que se toca para actualizar.
- `src/app.html` → código de la app (pantallas, quiz, flashcards, actualizador).
- `tools/build.js` → genera `dist/artifact.html` (versión claude.ai) y `dist/pwa/` (versión instalable).
- `dist/pwa/` → carpeta lista para subir a un hosting estático (GitHub Pages, Netlify, Cloudflare Pages).

## Cómo se actualiza el contenido
1. Añadir/editar términos en `vocab.json` (campos: id único, term, type, cat, en, es, ex, ph opcional, y prep / connCat / register / structure / rule / confusionWith / note según el tipo).
2. Subir `version` (formato AAAA.MM.DD, o AAAA.MM.DD.2 si hay dos el mismo día), `updated`, `notes`, y añadir una línea arriba en `changelog`.
3. `node tools/build.js`
4. Publicar el nuevo `vocab.json` (al artefacto o al hosting).
5. En el móvil: ⟳ → **Buscar actualizaciones** → **Instalar actualización**. La app también comprueba sola al abrirse (máx. cada 6 h).

El progreso (dominadas, aciertos/fallos) se guarda en el dispositivo y se conserva entre versiones, porque va ligado al `id` de cada término. **No reutilizar ni cambiar ids existentes.**

## Instalar en iPhone / iPad (versión PWA)
1. Se publica solo: cada cambio en `main` se valida, se compila y se sube a la rama `gh-pages` (GitHub Pages → Deploy from a branch → gh-pages / root).
2. Abrir la URL en **Safari** → botón Compartir → **Añadir a pantalla de inicio**.
3. Se abre a pantalla completa y funciona sin conexión.

## Sincronización con el proyecto English Teacher
El proyecto English Teacher es la **fuente principal**: escribe el vocabulario en el artefacto
https://claude.ai/artifact/WKftAcbadRJXpCU734Zjn3 (archivo `vocab.json` + datos embebidos en la página).

Cada vez que el artefacto se republica, la sesión de Claude que mantiene este repo:
1. Lee el `vocab.json` del artefacto.
2. `python3 -I tools/sync.py <vocab_del_artefacto.json>` → fusiona (el artefacto manda; no se borra ningún id; si hace falta, sube la versión).
3. `node tools/validate.js && node tools/build.js`, commit y push a `main` → la Action publica en GitHub Pages.
4. Si `republish_artifact` es `true`, republica el artefacto con el `vocab.json` fusionado para que el proyecto vea lo mismo.

Además hay una comprobación diaria de respaldo por si algún aviso no llegara.
