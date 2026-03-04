# Lenguaje Ensamblador

## Formato de fichero fuente

Los ficheros fuente tienen extensión `.asm` y se escriben directamente en el editor del simulador.

```
; Comentario — todo lo que sigue a ; se ignora
.titulo  Nombre del programa          ; directiva de título (opcional)

; ── Sección de instrucciones ──────────────────
[ETIQ:]  mnemónico  OP1 [, OP2]       ; instrucción con etiqueta opcional

; ── Sección de datos ──────────────────────────
NOMBRE:  dato  VALOR_HEX              ; declara una posición de datos
```

---

## Directivas

### `.titulo`

```asm
.titulo Nombre del programa
```

Establece el título que aparece en la barra superior del simulador.  
Opcional. Debe ir al principio del fichero (antes de cualquier instrucción).

---

## Etiquetas

Una etiqueta es un nombre simbólico que representa una dirección.

**Etiqueta de código** (para `beq`):
```asm
BUCLE: cmp  CONTAD , NUM2    ; la etiqueta BUCLE apunta a esta instrucción
       beq  FIN
       beq  BUCLE             ; vuelve a BUCLE
FIN:   beq  FIN
```

**Etiqueta de dato** (para operandos de `mov`, `add`, `cmp`):
```asm
NUM1:  dato 0005   ; NUM1 es el nombre de la dirección de datos donde se guarda 5
NUM2:  dato 0003
```

**Reglas:**
- Nombres alfanuméricos, sin espacios, sin caracteres especiales excepto `_`
- Sensibles a mayúsculas: `BUCLE ≠ bucle`
- No pueden coincidir con mnemónicos: `MOV`, `ADD`, `CMP`, `BEQ`, `DATO`
- La etiqueta va seguida inmediatamente de `:`

---

## Instrucciones

### `mov  SRC , DST`

```asm
mov  FUENTE , DESTINO
```
Copia el valor de la dirección `FUENTE` en la dirección `DESTINO`.

### `add  SRC , DST`

```asm
add  FUENTE , DESTINO
```
Acumula: `DESTINO ← DESTINO + FUENTE`.

### `cmp  A , B`

```asm
cmp  A , B
```
Compara: `ZF ← (A == B)`.

### `beq  ETIQ`

```asm
beq  ETIQUETA
```
Salto condicional: si `ZF=1`, el PC salta a la instrucción marcada con `ETIQUETA`.

---

## Declaración de datos: `dato`

```asm
NOMBRE:  dato  VALOR_HEX
```

- `NOMBRE` es el símbolo con el que se referencia la posición en las instrucciones
- `VALOR_HEX` es el valor inicial de 16 bits en hexadecimal (4 dígitos, ej. `0002`, `000F`, `FFFF`)
- Las posiciones de datos se asignan en orden de aparición, empezando en la dirección 0

**Ejemplo:**
```asm
NUM1:   dato 0002    ; dirección 0, valor inicial = 2
NUM2:   dato 0003    ; dirección 1, valor inicial = 3
RDO:    dato 0000    ; dirección 2, valor inicial = 0
CONTAD: dato 0000    ; dirección 3, valor inicial = 0
UNO:    dato 0001    ; dirección 4, valor inicial = 1
CERO:   dato 0000    ; dirección 5, valor inicial = 0
```

---

## Operandos numéricos sin símbolo

Se admite la notación `[n]` para referenciar directamente una dirección numérica:

```asm
mov  [0] , [4]      ; equivale a "copia mem_datos[0] en mem_datos[4]"
```

Aunque es preferible siempre usar nombres simbólicos para mayor claridad.

---

## Proceso de ensamblado (dos pasadas)

1. **Paso 1 — Recogida de símbolos:**  
   El ensamblador recorre el fuente y asigna direcciones a todas las etiquetas de código y datos.

2. **Paso 2 — Generación de código:**  
   Traduce cada instrucción a su palabra de 16 bits, resolviendo todos los símbolos.

Los errores (símbolo desconocido, instrucción inválida, etc.) se muestran en el panel del editor.

---

## Referencia rápida

```
.titulo  Nombre           → título en barra superior
ETIQ:    mov  A , B       → [B] ← [A]         (cod: 00 aaa bbb)
         add  A , B       → [B] ← [B]+[A]      (cod: 01 aaa bbb)
         cmp  A , B       → ZF ← [A]==[B]      (cod: 10 aaa bbb)
         beq  ETIQ        → si ZF: PC←addr     (cod: 11 000 aaa)
SYM:     dato HHHH        → declara dato hex
```
