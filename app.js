const DB_NAME='generate-pa-db',DB_VERSION=1,STORE='documents';let db,currentDraft=null,deferredInstall;const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const br=s=>esc(s||'-').replace(/\n/g,'<br>');
const fmtDate=s=>{if(!s)return'-';const [y,m,d]=String(s).split('-');return `${d}-${m}-${y}`};
function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});r.onsuccess=()=>{db=r.result;ok(db)};r.onerror=()=>no(r.error)})}
function os(mode='readonly'){return db.transaction(STORE,mode).objectStore(STORE)}
function allDocs(){return new Promise((ok,no)=>{const r=os().getAll();r.onsuccess=()=>ok(r.result.sort((a,b)=>b.updatedAt-a.updatedAt));r.onerror=()=>no(r.error)})}
function saveDoc(d){return new Promise((ok,no)=>{const r=os('readwrite').put(d);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
function deleteDoc(id){return new Promise((ok,no)=>{const r=os('readwrite').delete(id);r.onsuccess=ok;r.onerror=()=>no(r.error)})}
function data(){return Object.fromEntries(new FormData($('#petitionForm')).entries())}
function load(d){Object.entries(d||{}).forEach(([k,v])=>{const e=$('#petitionForm').elements[k];if(!e)return;if(e.length&&e[0].type==='radio')[...e].forEach(x=>x.checked=x.value===v);else e.value=v});labels()}
function labels(){const t=$('input[name=type]:checked').value;$('.partyLabel').textContent=t==='gugat'?'Penggugat':'Pemohon';$('.opponentLabel').textContent=t==='gugat'?'Tergugat':'Termohon'}
function row(label,value,plain=false){return `<tr><td class="label">${esc(label)}</td><td class="colon">:</td><td class="value">${plain?esc(value):value||'-'}</td></tr>`}
function generate(d){const talak=d.type==='talak';const A=talak?'Pemohon':'Penggugat';const B=talak?'Termohon':'Tergugat';const a=esc(d.plaintiffName||'-');const b=esc(d.defendantName||'-');const city=esc(d.city||'-');const court=esc(d.court||'Pengadilan Agama');const dateText=fmtDate(d.letterDate);const matter=talak?'permohonan cerai talak':'gugatan cerai';const roleText=talak?'permohonan cerai talak terhadap istri saya':'gugatan cerai terhadap suami saya';const base = [`Bahwa para pihak adalah suami isteri yang sah${d.marriageDate?`, menikah pada tanggal ${fmtDate(d.marriageDate)}`:''}${d.marriageNumber?`, tercatat pada akta nikah Nomor: ${esc(d.marriageNumber)}`:''}.`,`Bahwa sejak menikah sampai saat ini para pihak telah tinggal bersama dan menjalani kehidupan rumah tangga. ${br(d.residence||'-')}` ,`Bahwa selama perkawinan para pihak ${d.children?`telah lahir dan membesarkan anak: ${br(d.children||'-')}`:'belum dikaruniai anak.'}` ,`Bahwa dalam perjalanan rumah tangga terjadi perselisihan dan pertengkaran yang disebabkan oleh ${br(d.conflictCause||'-')}.` ,`Bahwa puncak perselisihan dan keadaan berpisah rumah terjadi pada ${br(d.separation||'-')}.` ,`Bahwa sejak saat itu para pihak tidak lagi hidup rukun dan tidak ada kemungkinan untuk disatukan kembali. ${br(d.reconciliation||'-')}` ,`Bahwa alasan-alasan tersebut di atas telah memenuhi ketentuan hukum mengenai alasan perceraian sebagaimana diatur dalam Undang-Undang No. 1 Tahun 1974 jo. Peraturan Pemerintah No. 9 Tahun 1975 Pasal 19 dan KHI Pasal 116 huruf (f).`];let posita='';base.forEach((item,index)=>{posita += `<li>${item}</li>`;});let petitum=`<li>Menerima dan mengabulkan ${talak?'permohonan Pemohon':'gugatan Penggugat'}.</li><li>${talak?'Memberi izin kepada Pemohon untuk menjatuhkan talak satu raj’i terhadap Termohon di hadapan sidang Pengadilan Agama '+city+'.':'Menjatuhkan talak satu ba’in sughra Tergugat terhadap Penggugat.'}</li>`;if(d.requests){petitum += `<li>${br(d.requests)}.</li>`;}petitum += `<li>Membebankan biaya perkara sesuai ketentuan hukum yang berlaku.</li>`;return `
<div class="word-document">
  <div class="letter-head">
    <div class="head-left">Perihal : ${talak?'Permohonan Cerai Talak':'Gugatan Cerai'}</div>
    <div class="head-right">${city}, ${dateText}</div>
  </div>
  <div class="recipient">Kepada Yth.<br>Ketua ${court}<br>di -<br>${city}</div>
  <p class="greeting">Assalamu’alaikum Wr. Wb.</p>
  <p>Yang bertanda tangan di bawah ini:</p>
  <table class="party-table">
    <tbody>
      ${row('Nama',`<strong>${a}</strong>`,true)}
      ${row('NIK',d.plaintiffNik?esc(d.plaintiffNik):'-')}
      ${row('Tempat dan Tanggal Lahir / Umur',d.plaintiffBirth?esc(d.plaintiffBirth):'-')}
      ${row('Agama',d.plaintiffReligion?esc(d.plaintiffReligion):'Islam')}
      ${row('Warga Negara','Indonesia')}
      ${row('Pendidikan / Pekerjaan',d.plaintiffJob?esc(d.plaintiffJob):'-')}
      ${row('Alamat',br(d.plaintiffAddress||'-'))}
      ${d.plaintiffPhone?row('Nomor Handphone',esc(d.plaintiffPhone)) : ''}
    </tbody>
  </table>
  <p>Selanjutnya disebut sebagai <strong>${A}</strong>.</p>
  <p>Dengan ini mengajukan ${roleText}:</p>
  <table class="party-table">
    <tbody>
      ${row('Nama',`<strong>${b}</strong>`,true)}
      ${row('NIK',d.defendantNik?esc(d.defendantNik):'-')}
      ${row('Tempat dan Tanggal Lahir / Umur',d.defendantBirth?esc(d.defendantBirth):'-')}
      ${row('Agama',d.defendantReligion?esc(d.defendantReligion):'Islam')}
      ${row('Warga Negara','Indonesia')}
      ${row('Pendidikan / Pekerjaan',d.defendantJob?esc(d.defendantJob):'-')}
      ${row('Alamat',br(d.defendantAddress||'-'))}
      ${d.defendantPhone?row('Nomor Handphone',esc(d.defendantPhone)) : ''}
    </tbody>
  </table>
  <p>Selanjutnya disebut sebagai <strong>${B}</strong>.</p>
  <p>Adapun dasar ${matter} ini adalah sebagai berikut:</p>
  <ol class="posita">${posita}</ol>
  <p class="justify">Bahwa berdasarkan uraian tersebut di atas, ${A} menegaskan bahwa keadaan rumah tangga ${A} dan ${B} sudah tidak lagi dapat dipertahankan dan tidak ada kemungkinan untuk hidup rukun kembali. Oleh karena itu, ${A} mohon agar Majelis Hakim yang memeriksa dan mengadili perkara ini menerima, mengabulkan, dan memutuskan perkara ini dengan amar putusan sebagai berikut:</p>
  <p class="mini-heading">Primer :</p>
  <ol class="petitum">${petitum}</ol>
  <p class="mini-heading">Subsider :</p>
  <p>Apabila Majelis Hakim berpendapat lain, mohon putusan yang seadil-adilnya.</p>
  <p>Demikian ${matter} ini dibuat dengan sebenarnya. Atas perhatian dan terkabulnya, diucapkan terima kasih. Wassalamu’alaikum Wr. Wb.</p>
  <div class="signature-block">
    <div>${city}, ${dateText}</div>
    <div>Hormat ${A},</div>
    <div class="signature-space"></div>
    <div><strong>${a}</strong></div>
  </div>
</div>
`;
}
function text(){const x=document.createElement('div');x.innerHTML=currentDraft.html;return x.innerText}
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
async function render(){const d=data();if(!d.plaintiffName&&!d.defendantName)return;currentDraft={...(currentDraft||{}),data:d,updatedAt:Date.now(),title:`${d.type==='talak'?'Cerai Talak':'Cerai Gugat'} — ${d.plaintiffName||'Tanpa nama'}`,html:generate(d)};$('#preview').className='paper';$('#preview').innerHTML=currentDraft.html;$('#printBtn').disabled=$('#exportTxtBtn').disabled=false;await saveDoc(currentDraft);$('#saveHint').textContent='Tersimpan di perangkat • '+new Date().toLocaleTimeString('id-ID');refreshDocs()}
async function refreshDocs(){const ds=await allDocs();$('#docCount').textContent=ds.length;$('#documentList').innerHTML=ds.length?ds.map(d=>`<div class="doc-row"><div><h3>${esc(d.title)}</h3><small>${new Date(d.updatedAt).toLocaleString('id-ID')}</small></div><div class="doc-actions"><button class="ghost openDoc" data-id="${d.id}">Buka</button><button class="danger delDoc" data-id="${d.id}">Hapus</button></div></div>`).join(''):'<div class="empty-state" style="padding:50px">Belum ada dokumen tersimpan.</div>'}
function view(v){$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$$('.view').forEach(x=>x.classList.toggle('active',x.id===v+'View'))}
$$('.tab').forEach(x=>x.onclick=()=>view(x.dataset.view));$$('input[name=type]').forEach(x=>x.onchange=labels);$('#petitionForm').onsubmit=e=>{e.preventDefault();render()};$('#printBtn').onclick=()=>print();$('#exportTxtBtn').onclick=()=>download('surat.txt',text(),'text/plain;charset=utf-8');$('#newBtn').onclick=()=>location.reload();$('#documentList').onclick=async e=>{const id=Number(e.target.dataset.id);if(!id)return;if(e.target.classList.contains('delDoc')){await deleteDoc(id);refreshDocs()}else{const d=(await allDocs()).find(x=>x.id===id);currentDraft=d;load(d.data);$('#preview').className='paper';$('#preview').innerHTML=d.html;$('#printBtn').disabled=$('#exportTxtBtn').disabled=false;view('editor')}};$('#exportBtn').onclick=async()=>download('generate-pa-backup.json',JSON.stringify(await allDocs(),null,2),'application/json');$('#importBtn').onclick=()=>$('#fileInput').click();$('#fileInput').onchange=e=>{const r=new FileReader();r.onload=async()=>{try{for(const d of JSON.parse(r.result)){delete d.id;await saveDoc(d)}refreshDocs();alert('Cadangan berhasil diimpor.')}catch{alert('JSON tidak valid')}};r.readAsText(e.target.files[0])};$('#clearBtn').onclick=async()=>{if(confirm('Hapus semua dokumen lokal?'))for(const d of await allDocs())await deleteDoc(d.id);refreshDocs()};window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installBtn').classList.remove('hidden')});$('#installBtn').onclick=()=>deferredInstall?.prompt();(async()=>{try{await openDB();$('#storageStatus').textContent='● Penyimpanan lokal aktif';refreshDocs()}catch{$('#storageStatus').textContent='Penyimpanan tidak tersedia'}if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');labels()})();
