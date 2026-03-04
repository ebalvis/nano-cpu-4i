const { useState, useEffect, useRef, useCallback } = React;

// ══════════════════════════════════════════════════════════════
//  MÁQUINA SIMPLE  ·  Arquitectura de referencia docente
//  ─────────────────────────────────────────────────────────────
//  Bus de direcciones : 7 bits  →  128 posiciones
//  Bus de datos       : 16 bits
//  Memoria de programa: separada de memoria de datos
//
//  CODIFICACIÓN DE INSTRUCCIONES (16 bits):
//  ┌──────┬───────────────┬───────────────┐
//  │OP(2b)│   Campo A(7b) │   Campo B(7b) │
//  └──────┴───────────────┴───────────────┘
//  MOV  00 sssssss ddddddd   [d] ← [s]
//  ADD  01 sssssss ddddddd   [d] ← [d] + [s]
//  CMP  10 aaaaaaa bbbbbbb   ZF  ← ([a] == [b])
//  BEQ  11 0000000 aaaaaaa   si ZF=1 : PC ← addr
// ══════════════════════════════════════════════════════════════

const MEM = 128;
const OP  = { MOV:0, ADD:1, CMP:2, BEQ:3 };

// ─── ENSAMBLADOR ─────────────────────────────────────────────
// Formato fuente:
//   .titulo  Nombre del programa
//   ETIQ:    mov  SRC , DST      ; instrucción con etiqueta opcional
//            add  SRC , DST
//            cmp  A   , B
//            beq  ETIQ
//   SYM:     dato VALOR_HEX      ; declara dato en memoria de datos
function assemble(src) {
  const errors=[], listing=[];
  let title="MÁQUINA SIMPLE";
  const rawLines = src.split("\n");
  const lines = [];

  rawLines.forEach((raw, i) => {
    const clean = raw.replace(/;.*/, "").trim();
    const tm = raw.match(/^\s*\.titulo\s+(.+)/i);
    if (tm) { title = tm[1].trim(); return; }
    if (clean) lines.push({ clean, lineNo: i+1 });
  });

  // Paso 1: recoger símbolos
  const symData={}, symCode={};
  let progAddr=0, dataAddr=0;
  lines.forEach(({ clean }) => {
    const lm = clean.match(/^(\w+)\s*:\s*(.*)/);
    const label = lm ? lm[1] : null;
    const rest  = lm ? lm[2].trim() : clean;
    const ft = rest.split(/\s+/)[0].toUpperCase();
    if (ft==="DATO") {
      if (label) symData[label] = dataAddr;
      dataAddr++;
    } else if (["MOV","ADD","CMP","BEQ"].includes(ft)) {
      if (label) symCode[label] = progAddr;
      progAddr++;
    } else if (label && !ft) {
      symCode[label] = progAddr;
    }
  });

  // Paso 2: generar código
  const progCode=[], dataInit={};
  let pc=0, dc=0;

  const resolveOp = (tok, ln) => {
    const mn = tok.match(/^\[(\d+)\]$/);
    if (mn) return parseInt(mn[1]);
    if (symData[tok] !== undefined) return symData[tok];
    const v = parseInt(tok, 16);
    if (!isNaN(v)) return v;
    errors.push(`Línea ${ln}: símbolo desconocido '${tok}'`);
    return 0;
  };

  lines.forEach(({ clean, lineNo }) => {
    const lm    = clean.match(/^(\w+)\s*:\s*(.*)/);
    const label = lm ? lm[1] : null;
    const rest  = lm ? lm[2].trim() : clean;
    if (!rest) return;
    const toks = rest.split(/[\s,]+/).filter(Boolean);
    const mn   = toks[0].toUpperCase();

    if (mn === "DATO") {
      const vs  = toks[1] || "0";
      const val = parseInt(vs, 16);
      const addr = symData[label] ?? dc;
      dataInit[addr] = isNaN(val) ? 0 : val & 0xFFFF;
      listing.push({ kind:"dato", addr:dc, label, mnemonic:"dato", op1:vs.toUpperCase(), op2:null, word:null });
      dc++;
    } else if (["MOV","ADD","CMP"].includes(mn)) {
      const ops  = rest.slice(mn.length).split(",").map(s => s.trim()).filter(Boolean);
      const aStr = ops[0]||"", bStr = ops[1]||"";
      const a    = resolveOp(aStr, lineNo);
      const b    = resolveOp(bStr, lineNo);
      const opBit = mn==="MOV" ? OP.MOV : mn==="ADD" ? OP.ADD : OP.CMP;
      const word  = (opBit<<14) | (a<<7) | b;
      progCode.push(word);
      listing.push({ kind:"instr", addr:pc, label, mnemonic:mn.toLowerCase(), op1:aStr, op2:bStr, word });
      pc++;
    } else if (mn === "BEQ") {
      const target = toks[1] || "0";
      const addr   = symCode[target]!==undefined ? symCode[target]
                   : symData[target]!==undefined ? symData[target]
                   : parseInt(target,16) || 0;
      const word   = (OP.BEQ<<14) | addr;
      progCode.push(word);
      listing.push({ kind:"instr", addr:pc, label, mnemonic:"beq", op1:target, op2:null, word });
      pc++;
    } else {
      errors.push(`Línea ${lineNo}: instrucción desconocida '${mn}'`);
    }
  });

  return { progCode, dataInit, listing, errors, title, symData, symCode };
}

// ─── DECODIFICADOR ───────────────────────────────────────────
function decode(word) {
  const op=(word>>14)&3, fA=(word>>7)&0x7F, fB=word&0x7F;
  if (op===OP.MOV) return { op, name:"MOV", s:fA, d:fB };
  if (op===OP.ADD) return { op, name:"ADD", s:fA, d:fB };
  if (op===OP.CMP) return { op, name:"CMP", a:fA, b:fB };
  if (op===OP.BEQ) return { op, name:"BEQ", addr:fB };
  return { op, name:"???" };
}

const toBin  = (n,w) => (n>>>0).toString(2).padStart(w,"0");
const toHex2 = n => (n&0xFF).toString(16).toUpperCase().padStart(2,"0");
const toHex4 = n => (n&0xFFFF).toString(16).toUpperCase().padStart(4,"0");
const u16    = n => n & 0xFFFF;

// ─── ESTADO CPU ──────────────────────────────────────────────
function makeCPU(progCode, dataInit) {
  const prog = new Array(MEM).fill(0);
  const data = new Array(MEM).fill(0);
  progCode.forEach((w,i) => { if (i<MEM) prog[i]=w; });
  Object.entries(dataInit).forEach(([addr,val]) => { data[addr]=val; });
  return { pc:0, ir:0, zf:0, prog, data, halted:false, log:[], tick:0 };
}

function cpuStep(cpu) {
  const { pc, prog, data, zf } = cpu;
  if (pc>=MEM || (prog[pc]===0 && pc>0))
    return { ...cpu, halted:true, log:[...cpu.log, `HALT @ PC=${toHex2(pc)}`] };
  const ir  = prog[pc];
  const ins = decode(ir);
  const dm  = [...data];
  let newPc=pc+1, newZf=zf, detail="";

  if      (ins.name==="MOV") { dm[ins.d]=data[ins.s]; detail=`[${ins.d}]←[${ins.s}]=${data[ins.s]}`; }
  else if (ins.name==="ADD") { dm[ins.d]=u16(data[ins.d]+data[ins.s]); detail=`[${ins.d}]←${data[ins.d]}+${data[ins.s]}=${dm[ins.d]}`; }
  else if (ins.name==="CMP") { newZf=data[ins.a]===data[ins.b]?1:0; detail=`[${ins.a}]=${data[ins.a]}==[${ins.b}]=${data[ins.b]}→ZF=${newZf}`; }
  else if (ins.name==="BEQ") { if(zf===1){newPc=ins.addr;detail=`SALTO→${ins.addr}`;}else detail=`no salta→PC=${newPc}`; }

  const log = `#${String(cpu.tick+1).padStart(3,"0")} PC=${toHex2(pc)} ${ins.name.padEnd(4)} ${detail}`;
  return { ...cpu, pc:newPc, ir, zf:newZf, data:dm, log:[...cpu.log,log], tick:cpu.tick+1 };
}

// ─── PROGRAMA DE DEMO ────────────────────────────────────────
const DEMO_SRC = `;──────────────────────────────
.titulo Multiplicación
;──────────────────────────────
; RDO ← NUM1 × NUM2
; Algoritmo: suma repetida
; CONTAD cuenta de 0 a NUM2
;──────────────────────────────
      mov  CERO   , RDO
      mov  CERO   , CONTAD
BUCLE:cmp  CONTAD , NUM2
      beq  FIN
      add  NUM1   , RDO
      add  UNO    , CONTAD
      cmp  CERO   , CERO
      beq  BUCLE
FIN:  beq  FIN

NUM1:   dato 0002
NUM2:   dato 0003
RDO:    dato 0000
CONTAD: dato 0000
UNO:    dato 0001
CERO:   dato 0000`;

// ─── COLORES ─────────────────────────────────────────────────
const BITCOL = i => i<=1 ? "#f87171" : i<=8 ? "#4ade80" : "#60a5fa";
const MNCOL  = { mov:"#fb923c", add:"#4ade80", cmp:"#60a5fa", beq:"#f472b6", dato:"#0088cc", "???":"#666" };

// ─── MINI COMPONENTES ────────────────────────────────────────
function NTag({ label, name, val, col }) {
  return (
    <div style={{display:"inline-flex",flexDirection:"column",alignItems:"flex-start",gap:0}}>
      <span style={{color:col+"88",fontSize:7,letterSpacing:1}}>{label}</span>
      <span style={{color:col,fontWeight:"bold",fontSize:10,background:col+"20",padding:"0 5px",borderRadius:3}}>
        {name}{val!==null ? `=${val}` : ""}
      </span>
    </div>
  );
}

function StatusBadge({ col, label, blink }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:4,background:col+"18",border:`1px solid ${col}44`,borderRadius:10,padding:"2px 8px"}}>
      <span style={{color:col,fontSize:9,animation:blink?"blink 1s infinite":"none"}}>●</span>
      <span style={{color:col,fontSize:9,fontWeight:"bold"}}>{label}</span>
    </div>
  );
}

const btnPalette = {
  blue:  { bg:"#1a3a5c", color:"#79c0ff", border:"#2a5080" },
  green: { bg:"#0d3320", color:"#3fb950", border:"#2d6a35" },
  red:   { bg:"#3a1010", color:"#f47067", border:"#6a2020" },
  grey:  { bg:"#161b22", color:"#636e7b", border:"#21262d" },
  dim:   { bg:"#0d1117", color:"#30363d", border:"#21262d" },
};
function Btn({ label, col="grey", onClick, disabled }) {
  const s = btnPalette[disabled?"dim":col] || btnPalette.grey;
  return (
    <button onClick={!disabled?onClick:undefined} style={{
      background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      borderRadius:6, padding:"4px 11px", cursor:disabled?"not-allowed":"pointer",
      fontSize:10, fontFamily:"inherit", fontWeight:"bold", letterSpacing:1
    }}>{label}</button>
  );
}

// ─────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
function MaquinaSimple() {
  const [src,        setSrc]        = useState(DEMO_SRC);
  const [asmRes,     setAsmRes]     = useState(null);
  const [cpu,        setCpu]        = useState(null);
  const [speed,      setSpeed]      = useState(500);
  const [running,    setRunning]    = useState(false);
  const [editPC,     setEditPC]     = useState(null);
  const [editCell,   setEditCell]   = useState(null);
  const [breakpoints,setBreakpoints]= useState(new Set());
  const runRef = useRef(false);
  const logRef = useRef(null);
  const pcRef  = useRef(null);

  const doAsm = useCallback((s) => {
    setRunning(false); runRef.current = false;
    const r = assemble(s); setAsmRes(r);
    if (!r.errors.length) setCpu(makeCPU(r.progCode, r.dataInit));
  }, []);

  useEffect(() => { doAsm(DEMO_SRC); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [cpu && cpu.log.length]);
  useEffect(() => { if (pcRef.current) pcRef.current.scrollIntoView({ block:"nearest", behavior:"smooth" }); }, [cpu && cpu.pc]);

  const doStep  = () => { if (!cpu||cpu.halted) return; setCpu(cpuStep(cpu)); };
  const doStop  = () => { setRunning(false); runRef.current=false; };
  const doReset = () => {
    if (!asmRes||asmRes.errors.length) return;
    setRunning(false); runRef.current=false;
    const c = makeCPU(asmRes.progCode, asmRes.dataInit);
    if (cpu) cpu.data.forEach((v,i) => { if (asmRes.dataInit[i]===undefined) c.data[i]=v; });
    setCpu(c);
  };
  const doRun = async () => {
    if (!cpu||cpu.halted) return;
    setRunning(true); runRef.current=true;
    let cur = cpu;
    while (runRef.current && !cur.halted) {
      cur = cpuStep(cur); setCpu({...cur});
      await new Promise(r => setTimeout(r, speed));
      if (breakpoints.has(cur.pc) && !cur.halted) {
        setCpu({...cur, log:[...cur.log, `── BREAKPOINT @ PC=${toHex2(cur.pc)} ──`]});
        break;
      }
    }
    setRunning(false); runRef.current=false;
  };

  const toggleBP = addr => {
    setBreakpoints(prev => {
      const n = new Set(prev);
      if (n.has(addr)) n.delete(addr); else n.add(addr);
      return n;
    });
  };

  const commitPC = () => {
    if (editPC===null||!cpu) { setEditPC(null); return; }
    const v = editPC.trim().startsWith("0x") ? parseInt(editPC,16) : parseInt(editPC,10);
    if (!isNaN(v)&&v>=0&&v<MEM)
      setCpu({...cpu, pc:v, halted:false, log:[...cpu.log, `── PC←${v} (manual) ──`]});
    setEditPC(null);
  };
  const commitCell = () => {
    if (!editCell||!cpu) { setEditCell(null); return; }
    const v = editCell.val.trim().startsWith("0x") ? parseInt(editCell.val,16) : parseInt(editCell.val,10);
    if (!isNaN(v)) { const d=[...cpu.data]; d[editCell.addr]=u16(v); setCpu({...cpu,data:d}); }
    setEditCell(null);
  };

  const c   = cpu, r = asmRes;
  const irD = c ? decode(c.ir) : null;
  const nxtD= c&&!c.halted&&c.pc<MEM ? decode(c.prog[c.pc]) : null;
  const irBin = c ? toBin(c.ir,16) : "0".repeat(16);
  const refAddrs = new Set();
  if (nxtD) {
    if (nxtD.name==="MOV") { refAddrs.add(nxtD.s); refAddrs.add(nxtD.d); }
    if (nxtD.name==="ADD") { refAddrs.add(nxtD.s); refAddrs.add(nxtD.d); }
    if (nxtD.name==="CMP") { refAddrs.add(nxtD.a); refAddrs.add(nxtD.b); }
  }
  const addrToSym = r ? Object.fromEntries(Object.entries(r.symData).map(([k,v])=>[v,k])) : {};

  return (
    <div style={{fontFamily:"'Courier New',monospace",background:"#0a0c10",height:"100vh",color:"#c9d1d9",display:"flex",flexDirection:"column",fontSize:13,overflow:"hidden"}}>

      {/* ══ TOP BAR ══ */}
      <div style={{background:"#0d1117",borderBottom:"1px solid #21262d",display:"flex",alignItems:"center",gap:10,padding:"7px 16px",flexShrink:0}}>
        <div style={{display:"flex",gap:5}}>
          {["#ff5f57","#febc2e","#28c840"].map((col,i) =>
            <div key={i} style={{width:11,height:11,borderRadius:"50%",background:col}}/>
          )}
        </div>
        <span style={{color:"#58a6ff",fontWeight:"bold",fontSize:13,letterSpacing:2}}>{r?.title||"MÁQUINA SIMPLE"}</span>
        <span style={{color:"#21262d",fontSize:10}}>│</span>
        <span style={{color:"#30363d",fontSize:10}}>bus.dir 7b · bus.datos 16b · {MEM} pos · MOV ADD CMP BEQ</span>
        {breakpoints.size>0 && (
          <div style={{display:"flex",alignItems:"center",gap:5,background:"#3d1f1f",border:"1px solid #6e1a1a",borderRadius:12,padding:"2px 10px"}}>
            <span style={{color:"#ff6b6b",fontSize:9}}>●</span>
            <span style={{color:"#ff9999",fontSize:10,fontWeight:"bold"}}>{breakpoints.size} BP</span>
          </div>
        )}
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
          <Btn label="⏭ PASO"  col={!c||c.halted?"dim":"blue"}  onClick={doStep} disabled={running||!c||c.halted}/>
          {!running
            ? <Btn label="▶ RUN" col={!c||c.halted?"dim":"green"} onClick={doRun}  disabled={!c||c.halted}/>
            : <Btn label="⏸ STOP" col="red" onClick={doStop}/>}
          <Btn label="↺ RESET" col="grey" onClick={doReset} disabled={running}/>
          <div style={{width:1,height:16,background:"#21262d",margin:"0 4px"}}/>
          <span style={{color:"#30363d",fontSize:9}}>VEL</span>
          <input type="range" min={60} max={1400} value={1460-speed}
            onChange={e=>setSpeed(1460-+e.target.value)}
            style={{width:66,accentColor:"#58a6ff"}}/>
          {c?.halted && <StatusBadge col="#f85149" label="HALT"/>}
          {!c?.halted && c && <StatusBadge col="#3fb950" label="READY"/>}
          {running && <StatusBadge col="#f0883e" label="RUN" blink={true}/>}
        </div>
      </div>

      {/* ══ MAIN GRID ══ */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"300px 1fr 280px",overflow:"hidden"}}>

        {/* ── LEFT: EDITOR ── */}
        <div style={{borderRight:"1px solid #21262d",display:"flex",flexDirection:"column",background:"#000d05",overflow:"hidden"}}>
          <div style={{padding:"6px 10px",borderBottom:"1px solid #005522",display:"flex",alignItems:"center",background:"#000",flexShrink:0}}>
            <span style={{color:"#006633",fontSize:9,letterSpacing:2}}>● EDITOR FUENTE</span>
            <button onClick={()=>doAsm(src)} style={{marginLeft:"auto",background:"#001a0a",color:"#00cc44",border:"1px solid #005522",borderRadius:4,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:"bold",letterSpacing:1}}>ENSAMBLAR ▶</button>
          </div>
          <textarea value={src} onChange={e=>setSrc(e.target.value)} spellCheck={false}
            style={{flex:1,background:"#000",color:"#00cc44",border:"none",outline:"none",padding:"10px 12px",fontSize:11.5,lineHeight:1.8,resize:"none",fontFamily:"'Courier New',monospace",minHeight:0,caretColor:"#00ff88"}}/>
          {r?.errors?.length>0 && (
            <div style={{background:"#110000",borderTop:"1px solid #550000",padding:"6px 10px",flexShrink:0}}>
              {r.errors.map((e,i)=><div key={i} style={{color:"#ff4444",fontSize:10}}>⚠ {e}</div>)}
            </div>
          )}
          <div style={{borderTop:"1px solid #005522",padding:"8px 10px",background:"#000",flexShrink:0}}>
            <div style={{color:"#004422",fontSize:8,letterSpacing:2,marginBottom:5}}>SINTAXIS</div>
            {[
              [".titulo", "Nombre del programa"],
              ["ETIQ: mov", "SRC , DST  →  [DST]←[SRC]"],
              ["      add", "SRC , DST  →  [DST]←[DST]+[SRC]"],
              ["      cmp", "A   , B    →  ZF←[A]==[B]"],
              ["      beq", "ETIQ       →  si ZF: PC←addr"],
              ["SYM:  dato","VALOR_HEX  →  declara dato"],
            ].map(([a,b],i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:3,fontSize:9.5,lineHeight:1.5}}>
                <span style={{color:"#00aaff",minWidth:72,flexShrink:0}}>{a}</span>
                <span style={{color:"#004422"}}>{b}</span>
              </div>
            ))}
            <div style={{color:"#003311",fontSize:8,marginTop:5}}>Clic en ○ del listado → breakpoint</div>
          </div>
        </div>

        {/* ── CENTER: CPU + LISTADO ── */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden",background:"#0a0c10"}}>

          {/* CPU HEADER */}
          <div style={{background:"#0d1117",borderBottom:"1px solid #21262d",display:"flex",gap:0,flexShrink:0}}>
            {/* PC */}
            <div style={{padding:"8px 14px",borderRight:"1px solid #21262d",minWidth:150,
              cursor:c&&!running?"pointer":"default",
              outline:editPC!==null?"1px solid #3fb950":"none",
              background:editPC!==null?"#0d2c1a":"transparent"}}
              onClick={()=>{ if(c&&!running&&editPC===null) setEditPC(String(c.pc)); }}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{color:"#444c56",fontSize:8,letterSpacing:2}}>PC</span>
                {c&&!running&&editPC===null&&<span style={{color:"#30363d",fontSize:8}}>✎</span>}
              </div>
              {editPC!==null ? (
                <div onClick={e=>e.stopPropagation()}>
                  <input autoFocus value={editPC} onChange={e=>setEditPC(e.target.value)}
                    onBlur={commitPC}
                    onKeyDown={e=>{if(e.key==="Enter")commitPC();if(e.key==="Escape")setEditPC(null);}}
                    style={{background:"transparent",color:"#3fb950",border:"none",outline:"none",
                      fontSize:26,fontWeight:"bold",fontFamily:"inherit",width:80,marginTop:2}}/>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:2}}>
                  <span style={{color:"#58a6ff",fontSize:26,fontWeight:"bold",lineHeight:1}}>{c?toHex2(c.pc):"--"}</span>
                  <span style={{color:"#444c56",fontSize:10}}>/{c?.pc??"-"}</span>
                </div>
              )}
              <div style={{display:"flex",gap:1,marginTop:4}}>
                {toBin(c?.pc??0,7).split("").map((b,i)=>(
                  <span key={i} style={{background:b==="1"?"#1a3a5c":"#0d1117",color:b==="1"?"#58a6ff":"#21262d",
                    fontSize:10,width:17,textAlign:"center",fontWeight:"bold",borderRadius:2}}>{b}</span>
                ))}
              </div>
            </div>

            {/* IR */}
            <div style={{flex:1,padding:"8px 14px",borderRight:"1px solid #21262d"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"#444c56",fontSize:8,letterSpacing:2}}>RI — REGISTRO INSTRUCCIÓN</span>
                <span style={{color:"#58a6ff",fontSize:11,marginLeft:"auto"}}>{c?`0x${toHex4(c.ir)}`:"0x----"}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
                <span style={{color:MNCOL[irD?.name?.toLowerCase()]||"#adbac7",fontSize:18,fontWeight:"bold",minWidth:42}}>
                  {irD?.name||"---"}
                </span>
                <div style={{display:"flex",flexDirection:"column",gap:1}}>
                  <div style={{display:"flex",gap:1}}>
                    {irBin.split("").map((b,i)=>(
                      <span key={i} style={{color:BITCOL(i),fontWeight:"bold",fontSize:11,
                        background:b==="1"?"#111827":"#0d1117",width:13,textAlign:"center",borderRadius:2}}>{b}</span>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:0}}>
                    {["O","P","·","·","·","A","·","·","·","·","·","B","·","·","·","·"].map((l,i)=>(
                      <span key={i} style={{color:BITCOL(i)+"55",fontSize:6,width:13,textAlign:"center"}}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ZF */}
            <div style={{padding:"8px 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:80}}>
              <span style={{color:"#444c56",fontSize:8,letterSpacing:2}}>ZF</span>
              <div style={{
                width:44,height:44,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                background:c?.zf?"#0d3320":"#180a0a",
                border:`3px solid ${c?.zf?"#3fb950":"#5c1e1e"}`,
                fontSize:20,fontWeight:"bold",color:c?.zf?"#3fb950":"#f47067",
                boxShadow:c?.zf?"0 0 14px #3fb95055":"none",
                transition:"all 0.2s",margin:"4px 0"
              }}>{c?.zf??0}</div>
              <span style={{fontSize:8,color:c?.zf?"#3fb950":"#444c56"}}>{c?.zf?"ACTIVO":"INACT."}</span>
            </div>
          </div>

          {/* PRÓXIMA INSTRUCCIÓN */}
          {nxtD&&c&&(
            <div style={{background:"#0d2c1a",borderBottom:"1px solid #2d6a35",padding:"7px 14px",flexShrink:0}}>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{color:"#3fb950",fontSize:8,letterSpacing:2}}>▶ NEXT</span>
                <span style={{color:MNCOL[nxtD.name.toLowerCase()]||"#adbac7",fontSize:14,fontWeight:"bold"}}>{nxtD.name}</span>
                {nxtD.name==="MOV"&&<>
                  <NTag label="src" name={addrToSym[nxtD.s]||`[${nxtD.s}]`} val={c.data[nxtD.s]} col="#4ade80"/>
                  <span style={{color:"#2d6a35"}}>→</span>
                  <NTag label="dst" name={addrToSym[nxtD.d]||`[${nxtD.d}]`} val={null} col="#58a6ff"/>
                </>}
                {nxtD.name==="ADD"&&<>
                  <NTag label="dst" name={addrToSym[nxtD.d]||`[${nxtD.d}]`} val={c.data[nxtD.d]} col="#58a6ff"/>
                  <span style={{color:"#2d6a35"}}>+</span>
                  <NTag label="src" name={addrToSym[nxtD.s]||`[${nxtD.s}]`} val={c.data[nxtD.s]} col="#4ade80"/>
                  <span style={{color:"#2d6a35"}}>→ dst</span>
                </>}
                {nxtD.name==="CMP"&&<>
                  <NTag label="A" name={addrToSym[nxtD.a]||`[${nxtD.a}]`} val={c.data[nxtD.a]} col="#4ade80"/>
                  <span style={{color:"#2d6a35",fontSize:10}}>==</span>
                  <NTag label="B" name={addrToSym[nxtD.b]||`[${nxtD.b}]`} val={c.data[nxtD.b]} col="#58a6ff"/>
                </>}
                {nxtD.name==="BEQ"&&<>
                  <NTag label="addr" name={String(nxtD.addr)} val={null} col="#f472b6"/>
                  <span style={{color:c.zf?"#3fb950":"#f47067",fontSize:10,fontWeight:"bold"}}>
                    {c.zf?"→ SALTARÁ":"→ no salta"}
                  </span>
                </>}
                <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}}>
                  {[["OP",((c.prog[c.pc]>>14)&3).toString(2).padStart(2,"0"),"#f87171"],
                    ["A", ((c.prog[c.pc]>>7)&0x7F).toString(2).padStart(7,"0"),"#4ade80"],
                    ["B",  (c.prog[c.pc]&0x7F).toString(2).padStart(7,"0"),"#60a5fa"]
                  ].map(([n,v,col])=>(
                    <div key={n} style={{textAlign:"center"}}>
                      <div style={{color:col,fontSize:9,fontWeight:"bold",letterSpacing:0.5}}>{v}</div>
                      <div style={{color:col+"66",fontSize:7}}>{n}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LISTADO RETRO */}
          <div style={{flex:1,overflowY:"auto",background:"#000d05"}}>
            {r&&!r.errors.length&&r.listing.map((row,i)=>{
              const isPC  = row.kind==="instr" && c?.pc===row.addr;
              const isPast= row.kind==="instr" && (c?.pc??0)>row.addr;
              const isDato= row.kind==="dato";
              const hasBP = row.kind==="instr" && breakpoints.has(row.addr);
              const dataVal= isDato&&c ? c.data[row.addr] : null;
              const isRef = isDato && refAddrs.has(row.addr);
              return (
                <div key={i} ref={isPC?pcRef:null}
                  style={{display:"flex",gap:0,padding:"1px 0",
                    background:isPC?"#001a0a":hasBP?"#1a0505":"transparent",
                    borderLeft:`3px solid ${isPC?"#3fb950":hasBP?"#f85149":"transparent"}`,
                    alignItems:"baseline",minHeight:22}}>
                  {/* breakpoint toggle */}
                  <div onClick={()=>row.kind==="instr"&&toggleBP(row.addr)}
                    style={{width:22,flexShrink:0,textAlign:"center",cursor:row.kind==="instr"?"pointer":"default",paddingTop:1,alignSelf:"center"}}>
                    {row.kind==="instr"&&(hasBP
                      ?<span style={{color:"#f85149",fontSize:12}}>●</span>
                      :<span style={{color:"#21262d",fontSize:10,opacity:0.4}}>○</span>
                    )}
                  </div>
                  {/* dirección */}
                  <span style={{color:isPC?"#3fb950":isDato?"#1f5fa6":isPast?"#21262d":"#3a4a3a",
                    fontSize:10,width:22,flexShrink:0,fontWeight:isPC?"bold":"normal"}}>{toHex2(row.addr)}</span>
                  {/* etiqueta */}
                  <span style={{color:isDato?"#0088cc":"#00aaff",fontSize:10,width:76,
                    flexShrink:0,textAlign:"right",paddingRight:6}}>
                    {row.label?`${row.label} :`:""}
                  </span>
                  {/* mnemónico */}
                  <span style={{
                    color:isDato?"#006688":isPC?MNCOL[row.mnemonic]||"#3fb950":isPast?"#21262d":MNCOL[row.mnemonic]||"#00cc44",
                    fontSize:11,width:38,flexShrink:0,fontWeight:isPC?"bold":"normal",letterSpacing:0.5}}>
                    {row.mnemonic}
                  </span>
                  {/* operandos */}
                  {isDato?(
                    <>
                      <span style={{color:isRef?"#00ffaa":"#0088aa",fontSize:11,minWidth:50}}>{row.op1}</span>
                      {dataVal!==null&&(
                        <span style={{color:isRef?"#00ffaa":"#004455",fontSize:10,marginLeft:8}}>
                          → {toHex4(dataVal)}  ({dataVal}){isRef?" ◀":""}
                        </span>
                      )}
                    </>
                  ):(
                    <>
                      <span style={{color:isPC?"#b3e6ff":isPast?"#21262d":"#79c0ff",fontSize:11,minWidth:72}}>{row.op1||""}</span>
                      {row.op2&&<>
                        <span style={{color:"#21262d",fontSize:11,width:10,textAlign:"center"}}>,</span>
                        <span style={{color:isPC?"#b3e6ff":isPast?"#21262d":"#79c0ff",fontSize:11}}>{row.op2}</span>
                      </>}
                      <span style={{color:"#1c2128",fontSize:9,marginLeft:"auto",paddingRight:10,alignSelf:"center"}}>
                        {row.word!==null?toHex4(row.word):""}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
            {!r&&<div style={{color:"#004422",fontSize:11,padding:"20px 16px"}}>Ensambla un programa para ver el listado.</div>}
          </div>
        </div>

        {/* ══ RIGHT: SÍMBOLOS + BREAKPOINTS + LOG ══ */}
        <div style={{borderLeft:"1px solid #21262d",display:"flex",flexDirection:"column",background:"#0d1117",overflow:"hidden"}}>

          {/* TABLA SÍMBOLOS */}
          {r&&Object.keys(r.symData).length>0&&(
            <div style={{borderBottom:"1px solid #21262d",padding:"8px 12px",flexShrink:0}}>
              <div style={{color:"#444c56",fontSize:8,letterSpacing:2,marginBottom:6}}>TABLA DE SÍMBOLOS</div>
              {Object.entries(r.symData).map(([name,addr])=>{
                const val = c?.data[addr]??0;
                const isRefSym = refAddrs.has(addr);
                const isEditing= editCell?.addr===addr;
                return (
                  <div key={name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,
                    padding:"2px 6px",borderRadius:5,
                    background:isRefSym?"#0d2c1a":isEditing?"#0d1a25":"transparent",
                    border:`1px solid ${isRefSym?"#2d6a35":isEditing?"#1f5fa6":"transparent"}`,
                    cursor:"pointer",transition:"all 0.15s"}}
                    onClick={()=>!running&&!isEditing&&setEditCell({addr,val:String(val)})}>
                    <span style={{color:isRefSym?"#3fb950":"#58a6ff",fontSize:10,fontWeight:"bold",minWidth:62,flexShrink:0}}>{name}</span>
                    <span style={{color:"#30363d",fontSize:9}}>[{toHex2(addr)}]</span>
                    <div style={{marginLeft:"auto"}}>
                      {isEditing?(
                        <input autoFocus value={editCell.val}
                          onChange={e=>setEditCell({addr,val:e.target.value})}
                          onBlur={commitCell}
                          onKeyDown={e=>{if(e.key==="Enter")commitCell();if(e.key==="Escape")setEditCell(null);}}
                          onClick={e=>e.stopPropagation()}
                          style={{background:"#0d1a25",color:"#58a6ff",border:"1px solid #1f5fa6",
                            borderRadius:3,padding:"1px 5px",width:50,fontSize:10,fontFamily:"inherit",outline:"none"}}/>
                      ):(
                        <span style={{color:isRefSym?"#3fb950":"#adbac7",fontSize:11,
                          fontWeight:isRefSym?"bold":"normal",background:isRefSym?"#0d3320":"#161b22",
                          padding:"1px 7px",borderRadius:4,border:`1px solid ${isRefSym?"#2d6a35":"#21262d"}`}}>
                          {toHex4(val)}
                        </span>
                      )}
                    </div>
                    {isRefSym&&<span style={{color:"#3fb950",fontSize:9}}>◀</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* BREAKPOINTS */}
          <div style={{borderBottom:"1px solid #21262d",padding:"8px 12px",flexShrink:0,minHeight:60}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
              <span style={{color:"#444c56",fontSize:8,letterSpacing:2}}>BREAKPOINTS</span>
              {breakpoints.size>0&&(
                <button onClick={()=>setBreakpoints(new Set())}
                  style={{marginLeft:"auto",background:"none",border:"none",color:"#444c56",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>
                  borrar todos
                </button>
              )}
            </div>
            {breakpoints.size===0&&<div style={{color:"#30363d",fontSize:10}}>Clic en ○ del listado para añadir</div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {[...breakpoints].sort((a,b)=>a-b).map(addr=>{
                const row = r?.listing?.find(rw=>rw.kind==="instr"&&rw.addr===addr);
                return (
                  <div key={addr} onClick={()=>toggleBP(addr)}
                    style={{display:"flex",alignItems:"center",gap:4,background:"#1a0505",
                      border:"1px solid #5c1e1e",borderRadius:12,padding:"2px 8px",cursor:"pointer"}}>
                    <span style={{color:"#f85149",fontSize:9}}>●</span>
                    <span style={{color:"#ff9999",fontSize:10,fontWeight:"bold"}}>{row?.label||toHex2(addr)}</span>
                    <span style={{color:"#5c1e1e",fontSize:9}}>×</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LOG */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"7px 12px",borderBottom:"1px solid #21262d",display:"flex",alignItems:"center"}}>
              <span style={{color:"#444c56",fontSize:8,letterSpacing:2}}>TRAZA DE EJECUCIÓN</span>
              <span style={{marginLeft:6,color:"#30363d",fontSize:9}}>({c?.tick??0} pasos)</span>
              <button onClick={()=>setCpu(s=>s?{...s,log:[]}:s)}
                style={{marginLeft:"auto",background:"none",border:"none",color:"#444c56",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>
                limpiar
              </button>
            </div>
            <div ref={logRef} style={{flex:1,overflowY:"auto",padding:"3px 0"}}>
              {(c?.log||[]).map((line,i)=>{
                const last    = i===(c.log.length-1);
                const isBP    = line.includes("BREAKPOINT");
                const isManual= line.includes("manual")||line.includes("PC←");
                const isHalt  = line.includes("HALT");
                return (
                  <div key={i} style={{
                    padding:"1px 12px",fontSize:9,lineHeight:1.75,
                    color:isHalt?"#f47067":isBP?"#f0883e":isManual?"#3fb950":last?"#adbac7":"#30363d",
                    borderLeft:`2px solid ${last&&!isBP?"#58a6ff":isBP?"#f0883e":isHalt?"#f47067":"transparent"}`,
                    background:last?"#0d1a25":isBP?"#1a0e05":"transparent",
                    fontWeight:isBP||isHalt?"bold":"normal"
                  }}>{line}</div>
                );
              })}
              {!c?.log?.length&&<div style={{color:"#21262d",fontSize:10,padding:"8px 12px"}}>Sin actividad</div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MaquinaSimple/>);