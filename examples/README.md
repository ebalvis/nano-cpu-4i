# Ejemplos

Programas de demostración para el simulador. Copia el contenido de cualquier `.asm` en el editor y pulsa **▶ Ensamblar**, o usa los botones de ejemplo en la pantalla del editor.

| Fichero | Descripción | Conceptos |
|---|---|---|
| [`suma.asm`](suma.asm) | RDO ← A + B | MOV, ADD |
| [`multiplicacion.asm`](multiplicacion.asm) | RDO ← NUM1 × NUM2 | Bucle, CMP, BEQ, contador |
| [`contador.asm`](contador.asm) | CONTAD ← 0..N | Breakpoints, traza |
| [`maximo.asm`](maximo.asm) | Comprobación de igualdad | Bifurcación condicional |

## Sugerencia pedagógica

Para cada ejemplo:
1. Leer los comentarios del fuente
2. Ensamblar y observar el listado y el código máquina hex generado
3. Añadir un **breakpoint** en el bucle principal
4. Ejecutar con **▶ Ejecutar** y observar cómo cambian los valores en la tabla de símbolos y en la memoria
5. Modificar los datos de entrada en la tabla de símbolos (clic directo) y volver a ejecutar
