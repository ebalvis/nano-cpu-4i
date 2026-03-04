# ISA — Juego de instrucciones

## Resumen

| Opcode | Binario | Mnemónico | Operación | Flags |
|---|---|---|---|---|
| 0 | `00` | `MOV` | `mem[B] ← mem[A]` | — |
| 1 | `01` | `ADD` | `mem[B] ← mem[B] + mem[A]` | — |
| 2 | `10` | `CMP` | `ZF ← (mem[A] == mem[B])` | ZF |
| 3 | `11` | `BEQ` | `si ZF=1 : PC ← B` | — |

---

## MOV — Mover dato

**Codificación:** `00 AAAAAAA BBBBBBB`

**Operación:** `mem[B] ← mem[A]`

Copia el contenido de la posición de datos A en la posición de datos B.

```
Antes:  mem[A] = 42,  mem[B] = 0
Después: mem[A] = 42,  mem[B] = 42
```

**Ejemplo:**
```asm
mov  CERO , RDO     ; RDO ← CERO (pone a 0 el resultado)
mov  NUM1 , TEMP    ; TEMP ← NUM1 (copia de trabajo)
```

---

## ADD — Sumar

**Codificación:** `01 AAAAAAA BBBBBBB`

**Operación:** `mem[B] ← mem[B] + mem[A]`

Suma el contenido de la posición A al contenido de la posición B.  
El resultado se guarda en B (acumulador destino).  
Opera en aritmética de 16 bits sin signo con desbordamiento modular (mod 65536).

```
Antes:  mem[A] = 5,  mem[B] = 10
Después: mem[A] = 5,  mem[B] = 15
```

**Ejemplo:**
```asm
add  NUM1 , RDO     ; RDO ← RDO + NUM1
add  UNO  , CONTAD  ; CONTAD ← CONTAD + 1
```

---

## CMP — Comparar

**Codificación:** `10 AAAAAAA BBBBBBB`

**Operación:** `ZF ← (mem[A] == mem[B])`

Compara los contenidos de las posiciones A y B.  
Si son iguales pone `ZF = 1`, si son distintos pone `ZF = 0`.  
No modifica ninguna posición de memoria.

```
mem[A] = 15,  mem[B] = 15  →  ZF = 1
mem[A] = 10,  mem[B] = 15  →  ZF = 0
```

**Ejemplo:**
```asm
cmp  CONTAD , NUM2  ; ZF=1 si CONTAD==NUM2
cmp  CERO   , CERO  ; ZF=1 siempre (truco para salto incondicional)
```

---

## BEQ — Saltar si igual (Branch if Equal)

**Codificación:** `11 0000000 AAAAAAA`

**Operación:** `si ZF=1 : PC ← A`

Si el flag ZF está activo (=1), salta a la dirección de programa A.  
Si ZF=0, continúa en la siguiente instrucción (PC+1).

**Campo A:** dirección de programa (0..127).  
**Campo B (campo A en la codificación):** no se usa (se codifica como 0000000).

```
ZF=1 → PC ← addr(ETIQUETA)
ZF=0 → PC ← PC + 1  (sin salto)
```

**Ejemplo:**
```asm
BEQ  FIN        ; si ZF=1 salta a FIN
BEQ  BUCLE      ; si ZF=1 vuelve a BUCLE
```

---

## Truco para salto incondicional

La Máquina Simple no tiene instrucción JMP. Se consigue el salto incondicional con dos instrucciones:

```asm
cmp  CERO , CERO   ; ZF ← 1  (siempre)
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
