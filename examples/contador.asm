;══════════════════════════════════════════════════════
; Ejemplo 4: Contador de 0 a N
; ─────────────────────────────
; Algoritmo: CONTAD ← 0, 1, 2, … N
;   (pon breakpoint en BUCLE para observar cada incremento)
;
; Ideal para practicar breakpoints y la traza de ejecución
;══════════════════════════════════════════════════════
.titulo Contador 0..N

      mov  CERO   , CONTAD    ; CONTAD ← 0
BUCLE:cmp  CONTAD , N         ; ZF ← (CONTAD == N)?
      beq  FIN                ; si llegamos a N → fin
      add  UNO    , CONTAD    ; CONTAD ← CONTAD + 1
      cmp  CERO   , CERO      ; ZF ← 1
      beq  BUCLE              ; repetir
FIN:  beq  FIN

; ── Datos ──────────────────────────────────────
N:      dato 0005             ; contar hasta N = 5 (cambia aquí)
CONTAD: dato 0000             ; contador (resultado visible aquí)
UNO:    dato 0001             ; constante 1
CERO:   dato 0000             ; constante 0
