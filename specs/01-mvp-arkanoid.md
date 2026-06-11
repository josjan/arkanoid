# SPEC 01 — MVP Arkanoid jugable

> **Estado:** Borrador · **Depende de:** — · **Fecha:** 2026-06-11
> **Objetivo:** Construir un Arkanoid jugable de un solo nivel con 3 vidas, puntuación básica y overlays de victoria/game over, usando los assets del spritesheet existente.

## Alcance

**Incluido:**

- `index.html` con canvas de 800 × 600 px y estructura mínima de página.
- `game.js` con el game loop completo (requestAnimationFrame).
- Paddle controlado simultáneamente por ratón y teclado (flechas / A-D).
- Bola que arranca pegada al paddle y se lanza con Espacio o clic.
- Cuadrícula fija de bloques: 10 columnas × 6 filas, un color por fila, usando los 6 primeros colores del spritesheet (red, cyan, green, magenta, yellow, hotpink).
- Física de rebote simple y predecible: ángulo de incidencia = ángulo de reflexión, velocidad constante.
- 3 vidas: al perder la bola se descuenta una vida y la bola vuelve al paddle.
- HUD en canvas: puntuación actual y vidas restantes visibles durante la partida.
- Puntuación: 10 puntos por bloque destruido.
- Overlay de **Victoria** al destruir todos los bloques.
- Overlay de **Game Over** al agotar las 3 vidas.
- Botón "Jugar de nuevo" en ambos overlays que reinicia la partida sin recargar la página.

**Fuera de alcance (para specs futuros):**

- Múltiples niveles.
- Power-ups.
- Persistencia de puntuación (localStorage / base de datos).
- Pantalla de inicio o menú principal.
- Pausa del juego.
- Controles táctiles (móvil).
- Aceleración de la bola.
- Tabla de récords (high scores).
- Bloques indestructibles o con múltiples golpes.
- Sonido.
- Animaciones de explosión al romper bloques.

## Modelo de datos

Convenciones: origen en esquina superior izquierda, velocidades en px/frame.

```js
// Estado global de la partida
const state = {
  phase: 'playing',   // 'playing' | 'victory' | 'gameover'
  lives: 3,
  score: 0,
};

// Paddle
const paddle = {
  x: 350,             // borde izquierdo
  y: 560,             // borde superior (fijo)
  w: 100,             // ancho en px
  h: 14,              // alto en px (altura del sprite)
  speed: 6,           // px/frame para control por teclado
};

// Bola
const ball = {
  x: 0,               // centro X
  y: 0,               // centro Y
  w: 16,              // ancho del sprite
  h: 16,              // alto del sprite
  vx: 4,              // velocidad horizontal
  vy: -4,             // velocidad vertical (negativo = hacia arriba)
  attached: true,     // true = pegada al paddle esperando lanzamiento
};

// Bloque (uno por celda de la cuadrícula)
// { x, y, w, h, color, alive }
const blocks = [];
```

## Plan de implementación

1. **`index.html` esqueleto.**
   Canvas 800×600 centrado, fondo de página oscuro, dos divs ocultos para los overlays
   (victoria y game over), `<script>` para `assets/spritesheet.js` y `game.js`.
   Verificación: abre sin errores de consola y muestra el canvas en blanco.

2. **`game.js` — escena estática.**
   Inicializar `state`, `paddle`, `ball` y `blocks` (cuadrícula 10×6, un color por fila).
   Game loop con `requestAnimationFrame`. Dibujar paddle, bloques y bola pegada al paddle.
   Verificación: se ve la cuadrícula completa, el paddle y la bola sin movimiento.

3. **Control del paddle.**
   `mousemove` sobre el canvas: centrar el paddle en la posición X del cursor.
   `keydown`/`keyup` para flechas y A/D: mover el paddle a `paddle.speed` px/frame.
   Limitar el paddle a los bordes del canvas.
   Verificación: el paddle sigue el ratón y responde al teclado sin salirse del canvas.

4. **Movimiento de la bola y rebotes en paredes.**
   Al pulsar Espacio o hacer clic, `ball.attached = false` y la bola empieza a moverse.
   Invertir `vx` al tocar pared izquierda/derecha; invertir `vy` al tocar el techo.
   Verificación: la bola rebota en las tres paredes indefinidamente.

5. **Colisión bola-paddle.**
   AABB entre bola y paddle. Al colisionar, invertir `vy`; ajustar `vx` según la
   distancia del impacto al centro del paddle (golpe en el extremo = ángulo más abierto).
   Verificación: la bola rebota en el paddle con ángulos distintos según el punto de impacto.

6. **Colisión bola-bloques.**
   Recorrer `blocks`, detectar AABB con bloques `alive`. Al colisionar: `alive = false`,
   `state.score += 10`, invertir `vy`.
   Verificación: los bloques desaparecen al ser golpeados y la puntuación sube.

7. **Pérdida de vida, game over y victoria.**
   Si la bola cae por debajo del canvas: `state.lives -= 1`, bola vuelve al paddle
   (`attached = true`). Si `lives === 0`: `state.phase = 'gameover'`.
   Si no quedan bloques `alive`: `state.phase = 'victory'`.
   Verificación: perder 3 veces activa game over; destruir todos los bloques activa victoria.

8. **HUD en canvas.**
   En cada frame, dibujar puntuación ("Score: X") y vidas ("Lives: X") en esquinas del canvas.
   Verificación: el HUD se actualiza en tiempo real durante la partida.

9. **Overlays y botón "Jugar de nuevo".**
   Mostrar el div correspondiente cuando `phase` cambia a `'victory'` o `'gameover'`.
   El botón llama a `resetGame()` que restaura `state`, `ball`, `paddle` y `blocks`
   y oculta el overlay.
   Verificación: el overlay aparece al finalizar la partida y el botón reinicia sin recargar la página.

## Criterios de aceptación

- [ ] `index.html` abre en el navegador sin errores en consola.
- [ ] La cuadrícula de 10×6 bloques se dibuja completa con los colores del spritesheet.
- [ ] El paddle se mueve con el ratón y con las flechas / A-D de forma simultánea.
- [ ] El paddle no sale de los bordes del canvas.
- [ ] La bola arranca pegada al paddle y se lanza al pulsar Espacio o hacer clic.
- [ ] La bola rebota en las paredes izquierda, derecha y techo.
- [ ] La bola rebota en el paddle.
- [ ] Al golpear un bloque, este desaparece y el marcador sube exactamente 10 puntos.
- [ ] Al perder la bola, las vidas bajan en 1 y la bola vuelve pegada al paddle.
- [ ] Al llegar a 0 vidas aparece el overlay de "Game Over".
- [ ] Al destruir todos los bloques aparece el overlay de "Victoria".
- [ ] El botón "Jugar de nuevo" reinicia la partida sin recargar la página.
- [ ] El HUD muestra la puntuación y las vidas actualizadas en todo momento.

## Decisiones

- **Sí:** Un solo archivo `game.js`. El juego es suficientemente pequeño para no justificar módulos separados en el MVP.
- **No:** Módulos ES6 (`import`/`export`). Añaden complejidad de servidor y no aportan nada a un MVP de un solo archivo.
- **Sí:** Física de rebote simple (ángulo de incidencia = ángulo de reflexión). Predecible y fácil de depurar.
- **No:** Física realista con vectores normales por cara del bloque. Complejidad innecesaria para el MVP.
- **Sí:** Overlays HTML (divs) para victoria/game over. Más fácil de estilizar que dibujarlos en el canvas.
- **No:** Pantalla de inicio. El juego arranca directamente; una pantalla de inicio va en un spec posterior.
- **No:** Animaciones de explosión al romper bloques. Los bloques simplemente desaparecen; las animaciones van en un spec posterior.
- **No:** Sonido. Se omite del MVP para reducir complejidad; se puede añadir en un spec posterior.
- **No:** Persistencia de puntuación. El score es solo en memoria durante la partida.
- **No:** Múltiples niveles, power-ups, bloques indestructibles. Todos fuera del alcance del MVP.

## Qué NO está en este spec

- Sonido (bounce y break).
- Animaciones de explosión al romper bloques.
- Pantalla de inicio o menú principal.
- Múltiples niveles.
- Power-ups.
- Bloques indestructibles o con múltiples golpes.
- Persistencia de puntuación (localStorage).
- Tabla de récords.
- Controles táctiles (móvil).
- Pausa del juego.

Cada uno de estos, si llega a implementarse, va en su propio spec.
