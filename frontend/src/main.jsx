import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BarChart, Bar, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, ReferenceLine} from 'recharts';
import {Anchor, ArrowDownRight, ArrowUpRight, BarChart3, BrainCircuit, ChevronRight, CircleAlert, CloudCog, Gauge, Layers3, MapPinned, Menu, PanelLeftClose, Route, ShipWheel, ShieldCheck, SlidersHorizontal, Sparkles, Target, Timer, X, Zap} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || '';

const fallback = {
  market:{bdi_reference:3432,bdi_as_of:'2026-09-22',australia_coal_reference_usd_t:109.8,route_proxy_current_usd_t:33.7,trend:'Rising',volatility_index:18,forecast_method:'Explainable hybrid baseline'},
  forecast:[1,2,3,4,5,6].map((m,i)=>({month:m,p10:31.4+i*.45,p50:33.8+i*.55,p90:36.2+i*.72})),
  vessels:[
    {name:'MV Eastern Horizon',class:'Panamax',dwt:76000,loa:225,beam:32.3,draft:13.5,speed:13.5,fuel_laden:28,availability:86,feasible:true,reasons:['Dimensions are within current port envelope'],utilization_pct:93,score:83},
    {name:'MV Ocean Meridian',class:'Supramax',dwt:58000,loa:190,beam:32.2,draft:12.6,speed:13.2,fuel_laden:24,availability:91,feasible:true,reasons:['Dimensions are within current port envelope'],utilization_pct:86,score:82},
    {name:'MV Coast Trader',class:'Handysize',dwt:38000,loa:180,beam:30,draft:10.5,speed:12.8,fuel_laden:21,availability:94,feasible:true,reasons:['Dimensions are within current port envelope'],utilization_pct:100,score:74},
    {name:'MV Cape Pioneer',class:'Capesize',dwt:150000,loa:275,beam:43,draft:17,availability:63,feasible:false,reasons:['Draft 17m exceeds berth limit 14.5m'],utilization_pct:100,score:41},
  ],
  ports:[
    {name:'Dhamra',lat:20.785,lon:86.968,max_loa:305,max_beam:48,max_draft:18,handling:60000,congestion:27,waiting_days:1.7,transit_days:12.8,route_score:82},
    {name:'Gangavaram',lat:17.602,lon:83.220,max_loa:300,max_beam:50,max_draft:17.8,handling:65000,congestion:31,waiting_days:1.9,transit_days:13.8,route_score:79},
    {name:'Paradip',lat:20.264,lon:86.704,max_loa:300,max_beam:46,max_draft:14.5,handling:52000,congestion:38,waiting_days:2.3,transit_days:13.0,route_score:75},
    {name:'Gopalpur',lat:19.258,lon:84.910,max_loa:245,max_beam:40,max_draft:12.5,handling:32000,congestion:22,waiting_days:1.5,transit_days:13.4,route_score:73},
    {name:'Visakhapatnam',lat:17.686,lon:83.218,max_loa:240,max_beam:42,max_draft:14.5,handling:47000,congestion:44,waiting_days:2.7,transit_days:14.2,route_score:71},
    {name:'Sagar-Sandheads',lat:21.64,lon:88.03,max_loa:290,max_beam:46,max_draft:13.5,handling:40000,congestion:36,waiting_days:2.2,transit_days:13.1,route_score:69},
    {name:'Haldia',lat:22.025,lon:88.058,max_loa:230,max_beam:36,max_draft:9.8,handling:28000,congestion:51,waiting_days:3.0,transit_days:13.7,route_score:58}
  ]
};

async function post(path, body){
  try{
    const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok) throw new Error('API '+r.status);
    return await r.json();
  } catch(e){ return null; }
}

function fmtMoney(n){ return new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n); }

function App(){
  const [navOpen,setNavOpen]=useState(true);
  const [active,setActive]=useState('workspace');
  const [cargo,setCargo]=useState({commodity:'Coal',quantity_mt:300000,origin:'Australia',destination:'Paradip',horizon_months:6,shipments:5,bunker_usd_t:520,coverage_pref_pct:50,freight_shock_pct:0,congestion_shock_pct:0,vessel_availability_shock_pct:0});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [demoMode,setDemoMode]=useState(true);
  const [toast,setToast]=useState('');

  const data=result||fallback;
  useEffect(()=>{ runAnalysis(cargo, true); },[]);
  function runAnalysis(payload=cargo, initial=false){
    setLoading(true);
    post('/api/procurement/analyze',payload).then(x=>{ if(x) setResult(x); }).finally(()=>setTimeout(()=>setLoading(false), initial?300:500));
  }
  function simulate(payload=cargo){
    setLoading(true);
    post('/api/procurement/simulate',{...payload,scenario_name:'Judge stress test'}).then(x=>{if(x){setResult(x);setToast('Stress test recalculated');}}).finally(()=>setTimeout(()=>setLoading(false),450));
  }
  function showToast(t){setToast(t);setTimeout(()=>setToast(''),2200);}

  const key = useMemo(()=>({
    vessel:data.vessels.find(v=>v.feasible) || data.vessels[0],
    altPort:[...data.ports].sort((a,b)=>b.route_score-a.route_score)[0],
    current: data.market?.route_proxy_current_usd_t || 33.7,
    next: data.forecast?.[0]?.p50 || 34.2,
    confidence:data.confidence||74
  }),[data]);

  const nav=[
    ['workspace','Decision Workspace',Target],
    ['forecast','Freight Forecast',BarChart3],
    ['fleet','Vessel Intelligence',ShipWheel],
    ['ports','Port Feasibility',MapPinned],
    ['contracts','Contract Coverage',Layers3],
    ['simulator','What-if Lab',SlidersHorizontal],
  ];

  return <div className="appShell">
    <aside className={'sidebar '+(navOpen?'':'closed')}>
      <div className="brand"><div className="brandMark"><Anchor size={17}/></div><div><b>CharterIQ</b><span>Procurement Digital Twin</span></div></div>
      <div className="modeBadge"><span className="pulse"></span> SIH BUILD • RESEARCH-BACKED</div>
      <div className="navGroup">
        <div className="navLabel">Decision system</div>
        {nav.map(([id,label,Icon])=><button key={id} className={'navItem '+(active===id?'active':'')} onClick={()=>setActive(id)}><Icon size={17}/><span>{label}</span><ChevronRight size={15} className="navChevron"/></button>)}
      </div>
      <div className="sidebarFoot"><div className="miniCard"><Sparkles size={16}/><div><b>Why this is different</b><span>Forecast → feasibility → coverage → stress test</span></div></div></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="iconBtn" onClick={()=>setNavOpen(!navOpen)}>{navOpen?<PanelLeftClose size={18}/>:<Menu size={18}/>}</button>
        <div className="crumb">Decision workspace <span>/</span> East Coast India</div>
        <div className="topActions"><span className="dataPill"><span className="greenDot"></span> Prototype data mode</span><button className="iconBtn"><CircleAlert size={18}/></button></div>
      </header>

      <div className="content">
        <section className="heroRow">
          <div><div className="eyebrow">FUTURE CARGO PROCUREMENT</div><h1>Decide before the market decides for you.</h1><p>CharterIQ turns a future cargo requirement into a transparent decision landscape across freight, vessel, port, contract and disruption risk.</p></div>
          <div className="heroActions"><button className="primaryBtn" onClick={()=>{onAnalyze(cargo);showToast('Procurement analysis refreshed')}}><Zap size={16}/> Analyze procurement</button><button className="ghostBtn" onClick={simulate}><SlidersHorizontal size={16}/> Run stress test</button></div>
        </section>

        <section className="scenarioBar">
          <div className="scenarioTitle"><Target size={18}/><div><b>Cargo requirement</b><span>Scenario input drives every downstream module</span></div></div>
          <select value={cargo.commodity} onChange={e=>setCargo({...cargo,commodity:e.target.value})}><option>Coal</option><option>Iron Ore</option><option>Limestone</option><option>Other Bulk</option></select>
          <div className="field"><span>Quantity</span><input type="number" value={cargo.quantity_mt} onChange={e=>setCargo({...cargo,quantity_mt:Number(e.target.value)})}/><small>MT</small></div>
          <select value={cargo.origin} onChange={e=>setCargo({...cargo,origin:e.target.value})}><option>Australia</option><option>Indonesia</option><option>Mozambique</option><option>US</option><option>Russia</option></select>
          <select value={cargo.destination} onChange={e=>setCargo({...cargo,destination:e.target.value})}><option>Paradip</option><option>Dhamra</option><option>Visakhapatnam</option><option>Gangavaram</option><option>Gopalpur</option><option>Haldia</option><option>Sagar-Sandheads</option></select>
          <div className="field compact"><span>Window</span><input type="number" min="1" max="24" value={cargo.horizon_months} onChange={e=>setCargo({...cargo,horizon_months:Number(e.target.value)})}/><small>mo</small></div>
          <button className="applyBtn" onClick={()=>runAnalysis()}>Apply</button>
        </section>

        {active==='workspace' && <Workspace data={data} keyData={key} cargo={cargo} setCargo={setCargo} onSimulate={simulate} onAnalyze={runAnalysis} loading={loading} onNavigate={setActive} demoMode={demoMode} setDemoMode={setDemoMode} showToast={showToast}/>} 
        {active==='forecast' && <Forecast data={data} />}
        {active==='fleet' && <Fleet data={data}/>} 
        {active==='ports' && <Ports data={data}/>} 
        {active==='contracts' && <Contracts data={data} cargo={cargo} setCargo={setCargo}/>} 
        {active==='simulator' && <Simulator data={data} cargo={cargo} setCargo={setCargo} onRun={simulate} loading={loading}/>} 
      </div>
      {toast && <div className="toast"><ShieldCheck size={16}/>{toast}</div>}
    </main>
  </div>
}

function SectionHeader({eyebrow,title,action}){return <div className="sectionHeader"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action}</div>}

function Workspace({data,keyData,cargo,setCargo,onSimulate,onAnalyze,loading,onNavigate,demoMode,setDemoMode,showToast}){
  const f=data.forecast||[];
  const port=data.ports?.find(p=>p.name===cargo.destination)||data.ports?.[0];
  const selected=keyData.vessel;
  const risk=Math.round((data.market?.volatility_index||18)*0.82);
  return <>
    <section className="metricGrid">
      <Metric title="Freight proxy" value={'$'+keyData.current.toFixed(1)} unit="/t" trend={data.market?.trend} note="Prototype route estimate" icon={BarChart3}/>
      <Metric title="Forecast confidence" value={(data.confidence||74)+'%'} trend="Stable" note="Model transparency: hybrid baseline" icon={BrainCircuit}/>
      <Metric title="Port pressure" value={(port?.congestion||38)+'%'} trend={port?.congestion>45?'Watch':'Normal'} note={(port?.name||cargo.destination)+' congestion index'} icon={MapPinned}/>
      <Metric title="Market exposure" value={cargo.coverage_pref_pct<40?'High':cargo.coverage_pref_pct<70?'Medium':'Lower'} trend="Scenario" note={`${100-cargo.coverage_pref_pct}% uncovered volume`} icon={Gauge}/>
    </section>

    <section className="grid2">
      <div className="panel heroPanel">
        <div className="panelHead"><div><div className="eyebrow">FORECAST SIGNAL</div><h3>Freight outlook</h3></div><div className="signal"><span className="signalDot"></span>{data.market?.trend||'Rising'} pressure</div></div>
        <div className="chartWrap tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={f}><defs><linearGradient id="band" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.24}/><stop offset="100%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1b2a3a"/><XAxis dataKey="month" tickFormatter={v=>`M${v}`} stroke="#7f93a7"/><YAxis stroke="#7f93a7"/><Tooltip contentStyle={{background:'#0c1824',border:'1px solid #243849',borderRadius:10,color:'#fff'}}/><Area type="monotone" dataKey="p90" stroke="none" fill="url(#band)"/><Area type="monotone" dataKey="p10" stroke="none" fill="transparent"/><Line type="monotone" dataKey="p50" stroke="#50c9ff" strokeWidth={3} dot={false}/></AreaChart></ResponsiveContainer></div>
        <div className="chartFooter"><span><i className="legendLine"></i>P50 forecast</span><span><i className="legendBand"></i>P10–P90 uncertainty band</span><span className="tinyNote">Proxy series • not a licensed route quote</span></div>
      </div>

      <div className="panel decisionPanel">
        <div className="panelHead"><div><div className="eyebrow">DECISION SNAPSHOT</div><h3>What changed the landscape?</h3></div><span className="confidence"><ShieldCheck size={14}/>{data.confidence||74}% confidence</span></div>
        <div className="decisionFlow">
          <FlowNode label="Market" value={`${data.market?.trend||'Rising'} trend`} accent="blue" />
          <FlowNode label="Vessel" value={`${selected?.class||'Panamax'} feasible`} accent="green" />
          <FlowNode label="Port" value={`${port?.name||cargo.destination} • ${port?.congestion||38}% pressure`} accent={port?.congestion>45?'amber':'green'} />
          <FlowNode label="Coverage" value={`${cargo.coverage_pref_pct}% targeted`} accent="purple" />
        </div>
        <div className="decisionNote"><Sparkles size={16}/><div><b>Decision note</b><p>{data.decision_note}</p></div></div>
        <button className="textBtn" onClick={()=>onNavigate('simulator')}>Open stress test <ChevronRight size={15}/></button>
      </div>
    </section>

    <section className="grid3">
      <div className="panel miniPanel"><div className="panelHead"><div><div className="eyebrow">VESSEL MATCH</div><h3>{selected?.class||'Panamax'}</h3></div><span className="tag success">FEASIBLE</span></div><div className="bigRow"><b>{selected?.name}</b><span>{selected?.dwt?.toLocaleString()} DWT</span></div><div className="reasonList">{(selected?.reasons||[]).map(r=><div key={r}><ShieldCheck size={14}/>{r}</div>)}</div><button className="textBtn" onClick={()=>onNavigate('fleet')}>Inspect fleet <ChevronRight size={15}/></button></div>
      <div className="panel miniPanel"><div className="panelHead"><div><div className="eyebrow">PORT ALTERNATIVE</div><h3>Resilience option</h3></div><span className="tag info">AUTO-EVALUATED</span></div><div className="bigRow"><b>{data.ports?.[0]?.name}</b><span>{data.ports?.[0]?.congestion}% pressure</span></div><div className="altMetrics"><div><b>{data.ports?.[0]?.waiting_days}</b><span>wait days</span></div><div><b>{data.ports?.[0]?.handling?.toLocaleString()}</b><span>MT/day handle</span></div><div><b>{data.ports?.[0]?.max_draft}m</b><span>max draft</span></div></div><button className="textBtn" onClick={()=>onNavigate('ports')}>Compare ports <ChevronRight size={15}/></button></div>
      <div className="panel miniPanel"><div className="panelHead"><div><div className="eyebrow">DATA TRUST</div><h3>Evidence layer</h3></div><span className="tag warning">PROTOTYPE</span></div><div className="dataTrust"><div className="trustItem"><span>Market benchmark</span><b>BDI {data.market?.bdi_reference?.toLocaleString()}</b></div><div className="trustItem"><span>Port constraints</span><b>Research-backed</b></div><div className="trustItem"><span>Route series</span><b>Proxy / synthetic</b></div><div className="trustItem"><span>Production feeds</span><b>Adapter-ready</b></div></div><button className="textBtn" onClick={()=>showToast('See research/competitive_scan.md')}>View lineage <ChevronRight size={15}/></button></div>
    </section>

    <section className="grid2 riskSection"><div className="panel"><div className="panelHead"><div><div className="eyebrow">RISK RADAR</div><h3>What could break the plan?</h3></div><span className="tag warning">MONITOR</span></div><div className="riskList">{(data.alerts&&data.alerts.length?data.alerts:[{severity:'watch',title:'No critical alert',detail:'Baseline scenario is currently within the demo guardrails.'}]).map((a,i)=><div className="riskItem" key={i}><span className={'riskIcon '+(a.severity==='critical'?'critical':'watch')}><CircleAlert size={14}/></span><div><b>{a.title}</b><p>{a.detail}</p></div></div>)}</div></div><div className="panel"><div className="eyebrow">DRIVER ATTRIBUTION</div><h3>Why the landscape looks like this</h3><div className="driverBars">{(data.drivers||[]).map(d=><div className="driverBar" key={d.name}><div><span>{d.name}</span><b>{d.weight}%</b></div><div className="barTrack"><i style={{width:d.weight+'%'}}></i></div></div>)}</div><div className="tinyNoteBlock">Weights are explanatory prototype signals, not causal estimates of the real market.</div></div></section>

    <section className="panel agentStrip"><div><div className="eyebrow">ORCHESTRATED INTELLIGENCE</div><h3>Five workers. One scenario state.</h3></div><div className="agentRow">{[['Market',BarChart3,'Forecast + uncertainty'],['Vessel',ShipWheel,'Fit + availability'],['Port',MapPinned,'Constraints + congestion'],['Procurement',Layers3,'Coverage trade-offs'],['Disruption',CircleAlert,'Stress + resilience']].map(([n,I,d])=><div className="agentChip" key={n}><span className="agentIcon"><I size={14}/></span><div><b>{n} Agent</b><small>{d}</small></div><span className="agentLive">LIVE</span></div>)}</div></section>

    <section className="panel commandPanel"><div><div className="eyebrow">JUDGE DEMO</div><h3>One-click scenario choreography</h3><p>Start from the cargo requirement, then change one shock at a time. Every downstream module recalculates from the same scenario state.</p></div><div className="commandButtons"><button onClick={()=>{const next={...cargo,freight_shock_pct:0,congestion_shock_pct:0,vessel_availability_shock_pct:0};setCargo(next);onSimulate(next)}}>Baseline</button><button onClick={()=>{const next={...cargo,freight_shock_pct:15};setCargo(next);onSimulate(next)}}>Freight +15%</button><button onClick={()=>{const next={...cargo,congestion_shock_pct:30};setCargo(next);onSimulate(next)}}>Congestion +30%</button><button onClick={()=>{const next={...cargo,vessel_availability_shock_pct:-35};setCargo(next);onSimulate(next)}}>Vessel availability −35%</button></div></section>
    <div className="disclaimer"><CircleAlert size={15}/> Prototype is research-backed and scenario-ready. Replace proxy freight / availability / congestion feeds with licensed or institution-approved live data before operational use.</div>
  </>
}

function Metric({title,value,unit,trend,note,icon:Icon}){const rising=trend==='Rising'; return <div className="metric"><div className="metricIcon"><Icon size={17}/></div><div className="metricText"><span>{title}</span><div><b>{value}</b><small>{unit}</small></div><p>{note}</p></div><span className={'microTrend '+(rising?'up':'neutral')}>{rising?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>} {trend}</span></div>}
function FlowNode({label,value,accent}){return <div className={'flowNode '+accent}><span>{label}</span><b>{value}</b></div>}

function Forecast({data}){return <section><SectionHeader eyebrow="FREIGHT SIGNAL" title="Forecast with uncertainty" action={<span className="dataPill"><span className="blueDot"></span>{data.market?.forecast_method}</span>}/><div className="grid2"><div className="panel"><div className="chartWrap xl"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.forecast}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1b2a3a"/><XAxis dataKey="month" tickFormatter={v=>`Month ${v}`} stroke="#7f93a7"/><YAxis stroke="#7f93a7"/><Tooltip contentStyle={{background:'#0c1824',border:'1px solid #243849',borderRadius:10,color:'#fff'}}/><Line type="monotone" dataKey="p10" stroke="#7f93a7" strokeDasharray="6 5" dot={false}/><Line type="monotone" dataKey="p50" stroke="#50c9ff" strokeWidth={3} dot={false}/><Line type="monotone" dataKey="p90" stroke="#7f93a7" strokeDasharray="6 5" dot={false}/><ReferenceLine y={data.market?.route_proxy_current_usd_t} stroke="#95a8bb" strokeDasharray="4 4" label={{value:'Current proxy',position:'insideTopLeft',fill:'#95a8bb'}}/></LineChart></ResponsiveContainer></div></div><div className="panel"><div className="eyebrow">MODEL CARD</div><div className="modelCard"><div><b>Explainable hybrid baseline</b><p>Recent level + local trend + mild seasonality. Confidence is reduced as volatility and forecast error grow.</p></div><div className="driver"><span>Trend</span><b>{data.market?.trend}</b></div><div className="driver"><span>Volatility index</span><b>{data.market?.volatility_index}/100</b></div><div className="driver"><span>Market reference</span><b>BDI {data.market?.bdi_reference?.toLocaleString()}</b></div><div className="driver"><span>Australian coal ref.</span><b>${data.market?.australia_coal_reference_usd_t}/t</b></div></div></div></div></section>}

function Fleet({data}){return <section><SectionHeader eyebrow="VESSEL INTELLIGENCE" title="Match cargo economics to physical reality" action={<span className="dataPill"><span className="greenDot"></span>Hard constraints enforced</span>}/><div className="panel tablePanel"><table><thead><tr><th>Vessel</th><th>Class</th><th>DWT</th><th>Draft</th><th>Availability</th><th>Port fit</th><th>Why</th></tr></thead><tbody>{data.vessels?.map(v=><tr key={v.name}><td><b>{v.name}</b></td><td>{v.class}</td><td>{v.dwt.toLocaleString()}</td><td>{v.draft}m</td><td><div className="progress"><span style={{width:v.availability+'%'}}></span></div><small>{v.availability}%</small></td><td><span className={'tag '+(v.feasible?'success':'danger')}>{v.feasible?'FEASIBLE':'BLOCKED'}</span></td><td>{v.reasons?.[0]}</td></tr>)}</tbody></table></div></section>}

function Ports({data}){return <section><SectionHeader eyebrow="PORT FEASIBILITY" title="Port choice is a constraint problem, not a dropdown" action={<span className="dataPill"><span className="amberDot"></span>Congestion shock enabled</span>}/><div className="panel routeMap"><div className="mapHeader"><div><div className="eyebrow">EAST COAST CORRIDOR</div><h3>Origin → destination resilience</h3><span>Illustrative geography for decision orientation; economics come from the engine.</span></div><div className="routeLegend"><span><i className="routeLine"></i>Trade corridor</span><span><i className="portPoint"></i>Port</span></div></div><div className="mapCanvas"><div className="seaGlow"></div><div className="indiaShape"></div><div className="originDot" style={{left:'24%',top:'23%'}}><span>Australia</span></div>{data.ports?.map((p,i)=>{const positions=[[64,22],[67,39],[60,51],[55,63],[71,68],[66,82],[74,59]];const [x,y]=positions[i%positions.length];return <div key={p.name} className={'mapPort '+(p.congestion>45?'watch':'')} style={{left:x+'%',top:y+'%'}}><span className="dot"></span><div><b>{p.name}</b><small>{p.congestion}% pressure</small></div></div>})}<div className="corridorStroke"></div></div></div><div className="grid3">{data.ports?.map(p=><div className="panel portCard" key={p.name}><div className="portTop"><div className="portIcon"><MapPinned size={17}/></div><div><h3>{p.name}</h3><span>{p.congestion}% congestion index</span></div><span className={'tag '+(p.congestion>45?'warning':'success')}>{p.congestion>45?'WATCH':'NORMAL'}</span></div><div className="portStats"><div><span>Max LOA</span><b>{p.max_loa}m</b></div><div><span>Max draft</span><b>{p.max_draft}m</b></div><div><span>Handling</span><b>{p.handling.toLocaleString()} MT/day</b></div><div><span>Wait est.</span><b>{p.waiting_days} days</b></div></div><div className="scoreRow"><span>Resilience score</span><b>{p.route_score}</b></div></div>)}</div><div className="disclaimer"><CircleAlert size={15}/> Port constraints are seeded from public port-authority specifications where available; congestion and route economics are prototype assumptions until live telemetry is integrated.</div></section>}

function Contracts({data,cargo,setCargo}){return <section><SectionHeader eyebrow="CONTRACT COVERAGE OPTIMIZER" title="Compare exposure, certainty and flexibility" action={<span className="dataPill"><span className="purpleDot"></span>Preference: {cargo.coverage_pref_pct}% coverage</span>}/><div className="coverageControl"><div><b>Target coverage</b><span>How much future cargo do you want secured?</span></div><input type="range" min="0" max="100" step="5" value={cargo.coverage_pref_pct} onChange={e=>setCargo({...cargo,coverage_pref_pct:Number(e.target.value)})}/><b>{cargo.coverage_pref_pct}%</b></div><div className="panel tablePanel"><table><thead><tr><th>Strategy</th><th>Coverage</th><th>Expected freight</th><th>Procurement cost</th><th>Market exposure</th><th>Flexibility</th><th>Trade-off</th></tr></thead><tbody>{data.contract_strategies?.map(s=><tr key={s.strategy} className={Math.abs(s.coverage_pct-cargo.coverage_pref_pct)<=10?'highlight':''}><td><b>{s.strategy}</b></td><td>{s.coverage_pct}%</td><td>${s.expected_freight_usd_t}/t</td><td>${fmtMoney(s.expected_procurement_usd)}</td><td>${fmtMoney(s.market_exposure_usd)}</td><td>{s.flexibility_pct}%</td><td>{s.tradeoff}</td></tr>)}</tbody></table></div><div className="disclaimer"><CircleAlert size={15}/> CharterIQ does not hard-code a universal “best” contract. It surfaces the decision trade-offs so coverage can be chosen against risk appetite, flexibility and procurement objectives.</div></section>}

function Simulator({data,cargo,setCargo,onRun,loading}){return <section><SectionHeader eyebrow="PROCUREMENT DIGITAL TWIN" title="Stress-test the decision before you commit" action={<span className="dataPill"><span className="redDot"></span>Live scenario state</span>}/><div className="grid2"><div className="panel simPanel"><div className="simRow"><label>Freight shock <b>{cargo.freight_shock_pct}%</b></label><input type="range" min="-20" max="50" step="5" value={cargo.freight_shock_pct} onChange={e=>setCargo({...cargo,freight_shock_pct:Number(e.target.value)})}/></div><div className="simRow"><label>Port congestion shock <b>{cargo.congestion_shock_pct}%</b></label><input type="range" min="0" max="100" step="5" value={cargo.congestion_shock_pct} onChange={e=>setCargo({...cargo,congestion_shock_pct:Number(e.target.value)})}/></div><div className="simRow"><label>Vessel availability shock <b>{cargo.vessel_availability_shock_pct}%</b></label><input type="range" min="-70" max="0" step="5" value={cargo.vessel_availability_shock_pct} onChange={e=>setCargo({...cargo,vessel_availability_shock_pct:Number(e.target.value)})}/></div><button className="primaryBtn full" disabled={loading} onClick={onRun}>{loading?<Timer size={16}/>:<Zap size={16}/>} {loading?'Recalculating…':'Run scenario'}</button></div><div className="panel"><div className="eyebrow">IMPACT VIEW</div><div className="impactGrid"><Impact label="Forecast midpoint" value={`$${data.forecast?.[0]?.p50?.toFixed(1)}/t`} note="30-day entry signal"/><Impact label="Port congestion" value={`${data.ports?.find(p=>p.name===cargo.destination)?.congestion||0}%`} note={cargo.congestion_shock_pct?'Shock applied':'Baseline'}/><Impact label="Vessel availability" value={`${data.vessels?.find(v=>v.feasible)?.availability||0}%`} note="Adjusted for scenario"/><Impact label="Confidence" value={`${data.confidence||0}%`} note="Recalculated"/></div><div className="changeLog"><b>Explain the change</b><p>{cargo.freight_shock_pct||cargo.congestion_shock_pct||cargo.vessel_availability_shock_pct ? 'The scenario perturbs the shared state, so forecast, port pressure, vessel availability and contract exposure are recalculated together.' : 'Baseline scenario: no shocks have been injected.'}</p></div></div></div></section>}
function Impact({label,value,note}){return <div className="impact"><span>{label}</span><b>{value}</b><small>{note}</small></div>}

createRoot(document.getElementById('root')).render(<App/>);
