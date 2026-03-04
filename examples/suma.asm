;══════════════════════════════════════════════════════
; Ejemplo 2: Suma de dos números
; ──────────────────────────────────────────────
; Algoritmo: RDO ← A + B
;
; El programa más simple posible en la Máquina Simple.
; Ilustra el uso de MOV y ADD.
;══════════════════════════════════════════════════════
.titulo Suma A + B

      mov  A   , RDO      ; RDO ← A  (copiar primer sumando)
      add  B   , RDO      ; RDO ← RDO + B
FIN:  beq  FIN            ; fin

; ── Datos ──────────────────────────────────────
A:    dato 000A           ; primer sumando  = 10
B:    dato 0005           ; segundo sumando = 5
RDO:  dato 0000           ; resultado: A + B = 15
