const DB_NAME='generate-pa-db',DB_VERSION=1,STORE='documents';let db,currentDraft=null,deferredInstall;const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});r.onsuccess=()=>{db=r.result;ok(db)};r.onerror=()=>no(r.error)})}
function store(mode='readonly'){return db.transaction(STORE,mode).objectStore(STORE)}
function allDocs(){return new Promise((ok,no)=>{const r=store().getAll();r.onsuccess=()=>ok(r.result.sort((a,b)=>b.updatedAt-a.updatedAt));r.onerror=()=>no(r.error)})}
function saveDoc(d){return new Promise((ok,no)=>{const r=store('readwrite').put(d);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
function deleteDoc(id){return new Promise((ok,no)=>{const r=store('readwrite').delete(id);r.onsuccess=ok;r.onerror=()=>no(r.error)})}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function nl2br(s){return esc(s).replace(/\n/g,'<br>')}
function dateText(s){if(!s)return'';let [y,m,d]=String(s).split('-');return `${d}-${m}-${y}`}
function row(label,val){return `<tr><td class="label">${esc(label)}</td><td class="dot">:</td><td class="value">${val||'-'}</td></tr>`}
function formData(){return Object.fromEntries(new FormData($('#petitionForm')).entries())}
function setForm(d){Object.entries(d||{}).forEach(([k,v])=>{let e=$('#petitionForm').elements[k];if(!e)return;if(e.length&&e[0].type==='radio'){[...e].forEach(x=>x.checked=x.value===v)}else e.value=v});updateLabels()}
function updateLabels(){let t=$('input[name=type]:checked').value;$('.partyLabel').textContent=t==='gugat'?'Penggugat':'Pemohon';$('.opponentLabel').textContent=t==='gugat'?'Tergugat':'Termohon'}
function generate(d){
  let talak=d.type==='talak';
  let title=talak?'PERMOHONAN CERAI TALAK':'GUGATAN CERAI';
  let plaintiffRole=talak?'Pemohon':'Penggugat';
  let defendantRole=talak?'Termohon':'Tergugat';
  let afirst=esc(d.plaintiffName||'-');
  let asecond=esc(d.defendantName||'-');
  let place=esc(d.city||'');
  let dateValue=dateText(d.letterDate);
  let matterText = talak ? 'permohonan cerai talak' : 'gugatan cerai';
  return `
    <div class="doc-word">
      <div class="doc-header">
        <div class="doc-title">PERIHAL: ${title}</div>
        <div class="doc-date">${place}${dateValue?`, ${dateValue}`:''}</div>
      </div>
      <p class="recipient">Kepada Yth.<br>Ketua ${esc(d.court||'Pengadilan Agama')}<br>di ${place || '-'} </p>
      <p class="salutation">Assalamu’alaikum Wr. Wb.</p>
      <p class="intro">Yang bertanda tangan di bawah ini:</p>
      <table class="meta">
        ${row('Nama', `<strong>${afirst}</strong>`)}
        ${row('NIK', esc(d.plaintiffNik||'-'))}
        ${row('Tempat/Tgl Lahir', esc(d.plaintiffBirth||'-'))}
        ${row('Agama', esc(d.plaintiffReligion||'Islam'))}
        ${row('Pekerjaan', esc(d.plaintiffJob||'-'))}
        ${row('Alamat', nl2br(d.plaintiffAddress||'-'))}
      </table>
      <p>Selanjutnya disebut <strong>${plaintiffRole}</strong>.</p>
      <p>Dengan ini mengajukan ${matterText} terhadap:</p>
      <table class="meta">
        ${row('Nama', `<strong>${asecond}</strong>`)}
        ${row('NIK', esc(d.defendantNik||'-'))}
        ${row('Tempat/Tgl Lahir', esc(d.defendantBirth||'-'))}
        ${row('Agama', esc(d.defendantReligion||'Islam'))}
        ${row('Pekerjaan', esc(d.defendantJob||'-'))}
        ${row('Alamat', nl2br(d.defendantAddress||'-'))}
      </table>
      <p>Selanjutnya disebut <strong>${defendantRole}</strong>.</p>
      <p>Adapun dasar ${talak?'permohonan':'gugatan'} ini adalah sebagai berikut:</p>
      <ol>
        <li>Bahwa para pihak adalah suami istri yang sah${d.marriageDate?` dan menikah pada tanggal ${dateText(d.marriageDate)}`:''}${d.marriageNumber?` dengan nomor akta nikah ${esc(d.marriageNumber)}`:''}.</li>
        <li>Bahwa setelah menikah para pihak tinggal bersama dan menjalani kehidupan rumah tangga. ${nl2br(d.residence||'-')}</li>
        <li>Bahwa selama perkawinan tersebut para pihak telah melahirkan dan membesarkan anak ${nl2br(d.children||'-')}.</li>
        <li>Bahwa rumah tangga para pihak telah terjadi perselisihan dan pertengkaran yang disebabkan oleh ${nl2br(d.conflictCause||'-')}.</li>
        <li>Bahwa puncak perselisihan dan keadaan berpisah terjadi pada ${nl2br(d.separation||'-')}.</li>
        <li>Bahwa upaya perdamaian serta keadaan nafkah dan pengasuhan adalah ${nl2br(d.reconciliation||'-')}.</li>
        <li>Bahwa berdasarkan uraian tersebut, rumah tangga para pihak tidak mungkin dipertahankan lagi dan tidak ada kemungkinan untuk rukun kembali.</li>
      </ol>
      <p>Bahwa berdasarkan hal tersebut di atas, ${talak?'permohonan':'gugatan'} ini diajukan berdasarkan peraturan perundang-undangan yang berlaku, termasuk Pasal 19 PP No. 9 Tahun 1975 dan Pasal 116 KHI huruf (f), sepanjang relevan.</p>
      <p class="petition"><strong>Primer:</strong></p>
      <ol>
        <li>Menerima dan mengabulkan ${talak?'permohonan Pemohon':'gugatan Penggugat'}.</li>
        <li>${talak?'Memberi izin kepada Pemohon untuk menjatuhkan talak satu raj’i terhadap Termohon di depan sidang Pengadilan Agama.':'Menjatuhkan talak satu ba’in sughra terhadap Penggugat.'}</li>
        ${d.requests?`<li>${nl2br(d.requests)}</li>`:''}
        <li>Membebankan biaya perkara sesuai hukum yang berlaku.</li>
      </ol>
      <p><strong>Subsider:</strong> Apabila Majelis Hakim berpendapat lain, mohon putusan yang seadil-adilnya.</p>
      <p>Demikian ${talak?'permohonan':'gugatan'} ini dibuat dengan sebenarnya. Atas perhatian dan terkabulnya, diucapkan terima kasih.</p>
      <div class="signature-block">
        <div>${place}${dateValue?`, ${dateValue}`:''}</div>
        <div>Hormat ${plaintiffRole},</div>
        <div class="space"></div>
        <div class="name"><strong>${afirst}</strong></div>
      </div>
    </div>`;
}
async function render(){
  let d=formData();
  if(!d.plaintiffName&&!d.defendantName)return;
  currentDraft={...(currentDraft||{}),data:d,updatedAt:Date.now(),title:`${d.type==='talak'?'Cerai Talak':'Cerai Gugat'} — ${d.plaintiffName||'Tanpa nama'}`,html:generate(d)};
  $('#preview').className='paper';
  $('#preview').innerHTML=currentDraft.html;
  $('#printBtn').disabled=$('#exportTxtBtn').disabled=false;
  await saveDoc(currentDraft);
  $('#saveHint').textContent='Tersimpan di perangkat • '+new Date().toLocaleTimeString('id-ID');
  refreshDocs();
}
function download(n,c,t){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:t}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
async function refreshDocs(){let ds=await allDocs();$('#docCount').textContent=ds.length;$('#documentList').innerHTML=ds.length?ds.map(d=>`<div class="doc-row"><div><h3>${esc(d.title)}</h3><small>${new Date(d.updatedAt).toLocaleString('id-ID')}</small></div><div class="doc-actions"><button class="ghost openDoc" data-id="${d.id}">Buka</button><button class="danger delDoc" data-id="${d.id}">Hapus</button></div></div>`).join(''):'<div class="empty-state" style="padding:50px">Belum ada dokumen tersimpan.</div>'}
function showView(v){$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$$('.view').forEach(x=>x.classList.toggle('active',x.id===v+'View'))}
$$('.tab').forEach(x=>x.onclick=()=>showView(x.dataset.view));$$('input[name=type]').forEach(x=>x.onchange=updateLabels);$('#petitionForm').onsubmit=e=>{e.preventDefault();render()};$('#printBtn').onclick=()=>print();$('#exportTxtBtn').onclick=()=>download('surat.txt',$('#preview').innerText,'text/plain');$('#newBtn').onclick=()=>location.reload();$('#documentList').onclick=async e=>{let id=Number(e.target.dataset.id);if(!id)return;if(e.target.classList.contains('delDoc')){await deleteDoc(id);refreshDocs()}else{let d=(await allDocs()).find(x=>x.id===id);currentDraft=d;setForm(d.data);$('#preview').className='paper';$('#preview').innerHTML=d.html;$('#printBtn').disabled=$('#exportTxtBtn').disabled=false;showView('editor')}};$('#exportBtn').onclick=async()=>download('generate-pa-backup.json',JSON.stringify(await allDocs(),null,2),'application/json');$('#importBtn').onclick=()=>$('#fileInput').click();$('#fileInput').onchange=e=>{let r=new FileReader();r.onload=async()=>{try{for(let d of JSON.parse(r.result)){delete d.id;await saveDoc(d)}refreshDocs();alert('Cadangan berhasil diimpor.')}catch{alert('JSON tidak valid')}};r.readAsText(e.target.files[0])};$('#clearBtn').onclick=async()=>{if(confirm('Hapus semua dokumen lokal?'))for(let d of await allDocs())await deleteDoc(d.id);refreshDocs()};window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installBtn').classList.remove('hidden')});$('#installBtn').onclick=()=>deferredInstall?.prompt();(async()=>{try{await openDB();$('#storageStatus').textContent='● Penyimpanan lokal aktif';refreshDocs()}catch{$('#storageStatus').textContent='Penyimpanan tidak tersedia'}if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');updateLabels()})();
