/**
 * assembler.js - Ensamblador de la Máquina Simple
 * Convierte código fuente ASM en instrucciones + datos iniciales
 *
 * Formato:
 *   .titulo  Nombre
 *   [ETIQ:]  mov  SRC , DST
 *   [ETIQ:]  add  SRC , DST
 *   [ETIQ:]  cmp  A , B
 *   [ETIQ:]  beq  ETIQ
 *   SYM:     dato VALOR_HEX
 */

var EXAMPLE_NAMES = ["Multiplicación", "Suma", "Contador", "Máximo"];
var EXAMPLE_CODE  = {};

EXAMPLE_CODE["Multiplicación"] =
"; RDO ← NUM1 × NUM2 (sumas repetidas)\n" +
".titulo Multiplicación\n" +
"      mov  CERO   , RDO\n" +
"      mov  CERO   , CONTAD\n" +
"BUCLE:cmp  CONTAD , NUM2\n" +
"      beq  FIN\n" +
"      add  NUM1   , RDO\n" +
"      add  UNO    , CONTAD\n" +
"      cmp  CERO   , CERO\n" +
"      beq  BUCLE\n" +
"FIN:  beq  FIN\n\n" +
"NUM1:   dato 0002\n" +
"NUM2:   dato 0003\n" +
"RDO:    dato 0000\n" +
"CONTAD: dato 0000\n" +
"UNO:    dato 0001\n" +
"CERO:   dato 0000";

EXAMPLE_CODE["Suma"] =
".titulo Suma A + B\n" +
"      mov  A   , RDO\n" +
"      add  B   , RDO\n" +
"FIN:  beq  FIN\n\n" +
"A:    dato 000A\n" +
"B:    dato 0005\n" +
"RDO:  dato 0000";

EXAMPLE_CODE["Contador"] =
"; Pon breakpoint en BUCLE\n" +
".titulo Contador 0..N\n" +
"      mov  CERO   , CONTAD\n" +
"BUCLE:cmp  CONTAD , N\n" +
"      beq  FIN\n" +
"      add  UNO    , CONTAD\n" +
"      cmp  CERO   , CERO\n" +
"      beq  BUCLE\n" +
"FIN:  beq  FIN\n\n" +
"N:      dato 0005\n" +
"CONTAD: dato 0000\n" +
"UNO:    dato 0001\n" +
"CERO:   dato 0000";

EXAMPLE_CODE["Máximo"] =
".titulo Comprobación igualdad\n" +
"      cmp  A , B\n" +
"      beq  IGUAL\n" +
"      mov  A , MAX\n" +
"      cmp  CERO , CERO\n" +
"      beq  FIN\n" +
"IGUAL:mov  A , MAX\n" +
"FIN:  beq  FIN\n\n" +
"A:    dato 000F\n" +
"B:    dato 000F\n" +
"MAX:  dato 0000\n" +
"CERO: dato 0000";

function assemble(source) {
  var errors = [], listing = [], progCode = [], dataInit = {};
  var title = "MÁQUINA SIMPLE";
  var lines = [], symData = {}, symCode = {};
  var progAddr = 0, dataAddr = 0;

  /* extraer .titulo y normalizar líneas */
  source.split("\n").forEach(function(raw, i) {
    var tm = raw.match(/^\s*\.titulo\s+(.+)/i);
    if (tm) { title = tm[1].trim(); return; }
    var clean = raw.replace(/;.*/, "").trim();
    if (clean) lines.push({ clean: clean, no: i + 1 });
  });

  /* pasada 1: recoger símbolos */
  lines.forEach(function(l) {
    var lm = l.clean.match(/^(\w+)\s*:\s*(.*)/);
    var lbl = lm ? lm[1] : null, rest = lm ? lm[2].trim() : l.clean;
    var mn  = rest.split(/\s+/)[0].toUpperCase();
    if (mn === "DATO") { if (lbl) symData[lbl] = dataAddr; dataAddr++; }
    else if (["MOV","ADD","CMP","BEQ"].indexOf(mn) >= 0) { if (lbl) symCode[lbl] = progAddr; progAddr++; }
    else if (lbl && !mn) symCode[lbl] = progAddr;
  });

  /* pasada 2: generar código */
  var pc = 0, dc = 0;

  function resD(tok, no) {
    if (symData[tok] !== undefined) return symData[tok];
    var v = parseInt(tok.replace(/^\[(\d+)\]$/, "$1"), 10);
    if (!isNaN(v)) return v;
    errors.push("Línea " + no + ": símbolo desconocido '" + tok + "'"); return 0;
  }
  function resC(tok, no) {
    if (symCode[tok] !== undefined) return symCode[tok];
    var v = parseInt(tok, 16); if (!isNaN(v)) return v;
    errors.push("Línea " + no + ": etiqueta desconocida '" + tok + "'"); return 0;
  }

  lines.forEach(function(l) {
    var lm  = l.clean.match(/^(\w+)\s*:\s*(.*)/);
    var lbl = lm ? lm[1] : null, rest = lm ? lm[2].trim() : l.clean;
    if (!rest) return;
    var toks = rest.split(/[\s,]+/).filter(Boolean), mn = toks[0].toUpperCase();

    if (mn === "DATO") {
      var val = parseInt(toks[1] || "0", 16);
      dataInit[dc] = isNaN(val) ? 0 : val & 0xFFFF;
      listing.push({ kind: "dato", addr: dc++, label: lbl, mnemonic: "dato", op1: (toks[1] || "0").toUpperCase(), op2: null, word: null });

    } else if (mn === "MOV" || mn === "ADD" || mn === "CMP") {
      var ops = rest.slice(mn.length).split(",").map(function(s){ return s.trim(); }).filter(Boolean);
      var a = resD(ops[0] || "", l.no), b = resD(ops[1] || "", l.no);
      var opBit = mn === "MOV" ? 0 : mn === "ADD" ? 1 : 2;
      var word  = (opBit << 14) | (a << 7) | b;
      progCode.push(word);
      listing.push({ kind: "instr", addr: pc++, label: lbl, mnemonic: mn.toLowerCase(), op1: ops[0] || "", op2: ops[1] || "", word: word });

    } else if (mn === "BEQ") {
      var addr = symCode[toks[1]] !== undefined ? symCode[toks[1]] : resC(toks[1] || "0", l.no);
      var word = (3 << 14) | addr;
      progCode.push(word);
      listing.push({ kind: "instr", addr: pc++, label: lbl, mnemonic: "beq", op1: toks[1] || "", op2: null, word: word });

    } else {
      errors.push("Línea " + l.no + ": instrucción desconocida '" + toks[0] + "'");
    }
  });

  return { progCode: progCode, dataInit: dataInit, listing: listing, errors: errors, title: title, symData: symData };
}
