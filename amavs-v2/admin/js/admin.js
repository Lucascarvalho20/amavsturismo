/* AMAVS Admin JS v2 */
'use strict';
// Auth
function checkAuth(){const s=sessionStorage.getItem('amavs_admin');if(!s&&!location.pathname.includes('login.html')){location.href='login.html';return false;}return true;}
function adminLogout(){sessionStorage.removeItem('amavs_admin');location.href='login.html';}
checkAuth();

// Populate user info
(function(){
  const s=sessionStorage.getItem('amavs_admin');
  if(!s) return;
  const d=JSON.parse(s);
  const el=id=>document.getElementById(id);
  if(el('suName')) el('suName').textContent=d.user||'Admin';
  if(el('suAvatar')) el('suAvatar').textContent=(d.user||'A')[0].toUpperCase();
  if(el('suRole')) el('suRole').textContent={admin:'Administrador',operator:'Operador',viewer:'Visualizador'}[d.role]||'Admin';
})();

// Sidebar
document.addEventListener('DOMContentLoaded',()=>{
  const tog=document.getElementById('sidebarToggle');
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('sidebarOverlay');
  tog?.addEventListener('click',()=>{sb.classList.toggle('open');ov.classList.toggle('active');});
  ov?.addEventListener('click',()=>{sb.classList.remove('open');ov.classList.remove('active');});
});

// Toast
function adminToast(msg,type='success'){
  const t=document.createElement('div');t.className=`admin-toast ${type}`;
  const icons={success:'check-circle',error:'exclamation-circle',info:'info-circle'};
  t.innerHTML=`<i class="fas fa-${icons[type]||'info-circle'} ti"></i> ${msg}`;
  document.body.appendChild(t);
  requestAnimationFrame(()=>setTimeout(()=>t.classList.add('show'),10));
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),350);},3500);
}

// Modals
function openModal(id){const m=document.getElementById(id);if(m)m.classList.add('active');}
function closeModal(id){const m=document.getElementById(id);if(m)m.classList.remove('active');}
document.addEventListener('click',e=>{if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('active');});

// Formatters
function fBRL(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);}
function fDate(d){if(!d)return '—';return new Date(d+'T00:00:00').toLocaleDateString('pt-BR');}

// Badge helper
const statusMap={
  pending:{l:'Pendente',cls:'bdg-yellow'},
  approved:{l:'Aprovado',cls:'bdg-green'},
  completed:{l:'Concluído',cls:'bdg-blue'},
  rejected:{l:'Recusado',cls:'bdg-red'},
  active:{l:'Ativo',cls:'bdg-green'},
  available:{l:'Disponível',cls:'bdg-green'},
  maintenance:{l:'Manutenção',cls:'bdg-yellow'},
  unavailable:{l:'Indisponível',cls:'bdg-red'},
  ended:{l:'Encerrado',cls:'bdg-gray'},
  pending_licit:{l:'Em andamento',cls:'bdg-yellow'},
};
function badge(s){const m=statusMap[s]||{l:s,cls:'bdg-gray'};return `<span class="bdg ${m.cls}">${m.l}</span>`;}

// Canvas charts
function drawBar(id,labels,values,color='#C8A84B'){
  const c=document.getElementById(id);if(!c)return;
  const ctx=c.getContext('2d');const W=c.parentElement.offsetWidth||400,H=220;
  c.width=W;c.height=H;const max=Math.max(...values)||1;
  const bw=(W-60)/labels.length-8;
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<=4;i++){const y=20+(H-60)*(1-i/4);ctx.beginPath();ctx.strokeStyle='rgba(0,0,0,.06)';ctx.lineWidth=1;ctx.moveTo(40,y);ctx.lineTo(W-10,y);ctx.stroke();ctx.fillStyle='#94A3B8';ctx.font='10px Outfit,sans-serif';ctx.textAlign='right';ctx.fillText(Math.round(max*i/4),36,y+3);}
  labels.forEach((lbl,i)=>{const x=50+i*(bw+8),bh=(values[i]||0)/max*(H-60),y=H-40-bh;const g=ctx.createLinearGradient(0,y,0,H-40);g.addColorStop(0,color);g.addColorStop(1,color+'88');ctx.fillStyle=g;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,bw,bh,[4,4,0,0]);else ctx.rect(x,y,bw,bh);ctx.fill();ctx.fillStyle='#94A3B8';ctx.font='10px Outfit,sans-serif';ctx.textAlign='center';ctx.fillText(lbl,x+bw/2,H-22);if(values[i]){ctx.fillStyle='#1E293B';ctx.font='bold 10px Outfit,sans-serif';ctx.fillText(values[i],x+bw/2,y-4);}});
}
function drawLine(id,labels,values,color='#C8A84B'){
  const c=document.getElementById(id);if(!c)return;
  const ctx=c.getContext('2d');const W=c.parentElement.offsetWidth||400,H=220;
  c.width=W;c.height=H;const max=Math.max(...values)||1;
  const pts=labels.map((_,i)=>({x:50+(i/(labels.length-1||1))*(W-70),y:20+(1-values[i]/max)*(H-55)}));
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<=4;i++){const y=20+(H-55)*(1-i/4);ctx.beginPath();ctx.strokeStyle='rgba(0,0,0,.06)';ctx.moveTo(40,y);ctx.lineTo(W-10,y);ctx.stroke();ctx.fillStyle='#94A3B8';ctx.font='10px Outfit,sans-serif';ctx.textAlign='right';ctx.fillText(Math.round(max*i/4),36,y+3);}
  ctx.beginPath();ctx.moveTo(pts[0].x,H-35);pts.forEach(p=>ctx.lineTo(p.x,p.y));ctx.lineTo(pts[pts.length-1].x,H-35);ctx.closePath();const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,color+'33');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fill();
  ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineJoin='round';pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  pts.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.fillStyle='#94A3B8';ctx.font='10px Outfit,sans-serif';ctx.textAlign='center';ctx.fillText(labels[i],p.x,H-16);});
}

// Mock data
const mockQuotes=[
  {id:'QT20240115001',client:'TechCorp Brasil',vehicle:'Executive Plus',date:'2024-01-15',origin:'Brasília',dest:'São Paulo',pax:40,status:'pending',value:1200},
  {id:'QT20240114002',client:'Prefeitura DF',vehicle:'Gran Viaggio',date:'2024-01-14',origin:'Brasília',dest:'Goiânia',pax:48,status:'approved',value:3600},
  {id:'QT20240113003',client:'Colégio Estadual',vehicle:'City Express',date:'2024-01-13',origin:'Taguatinga',dest:'Brasília',pax:25,status:'pending',value:950},
  {id:'QT20240112004',client:'Banco do Brasil',vehicle:'Master Luxo',date:'2024-01-12',origin:'Brasília',dest:'Aeroporto',pax:14,status:'completed',value:480},
  {id:'QT20240111005',client:'Ministério Saúde',vehicle:'Gran Viaggio',date:'2024-01-11',origin:'Brasília',dest:'Belo Horizonte',pax:46,status:'rejected',value:5200},
];
const mockVehicles=[
  {id:1,name:'Executive Plus',model:'Mercedes O-500',cat:'Ônibus',cap:46,year:2022,km:48200,plate:'ABC-1234',status:'available',nextService:'2024-06-01',priceKm:8.50},
  {id:2,name:'Gran Viaggio',model:'Volvo B420R',cat:'Ônibus',cap:50,year:2023,km:32100,plate:'DEF-5678',status:'available',nextService:'2024-08-15',priceKm:9.20},
  {id:3,name:'City Express',model:'Volare V8-L',cat:'Micro-ônibus',cap:28,year:2021,km:61800,plate:'GHI-9012',status:'available',nextService:'2024-04-20',priceKm:6.80},
  {id:4,name:'Sprint Premium',model:'Mercedes Sprinter 519',cat:'Micro-ônibus',cap:20,year:2020,km:89400,plate:'JKL-3456',status:'maintenance',nextService:'2024-02-28',priceKm:6.20},
  {id:5,name:'Transit Executive',model:'Ford Transit 460',cat:'Van',cap:15,year:2022,km:41300,plate:'MNO-7890',status:'available',nextService:'2024-07-10',priceKm:4.90},
  {id:6,name:'Master Luxo',model:'Renault Master L3H2',cat:'Van',cap:16,year:2021,km:55600,plate:'PQR-1234',status:'available',nextService:'2024-05-22',priceKm:5.10},
];
const mockContratos=[
  {id:'CT-2024-001',client:'Prefeitura de Brasília',modality:'Pregão Eletrônico',start:'2024-01-01',end:'2024-12-31',value:180000,status:'active'},
  {id:'CT-2023-008',client:'SABESP — Unidade Santos',modality:'Dispensa',start:'2023-07-01',end:'2024-06-30',value:96000,status:'active'},
  {id:'CT-2024-002',client:'Sec. Estadual de Educação',modality:'Pregão Eletrônico',start:'2024-02-01',end:'2025-01-31',value:240000,status:'pending_licit'},
  {id:'CT-2022-015',client:'Ministério da Saúde',modality:'Inexigibilidade',start:'2022-06-01',end:'2023-05-31',value:150000,status:'ended'},
];
const mockUsers=[
  {id:1,name:'Administrador',user:'admin',email:'admin@amavsturismo.com.br',role:'admin',status:'active',lastLogin:'2024-01-15'},
  {id:2,name:'Operacional',user:'operador',email:'ops@amavsturismo.com.br',role:'operator',status:'active',lastLogin:'2024-01-14'},
];
