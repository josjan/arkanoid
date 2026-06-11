# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) para trabajar con el código de este repositorio.

## Proyecto

Un clon de Arkanoid/Breakout construido con HTML, CSS y JavaScript puro — sin dependencias. Se abre `index.html` directamente en el navegador; no hay paso de compilación, ni bundler, ni gestor de paquetes.

## Ejecutar el juego

Abrir `index.html` en el navegador. No se necesita servidor de desarrollo. Si se quiere recarga automática durante el desarrollo, cualquier servidor de archivos estático sirve (p. ej. `npx serve .` o la extensión Live Server de VS Code), pero es opcional.

## Arquitectura

El juego usa sprites y renderiza en un `<canvas>` de HTML.

- `assets/spritesheet.js` — cargador de sprites. Expone `loadSpritesheet(cb)`, `drawSprite(ctx, name, x, y, w, h)` y `drawFrame(ctx, frame, x, y, w, h)`. Debe incluirse antes de cualquier código del juego que dibuje.
- `assets/spritesheet-breakout.png` — el spritesheet único. Todas las coordenadas de sprites están definidas en `SPRITES` y `EXPLOSION_FRAMES` dentro de `spritesheet.js`.
- `assets/sounds/` — `ball-bounce.mp3` y `break-sound.mp3`.

Los nombres de sprites siguen una convención: los bloques se buscan como `block_<color>` (p. ej. `block_red`, `block_cyan`). La paleta es `paddle` y la bola es `ball`.

## Flujo de trabajo basado en specs

Las funcionalidades se diseñan antes de codificarse. El flujo es:

1. `/spec <descripción breve>` — diseñador guiado interactivo que produce un archivo de spec en `specs/NN-slug.md`.
2. Editar la cabecera del spec para poner `Estado: Aprobado` cuando esté listo.
3. `/spec-impl <NN-slug>` — lee el spec aprobado, crea una rama git `spec-NN-slug` e implementa paso a paso con pausas para revisar los diffs.

Los specs viven en `specs/`. La estructura de la plantilla (cabecera, alcance, modelo de datos, plan de implementación, criterios de aceptación, decisiones, riesgos) está definida en `.claude/skills/spec/template.md`.

`/spec-impl` requiere que el repositorio tenga git inicializado (`git init`) y que el estado del spec sea `Aprobado` (o su equivalente en el idioma en que esté escrito) — de lo contrario se negará a arrancar.
