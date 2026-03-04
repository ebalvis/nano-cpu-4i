# src/

Código fuente de la aplicación.

| Fichero | Descripción |
|---|---|
| `app.jsx` | Código fuente React/JSX — **editar aquí** |
| `app.js` | Compilado por Babel CLI — referenciado desde `index.html` |

## Estructura de `app.jsx`

```
app.jsx
├── Constantes:    MEM, OP
├── assemble()     Ensamblador de dos pasadas (texto → código máquina)
├── decode()       Decodificador de instrucciones
├── makeCPU()      Inicializa el estado de la CPU
├── cpuStep()      Ejecuta un ciclo fetch-decode-execute
├── DEMO_SRC       Programa de demostración incluido por defecto
├── MaquinaSimple  Componente principal React
├── NTag           Mini-componente: etiqueta de operando
├── StatusBadge    Mini-componente: badge de estado (READY/RUN/HALT)
└── Btn            Mini-componente: botón de control
```

## Compilar tras modificar

```bash
# Desde la raíz del proyecto:
npm install          # solo la primera vez
npm run build        # src/app.jsx → src/app.js
npm run watch        # recompila automáticamente al guardar
```

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para más detalles.
