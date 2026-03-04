# Changelog

Todos los cambios notables se documentan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [1.0.0] — 2025-03 — Refactorización vanilla JS

### Cambiado
- Arquitectura reescrita: React + Babel eliminados → vanilla JS puro (`cpu.js`, `assembler.js`, `app.js`, `ui.js`)
- Misma estructura modular que arquitectura de referencia: `state` global, `render()` con `innerHTML`
- Carpetas `css/` y `js/` en lugar de `src/` compilado
- Sin dependencias de build ni `node_modules` para ejecutar

### Añadido
- **Panel RI mejorado** — tres bloques separados OP / Campo A / Campo B con bits coloreados y valor hex por campo
- **Panel Memoria de datos** — grid hex 8 columnas × 16 filas (128 celdas), valores en tiempo real
- **Edición de símbolos** en tiempo real: clic en cualquier dato de la tabla para editar (decimal o `0x` hex)

---

## [0.3.0] — 2025-03

### Añadido
- Breakpoints: activación con clic en el listado, parada automática en RUN
- Panel de breakpoints con etiquetas y botón eliminar
- Badge de contador de BP activos en la barra superior
- Panel `▶ NEXT` con operandos resueltos simbólicamente y campos binarios OP/A/B
- Log de traza coloreado: normal / breakpoint / HALT

### Cambiado
- Diseño de ejecución modernizado (panel CPU con cabecera fija)

---

## [0.2.0] — 2025-03

### Añadido
- Soporte para etiquetas simbólicas de datos con directiva `.titulo`
- Declaración de datos con `NOMBRE: dato VALOR_HEX`
- Tabla de símbolos en tiempo real en el panel derecho
- Vista unificada instrucciones + datos en el listado

---

## [0.1.0] — 2025-03

### Añadido
- Simulador inicial de la Máquina Simple
- ISA: MOV, ADD, CMP, BEQ
- Bus de direcciones 7 bits (128 posiciones), bus de datos 16 bits
- Memorias de programa y datos separadas
- Ensamblador integrado de dos pasadas con etiquetas
- Registros: PC, RI (IR), ZF
- Controles: PASO, RUN, STOP, RESET, velocidad
- Despliegue en GitHub Pages vía GitHub Actions
