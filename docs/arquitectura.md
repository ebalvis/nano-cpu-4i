# Arquitectura de la Máquina Simple

## Descripción general

La **Máquina Simple** es una arquitectura de CPU de referencia diseñada para la docencia de
Arquitectura de Computadores. Su objetivo es ilustrar los conceptos básicos de una CPU
(ciclo fetch-decode-execute, registros, flags, memoria) con el mínimo número de elementos.

---

## Organización del hardware

```
┌──────────────────────────────────────────────────────────┐
│                      CPU                                 │
│                                                          │
│   ┌────────┐    ┌────────────────┐    ┌────────────┐    │
│   │   PC   │    │  RI (IR)       │    │     ZF     │    │
│   │ 7 bits │    │  16 bits       │    │   1 bit    │    │
│   └───┬────┘    └───────┬────────┘    └────────────┘    │
│       │                 │                                 │
└───────┼─────────────────┼─────────────────────────────── ┘
        │                 │
   Bus de dir.       Bus de datos
     (7 bits)         (16 bits)
        │                 │
┌───────▼─────────────────▼─────────────────────────────── ┐
│       MEMORIA DE PROGRAMA         MEMORIA DE DATOS        │
│         128 × 16 bits               128 × 16 bits         │
│        (dirección 0..7F)           (dirección 0..7F)      │
└───────────────────────────────────────────────────────────┘
```

## Registros

| Registro | Bits | Descripción |
|---|---|---|
| **PC** | 7 | Contador de Programa — dirección de la próxima instrucción |
| **RI** | 16 | Registro de Instrucción — instrucción en ejecución |
| **ZF** | 1 | Flag Zero — resultado de la última comparación |

## Memorias

| Memoria | Tamaño | Acceso |
|---|---|---|
| Programa | 128 × 16 bits | Solo lectura durante ejecución |
| Datos | 128 × 16 bits | Lectura y escritura |

Las dos memorias son **físicamente separadas** (arquitectura Harvard modificada).  
El bus de direcciones de 7 bits permite acceder a las 128 posiciones de cada una.

---

## Ciclo de instrucción

```
1. FETCH    IR ← MEM_PROG[PC]
            PC ← PC + 1

2. DECODE   opcode ← IR[15:14]
            campoA ← IR[13:7]
            campoB ← IR[6:0]

3. EXECUTE  según opcode (ver ISA)
```

---

## Codificación de instrucciones

Todas las instrucciones tienen **16 bits** con el siguiente formato:

```
 15  14  13  12  11  10  9   8   7   6   5   4   3   2   1   0
┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
│OP │OP │ A6│ A5│ A4│ A3│ A2│ A1│ A0│ B6│ B5│ B4│ B3│ B2│ B1│ B0│
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
 ╰──OP──╯ ╰────────── Campo A (7 bits) ──────────╯ ╰─── Campo B (7 bits) ───╯
```

| Campo | Bits | Descripción |
|---|---|---|
| OP | [15:14] | Código de operación (2 bits → 4 instrucciones) |
| A | [13:7] | Operando A — dirección de datos (0..127) |
| B | [6:0] | Operando B — dirección de datos o dirección de salto (0..127) |
