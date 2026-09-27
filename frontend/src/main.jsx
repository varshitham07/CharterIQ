import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine
} from "recharts";

import {
  Anchor, ArrowDownRight, ArrowUpRight, BarChart3 as ChartIcon, BrainCircuit,
  ChevronRight, CircleAlert, Gauge, Layers3, MapPinned, Menu, PanelLeftClose,
  Route, ShipWheel, ShieldCheck, SlidersHorizontal, Sparkles, Target, Timer, Zap,
  Database, Waves, Activity, Globe2, Fuel, CircleDot, ExternalLink
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || '';

const PHOTO_HERO = 'https://images.unsplash.com/photo-1742576437150-3a79cae681f2?auto=format&fit=crop&fm=jpg&q=85&w=2200';
const PHOTO_PORT = 'https://images.unsplash.com/photo-1774929106778-6b2025b2555a?auto=format&fit=crop&fm=jpg&q=80&w=1600';
const PHOTO_LOADING = 'https://images.unsplash.com/photo-1759216373387-8c9fcbcfd75b?auto=format&fit=crop&fm=jpg&q=80&w=1600';

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
    {name:'Haldia',lat:22.025,lon:88.058,max_loa:230,max_beam:36,max_draft:9.8,handling:28000,waiting_days:3.0,transit_days:13.7,route_score:58}
  ],
  confidence:74,
  drivers:[{name:'Freight trend',weight:34},{name:'Port congestion',weight:23},{name:'Cargo coverage',weight:20},{name:'Vessel availability',weight:23}],
  alerts:[],
  decision_note:'No single strategy is universally optimal. CharterIQ exposes cost, exposure and flexibility trade-offs so the charterer can select a strategy consistent with the cargo plan and risk appetite.'
};

async function get(path){
  try{ const r=await fetch(API+path); if(!r.ok) throw new Error(); return await r.json(); }catch{return null;}
}
async function post(path,body){
  try{ const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok) throw new Error(); return await r.json(); }catch{return null;}
}
function money(n){return new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n||0);}
function pct(n){return `${Math.round(n||0)}%`;}

function App(){
  const [navOpen,setNavOpen]=useState(true);
  const [active,setActive]=useState('workspace');
  const [cargo,setCargo]=useState({commodity:'Coal',quantity_mt:300000,origin:'Australia',destination:'Paradip',horizon_months:6,shipments:5,bunker_usd_t:520,coverage_pref_pct:50,freight_shock_pct:0,congestion_shock_pct:0,vessel_availability_shock_pct:0});
  const [result,setResult]=useState(null);
  const [market,setMarket]=useState(null);
  const [loading,setLoading]=useState(false);
  const [toast,setToast]=useState('');

  useEffect(()=>{ runAnalysis(cargo,true); get('/api/market/snapshot').then(setMarket); },[]);

  function runAnalysis(payload=cargo,initial=false){
    setLoading(true);
    post('/api/procurement/analyze',payload).then(x=>{if(x)setResult(x);}).finally(()=>setTimeout(()=>setLoading(false),initial?250:450));
  }
  function simulate(payload=cargo){
    setLoading(true);
    post('/api/procurement/simulate',{...payload,scenario_name:'CharterIQ stress test'}).then(x=>{if(x){setResult(x);showToast('Scenario recalculated');}}).finally(()=>setTimeout(()=>setLoading(false),450));
  }
  function showToast(t){setToast(t);setTimeout(()=>setToast(''),2200);}

  const data=result||fallback;
  const key=useMemo(()=>({
    vessel:data.vessels.find(v=>v.feasible)||data.vessels[0],
    port:data.ports.find(p=>p.name===cargo.destination)||data.ports[0],
    alt:[...data.ports].sort((a,b)=>b.route_score-a.route_score)[0],
    current:data.market?.route_proxy_current_usd_t||33.7
  }),[data,cargo.destination]);

  const nav=[
    ['workspace','Decision Workspace',Target],
    ['forecast','Freight Forecast',ChartIcon],
    ['fleet','Vessel Intelligence',ShipWheel],
    ['ports','Port Feasibility',MapPinned],
    ['contracts','Contract Coverage',Layers3],
    ['simulator','What-if Lab',SlidersHorizontal]
  ];

  return <div className="appShell">
    <aside className={'sidebar '+(navOpen?'':'closed')}>
      <div className="brand"><div className="brandMark"><Anchor size={17}/></div><div><b>CharterIQ</b><span>Freight intelligence system</span></div></div>
      <div className="modeBadge"><span className="pulse"></span> SIH26006 • PROTOTYPE</div>
      <div className="navLabel">Decision system</div>
      {nav.map(([id,label,Icon])=><button key={id} className={'navItem '+(active===id?'active':'')} onClick={()=>setActive(id)}><Icon size={17}/><span>{label}</span><ChevronRight size={14} className="navChevron"/></button>)}
      <div className="sidebarFoot">
        <div className="miniCard"><Database size={16}/><div><b>Evidence first</b><span>Research-backed constraints + explicit proxy disclosure.</span></div></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="iconBtn" onClick={()=>setNavOpen(!navOpen)}>{navOpen?<PanelLeftClose size={18}/>:<Menu size={18}/>}</button>
        <div className="crumb">CharterIQ <span>/</span> East Coast India <span>/</span> {cargo.origin} → {cargo.destination}</div>
        <div className="topActions"><span className="dataPill"><span className="greenDot"></span> Research-backed data mode</span><span className="topDate">AS OF {data.as_of||'2026-09-23'}</span></div>
      </header>

      <div className="content">
        <Hero cargo={cargo} market={market} loading={loading} onAnalyze={()=>runAnalysis()} onSimulate={()=>simulate()} />

        <section className="scenarioBar">
          <div className="scenarioTitle"><Target size={18}/><div><b>Build a cargo scenario</b><span>One shared state powers every decision module</span></div></div>
          <select value={cargo.commodity} onChange={e=>setCargo({...cargo,commodity:e.target.value})}><option>Coal</option><option>Iron Ore</option><option>Limestone</option><option>Other Bulk</option></select>
          <div className="field"><span>Quantity</span><input type="number" value={cargo.quantity_mt} onChange={e=>setCargo({...cargo,quantity_mt:Number(e.target.value)})}/><small>MT</small></div>
          <select value={cargo.origin} onChange={e=>setCargo({...cargo,origin:e.target.value})}><option>Australia</option><option>Indonesia</option><option>Mozambique</option><option>US</option><option>Russia</option></select>
          <select value={cargo.destination} onChange={e=>setCargo({...cargo,destination:e.target.value})}><option>Paradip</option><option>Dhamra</option><option>Visakhapatnam</option><option>Gangavaram</option><option>Gopalpur</option><option>Haldia</option><option>Sagar-Sandheads</option></select>
          <div className="field compact"><span>Window</span><input type="number" min="1" max="24" value={cargo.horizon_months} onChange={e=>setCargo({...cargo,horizon_months:Number(e.target.value)})}/><small>mo</small></div>
          <button className="applyBtn" onClick={()=>runAnalysis()}>Update landscape <Zap size={13}/></button>
        </section>

        {active==='workspace' && <Workspace data={data} market={market} keyData={key} cargo={cargo} setCargo={setCargo} onSimulate={simulate} onNavigate={setActive} showToast={showToast}/>}
        {active==='forecast' && <Forecast data={data} market={market}/>}
        {active==='fleet' && <Fleet data={data}/>}
        {active==='ports' && <Ports data={data}/>}
        {active==='contracts' && <Contracts data={data} cargo={cargo} setCargo={setCargo}/>}
        {active==='simulator' && <Simulator data={data} cargo={cargo} setCargo={setCargo} onRun={simulate} loading={loading}/>}
      </div>
      <footer className="footer">Photography: Unsplash contributors • Market benchmark: delayed public BDI reference • Route series: explicit prototype proxy • Production connectors remain adapter-ready.</footer>
      {toast && <div className="toast"><ShieldCheck size={16}/>{toast}</div>}
    </main>
  </div>
}

function Hero({cargo,market,loading,onAnalyze,onSimulate}){
  return <section className="hero">
    <div className="heroPhoto" style={{backgroundImage:`url("${PHOTO_HERO}")`}}></div>
    <div className="heroShade"></div>
    <div className="heroGrid"></div>
    <div className="routePulse r1"></div><div className="routePulse r2"></div>
    <div className="heroContent">
      <div className="heroKicker"><span className="pulse"></span> PREDICTIVE BULK-CARGO PROCUREMENT</div>
      <h1>Forecast the market.<br/><em>Match the vessel.</em><br/>Optimize the contract.</h1>
      <p>CharterIQ turns a future cargo requirement into a decision landscape across freight, vessel, port, contract coverage and disruption risk.</p>
      <div className="heroActions"><button className="primaryBtn" onClick={onAnalyze}><Zap size={16}/>{loading?'Recalculating…':'Analyze procurement'}</button><button className="ghostBtn" onClick={onSimulate}><SlidersHorizontal size={16}/> Stress-test scenario</button></div>
      <div className="heroRoute"><div><span>ORIGIN</span><b>{cargo.origin}</b></div><Route size={17}/><div><span>DESTINATION</span><b>{cargo.destination}</b></div><div className="heroRouteMeta"><span>CARGO</span><b>{money(cargo.quantity_mt)} MT {cargo.commodity}</b></div></div>
    </div>
    <div className="heroTerminal">
      <div className="terminalTop"><span><i></i> MARKET PULSE</span><small>LIVE-STYLE PROTOTYPE</small></div>
      <div className="terminalMetric"><span>BDI reference</span><b>{dataSafe(market?.bdi||3432).toLocaleString()}</b></div>
      <div className="terminalMetric"><span>Route proxy</span><b>$33.7<span>/t</span></b></div>
      <div className="terminalMetric"><span>Model confidence</span><b>74<span>%</span></b></div>
      <div className="terminalLine"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <div className="terminalStatus"><span className="greenDot"></span> Scenario engine ready</div>
    </div>
  </section>
}
function dataSafe(n){return n||0}

function Workspace({data,market,keyData,cargo,setCargo,onSimulate,onNavigate,showToast}){
  const f=data.forecast||[], port=keyData.port, selected=keyData.vessel;
  const bdiSeries=(market?.bdi_recent||[]).map(x=>({date:x.date.slice(5),bdi:x.bdi}));
  return <>
    <section className="metricGrid">
      <Metric title="Freight proxy" value={'$'+keyData.current.toFixed(1)} unit="/t" trend={data.market?.trend} note="Australia → East Coast India" icon={ChartIcon}/>
      <Metric title="Forecast confidence" value={pct(data.confidence)} trend="Model" note="Uncertainty-aware baseline" icon={BrainCircuit}/>
      <Metric title="Port pressure" value={pct(port?.congestion)} trend={port?.congestion>45?'Watch':'Normal'} note={`${port?.name||cargo.destination} congestion index`} icon={MapPinned}/>
      <Metric title="Market exposure" value={cargo.coverage_pref_pct<40?'High':cargo.coverage_pref_pct<70?'Medium':'Lower'} trend="Scenario" note={`${100-cargo.coverage_pref_pct}% uncovered volume`} icon={Gauge}/>
    </section>

    <section className="intelGrid">
      <div className="panel forecastHero">
        <PanelHead eyebrow="FREIGHT SIGNAL" title="Future freight landscape" badge={`${data.market?.trend||'Rising'} pressure`}/>
        <div className="chartWrap tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={f}>
          <defs><linearGradient id="forecastBand" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#47d5ff" stopOpacity={.25}/><stop offset="100%" stopColor="#47d5ff" stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#203344"/><XAxis dataKey="month" tickFormatter={v=>`M${v}`} stroke="#71879a"/><YAxis stroke="#71879a"/><Tooltip contentStyle={{background:'#081824',border:'1px solid #2a4558',borderRadius:10,color:'#fff'}}/>
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#forecastBand)"/><Area type="monotone" dataKey="p10" stroke="none" fill="transparent"/><Line type="monotone" dataKey="p50" stroke="#55d5ff" strokeWidth={3} dot={false}/>
        </AreaChart></ResponsiveContainer></div>
        <div className="chartFooter"><span><i className="legendLine"></i>P50</span><span><i className="legendBand"></i>P10–P90 uncertainty</span><span className="tinyNote">Proxy series • not an official route quote</span></div>
      </div>

      <div className="panel decisionPanel">
        <PanelHead eyebrow="DECISION SNAPSHOT" title="What changes the landscape?" badge={`${data.confidence||74}% confidence`}/>
        <div className="decisionFlow">
          <FlowNode label="Market" value={`${data.market?.trend||'Rising'} freight pressure`} accent="blue"/>
          <FlowNode label="Vessel" value={`${selected?.class||'Panamax'} passes current envelope`} accent="green"/>
          <FlowNode label="Port" value={`${port?.name||cargo.destination} • ${port?.congestion||0}% pressure`} accent={port?.congestion>45?'amber':'green'}/>
          <FlowNode label="Coverage" value={`${cargo.coverage_pref_pct}% target`} accent="purple"/>
        </div>
        <div className="decisionNote"><Sparkles size={16}/><div><b>Explain the result</b><p>{data.decision_note}</p></div></div>
        <button className="textBtn" onClick={()=>onNavigate('simulator')}>Open what-if lab <ChevronRight size={15}/></button>
      </div>
    </section>

    <section className="photoBand">
      <div className="photoStory" style={{backgroundImage:`url("${PHOTO_PORT}")`}}><span>PORT INTELLIGENCE</span><b>From berth limits to congestion pressure.</b></div>
      <div className="photoStory photoStory2" style={{backgroundImage:`url("${PHOTO_LOADING}")`}}><span>VESSEL OPERATIONS</span><b>Match cargo to a feasible vessel before chartering.</b></div>
      <div className="photoCopy"><div className="eyebrow">REAL-WORLD OPERATING CONTEXT</div><h3>Every decision is constrained by the physical network.</h3><p>CharterIQ connects market signals to vessel dimensions, berth limits, handling capability and scenario shocks — not just a freight chart.</p><div className="miniStats"><span><b>7</b> East Coast ports</span><span><b>4</b> vessel classes</span><span><b>5</b> origin markets</span></div></div>
    </section>

    {bdiSeries.length>4 && <section className="grid2 marketReference"><div className="panel"><PanelHead eyebrow="MARKET REFERENCE" title="BDI recent pulse" badge="Delayed public reference"/><div className="chartWrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={bdiSeries}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#203344"/><XAxis dataKey="date" stroke="#71879a"/><YAxis stroke="#71879a"/><Tooltip contentStyle={{background:'#081824',border:'1px solid #2a4558',borderRadius:10,color:'#fff'}}/><Line type="monotone" dataKey="bdi" stroke="#65d8b6" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></div><p className="sourceNote">Used as a market-context reference. The route forecast remains a clearly labelled prototype proxy.</p></div><div className="panel evidencePanel"><div className="eyebrow">DATA FOUNDATION</div><h3>What is real, what is modeled?</h3><Evidence icon={Database} label="BDI reference" value="Delayed public market snapshot"/><Evidence icon={MapPinned} label="Port constraints" value="Official / research-backed references"/><Evidence icon={Activity} label="Route forecast" value="Reproducible prototype proxy series"/><Evidence icon={Globe2} label="Production feeds" value="Adapter-ready, not claimed live"/><div className="sourceNote">OpenAI is not used as a market-data source. AI can explain model outputs; the underlying evidence stays traceable.</div></div></section>}

    <section className="grid3">
      <div className="panel miniPanel"><PanelHead eyebrow="VESSEL MATCH" title={selected?.class||'Panamax'} badge="FEASIBLE"/><div className="bigRow"><b>{selected?.name}</b><span>{selected?.dwt?.toLocaleString()} DWT</span></div><div className="reasonList">{(selected?.reasons||[]).map(r=><div key={r}><ShieldCheck size={14}/>{r}</div>)}</div><button className="textBtn" onClick={()=>onNavigate('fleet')}>Inspect fleet <ChevronRight size={15}/></button></div>
      <div className="panel miniPanel"><PanelHead eyebrow="PORT RESILIENCE" title={keyData.alt?.name||'Dhamra'} badge="ALTERNATIVE"/><div className="altMetrics"><div><b>{keyData.alt?.waiting_days}</b><span>wait days</span></div><div><b>{keyData.alt?.handling?.toLocaleString()}</b><span>MT/day</span></div><div><b>{keyData.alt?.max_draft}m</b><span>draft</span></div></div><button className="textBtn" onClick={()=>onNavigate('ports')}>Compare ports <ChevronRight size={15}/></button></div>
      <div className="panel miniPanel"><PanelHead eyebrow="DATA TRUST" title="Evidence layer" badge="TRANSPARENT"/><div className="dataTrust"><div className="trustItem"><span>BDI benchmark</span><b>{data.market?.bdi_reference?.toLocaleString()}</b></div><div className="trustItem"><span>Australian coal</span><b>${data.market?.australia_coal_reference_usd_t}/t</b></div><div className="trustItem"><span>Route series</span><b>Proxy / synthetic</b></div><div className="trustItem"><span>Live AIS</span><b>Not connected</b></div></div><button className="textBtn" onClick={()=>showToast('Data lineage is documented in docs/DATA_STRATEGY.md')}>View lineage <ChevronRight size={15}/></button></div>
    </section>

    <section className="grid2 riskSection">
      <div className="panel"><PanelHead eyebrow="RISK RADAR" title="What could break the plan?" badge="MONITOR"/><div className="riskList">{(data.alerts?.length?data.alerts:[{severity:'watch',title:'Baseline scenario is inside demo guardrails',detail:'Stress-test freight, congestion or vessel availability to see the landscape propagate.'}]).map((a,i)=><div className="riskItem" key={i}><span className={'riskIcon '+(a.severity==='critical'?'critical':'watch')}><CircleAlert size={14}/></span><div><b>{a.title}</b><p>{a.detail}</p></div></div>)}</div></div>
      <div className="panel"><div className="eyebrow">DRIVER ATTRIBUTION</div><h3>Why the result looks like this</h3><div className="driverBars">{(data.drivers||[]).map(d=><div className="driverBar" key={d.name}><div><span>{d.name}</span><b>{d.weight}%</b></div><div className="barTrack"><i style={{width:d.weight+'%'}}></i></div></div>)}</div><div className="tinyNoteBlock">Weights are explanatory prototype signals, not causal estimates.</div></div>
    </section>
  </>
}

function PanelHead({eyebrow,title,badge}){return <div className="panelHead"><div><div className="eyebrow">{eyebrow}</div><h3>{title}</h3></div>{badge&&<span className="signal"><span className="signalDot"></span>{badge}</span>}</div>}
function Evidence({icon:Icon,label,value}){return <div className="evidence"><Icon size={15}/><span>{label}</span><b>{value}</b></div>}
function Metric({title,value,unit,trend,note,icon:Icon}){const up=trend==='Rising';return <div className="metric"><div className="metricIcon"><Icon size={17}/></div><div className="metricText"><span>{title}</span><div><b>{value}</b><small>{unit}</small></div><p>{note}</p></div><span className={'microTrend '+(up?'up':'neutral')}>{up?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>} {trend}</span></div>}
function FlowNode({label,value,accent}){return <div className={'flowNode '+accent}><span>{label}</span><b>{value}</b></div>}

function Forecast({data,market}){
  const series=(market?.bdi_recent||[]).map(x=>({date:x.date.slice(5),bdi:x.bdi}));
  return <section><SectionHeader eyebrow="MARKET INTELLIGENCE" title="Forecast with uncertainty" action={<span className="dataPill"><span className="blueDot"></span>{data.market?.forecast_method}</span>}/><div className="grid2"><div className="panel"><div className="chartWrap xl"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.forecast}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#203344"/><XAxis dataKey="month" tickFormatter={v=>`Month ${v}`} stroke="#71879a"/><YAxis stroke="#71879a"/><Tooltip contentStyle={{background:'#081824',border:'1px solid #2a4558',borderRadius:10,color:'#fff'}}/><Line dataKey="p10" stroke="#71879a" strokeDasharray="6 5" dot={false}/><Line dataKey="p50" stroke="#55d5ff" strokeWidth={3} dot={false}/><Line dataKey="p90" stroke="#71879a" strokeDasharray="6 5" dot={false}/><ReferenceLine y={data.market?.route_proxy_current_usd_t} stroke="#91a5b7" strokeDasharray="4 4"/></LineChart></ResponsiveContainer></div><div className="chartFooter">P10 / P50 / P90 • current route proxy ${data.market?.route_proxy_current_usd_t}/t</div></div><div className="panel modelPanel"><div className="eyebrow">MODEL CARD</div><h3>Explainable hybrid baseline</h3><p>Recent level + local trend + mild seasonality. Uncertainty widens with residual error and forecast horizon.</p><div className="modelRows"><span>Forecast horizon <b>{data.forecast?.length} months</b></span><span>Trend <b>{data.market?.trend}</b></span><span>Volatility index <b>{data.market?.volatility_index}</b></span><span>Confidence <b>{data.confidence}%</b></span></div><div className="decisionNote"><Sparkles size={16}/><div><b>Why uncertainty matters</b><p>The system presents a range so a charterer can compare exposure rather than treating one point estimate as certainty.</p></div></div></div></div>{series.length>4&&<div className="panel marketReferenceWide"><PanelHead eyebrow="REFERENCE SERIES" title="BDI context — recent observations" badge="DELAYED PUBLIC"/><div className="chartWrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={series}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#203344"/><XAxis dataKey="date" stroke="#71879a"/><YAxis stroke="#71879a"/><Tooltip contentStyle={{background:'#081824',border:'1px solid #2a4558',borderRadius:10,color:'#fff'}}/><Line dataKey="bdi" stroke="#65d8b6" strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></div></div>}</section>
}

function Fleet({data}){
 return <section><SectionHeader eyebrow="VESSEL INTELLIGENCE" title="Match the cargo to a feasible hull" action={<span className="dataPill"><span className="greenDot"></span>Hard constraints enforced</span>}/><div className="fleetHero panel"><div><div className="eyebrow">VESSEL × PORT FEASIBILITY</div><h3>Capacity is not enough. The berth envelope matters.</h3><p>Each candidate is checked against LOA, beam, draft, parcel utilisation and adjusted availability.</p></div><div className="vesselClassStrip">{['Handysize','Supramax','Panamax','Capesize'].map((x,i)=><div className="vClass" key={x}><ShipWheel size={18}/><span>{x}</span><b>{[38,58,76,150][i]}K DWT</b></div>)}</div></div><div className="tablePanel panel"><table><thead><tr><th>Vessel</th><th>Class</th><th>DWT</th><th>LOA</th><th>Draft</th><th>Availability</th><th>Utilisation</th><th>Feasibility</th></tr></thead><tbody>{data.vessels.map(v=><tr key={v.name} className={v.feasible?'highlight':''}><td><b>{v.name}</b></td><td>{v.class}</td><td>{v.dwt.toLocaleString()}</td><td>{v.loa}m</td><td>{v.draft}m</td><td>{v.availability}%</td><td><span className="progress"><span style={{width:v.utilization_pct+'%'}}></span></span>{v.utilization_pct}%</td><td><span className={'tag '+(v.feasible?'success':'danger')}>{v.feasible?'PASS':'BLOCKED'}</span></td></tr>)}</tbody></table></div></section>
}

function Ports({data}){
 return <section><SectionHeader eyebrow="PORT INTELLIGENCE" title="Validate the physical network" action={<span className="dataPill"><span className="blueDot"></span>East Coast India</span>}/><div className="portFeature"><div className="portPhoto" style={{backgroundImage:`url("${PHOTO_PORT}")`}}><div><span>PORT FEASIBILITY</span><b>Berth limits become decision variables.</b></div></div><div className="portExplainer panel"><div className="eyebrow">CONSTRAINT ENGINE</div><h3>Hard limits + operational pressure</h3><p>CharterIQ combines berth dimensions with congestion and handling assumptions to surface resilient alternatives.</p><div className="portPills"><span>LOA</span><span>Beam</span><span>Draft</span><span>Handling</span><span>Congestion</span></div></div></div><div className="portGrid">{data.ports.map((p,i)=><div className="panel portCard" key={p.name}><div className="portTop"><div className="portIcon"><MapPinned size={16}/></div><div><h3>{p.name}</h3><span>{p.lat.toFixed(2)}°N • {p.lon.toFixed(2)}°E</span></div><span className={'tag '+(p.congestion>45?'warning':'success')}>{p.congestion>45?'WATCH':'OPEN'}</span></div><div className="portStats"><div><span>LOA limit</span><b>{p.max_loa} m</b></div><div><span>Draft</span><b>{p.max_draft} m</b></div><div><span>Handling</span><b>{p.handling.toLocaleString()} MT/day</b></div><div><span>Waiting</span><b>{p.waiting_days} days</b></div></div><div className="scoreRow"><span>Route resilience</span><b>{p.route_score}/100</b></div><div className="barTrack"><i style={{width:Math.max(10,p.route_score)+'%'}}></i></div></div>)}</div></section>
}

function Contracts({data,cargo,setCargo}){
 return <section><SectionHeader eyebrow="CONTRACT COVERAGE" title="Compare exposure before committing" action={<span className="dataPill"><span className="purpleDot"></span>Trade-off workspace</span>}/><div className="coverageControl"><div><b>Target coverage</b><span>Change the uncovered spot volume</span></div><input type="range" min="0" max="100" step="5" value={cargo.coverage_pref_pct} onChange={e=>setCargo({...cargo,coverage_pref_pct:Number(e.target.value)})}/><strong>{cargo.coverage_pref_pct}%</strong></div><div className="grid2"><div className="panel"><div className="chartWrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.contract_strategies||[]}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#203344"/><XAxis dataKey="coverage_pct" tickFormatter={v=>`${v}%`} stroke="#71879a"/><YAxis stroke="#71879a"/><Tooltip contentStyle={{background:'#081824',border:'1px solid #2a4558',borderRadius:10,color:'#fff'}}/><Bar dataKey="expected_procurement_usd" fill="#4ecdf5" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></div><div className="panel tablePanel"><table><thead><tr><th>Strategy</th><th>Coverage</th><th>Expected freight</th><th>Market exposure</th><th>Flexibility</th></tr></thead><tbody>{(data.contract_strategies||[]).map(s=><tr key={s.strategy} className={s.coverage_pct===cargo.coverage_pref_pct?'highlight':''}><td><b>{s.strategy}</b></td><td>{s.coverage_pct}%</td><td>${s.expected_freight_usd_t}/t</td><td>${money(s.market_exposure_usd)}</td><td>{s.flexibility_pct}%</td></tr>)}</tbody></table></div></div><div className="disclaimer"><CircleAlert size={15}/> There is no universal winning strategy. The workspace exposes cost, market exposure and flexibility so the user can choose according to the cargo plan and risk appetite.</div></section>
}

function Simulator({data,cargo,setCargo,onRun,loading}){
 return <section><SectionHeader eyebrow="PROCUREMENT DIGITAL TWIN" title="Stress-test the decision before you commit" action={<span className="dataPill"><span className="redDot"></span>Shared scenario state</span>}/><div className="grid2"><div className="panel simPanel"><SimRow label="Freight shock" value={cargo.freight_shock_pct} min={-20} max={50} onChange={v=>setCargo({...cargo,freight_shock_pct:v})}/><SimRow label="Port congestion shock" value={cargo.congestion_shock_pct} min={0} max={100} onChange={v=>setCargo({...cargo,congestion_shock_pct:v})}/><SimRow label="Vessel availability shock" value={cargo.vessel_availability_shock_pct} min={-70} max={0} onChange={v=>setCargo({...cargo,vessel_availability_shock_pct:v})}/><button className="primaryBtn full" disabled={loading} onClick={()=>onRun()}>{loading?<Timer size={16}/>:<Zap size={16}/>} {loading?'Recalculating…':'Run scenario'}</button></div><div className="panel"><div className="eyebrow">IMPACT VIEW</div><div className="impactGrid"><Impact label="Forecast midpoint" value={`$${data.forecast?.[0]?.p50?.toFixed(1)}/t`} note="Near-term proxy signal"/><Impact label="Port congestion" value={pct(data.ports?.find(p=>p.name===cargo.destination)?.congestion)} note={cargo.congestion_shock_pct?'Shock applied':'Baseline'}/><Impact label="Vessel availability" value={pct(data.vessels?.find(v=>v.feasible)?.availability)} note="Adjusted for scenario"/><Impact label="Confidence" value={pct(data.confidence)} note="Recalculated"/></div><div className="changeLog"><b>Scenario propagation</b><p>{cargo.freight_shock_pct||cargo.congestion_shock_pct||cargo.vessel_availability_shock_pct?'The shock perturbs the shared state; forecast, port pressure, vessel availability and contract exposure are recalculated together.':'Baseline scenario: no shocks have been injected.'}</p></div></div></div></section>
}
function SimRow({label,value,min,max,onChange}){return <div className="simRow"><label>{label}<b>{value}%</b></label><input type="range" min={min} max={max} step="5" value={value} onChange={e=>onChange(Number(e.target.value))}/></div>}
function Impact({label,value,note}){return <div className="impact"><span>{label}</span><b>{value}</b><small>{note}</small></div>}
function SectionHeader({eyebrow,title,action}){return <div className="sectionHeader"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action}</div>}

createRoot(document.getElementById('root')).render(<App/>);
