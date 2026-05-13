/* AMAVS Turismo — main.js v2 | WhatsApp: 61984222205 */
'use strict';

const fleetData = [
  { id:1, name:'Executive Plus', model:'Mercedes-Benz O-500', category:'onibus', capacity:46, year:2022, km:48200, priceKm:8.50, priceDay:1200, available:true, plate:'ABC-1234', image:'assets/images/onibus-executive.jpg', features:['Wi-Fi','Ar-cond.','TV','Banheiro','USB','Poltrona recl.'], desc:'Ônibus executivo de alto padrão com 46 lugares reclináveis, banheiro a bordo, TV e Wi-Fi. Ideal para viagens longas e corporativas.' },
  { id:2, name:'Gran Viaggio', model:'Volvo B420R', category:'onibus', capacity:50, year:2023, km:32100, priceKm:9.20, priceDay:1400, available:true, plate:'DEF-5678', image:'assets/images/onibus-gran.jpg', features:['Wi-Fi','Ar-cond.','TV 4K','Banheiro','USB-C','Frigobar'], desc:'O mais moderno da frota. Motor Volvo com câmbio automático, suspensão a ar e central multimídia 4K.' },
  { id:3, name:'City Express', model:'Volare V8-L', category:'micro', capacity:28, year:2021, km:61800, priceKm:6.80, priceDay:780, available:true, plate:'GHI-9012', image:'assets/images/micro-city.jpg', features:['Wi-Fi','Ar-cond.','USB','Poltrona exec.'], desc:'Micro-ônibus versátil e ágil, perfeito para grupos de até 28 pessoas em trajetórias urbanas e intermunicipais.' },
  { id:4, name:'Sprint Premium', model:'Mercedes Sprinter 519', category:'micro', capacity:20, year:2020, km:89400, priceKm:6.20, priceDay:680, available:false, plate:'JKL-3456', image:'assets/images/micro-sprint.jpg', features:['Ar-cond.','USB','Poltrona exec.'], desc:'Micro-ônibus executivo Mercedes com 20 lugares. Em manutenção programada.' },
  { id:5, name:'Transit Executive', model:'Ford Transit 460', category:'van', capacity:15, year:2022, km:41300, priceKm:4.90, priceDay:560, available:true, plate:'MNO-7890', image:'assets/images/van-transit.jpg', features:['Wi-Fi','Ar-cond.','USB','Câmera 360°'], desc:'Van executiva Ford com 15 lugares, ideal para traslados corporativos rápidos e transfer aeroporto.' },
  { id:6, name:'Master Luxo', model:'Renault Master L3H2', category:'van', capacity:16, year:2021, km:55600, priceKm:5.10, priceDay:580, available:true, plate:'PQR-1234', image:'assets/images/van-master.jpg', features:['Wi-Fi','Ar-cond.','USB','GPS'], desc:'Van ampliada Renault com 16 lugares e bagageiro generoso.' },
];

const WPP = '5561984222205';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function showToast(msg, type='success') {
  let c = $('.toast-container');
  if (!c) { c = document.createElement('div'); c.className='toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':'exclamation-circle'} ti"></i> ${msg}`;
  c.appendChild(t);
  requestAnimationFrame(() => setTimeout(() => t.classList.add('show'), 10));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 3500);
}

function formatBRL(v) { return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v); }
function formatDate(d) { if(!d) return '—'; return new Date(d+'T00:00:00').toLocaleDateString('pt-BR'); }
function nowTime() { return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }

// Loader
window.addEventListener('load', () => {
  const l = document.getElementById('pageLoader');
  if (l) setTimeout(() => l.classList.add('hidden'), 700);
});

// Navbar
(function() {
  const nav = document.getElementById('navbar');
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30), {passive:true});
  ham?.addEventListener('click', () => { ham.classList.toggle('active'); links?.classList.toggle('open'); });
  document.addEventListener('click', e => { if (!nav.contains(e.target)) { ham?.classList.remove('active'); links?.classList.remove('open'); } });
})();

// Reveal
function initReveal() {
  const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), {threshold:.08});
  $$('.reveal').forEach(el => io.observe(el));
}

// Counters
function animCounters() {
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix||'', dur=1800, start=Date.now();
    const run = () => { const pct=Math.min((Date.now()-start)/dur,1), ease=1-Math.pow(1-pct,3); el.textContent=Math.round(ease*target)+suffix; if(pct<1) requestAnimationFrame(run); };
    run();
  });
}

// Fleet render
function renderFleet(filter='all', containerId='fleetGrid') {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  const cats = {onibus:'Ônibus',micro:'Micro-ônibus',van:'Van'};
  const vehicles = filter==='all' ? fleetData : fleetData.filter(v=>v.category===filter);
  grid.innerHTML = vehicles.map(v => `
    <div class="vehicle-card reveal">
      <div class="vc-img">
        <img src="${v.image}" alt="${v.name}" loading="lazy" onerror="this.src='assets/images/placeholder.svg'"/>
        <span class="vc-tag cat">${cats[v.category]}</span>
        <span class="vc-pax"><i class="fas fa-users"></i> ${v.capacity}</span>
      </div>
      <div class="vc-body">
        <div class="vc-header">
          <div><div class="vc-name">${v.name}</div><div class="vc-model">${v.model}</div></div>
          <div class="vc-price-badge">R$${v.priceKm.toFixed(2)}/km</div>
        </div>
        <div class="vc-chips">
          ${v.features.slice(0,4).map(f=>`<span class="vc-chip"><i class="fas fa-check"></i>${f}</span>`).join('')}
          ${!v.available?'<span class="vc-chip" style="color:var(--red);background:var(--red-bg)"><i class="fas fa-times"></i>Indisponível</span>':''}
        </div>
        <div class="vc-btns">
          <a href="veiculo.html?id=${v.id}" class="vc-btn-s">Ver detalhes</a>
          <a href="orcamento.html?veiculo=${v.id}" class="vc-btn-p">Orçamento</a>
        </div>
      </div>
    </div>`).join('');
  initReveal();
}

// Vehicle detail
function initVehiclePage() {
  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  const v = fleetData.find(x=>x.id===id);
  const el = s => document.getElementById(s);
  if (!v) { el('vehicleContent')&&(el('vehicleContent').innerHTML='<p style="padding:4rem;text-align:center">Veículo não encontrado.</p>'); return; }
  document.title = `${v.name} | AMAVS Turismo`;
  if(el('vdName')) el('vdName').textContent=v.name;
  if(el('vdModel')) el('vdModel').textContent=v.model;
  if(el('vdDesc')) el('vdDesc').textContent=v.desc;
  if(el('vdCapacity')) el('vdCapacity').textContent=`${v.capacity} passageiros`;
  if(el('vdYear')) el('vdYear').textContent=v.year;
  if(el('vdPlate')) el('vdPlate').textContent=v.plate;
  if(el('vdKm')) el('vdKm').textContent=v.km.toLocaleString('pt-BR')+' km';
  if(el('vdPriceKm')) el('vdPriceKm').textContent=`R$ ${v.priceKm.toFixed(2)}/km`;
  if(el('vdPriceDay')) el('vdPriceDay').textContent=`R$ ${v.priceDay.toLocaleString('pt-BR')}/dia`;
  if(el('vdStatus')) el('vdStatus').innerHTML=v.available?'<span class="bdg bdg-green"><i class="fas fa-check"></i> Disponível</span>':'<span class="bdg bdg-red"><i class="fas fa-times"></i> Indisponível</span>';
  if(el('vdFeatures')) el('vdFeatures').innerHTML=v.features.map(f=>`<div class="vdf"><i class="fas fa-check-circle"></i> ${f}</div>`).join('');
  const mImg = el('vdMainImg');
  if(mImg) { mImg.src=v.image; mImg.onerror=()=>mImg.src='assets/images/placeholder.svg'; }
  const wBtn = el('vdWppBtn');
  if(wBtn) wBtn.href=`https://wa.me/${WPP}?text=${encodeURIComponent(`Olá! Interesse no ${v.name} (${v.model}). Posso receber um orçamento?`)}`;
  const moreEl = el('moreVehicles');
  if(moreEl) { const cats={onibus:'Ônibus',micro:'Micro-ônibus',van:'Van'}; moreEl.innerHTML=fleetData.filter(x=>x.id!==id).slice(0,3).map(o=>`<div class="vehicle-card reveal"><div class="vc-img"><img src="${o.image}" onerror="this.src='assets/images/placeholder.svg'"/><span class="vc-tag cat">${cats[o.category]}</span><span class="vc-pax"><i class="fas fa-users"></i> ${o.capacity}</span></div><div class="vc-body"><div class="vc-name">${o.name}</div><div class="vc-model">${o.model}</div><div class="vc-btns" style="margin-top:.75rem"><a href="veiculo.html?id=${o.id}" class="vc-btn-s">Ver</a><a href="orcamento.html?veiculo=${o.id}" class="vc-btn-p">Orçar</a></div></div></div>`).join(''); initReveal(); }
}

// Orçamento steps
function initOrcamentoPage() {
  let step=1;
  const panels=$$('.orc-panel'), items=$$('.os-item'), lines=$$('.os-line');
  const nextBtn=document.getElementById('orcNext'), prevBtn=document.getElementById('orcPrev'), subBtn=document.getElementById('orcSubmit');
  function go(s) {
    step=s;
    panels.forEach((p,i)=>p.style.display=(i+1===s)?'block':'none');
    items.forEach((it,i)=>{it.classList.toggle('active',i+1===s);it.classList.toggle('done',i+1<s);});
    lines.forEach((l,i)=>l.classList.toggle('done',i+1<s));
    if(prevBtn) prevBtn.style.display=s>1?'inline-flex':'none';
    if(nextBtn) nextBtn.style.display=s<3?'inline-flex':'none';
    if(subBtn) subBtn.style.display=s===3?'inline-flex':'none';
  }
  go(1);
  nextBtn?.addEventListener('click',()=>step<3&&go(step+1));
  prevBtn?.addEventListener('click',()=>step>1&&go(step-1));
  document.getElementById('orcForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(e.target));
    const code='QT'+Date.now().toString().slice(-8);
    const msg=`🚌 *Orçamento AMAVS*\n*Código:* ${code}\n*Nome:* ${d.nome}\n*Tel:* ${d.telefone}\n*Origem:* ${d.origem}\n*Destino:* ${d.destino}\n*Data:* ${d.data_ida}\n*Pax:* ${d.passageiros}\n*Obs:* ${d.observacoes||'—'}`;
    setTimeout(()=>window.open(`https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`,'_blank'),400);
    go(4);
    const codeEl=document.getElementById('quoteCode');
    if(codeEl) codeEl.textContent=code;
  });
}

// Licitações
const defaultContratos=[
  {num:'CT-2024-001',title:'Prefeitura de Brasília — Transporte Escolar',desc:'Contrato de fretamento para transporte de estudantes da rede municipal.',date:'2024-01-01',status:'active',image:''},
  {num:'CT-2023-008',title:'SABESP — Transporte de Funcionários',desc:'Deslocamento diário de colaboradores entre unidades operacionais.',date:'2023-07-01',status:'active',image:''},
  {num:'CT-2024-002',title:'Secretaria de Educação DF — Excursões',desc:'Serviço de transporte para atividades pedagógicas externas.',date:'2024-02-01',status:'active',image:''},
  {num:'CT-2022-015',title:'Ministério da Saúde — Transfer Eventos',desc:'Transporte para congressos e eventos institucionais federais.',date:'2022-06-01',status:'ended',image:''},
];
function loadLicitacoes() {
  const c=document.getElementById('licitacoesGrid');
  if(!c) return;
  const data=JSON.parse(localStorage.getItem('amavs_contratos')||'null')||defaultContratos;
  c.innerHTML=data.map(ct=>`<div class="licit-card reveal"><div class="licit-img">${ct.image?`<img src="${ct.image}" loading="lazy"/>`:'<div class="no-img"><i class="fas fa-file-contract"></i></div>'}</div><div class="licit-body"><div class="licit-num">${ct.num}</div><div class="licit-title">${ct.title}</div><div class="licit-desc">${ct.desc}</div><div class="licit-footer"><span>${formatDate(ct.date)}</span><span class="bdg bdg-${ct.status==='active'?'green':'gray'}">${ct.status==='active'?'Ativo':'Encerrado'}</span></div></div></div>`).join('');
  initReveal();
}

// Chatbot
function initChatbot() {
  const btn=document.getElementById('chatbotBtn'), panel=document.getElementById('chatbotPanel'), closeBtn=document.getElementById('chatClose'), input=document.getElementById('chatInput'), send=document.getElementById('chatSend'), msgsEl=document.getElementById('chatMsgs');
  if(!btn||!panel) return;
  btn.addEventListener('click',()=>panel.classList.toggle('open'));
  closeBtn?.addEventListener('click',()=>panel.classList.remove('open'));
  let history=[], typing=false;
  const SYSTEM=`Você é a assistente virtual da AMAVS Turismo, empresa de fretamento de ônibus, micro-ônibus e vans em Brasília/DF e região. Seja simpática, objetiva e profissional. Responda em português brasileiro.
Frota: 6 veículos (2 ônibus 46-50 pax, 2 micro-ônibus 20-28 pax, 2 vans 15-16 pax). Todos com ar-cond., seguro e motoristas CNH D/E.
WhatsApp: (61) 98422-2205. Atendimento: Seg-Sex 8h-18h, Sáb 8h-12h.
Serviços: fretamento corporativo, turismo, escolar, eventos, licitações públicas, transfer aeroporto.
Para orçamento: direcione para WhatsApp ou página de orçamento. Seja breve (máx 2 parágrafos).`;
  function addMsg(txt,role='bot'){const el=document.createElement('div');el.className=`msg ${role}`;el.innerHTML=`<div class="msg-bubble">${txt.replace(/\n/g,'<br>')}</div><div class="msg-time">${nowTime()}</div>`;msgsEl.appendChild(el);msgsEl.scrollTop=9999;return el;}
  function showDots(){const el=document.createElement('div');el.className='msg bot';el.id='tdots';el.innerHTML='<div class="typing-dots"><span></span><span></span><span></span></div>';msgsEl.appendChild(el);msgsEl.scrollTop=9999;}
  function hideDots(){document.getElementById('tdots')?.remove();}
  async function doSend(txt){
    if(typing||!txt.trim()) return;
    typing=true; addMsg(txt,'user'); history.push({role:'user',content:txt}); if(input) input.value=''; showDots();
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,system:SYSTEM,messages:history})});
      const data=await res.json(); hideDots();
      const reply=data.content?.[0]?.text||'Desculpe, tive uma dificuldade. Entre em contato pelo WhatsApp: (61) 98422-2205';
      history.push({role:'assistant',content:reply}); addMsg(reply,'bot');
    }catch{hideDots();addMsg('Desculpe, estou com dificuldades técnicas. Fale pelo <a href="https://wa.me/5561984222205" target="_blank" style="color:var(--gold)">WhatsApp</a>.','bot');}
    typing=false;
  }
  send?.addEventListener('click',()=>doSend(input.value));
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend(input.value);}});
  $$('.qbtn').forEach(b=>b.addEventListener('click',()=>{panel.classList.add('open');doSend(b.textContent);}));
  setTimeout(()=>{ if(msgsEl&&!msgsEl.children.length) addMsg('Olá! 👋 Sou a assistente da AMAVS Turismo. Como posso ajudar?','bot'); },600);
}

// Contact form
document.addEventListener('DOMContentLoaded',()=>{
  initReveal();
  if(document.getElementById('fleetGrid')) renderFleet();
  $$('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>{$$('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderFleet(btn.dataset.filter);}));
  const sb=document.querySelector('.stats-banner');
  if(sb) new IntersectionObserver(entries=>{if(entries[0].isIntersecting)animCounters();},{threshold:.3}).observe(sb);
  if(location.pathname.includes('veiculo.html')) initVehiclePage();
  if(location.pathname.includes('orcamento.html')) initOrcamentoPage();
  loadLicitacoes();
  initChatbot();
  document.getElementById('contactForm')?.addEventListener('submit',e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
    if(!d.nome||!d.telefone||!d.mensagem){showToast('Preencha os campos obrigatórios.','error');return;}
    window.open(`https://wa.me/${WPP}?text=${encodeURIComponent(`Contato via site\nNome: ${d.nome}\nTel: ${d.telefone}\nEmail: ${d.email||'—'}\nAssunto: ${d.assunto||'Geral'}\n\n${d.mensagem}`)},'_blank');
    showToast('Mensagem enviada!'); e.target.reset();
  });
  document.getElementById('quickQuoteForm')?.addEventListener('submit',e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
    if(!d.origem||!d.destino||!d.nome){showToast('Preencha os campos obrigatórios.','error');return;}
    window.open(`https://wa.me/${WPP}?text=${encodeURIComponent(`🚌 Orçamento rápido\nNome: ${d.nome}\nOrigem: ${d.origem}\nDestino: ${d.destino}\nPax: ${d.pax||'?'}`)},'_blank');
    showToast('Redirecionando para o WhatsApp!');
  });
});
