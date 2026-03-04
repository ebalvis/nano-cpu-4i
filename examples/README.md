# Ejemplos

Programas de demostración para el simulador de la Máquina Simple.  
Copia el contenido de cualquier `.asm` en el editor del simulador y pulsa **ENSAMBLAR ▶**.

| Fichero | Descripción | Conceptos ilustrados |
|---|---|---|
| [`suma.asm`](suma.asm) | RDO ← A + B | MOV, ADD, instrucción simple |
| [`multiplicacion.asm`](multiplicacion.asm) | RDO ← NUM1 × NUM2 | Bucle, CMP, BEQ, contador |
| [`contador.asm`](contador.asm) | Cuenta de 0 a N | Breakpoints, traza |
| [`maximo.asm`](maximo.asm) | Comprobación de igualdad | Bifurcación condicional |

## Sugerencia pedagógica

Para cada ejemplo se recomienda:

1. Leer los comentarios del fuente
2. **Ensamblar** y observar el listado generado
3. Añadir un **breakpoint** en el bucle principal
4. Ejecutar con **RUN** y observar cómo cambian los valores en la tabla de símbolos
5. Modificar los datos de entrada y volver a ejecutar
