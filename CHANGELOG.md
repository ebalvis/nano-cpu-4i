# Changelog

Todos los cambios notables de este proyecto se documentan aquí.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased]

---

## [0.3.0] — 2025-03

### Añadido
- Soporte para **breakpoints**: activación con clic en el listado, parada automática en RUN
- Panel de breakpoints en el panel derecho con etiquetas y botón eliminar
- Badge de contador de BP activos en la barra superior
- Edición del **PC** en tiempo real con clic directo sobre el registro
- Edición de **valores de datos** en la tabla de símbolos durante la ejecución
- Panel `▶ NEXT` con operandos resueltos simbólicamente y campos binarios OP/A/B
- Log de traza coloreado: normal / breakpoint / HALT / modificación manual

### Cambiado
- Diseño de ejecución modernizado (panel de CPU con cabecera fija)
- Listado retro mejorado: instrucciones pasadas atenuadas, flecha `◀` de PC

---

## [0.2.0] — 2025-03

### Añadido
- Soporte para **etiquetas simbólicas** de datos con directiva `.titulo`
- Declaración de datos con `NOMBRE: dato VALOR_HEX`
- Tabla de símbolos en tiempo real en el panel derecho
- Vista unificada instrucciones + datos en el listado (verde/azul)
- Valores de datos actualizados en tiempo real en el listado
- Representación binaria del bus de direcciones bajo el PC

### Cambiado
- Editor con estética terminal retro (fondo negro, texto verde)
- Listado al estilo del hardware de referencia de clase

---

## [0.1.0] — 2025-03

### Añadido
- Simulador inicial de la Máquina Simple
- ISA con 4 instrucciones: MOV, ADD, CMP, BEQ
- Bus de direcciones de 7 bits (128 posiciones)
- Bus de datos de 16 bits
- Memorias de programa y datos separadas (128 × 16 bits cada una)
- Ensamblador integrado con soporte de etiquetas de código
- Registros visibles: PC, RI (IR), ZF
- Controles: PASO, RUN, STOP, RESET, velocidad
- Log de traza de ejecución
- Despliegue en GitHub Pages vía GitHub Actions
