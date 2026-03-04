# Guía de uso del simulador

## Interfaz general

```
┌─────────────────────┬────────────────────────────────┬────────────────────┐
│   EDITOR FUENTE     │   PC  │  RI — REG. INSTRUCCIÓN │  TABLA SÍMBOLOS    │
│   (terminal verde)  │       │  ZF                     │  BREAKPOINTS       │
│                     ├───────┴─────────────────────────┤  TRAZA EJECUCIÓN   │
│                     │   ▶ NEXT — próxima instrucción  │                    │
│                     ├─────────────────────────────────┤                    │
│                     │   LISTADO DE PROGRAMA           │                    │
│                     │   (instrucciones + datos)       │                    │
└─────────────────────┴─────────────────────────────────┴────────────────────┘
```

---

## Panel izquierdo — Editor

- Escribe o pega tu programa en lenguaje ensamblador
- Pulsa **ENSAMBLAR ▶** para compilar
- Los errores aparecen en rojo bajo el editor
- La referencia ISA integrada está siempre visible

---

## Barra de control

| Botón | Acción |
|---|---|
| ⏭ **PASO** | Ejecuta una sola instrucción (fetch-decode-execute) |
| ▶ **RUN** | Ejecución continua hasta HALT o breakpoint |
| ⏸ **STOP** | Pausa la ejecución continua |
| ↺ **RESET** | Reinicia PC=0 y datos a sus valores iniciales |
| Slider **VEL** | Velocidad: desliza a la derecha para ir más rápido |

**Indicadores de estado:**
- 🟢 **READY** — listo para ejecutar
- 🟠 **RUN** — ejecución continua en curso
- 🔴 **HALT** — programa terminado

---

## Panel central — CPU

### Contador de Programa (PC)
- Muestra la dirección de la instrucción actual en **hex** y **decimal**
- Representación binaria de 7 bits del bus de direcciones
- **Editable**: haz clic → escribe el nuevo valor (decimal o `0x…`) → Enter

### Registro de Instrucción (RI)
- Muestra el mnemónico de la última instrucción ejecutada
- 16 bits coloreados por campo:
  - 🔴 Bits 15-14 = OP (opcode)
  - 🟢 Bits 13-7  = Campo A
  - 🔵 Bits 6-0   = Campo B

### Flag Zero (ZF)
- Indicador circular: 🟢 verde = 1 (activo) · 🔴 rojo = 0 (inactivo)
- Se actualiza al ejecutar `CMP`

### Banda ▶ NEXT
- Muestra la **próxima instrucción** a ejecutar con los valores actuales de los operandos
- Los operandos aparecen con su nombre simbólico y valor: `RDO=6`
- Muestra los campos binarios OP/A/B de la instrucción

---

## Panel central — Listado

Vista unificada de instrucciones y datos, estilo terminal retro:

```
 ○  00          mov   CERO   , RDO       0073
 ○  01          mov   CERO   , CONTAD    006C
 ●  02  BUCLE:  cmp   CONTAD , NUM2      84EC    ← breakpoint
 ▶  03          beq   FIN               C008    ← PC actual
    04          add   NUM1   , RDO       4B0B
    —— datos ——
    09  NUM1:   dato  0002    → 0002  (2)
    0A  NUM2:   dato  0003    → 0003  (3)
    0B  RDO:    dato  0000    → 0006  (6)   ◀  ← referenciado por NEXT
```

- **○ / ●** — clic para activar/desactivar breakpoint
- **▶** — instrucción apuntada por el PC
- Las instrucciones ejecutadas se atenúan
- Los valores de datos se actualizan en tiempo real

---

## Breakpoints

1. Haz clic en el círculo **○** a la izquierda de cualquier instrucción
2. El círculo se vuelve **●** rojo — breakpoint activo
3. Al pulsar **RUN**, la ejecución para justo antes de esa instrucción
4. El log muestra `── BREAKPOINT @ PC=XX ──`

**Panel de breakpoints** (panel derecho):
- Lista todos los breakpoints activos con su etiqueta
- Clic en **×** para eliminar uno
- "borrar todos" elimina todos a la vez

---

## Tabla de símbolos

- Lista todos los símbolos `dato` con su dirección y valor actual
- Los símbolos referenciados por la próxima instrucción se resaltan en verde con `◀`
- **Haz clic en cualquier símbolo** para editar su valor directamente (decimal o hex)

---

## Traza de ejecución

Log de todos los pasos ejecutados:

```
#001 PC=00 MOV  [5]←[0]=0
#002 PC=01 MOV  [3]←[0]=0
#003 PC=02 CMP  [3]=0==[1]=3→ZF=0
```

Colores:
- Gris — paso normal (pasado)
- **Blanco** — último paso ejecutado
- **Naranja** — parada en breakpoint
- **Rojo** — HALT
- **Verde** — modificación manual de PC
