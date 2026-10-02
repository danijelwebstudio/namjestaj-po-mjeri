import { useEffect, useState } from 'react';
import { businessConfig } from '../config/businessConfig.js';
import { summaryRows } from '../brief/briefLogic.js';
import { previewable, sizeLabel } from '../brief/fileRules.js';
import { getAttachmentURL, listLeads, live, login, logout, statuses, updateLead } from '../data/leadService.js';
import './Inbox.css';

function FileView({ item }) {
  const [source, setSource] = useState(null);
  const [error, setError] = useState('');
  const [failedImage, setFailedImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const name = item.file?.name || item.name;
  useEffect(() => () => { if (source?.local) URL.revokeObjectURL(source.url); }, [source]);
  async function open() {
    setBusy(true); setError('');
    try { setSource(await getAttachmentURL(item)); } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <article className="inbox-file">
    <span className="inbox-file-kind">{name.split('.').pop().toUpperCase()}</span>
    <strong>{name}</strong><small>{sizeLabel(item.file?.size || item.size)} · {item.kind === 'photo' ? 'Fotografija prostora' : 'Nacrt / projekat'}</small>
    {!source ? <button type="button" onClick={open} disabled={busy}>{busy ? 'Otvaranje…' : 'Prikaži prilog'}</button> : <>
      {previewable(name) && !failedImage && <img src={source.url} alt={name} onError={() => setFailedImage(true)} />}
      <a href={source.url} target="_blank" rel="noopener noreferrer" download={name}>Otvori / preuzmi fajl ↗</a>
      {!source.local && <button type="button" onClick={open} disabled={busy}>Obnovi link (važi 5 minuta)</button>}
    </>}
    {error && <p role="alert">{error}</p>}
  </article>;
}
function LeadDetail({ lead, onSaved }) {
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState(lead.internal_note || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function save(event) {
    event.preventDefault(); setSaving(true); setMessage('');
    try { await updateLead(lead.id, status, note); setMessage('Status i bilješka su sačuvani.'); await onSaved(); }
    catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  }
  const project = businessConfig.projectBrief.projectTypes.find((item) => item.id === lead.data.projectType)?.label || 'Projekat';
  return <section className="inbox-detail" aria-label="Detalji izabranog upita">
    <div className="inbox-detail-heading"><p className="inbox-eyebrow">{lead.reference} · {new Date(lead.created_at).toLocaleString('sr-Latn')}</p><h2>{project}</h2><p>{lead.data.location} · {lead.data.name}</p></div>
    <div className="inbox-contact">{lead.data.phone && <a href={`tel:${lead.data.phone.replace(/[^+\d]/g, '')}`}>Pozovi klijenta ↗</a>}{lead.data.email && <a href={`mailto:${encodeURIComponent(lead.data.email)}`}>Odgovori emailom ↗</a>}</div>
    <form className="inbox-management" onSubmit={save}>
      <label>Status upita<select value={status} onChange={(event) => setStatus(event.target.value)}>{Object.entries(statuses).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <label>Privatna bilješka za firmu<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={4000} rows={3} placeholder="Dogovoreno mjerenje, pitanja za klijenta…" /></label>
      <button type="submit" disabled={saving}>{saving ? 'Čuvanje…' : 'Sačuvaj status i bilješku'}</button><p role="status">{message}</p>
    </form>
    <h3>Odgovori klijenta</h3><dl className="brief-summary">{summaryRows(lead.data, businessConfig.projectBrief).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <h3>Fotografije i projektni fajlovi ({lead.files.length})</h3>
    {!lead.files.length ? <p>Klijent nije dodao priloge.</p> : <div className="inbox-files">{lead.files.map((item) => <FileView key={item.id || item.path} item={item} />)}</div>}
  </section>;
}
export default function Inbox() {
  const [authorized, setAuthorized] = useState(!live);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [leads, setLeads] = useState([]); const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('all');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [updated, setUpdated] = useState('');
  async function refresh() {
    try { const rows = await listLeads(); setLeads(rows); setError(''); setUpdated(new Date().toLocaleTimeString('sr-Latn')); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => {
    if (!authorized) return;
    refresh();
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, 30000);
    return () => clearInterval(timer);
  }, [authorized]);
  async function signIn(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(email, password); setPassword(''); setAuthorized(true); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function signOut() {
    try { await logout(); } catch { /* Local credentials must be cleared even if network logout fails. */ }
    setAuthorized(false); setLeads([]); setSelected(null);
  }
  const visible = leads.filter((lead) => (filter === 'all' || lead.status === filter) && `${lead.reference} ${lead.data.name} ${lead.data.location}`.toLowerCase().includes(query.toLowerCase()));
  const detail = leads.find((lead) => lead.id === selected);
  return <main className="inbox-shell">
    <header className="inbox-top"><a href="#main">← Nazad na sajt</a><span>PO MJERI / RADNI PROSTOR</span>{live && authorized && <button onClick={signOut}>Odjavi se</button>}</header>
    <div className="inbox-title"><p className="inbox-eyebrow">{live ? 'PRIVATNO SANDUČE FIRME' : 'DEMONSTRACIJA · ISTI UREĐAJ I PREGLEDNIK'}</p><h1>Svaki projekat počinje<br />dobrim razgovorom.</h1><p>Upiti, fotografije i nacrti — zajedno, spremni za vaš prvi odgovor.</p></div>
    {!live && <p className="brief-demo-banner">Ovo nije zaštićeno sanduče stvarne firme. Prikazuje samo probne upite sa ovog uređaja. Za prijem sa drugih uređaja uključite Supabase prema uputstvu.</p>}
    {error && <p className="inbox-alert" role="alert">{error}</p>}
    {!authorized ? <form className="inbox-login" onSubmit={signIn}><h2>Prijava za stolara</h2><label>Email<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Lozinka<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button disabled={busy}>{busy ? 'Prijava…' : 'Otvori sanduče →'}</button><p>Nalog za firmu kreira administrator. Nakon osvježavanja stranice prijavite se ponovo.</p></form> : <>
      <div className="inbox-stats"><div><strong>{leads.filter((lead) => lead.status === 'new').length}</strong><span>Novi upiti</span></div><div><strong>{leads.filter((lead) => lead.status === 'measuring').length}</strong><span>Mjerenja</span></div><div><strong>{leads.length}</strong><span>U prikazu</span></div></div>
      <div className="inbox-toolbar"><label>Pretraga<input type="search" placeholder="Ime, lokacija ili broj upita" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Status<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Svi statusi</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button onClick={refresh}>Osvježi ↻</button></div>
      <p className="inbox-refresh">Posljednja provjera: {updated || '…'} · Automatsko osvježavanje svakih 30 sekundi dok je stranica otvorena.{live && ' Prikazuje se do 200 najnovijih upita.'}</p>
      <div className="inbox-layout"><nav className="inbox-list" aria-label="Pristigli upiti">
        {!visible.length && <div className="inbox-empty"><h2>{leads.length ? 'Nema rezultata.' : 'Još nema upita.'}</h2><p>{live ? 'Novi upiti će se pojaviti ovdje.' : 'Vrati se na sajt, popuni formular i pošalji probni upit sa fotografijom ili PDF-om.'}</p><a href="#project-brief">Otvori formular →</a></div>}
        {visible.map((lead) => <button className="inbox-card" key={lead.id} aria-pressed={selected === lead.id} onClick={() => setSelected(lead.id)}><span className="inbox-card-top"><small>{lead.reference}</small><span className={`inbox-badge inbox-badge-${lead.status}`}>{statuses[lead.status]}</span></span><strong>{businessConfig.projectBrief.projectTypes.find((item) => item.id === lead.data.projectType)?.label} · {lead.data.location}</strong><span>{lead.data.name}</span><span>{businessConfig.projectBrief.budgetRanges.find((item) => item.id === lead.data.budget)?.label}</span><small>{lead.files.length} priloga · {new Date(lead.created_at).toLocaleDateString('sr-Latn')}</small></button>)}
      </nav>{detail ? <LeadDetail key={detail.id} lead={detail} onSaved={refresh} /> : <section className="inbox-placeholder"><span>↖</span><h2>Izaberite upit.</h2><p>Ovdje ćete vidjeti kompletan projekat, kontakt i priloge.</p></section>}</div>
    </>}
  </main>;
}
