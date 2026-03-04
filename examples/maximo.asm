;══════════════════════════════════════════════════════
; Ejemplo 3: Máximo de dos números
; ──────────────────────────────────
; Algoritmo: MAX ← max(A, B)
;
; Nota: La Máquina Simple no tiene resta ni CMP>,
; por lo que se resuelve con igualdad:
;   Si A == B  →  MAX = A  (son iguales, cualquiera vale)
;   Si A != B  →  no podemos saber cuál es mayor sin
;                 operaciones adicionales.
;
; Este ejemplo ilustra la comprobación de igualdad
; y el uso de saltos condicionales para bifurcar.
;══════════════════════════════════════════════════════
.titulo Comprobación de igualdad

      cmp  A , B          ; ZF ← (A == B)?
      beq  IGUALES        ; si iguales → rama IGUALES
      ; A ≠ B: copiamos A como candidato (sin resta no podemos comparar >)
      mov  A , MAX
      cmp  CERO , CERO    ; ZF ← 1  (salto incondicional)
      beq  FIN
IGUALES:
      mov  A , MAX        ; A == B, MAX = cualquiera
FIN:  beq  FIN

; ── Datos ──────────────────────────────────────
A:    dato 000F           ; primer  valor = 15
B:    dato 000F           ; segundo valor = 15  (cambia para probar ≠)
MAX:  dato 0000           ; resultado
CERO: dato 0000           ; constante 0
