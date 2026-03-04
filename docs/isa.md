# ISA — Juego de instrucciones

## Resumen

| Opcode | Binario | Mnemónico | Operación | ZF |
|---|---|---|---|---|
| 0 | `00` | `MOV` | `mem[B] ← mem[A]` | — |
| 1 | `01` | `ADD` | `mem[B] ← mem[B] + mem[A]` | — |
| 2 | `10` | `CMP` | `ZF ← (mem[A] == mem[B])` | ✓ |
| 3 | `11` | `BEQ` | `si ZF=1 : PC ← B` | — |

---

## MOV `00 AAAAAAA BBBBBBB`

`mem[B] ← mem[A]`

Copia el contenido de la posición A en la posición B.

```asm
mov  CERO , RDO     ; RDO ← 0 (inicializa resultado)
mov  NUM1 , TEMP    ; TEMP ← NUM1
```

## ADD `01 AAAAAAA BBBBBBB`

`mem[B] ← mem[B] + mem[A]`

Suma A al contenido de B. El resultado queda en B. Opera en 16 bits (mod 65536).

```asm
add  NUM1 , RDO     ; RDO ← RDO + NUM1
add  UNO  , CONTAD  ; CONTAD++
```

## CMP `10 AAAAAAA BBBBBBB`

`ZF ← (mem[A] == mem[B])`

Compara A y B. Si son iguales: ZF=1. Si son distintos: ZF=0. No modifica memoria.

```asm
cmp  CONTAD , NUM2  ; ZF=1 si CONTAD==NUM2
cmp  CERO   , CERO  ; ZF=1 siempre (para salto incondicional)
```

## BEQ `11 0000000 AAAAAAA`

`si ZF=1 : PC ← A`

Salto condicional. Si ZF=1 salta a la instrucción A; si ZF=0 continúa en PC+1.

```asm
beq  FIN    ; salta a FIN si ZF=1
beq  BUCLE  ; vuelve a BUCLE si ZF=1
```

---

## Salto incondicional (truco)

`BEQ` solo salta si ZF=1. Para salto incondicional:

```asm
cmp  CERO , CERO   ; ZF ← 1 (siempre)
beq  DESTINO        ; salta siempre
```

---

## Tabla de codificaciones de ejemplo

| Instrucción | Binario | Hex |
|---|---|---|
| `MOV [0],[4]` | `00 0000000 0000100` | `0004` |
| `ADD [1],[4]` | `01 0000001 0000100` | `4084` |
| `CMP [4],[3]` | `10 0000100 0000011` | `8203` |
| `BEQ 8` | `11 0000000 0001000` | `C008` |
