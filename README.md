# Máquina Simple — Simulador Interactivo

Simulador didáctico de una CPU de arquitectura sencilla para la docencia de **Arquitectura de Computadores**.  
Funciona directamente en el navegador sin instalación ni dependencias.

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-blue?logo=github)](https://ebalvis.github.io/Simulador-interactivo-de-maquina-simple/)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)](LICENSE)

---

## Características

- **Editor ensamblador** integrado con sintaxis retro (terminal verde)
- **Listado unificado** instrucciones + datos, como en el hardware de referencia de clase
- **Registros en tiempo real**: PC editable, RI con bits coloreados, ZF animado
- **Breakpoints**: activa/desactiva con un clic, RUN para automáticamente al llegar
- **Tabla de símbolos** editable en ejecución
- **Traza de ejecución** completa con log coloreado
- Sin instalación — un solo fichero `index.html` + `src/app.js`

---

## Demo rápida

```asm
.titulo Multiplicación

      mov  CERO   , RDO
      mov  CERO   , CONTAD
BUCLE:cmp  CONTAD , NUM2
      beq  FIN
      add  NUM1   , RDO
      add  UNO    , CONTAD
      cmp  CERO   , CERO
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

## Arquitectura simulada

| Elemento | Especificación |
|---|---|
| Bus de direcciones | 7 bits → 128 posiciones |
| Bus de datos | 16 bits |
| Memoria de programa | 128 × 16 bits (separada) |
| Memoria de datos | 128 × 16 bits |
| Registros | PC · RI (IR) · ZF |

### ISA (4 instrucciones)

```
MOV  00 AAAAAAA BBBBBBB   mem[B] ← mem[A]
ADD  01 AAAAAAA BBBBBBB   mem[B] ← mem[B] + mem[A]
CMP  10 AAAAAAA BBBBBBB   ZF    ← (mem[A] == mem[B])
BEQ  11 0000000 AAAAAAA   si ZF=1 : PC ← A
```

---

## Uso

### Abrir directamente (sin servidor)

```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

> Si el navegador bloquea scripts locales, usa un servidor local.

### Servidor local

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

---

## Estructura del repositorio

```
Simulador-interactivo-de-maquina-simple/
├── assets/                  Recursos estáticos (favicon, imágenes)
├── docs/                    Documentación técnica
│   ├── arquitectura.md      Descripción del hardware simulado
│   ├── isa.md               Juego de instrucciones detallado
│   ├── ensamblador.md       Referencia del lenguaje ensamblador
│   └── simulador.md         Guía de uso de la interfaz
├── examples/                Programas de ejemplo (.asm)
│   ├── multiplicacion.asm   Multiplicación por sumas repetidas
│   ├── suma.asm             Suma de dos números
│   ├── contador.asm         Contador 0..N (ideal para breakpoints)
│   └── maximo.asm           Comprobación de igualdad
├── src/                     Código fuente
│   ├── app.jsx              Fuente React/JSX (editar aquí)
│   └── app.js               Compilado (referenciado desde index.html)
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── index.html               Punto de entrada de la aplicación
```

---

## Documentación

- [Arquitectura](docs/arquitectura.md)
- [ISA — Juego de instrucciones](docs/isa.md)
- [Lenguaje ensamblador](docs/ensamblador.md)
- [Guía del simulador](docs/simulador.md)
- [Ejemplos](examples/README.md)
- [Cómo contribuir](CONTRIBUTING.md)
- [Historial de cambios](CHANGELOG.md)

---

## Licencia

[MIT](LICENSE) — libre para uso docente y académico.
