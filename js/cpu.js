/**
 * cpu.js - Núcleo de la CPU simulada
 * Arquitectura: Máquina Simple
 *   Bus direcciones : 7 bits → 128 posiciones
 *   Bus datos       : 16 bits
 *   Memorias        : programa y datos separadas (Harvard)
 *
 * Codificación instrucción (16 bits):
 *   [15:14] OP   [13:7] Campo A   [6:0] Campo B
 *
 *   MOV 00  mem[B] ← mem[A]
 *   ADD 01  mem[B] ← mem[B] + mem[A]
 *   CMP 10  ZF ← (mem[A] == mem[B])
 *   BEQ 11  si ZF=1 : PC ← B
 */

var MEM_SIZE = 128;

var OPCODES = { MOV: 0, ADD: 1, CMP: 2, BEQ: 3 };

var INSTRUCTION_INFO = {
  mov:  { fmt: "SRC , DST",  desc: "mem[DST] \u2190 mem[SRC]" },
  add:  { fmt: "SRC , DST",  desc: "mem[DST] \u2190 mem[DST] + mem[SRC]" },
  cmp:  { fmt: "A , B",      desc: "ZF \u2190 (mem[A] == mem[B])" },
  beq:  { fmt: "ETIQ",       desc: "si ZF=1 : PC \u2190 addr(ETIQ)" },
  dato: { fmt: "VALOR_HEX",  desc: "declara posición de datos e inicializa" }
};

function createCPU(progCode, dataInit) {
  var prog = [], data = [], i;
  for (i = 0; i < MEM_SIZE; i++) prog.push(0);
  for (i = 0; i < MEM_SIZE; i++) data.push(0);
  if (progCode) for (i = 0; i < progCode.length && i < MEM_SIZE; i++) prog[i] = progCode[i];
  if (dataInit)  for (var a in dataInit) if (dataInit.hasOwnProperty(a)) data[a] = dataInit[a];
  return { pc: 0, ir: 0, zf: 0, prog: prog, data: data, halted: false, tick: 0, log: [] };
}

function cloneCPU(c) {
  return { pc: c.pc, ir: c.ir, zf: c.zf, prog: c.prog.slice(), data: c.data.slice(),
           halted: c.halted, tick: c.tick, log: c.log.slice() };
}

function decode(word) {
  var op = (word >> 14) & 3, fA = (word >> 7) & 0x7F, fB = word & 0x7F;
  if (op === 0) return { op: op, name: "mov", s: fA, d: fB };
  if (op === 1) return { op: op, name: "add", s: fA, d: fB };
  if (op === 2) return { op: op, name: "cmp", a: fA, b: fB };
               return { op: op, name: "beq", addr: fB };
}

function stepCPU(cpu) {
  if (cpu.halted) return;
  var ir = cpu.prog[cpu.pc], ins = decode(ir), dm = cpu.data;
  var newPc = cpu.pc + 1, newZf = cpu.zf, detail = "";

  if (ins.name === "mov") {
    dm[ins.d] = dm[ins.s];
    detail = "[" + ins.d + "]\u2190" + dm[ins.s];
  } else if (ins.name === "add") {
    var sum = (dm[ins.d] + dm[ins.s]) & 0xFFFF;
    detail = "[" + ins.d + "]\u2190" + dm[ins.d] + "+" + dm[ins.s] + "=" + sum;
    dm[ins.d] = sum;
  } else if (ins.name === "cmp") {
    newZf  = dm[ins.a] === dm[ins.b] ? 1 : 0;
    detail = dm[ins.a] + "==" + dm[ins.b] + "\u2192ZF=" + newZf;
  } else if (ins.name === "beq") {
    if (cpu.zf === 1) { newPc = ins.addr; detail = "SALTO\u2192" + ins.addr; }
    else detail = "no salta\u2192" + newPc;
  }

  cpu.ir = ir; cpu.zf = newZf; cpu.pc = newPc; cpu.tick++;
  cpu.log.push("#" + pad3(cpu.tick) + " PC=" + toHex2(cpu.pc-1) + " " + ins.name.toUpperCase() + " " + detail);

  if (cpu.prog[cpu.pc] === 0 && cpu.pc > 0) { cpu.halted = true; cpu.log.push("HALT @ PC=" + toHex2(cpu.pc)); }
}

function toHex2(n)  { return (n & 0xFF).toString(16).toUpperCase().padStart(2, "0"); }
function toHex4(n)  { return (n & 0xFFFF).toString(16).toUpperCase().padStart(4, "0"); }
function toBin(n,w) { return (n >>> 0).toString(2).padStart(w, "0"); }
function pad3(n)    { return String(n).padStart(3, "0"); }
