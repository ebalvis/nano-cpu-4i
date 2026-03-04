# Lenguaje Ensamblador

## Formato de fichero fuente

```asm
; Comentario — todo lo que sigue a ; se ignora
.titulo  Nombre del programa

; ── instrucciones ──────────────────────────
[ETIQ:]  mnemónico  OP1 [, OP2]

; ── datos ──────────────────────────────────
NOMBRE:  dato  VALOR_HEX
```

---

## Directiva `.titulo`

```asm
.titulo Multiplicación
```

Establece el título que aparece en la barra del simulador. Opcional, debe ir al principio.

---

## Instrucciones

```asm
mov  SRC , DST      ; DST ← SRC
add  SRC , DST      ; DST ← DST + SRC
cmp  A   , B        ; ZF ← (A == B)
beq  ETIQUETA       ; si ZF=1: PC ← addr(ETIQUETA)
```

Los operandos son **nombres de símbolo** declarados con `dato`.

---

## Declaración de datos

```asm
NOMBRE:  dato  VALOR_HEX
```

- `NOMBRE` — identificador simbólico (usado en instrucciones)
- `VALOR_HEX` — valor inicial de 16 bits en hexadecimal (4 dígitos)
- Las posiciones se asignan en orden de aparición desde la dirección 0

```asm
NUM1:   dato 0002    ; dir. 0, valor inicial = 2
NUM2:   dato 0003    ; dir. 1, valor inicial = 3
RDO:    dato 0000    ; dir. 2, valor inicial = 0
UNO:    dato 0001    ; dir. 3, constante 1
CERO:   dato 0000    ; dir. 4, constante 0
```

---

## Etiquetas de código

```asm
BUCLE: cmp  CONTAD , NUM2
       beq  FIN
       add  UNO    , CONTAD
       cmp  CERO   , CERO
       beq  BUCLE
FIN:   beq  FIN
```

La etiqueta va seguida de `:` y puede estar en la misma línea que la instrucción.

---

## Proceso de ensamblado (dos pasadas)

**Pasada 1** — recorre el fuente y asigna direcciones a todas las etiquetas de código y datos.

**Pasada 2** — traduce cada instrucción a su palabra de 16 bits resolviendo todos los símbolos.

Los errores se muestran en rojo bajo el editor antes de permitir la ejecución.

---

## Referencia rápida

```
.titulo  Nombre           → título en barra
ETIQ:    mov  A , B       → [B] ← [A]
         add  A , B       → [B] ← [B]+[A]
         cmp  A , B       → ZF ← [A]==[B]
         beq  ETIQ        → si ZF: PC←addr
SYM:     dato HHHH        → dato hex 16b
```
