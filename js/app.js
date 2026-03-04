/**
 * app.js - Estado global y controladores
 */

var state = {
  source:     EXAMPLE_CODE["Multiplicación"],
  asmResult:  null,
  cpu:        null,
  assembled:  false,
  running:    false,
  speed:      500,
  intervalId: null,
  breakpoints: {},
  editCell:   null   /* { addr, val } */
};

function doAssemble() {
  var r = assemble(state.source);
  state.asmResult = r;
  if (r.errors.length === 0) {
    state.cpu = createCPU(r.progCode, r.dataInit);
    state.assembled = true;
    state.running = false;
    state.breakpoints = {};
  }
  render();
}

function doStep() {
  if (!state.cpu || state.cpu.halted) return;
  var c = cloneCPU(state.cpu);
  stepCPU(c);
  state.cpu = c;
  render();
}

function doRun() {
  if (!state.cpu || state.cpu.halted) return;
  state.running = true;
  startInterval();
  render();
}

function doStop() {
  state.running = false;
  if (state.intervalId) { clearInterval(state.intervalId); state.intervalId = null; }
  render();
}

function doReset() {
  state.running = false;
  if (state.intervalId) { clearInterval(state.intervalId); state.intervalId = null; }
  if (state.asmResult && state.asmResult.errors.length === 0)
    state.cpu = createCPU(state.asmResult.progCode, state.asmResult.dataInit);
  render();
}

function doBack() {
  state.assembled = false; state.running = false;
  if (state.intervalId) { clearInterval(state.intervalId); state.intervalId = null; }
  state.cpu = null; state.asmResult = null; state.breakpoints = {};
  render();
}

function startInterval() {
  if (state.intervalId) clearInterval(state.intervalId);
  state.intervalId = setInterval(function() {
    if (!state.cpu || state.cpu.halted) {
      state.running = false; clearInterval(state.intervalId); state.intervalId = null;
      render(); return;
    }
    var c = cloneCPU(state.cpu);
    stepCPU(c);
    state.cpu = c;
    if (state.breakpoints[c.pc] && !c.halted) {
      c.log.push("── BREAKPOINT @ PC=" + toHex2(c.pc) + " ──");
      state.running = false; clearInterval(state.intervalId); state.intervalId = null;
    }
    render();
  }, state.speed);
}

function setSpeed(val) {
  state.speed = 1050 - val;
  if (state.running) startInterval();
}

function loadExample(name) {
  state.source = EXAMPLE_CODE[name];
  render();
}

function onSourceChange(el) {
  state.source = el.value;
  document.querySelector(".editor-header .lines").textContent = state.source.split("\n").length + " líneas";
}

function toggleBP(addr) {
  if (state.breakpoints[addr]) delete state.breakpoints[addr];
  else state.breakpoints[addr] = true;
  render();
}

function clearAllBP() {
  state.breakpoints = {};
  render();
}

function startEditCell(addr, curVal) {
  if (state.running) return;
  state.editCell = { addr: addr, val: String(curVal) };
  render();
  var inp = document.querySelector(".sym-edit-input");
  if (inp) { inp.focus(); inp.select(); }
}

function onEditCellChange(el) {
  if (state.editCell) state.editCell.val = el.value;
}

function commitCell() {
  if (!state.editCell || !state.cpu) { state.editCell = null; render(); return; }
  var raw = state.editCell.val.trim();
  var v = raw.match(/^0x/i) ? parseInt(raw, 16) : parseInt(raw, 10);
  if (!isNaN(v)) {
    var d = state.cpu.data.slice();
    d[state.editCell.addr] = v & 0xFFFF;
    state.cpu.data = d;
  }
  state.editCell = null;
  render();
}

function cancelCell() {
  state.editCell = null;
  render();
}
