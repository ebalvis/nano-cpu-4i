;══════════════════════════════════════════════════════
; Ejemplo 1: Multiplicación por sumas repetidas
; ──────────────────────────────────────────────
; Algoritmo: RDO ← NUM1 × NUM2
;   Suma NUM1 a RDO exactamente NUM2 veces,
;   usando CONTAD como contador 0..NUM2
;
; Modifica: NUM1 y NUM2 en la tabla de símbolos
;           para cambiar los operandos
;══════════════════════════════════════════════════════
.titulo Multiplicación

      mov  CERO   , RDO       ; RDO ← 0  (inicializar resultado)
      mov  CERO   , CONTAD    ; CONTAD ← 0  (inicializar contador)
BUCLE:cmp  CONTAD , NUM2      ; ZF ← (CONTAD == NUM2)?
      beq  FIN                ; si ZF=1: terminado → salta a FIN
      add  NUM1   , RDO       ; RDO ← RDO + NUM1
      add  UNO    , CONTAD    ; CONTAD ← CONTAD + 1
      cmp  CERO   , CERO      ; ZF ← 1  (forzar salto incondicional)
      beq  BUCLE              ; vuelve al inicio del bucle
FIN:  beq  FIN               ; bucle infinito de fin (HALT simulado)

; ── Datos ──────────────────────────────────────
NUM1:   dato 0002             ; primer operando  (cambia aquí)
NUM2:   dato 0003             ; segundo operando (cambia aquí)
RDO:    dato 0000             ; resultado: NUM1 × NUM2
CONTAD: dato 0000             ; contador interno
UNO:    dato 0001             ; constante 1
CERO:   dato 0000             ; constante 0
