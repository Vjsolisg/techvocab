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
1. Subir el contenido de `dist/pwa/` a un hosting HTTPS.
2. Abrir la URL en **Safari** → botón Compartir → **Añadir a pantalla de inicio**.
3. Se abre a pantalla completa y funciona sin conexión.
