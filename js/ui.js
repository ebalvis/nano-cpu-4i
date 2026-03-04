/**
 * ui.js - Renderizado de la interfaz
 * Genera todo el HTML de los paneles a partir del estado
 */

function ledHtml(on, color) {
  return '<div class="led' + (on ? ' on-' + color : '') + '"></div>';
}

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderEditor() {
  var lineCount = state.source.split("\n").length;
  var errHtml = "";
  if (state.asmResult && state.asmResult.errors.length > 0) {
    errHtml = '<div class="errors">';
    state.asmResult.errors.forEach(function(e) { errHtml += "<div>" + escHtml(e) + "</div>"; });
    errHtml += "</div>";
  }

  var exBtns = EXAMPLE_NAMES.map(function(n) {
    return '<button class="example-btn" onclick="loadExample(\'' + escHtml(n) + '\')">' + escHtml(n) + "</button>";
  }).join("");

  var refItems = Object.keys(INSTRUCTION_INFO).map(function(mn) {
    var info = INSTRUCTION_INFO[mn];
    return '<div class="ref-item"><span class="name mn-' + mn + '">' + mn.toUpperCase() + " " + info.fmt + '</span><span class="desc"> — ' + info.desc + "</span></div>";
  }).join("");

  return '<div class="content">' +
    '<div class="examples"><span>Ejemplos:</span>' + exBtns + "</div>" +
    '<div class="editor-box">' +
      '<div class="editor-header"><span>EDITOR ASM</span><span class="lines">' + lineCount + " líneas</span></div>" +
      '<textarea id="codeEditor" spellcheck="false" oninput="onSourceChange(this)">' + escHtml(state.source) + "</textarea>" +
    "</div>" +
    errHtml +
    '<button class="btn btn-yellow btn-assemble" onclick="doAssemble()">&#9654; Ensamblar</button>' +
    '<div class="reference"><div class="reference-title">JUEGO DE INSTRUCCIONES</div><div class="ref-grid">' + refItems + "</div></div>" +
  "</div>";
}

function renderExecution() {
  var cpu = state.cpu, r = state.asmResult;
  var hd  = !cpu || cpu.halted || state.running;
  var nr  = !state.running;

  /* ── controles ── */
  var controls = '<div class="controls">' +
    '<button class="btn btn-gray" onclick="doBack()">&larr; Editor</button>' +
    '<button class="btn btn-blue" onclick="doStep()"' + (hd ? " disabled" : "") + ">&#9197; Paso</button>" +
    (state.running
      ? '<button class="btn btn-yellow" onclick="doStop()">&#9646;&#9646; Parar</button>'
      : '<button class="btn btn-green" onclick="doRun()"' + (hd ? " disabled" : "") + ">&#9654; Ejecutar</button>") +
    '<button class="btn btn-red" onclick="doReset()">&#8635; Reset</button>' +
    '<div class="speed-control"><span>Velocidad:</span>' +
      '<input type="range" min="50" max="1000" step="50" value="' + (1050 - state.speed) + '" oninput="setSpeed(Number(this.value))">' +
    "</div>" +
  "</div>";

  /* ── panel CPU (PC, IR, ZF, ciclos) ── */
  var ins  = cpu ? decode(cpu.ir) : null;
  var mnNm = ins ? ins.name : "---";
  var word = cpu ? cpu.ir : 0;
  var opBin = toBin((word >> 14) & 3,  2);
  var aBin  = toBin((word >>  7) & 127, 7);
  var bBin  = toBin( word        & 127, 7);
  var opHex = toHex2((word >> 14) & 3);
  var aHex  = toHex2((word >>  7) & 127);
  var bHex  = toHex2( word        & 127);

  /* fila de bits coloreados por campo */
  var bitsHtml = '<div class="ir-bits-row">';
  [opBin, aBin, bBin].forEach(function(seg, si) {
    var col = si===0 ? "#f87171" : si===1 ? "#4ade80" : "#60a5fa";
    var bg  = si===0 ? "#2a0a0a" : si===1 ? "#0a1a0a" : "#0a1025";
    bitsHtml += '<div class="ir-field" style="border-color:' + col + '40;background:' + bg + '">';
    for (var i=0; i<seg.length; i++) {
      bitsHtml += '<span style="color:' + (seg[i]==="1" ? col : col+"44") + '">' + seg[i] + '</span>';
    }
    bitsHtml += '</div>';
  });
  bitsHtml += '</div>';

  /* fila hex + etiquetas */
  var hexHtml = '<div class="ir-hex-row">' +
    '<div class="ir-field-label" style="color:#f87171">OP<br><span style="color:#f87171;font-size:12px;font-weight:700">' + opHex + '</span></div>' +
    '<div class="ir-field-label" style="color:#4ade80">A<br><span style="color:#4ade80;font-size:12px;font-weight:700">' + aHex + '</span></div>' +
    '<div class="ir-field-label" style="color:#60a5fa">B<br><span style="color:#60a5fa;font-size:12px;font-weight:700">' + bHex + '</span></div>' +
  '</div>';

  var cpuPanel = '<div class="panel">' +
    '<div class="panel-title" style="color:#fbbf24"><span class="bar" style="background:#fbbf24"></span> CPU</div>' +
    '<div class="pc-item">' + ledHtml(true,"green") + '<span class="pc-label">PC</span><span class="pc-value">' + (cpu ? toHex2(cpu.pc) : "--") + "</span></div>" +
    '<div class="ir-block">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<span style="color:#444;font-size:9px;letter-spacing:2px">RI</span>' +
        '<span class="mn-' + mnNm + '" style="font-size:16px;font-weight:700">' + mnNm.toUpperCase() + '</span>' +
        '<span style="color:#333;font-size:10px;margin-left:auto">0x' + toHex4(word) + '</span>' +
      '</div>' +
      bitsHtml + hexHtml +
    '</div>' +
    '<div class="zf-item' + (cpu && cpu.zf ? " zf-on" : "") + '">' + ledHtml(cpu&&cpu.zf,"blue") + '<span class="zf-label">ZF</span><span class="zf-value">' + (cpu ? cpu.zf : 0) + "</span></div>" +
    '<div class="cycles-item"><span class="cycles-label">CICLOS</span><span class="cycles-value">' + (cpu ? cpu.tick : 0) + "</span></div>" +
  "</div>";

  /* ── panel tabla de símbolos ── */
  var symRows = "";
  if (r && Object.keys(r.symData).length > 0) {
    /* símbolos referenciados por la próxima instrucción */
    var refSet = {};
    if (cpu && !cpu.halted) {
      var nxt = decode(cpu.prog[cpu.pc]);
      if (nxt.name==="mov"||nxt.name==="add") { refSet[nxt.s]=true; refSet[nxt.d]=true; }
      if (nxt.name==="cmp") { refSet[nxt.a]=true; refSet[nxt.b]=true; }
    }
    Object.keys(r.symData).forEach(function(name) {
      var addr = r.symData[name], val = cpu ? cpu.data[addr] : 0, hi = refSet[addr];
      var isEditing = state.editCell && state.editCell.addr === addr;
      var badge = isEditing
        ? '<input class="sym-edit-input" value="' + escHtml(state.editCell.val) + '" ' +
            'oninput="onEditCellChange(this)" ' +
            'onblur="commitCell()" ' +
            'onkeydown="var k=event.key;if(k===String.fromCharCode(13))commitCell();if(k===String.fromCharCode(27))cancelCell();" ' +
            'onclick="event.stopPropagation()"/>'
        : '<span class="sym-badge">' + toHex4(val) + "</span>";
      symRows += '<div class="sym-row' + (hi ? " active" : "") + '" onclick="startEditCell(' + addr + ',' + val + ')">' +
        '<span class="sym-name">' + escHtml(name) + "</span>" +
        '<span class="sym-addr">[' + toHex2(addr) + "]</span>" +
        badge +
        (hi ? '<span class="sym-arrow">&#9664;</span>' : "") +
      "</div>";
    });
  }
  var symPanel = symRows
    ? '<div class="panel"><div class="panel-title" style="color:#3b82f6"><span class="bar" style="background:#3b82f6"></span> Símbolos</div>' + symRows + "</div>"
    : "";

  /* ── panel breakpoints ── */
  var bps = Object.keys(state.breakpoints).map(Number).sort(function(a,b){return a-b;});
  var chipsHtml = bps.length === 0
    ? '<span class="bp-empty">Clic en ○ del listado para añadir</span>'
    : bps.map(function(addr) {
        var row = r&&r.listing ? r.listing.find(function(rw){return rw.kind==="instr"&&rw.addr===addr;}) : null;
        var lbl = (row&&row.label) ? row.label : toHex2(addr);
        return '<div class="bp-chip" onclick="toggleBP(' + addr + ')"><span style="color:#ef4444">&#9679;</span><span class="bp-name">' + escHtml(lbl) + '</span><span class="bp-x">×</span></div>';
      }).join("");
  var bpPanel = '<div class="panel">' +
    '<div style="display:flex;align-items:center;margin-bottom:8px"><div class="panel-title" style="color:#ef4444;margin-bottom:0"><span class="bar" style="background:#ef4444"></span> Breakpoints</div>' +
    (bps.length ? '<button class="bp-clear" onclick="clearAllBP()">borrar todos</button>' : "") + "</div>" +
    '<div class="bp-list">' + chipsHtml + "</div></div>";

  /* ── panel listado programa ── */
  var listRows = "";
  if (r && r.listing) {
    /* reverse addr→sym map para mostrar nombres */
    var a2s = {};
    if (r.symData) Object.keys(r.symData).forEach(function(n){ a2s[r.symData[n]]=n; });

    r.listing.forEach(function(row) {
      var isPC   = row.kind==="instr" && cpu && cpu.pc===row.addr && !cpu.halted;
      var isPast = row.kind==="instr" && cpu && cpu.pc>row.addr;
      var hasBP  = row.kind==="instr" && state.breakpoints[row.addr];
      var isDato = row.kind==="dato";

      var cls = "instr-row";
      if (isPC)   cls += " current";
      if (isPast) cls += " past";
      if (hasBP)  cls += " bp";
      if (isDato) cls += " dato";

      var bpDot = row.kind==="instr"
        ? '<span class="bp-dot' + (hasBP?" active":"") + '" onclick="event.stopPropagation();toggleBP(' + row.addr + ')"></span>'
        : '<span style="width:12px;display:inline-block"></span>';

      var sym1 = a2s[r.symData && r.symData[row.op1]!==undefined ? r.symData[row.op1] : -1] || row.op1;
      var sym2 = row.op2 ? (a2s[r.symData && r.symData[row.op2]!==undefined ? r.symData[row.op2] : -1] || row.op2) : "";

      var opsHtml = "";
      if (isDato) {
        var dv = cpu ? cpu.data[row.addr] : 0;
        opsHtml = '<span style="color:#0088cc">' + escHtml(row.op1) + '</span><span class="dato-val"> → ' + toHex4(dv) + "</span>";
      } else {
        opsHtml = '<span class="sym-ref">' + escHtml(row.op1) + "</span>";
        if (row.op2) opsHtml += '<span class="instr-sep">, </span><span class="sym-ref">' + escHtml(row.op2) + "</span>";
      }

      listRows += '<div class="' + cls + '">' +
        bpDot +
        '<span class="instr-addr">' + toHex2(row.addr) + "</span>" +
        '<span class="instr-label">' + (row.label ? escHtml(row.label)+":" : "") + "</span>" +
        '<span class="instr-text"><span class="mn-' + row.mnemonic + '">' + row.mnemonic + "</span> " + opsHtml + "</span>" +
        '<span class="instr-word">' + (row.word!==null ? toHex4(row.word) : "") + "</span>" +
      "</div>";
    });
  }
  var listPanel = '<div class="panel">' +
    '<div class="panel-title" style="color:#3b82f6"><span class="bar" style="background:#3b82f6"></span> Listado (' + (r&&r.listing?r.listing.length:0) + " líneas)</div>" +
    '<div class="program-list">' + listRows + "</div></div>";

  /* ── panel log ── */
  var log = (cpu&&cpu.log) ? cpu.log : [];
  var logRows = log.map(function(line, i) {
    var isBP = line.indexOf("BREAKPOINT")>=0, isHalt = line.indexOf("HALT")>=0, last = i===log.length-1;
    var cls = isBP ? "log-bp" : isHalt ? "log-halt" : last ? "log-last" : "log-normal";
    return '<div class="log-row ' + cls + '">' + escHtml(line) + "</div>";
  }).join("") || '<div style="color:#2a2a2a;font-size:10px;padding:4px 8px">Sin actividad</div>';
  var logPanel = '<div class="panel">' +
    '<div style="display:flex;align-items:center;margin-bottom:8px"><div class="panel-title" style="color:#888;margin-bottom:0"><span class="bar" style="background:#888"></span> Traza (' + log.length + " pasos)</div>" +
    '<button style="margin-left:auto;background:none;border:none;color:#444;cursor:pointer;font-size:10px;font-family:inherit" onclick="if(state.cpu)state.cpu.log=[];render()">limpiar</button></div>' +
    '<div class="log-area">' + logRows + "</div></div>";

  /* ── panel memoria hex ── */
  var COLS = 8;
  var memHeader = '<div></div>';
  for (var c = 0; c < COLS; c++) memHeader += '<div class="mem-col-h">+' + c.toString(16).toUpperCase() + '</div>';
  var memRows = "";
  for (var row = 0; row < 16; row++) {
    memRows += '<div class="mem-row-h">' + toHex2(row * COLS) + '</div>';
    for (var col = 0; col < COLS; col++) {
      var addr = row * COLS + col;
      var val  = cpu ? cpu.data[addr] : 0;
      var cls  = val ? "mem-cell has-val" : "mem-cell";
      memRows += '<div class="' + cls + '">' + toHex4(val) + '</div>';
    }
  }
  var memPanel = '<div class="panel">' +
    '<div class="panel-title" style="color:#8b5cf6"><span class="bar" style="background:#8b5cf6"></span> Memoria datos (' + MEM_SIZE + ' celdas)</div>' +
    '<div class="mem-grid" style="grid-template-columns:32px ' + 'repeat(' + COLS + ',1fr)'  + '">' +
      memHeader + memRows +
    '</div>' +
  '</div>';

  return '<div class="content">' + controls +
    '<div class="exec-grid">' +
      '<div class="left-col">'  + cpuPanel + symPanel + bpPanel + "</div>" +
      '<div class="right-col">' + listPanel + memPanel + logPanel + "</div>" +
    "</div></div>";
}

function render() {
  var cpu = state.cpu, r = state.asmResult;
  var statusHtml = "";
  if (cpu && cpu.halted && state.assembled) statusHtml = '<span class="status halt">&#9679; HALT</span>';
  else if (state.running) statusHtml = '<span class="status running">&#9679; EJECUTANDO</span>';

  var bpCount = Object.keys(state.breakpoints).length;
  var bpBadge = bpCount > 0
    ? '<span style="font-size:10px;color:#ff9999;background:#ef444415;border:1px solid #ef444435;border-radius:10px;padding:1px 8px;margin-left:8px">&#9679; ' + bpCount + " BP</span>"
    : "";

  var html = '<div class="header">' +
    '<div class="header-left">' +
      '<div class="leds">' + ledHtml(true,"red") + ledHtml(state.assembled,"yellow") + ledHtml(state.running,"green") + ledHtml(cpu&&cpu.zf===1,"blue") + "</div>" +
      '<span class="title">' + escHtml(r ? r.title : "MÁQUINA SIMPLE") + "</span>" +
      '<span class="version">v1.0</span>' + bpBadge +
    "</div>" +
    "<div>" + statusHtml + "</div>" +
  "</div>";

  html += state.assembled ? renderExecution() : renderEditor();
  document.getElementById("app").innerHTML = html;

  var logEl = document.querySelector(".log-area");
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
  var curRow = document.querySelector(".instr-row.current");
  if (curRow) curRow.scrollIntoView({ block: "nearest" });
}

render();
