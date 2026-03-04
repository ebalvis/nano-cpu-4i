# Cómo contribuir

¡Gracias por tu interés en mejorar el simulador!

---

## Estructura del código

```
js/cpu.js        Núcleo CPU — solo lógica pura, sin DOM
js/assembler.js  Ensamblador — EXAMPLE_CODE[], assemble()
js/app.js        Estado global (state{}) y controladores (doStep, doRun…)
js/ui.js         Renderizado — render(), renderEditor(), renderExecution()
css/styles.css   Estilos retro-industrial
```

El flujo de datos es unidireccional:

```
Evento usuario → controlador en app.js → modifica state{} → render() → innerHTML
```

---

## Desarrollo local

No se necesita `npm install` ni ningún paso de compilación.

```bash
git clone https://github.com/ebalvis/Simulador-interactivo-de-maquina-simple.git
cd Simulador-interactivo-de-maquina-simple

# Opción A — abrir directamente
open index.html

# Opción B — servidor local (evita restricciones CORS)
python3 -m http.server 8080
# → http://localhost:8080
```

Edita cualquier fichero `.js` o `.css` y recarga el navegador. Sin build.

---

## Flujo de trabajo

1. Haz un **fork** del repositorio
2. Crea una rama:
   ```bash
   git checkout -b feat/nombre-de-la-mejora
   ```
3. Edita los ficheros en `js/` o `css/`
4. Prueba abriendo `index.html` en el navegador
5. Haz commit siguiendo la convención:
   ```
   feat:     nueva funcionalidad
   fix:      corrección de bug
   docs:     cambios en documentación
   style:    formato, espacios
   refactor: refactorización sin cambio de comportamiento
   ```
6. Abre un **Pull Request**

---

## Añadir un ejemplo

1. Crea `examples/mi_ejemplo.asm` con comentarios descriptivos
2. Añade el nombre a `EXAMPLE_NAMES[]` en `js/assembler.js`
3. Añade el código a `EXAMPLE_CODE["nombre"]` en `js/assembler.js`
4. Actualiza la tabla en `examples/README.md`

---

## Añadir una instrucción

1. `js/cpu.js` — añade a `OPCODES`, `INSTRUCTION_INFO` e implementa en `stepCPU()`
2. `js/assembler.js` — añade el parsing en la pasada 2 de `assemble()`
3. `js/ui.js` — añade clase CSS `.mn-nuevaInstr` en `css/styles.css`
4. Documenta en `docs/isa.md`

---

## Reportar un bug

Abre un issue con:
- Descripción del problema
- Pasos para reproducirlo
- Programa ensamblador que lo provoca (si aplica)
- Navegador y versión

---

## Código de conducta

Proyecto de uso académico. Se espera un trato respetuoso en todas las interacciones.
