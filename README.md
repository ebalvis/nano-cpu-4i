# 🖥️ Simulador Interactivo de Máquina Simple

<div align="center">

![versión](https://img.shields.io/badge/versión-1.0.0-222?style=flat-square&labelColor=222)
![licencia](https://img.shields.io/badge/licencia-MIT-brightgreen?style=flat-square)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-deployed-2ea44f?style=flat-square&logo=github)

**Simulador interactivo de una CPU simplificada con ensamblador integrado, ejecución paso a paso y visualización en tiempo real de registros, memoria y flags.**

🚀 [Demo en vivo](https://ebalvis.github.io/nano-cpu-4i/) · 📖 [Manual de uso](docs/simulador.md) · ⚙️ [Set de instrucciones](docs/isa.md) · 📋 [Ejemplos](examples/)

</div>

---

## ✨ Características

- **Editor ensamblador** integrado con sintaxis retro (terminal verde), 4 ejemplos cargables
- **Listado unificado** instrucciones + datos con valores en tiempo real y código máquina hex
- **Panel CPU** — PC, RI desglosado en campos OP/A/B (binario + hex), ZF animado, contador de ciclos
- **Breakpoints** — activa/desactiva con un clic, ejecución RUN para automáticamente
- **Tabla de símbolos** editable en ejecución (clic para modificar cualquier dato)
- **Memoria de datos** — grid hex 8×16 (128 celdas) con valores en tiempo real
- **Traza de ejecución** completa con log coloreado paso a paso
- Sin instalación — abre `index.html` directamente en el navegador

---

## 🚀 Demo rápida

```asm
.titulo Multiplicación

      mov  CERO   , RDO       ; RDO ← 0
      mov  CERO   , CONTAD    ; CONTAD ← 0
BUCLE:cmp  CONTAD , NUM2      ; ¿terminamos?
      beq  FIN
      add  NUM1   , RDO       ; RDO += NUM1
      add  UNO    , CONTAD    ; CONTAD++
      cmp  CERO   , CERO      ; salto incondicional
      beq  BUCLE
FIN:  beq  FIN

NUM1:   dato 0002
NUM2:   dato 0003
RDO:    dato 0000
CONTAD: dato 0000
UNO:    dato 0001
CERO:   dato 0000
```

---

## 🏗️ Arquitectura simulada

| Elemento | Especificación |
|---|---|
| Bus de direcciones | 7 bits → 128 posiciones |
| Bus de datos | 16 bits sin signo |
| Memoria de programa | 128 × 16 bits (solo lectura en ejecución) |
| Memoria de datos | 128 × 16 bits (lectura/escritura) |
| Registros | PC (7b) · RI/IR (16b) · ZF (1b) |

### ISA — 4 instrucciones

| Instr | Binario | Operación |
|---|---|---|
| `MOV` | `00 AAAAAAA BBBBBBB` | `mem[B] ← mem[A]` |
| `ADD` | `01 AAAAAAA BBBBBBB` | `mem[B] ← mem[B] + mem[A]` |
| `CMP` | `10 AAAAAAA BBBBBBB` | `ZF ← (mem[A] == mem[B])` |
| `BEQ` | `11 0000000 AAAAAAA` | `si ZF=1 : PC ← A` |

Codificación de instrucción (16 bits):

<img src="assets/bits-instruccion.png" alt="Instrucción (16 bits)" width="700">

</div>
---

## 📂 Estructura del repositorio

```
Simulador-interactivo-de-maquina-simple/
│
├── css/
│   └── styles.css          Estilos retro-industrial (IBM Plex Mono)
│
├── js/
│   ├── cpu.js              Núcleo CPU: createCPU, cloneCPU, decode, stepCPU
│   ├── assembler.js        Ensamblador 2 pasadas + 4 ejemplos
│   ├── app.js              Estado global y controladores
│   └── ui.js               Renderizado completo con innerHTML
│
├── assets/
│   ├── favicon.svg         Icono chip CPU
│   └── arquitectura.svg    Diagrama de arquitectura
│
├── docs/
│   ├── arquitectura.md     Hardware: buses, memorias, registros
│   ├── isa.md              Juego de instrucciones detallado
│   ├── ensamblador.md      Referencia del lenguaje ensamblador
│   └── simulador.md        Guía de uso de la interfaz
│
├── examples/
│   ├── multiplicacion.asm  Multiplicación por sumas repetidas
│   ├── suma.asm            Suma de dos números
│   ├── contador.asm        Contador 0..N (ideal para breakpoints)
│   └── maximo.asm          Comprobación de igualdad
│
├── index.html              Punto de entrada (carga css/ + js/)
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 🖥️ Ejecución en local

El simulador es HTML + CSS + JS puro. Solo necesitas estos ficheros:
```
index.html
css/styles.css
js/cpu.js
js/assembler.js
js/app.js
js/ui.js
```

Cópialos a cualquier carpeta y abre `index.html` en el navegador. Sin instalación, sin compilación.

> ⚠️ Si la página aparece en blanco, el navegador puede estar bloqueando scripts locales por CORS.  
> Solución: abre una terminal en la carpeta y lanza un servidor mínimo:
>
> ```bash
> # Python (macOS / Linux — viene instalado)
> python3 -m http.server 8080
> # → http://localhost:8080
>
> # VS Code: clic derecho sobre index.html → Open with Live Server
> ```

🚀 O usa directamente la **[demo en vivo](https://ebalvis.github.io/Simulador-interactivo-de-maquina-simple/)** sin instalar nada.
---

## 🔧 Flujo de trabajo del ensamblador

```
Código fuente (.asm)
        │
        ▼
  Pasada 1: recoger etiquetas → symCode{}, symData{}
        │
        ▼
  Pasada 2: generar código máquina
        │
        ├─▶ progCode[]   → Memoria de programa (128 × 16b)
        └─▶ dataInit{}   → Memoria de datos    (128 × 16b)
                │
                ▼
          createCPU(progCode, dataInit)
                │
                ▼
          stepCPU() × N   ← fetch → decode → execute
```

---

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [Arquitectura](docs/arquitectura.md) | Diagrama de bloques, buses, memorias, ciclo F-D-E |
| [ISA](docs/isa.md) | Las 4 instrucciones con ejemplos y codificación binaria |
| [Ensamblador](docs/ensamblador.md) | Sintaxis, etiquetas, directivas, ejemplos |
| [Simulador](docs/simulador.md) | Guía de uso de la interfaz, breakpoints, traza |
| [Ejemplos](examples/) | 4 programas comentados listos para cargar |
| [Contribuir](CONTRIBUTING.md) | Cómo contribuir al proyecto |
| [Changelog](CHANGELOG.md) | Historial de versiones |

---

## 📄 Licencia

[MIT](LICENSE) — libre para uso docente y académico.

---

<div align="center">
<sub>Desarrollado para la asignatura de Arquitectura de Computadores · Universidad de Vigo</sub>
</div>
