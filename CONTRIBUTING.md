# Cómo contribuir

¡Gracias por tu interés en mejorar el simulador!

---

## Configuración del entorno de desarrollo

### Requisitos

- Node.js ≥ 18 (solo para compilar el fuente JSX)
- Cualquier navegador moderno (Chrome, Firefox, Edge, Safari)
- Git

### Instalar dependencias de build

```bash
git clone https://github.com/ebalvis/Simulador-interactivo-de-maquina-simple.git
cd Simulador-interactivo-de-maquina-simple
npm install
```

### Desarrollo

```bash
# Compilar una vez
npm run build

# Compilar automáticamente al guardar cambios en src/app.jsx
npm run watch

# Servidor local de desarrollo
npm run dev
# Abre http://localhost:8080
```

> **Sin npm:** Si no tienes Node.js, puedes abrir `index.html` directamente.  
> El fichero `src/app.js` ya compilado está versionado en el repo.

---

## Flujo de trabajo

1. Haz un **fork** del repositorio
2. Crea una rama descriptiva:
   ```bash
   git checkout -b feat/nombre-de-la-mejora
   ```
3. Edita `src/app.jsx`
4. Compila: `npm run build`
5. Prueba abriendo `index.html` en el navegador
6. Haz commit siguiendo la convención:
   ```bash
   git commit -m "feat: descripción de la mejora"
   git commit -m "fix: descripción del arreglo"
   git commit -m "docs: actualiza documentación"
   ```
7. Abre un **Pull Request** describiendo los cambios

---

## Convención de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
docs:     cambios en documentación
style:    formato, espacios (sin cambio funcional)
refactor: refactorización sin cambio de comportamiento
perf:     mejora de rendimiento
test:     añadir o corregir tests
chore:    tareas de mantenimiento (build, dependencias)
```

---

## Estructura del código fuente

El fichero `src/app.jsx` está organizado en secciones claramente delimitadas:

| Sección | Descripción |
|---|---|
| Constantes | `MEM`, `OP` |
| `assemble()` | Ensamblador de dos pasadas |
| `decode()` | Decodificador de instrucciones |
| `makeCPU()` / `cpuStep()` | Estado y ciclo de ejecución de la CPU |
| `DEMO_SRC` | Programa cargado por defecto |
| `MaquinaSimple` | Componente principal React |
| Subcomponentes | `NTag`, `StatusBadge`, `Btn` |

---

## Añadir un nuevo ejemplo

1. Crea `examples/mi_ejemplo.asm` con comentarios descriptivos
2. Añádelo a la tabla de `examples/README.md`
3. Incluye comentarios que expliquen el algoritmo y los conceptos ilustrados

---

## Reportar un bug

Abre un issue con:
- Descripción clara del problema
- Pasos para reproducirlo
- Programa ensamblador que lo provoca (si aplica)
- Navegador y versión

---

## Código de conducta

Este proyecto se usa en un contexto académico. Se espera un trato respetuoso y constructivo en todas las interacciones.
