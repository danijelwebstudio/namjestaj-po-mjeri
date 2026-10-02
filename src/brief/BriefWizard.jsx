import { useEffect, useRef, useState } from 'react';
import { DRAFT_VERSION, detailFields, emptyBrief, parseDraft, serviceOptionsForProject, stepLabels, summaryRows, summaryText, validateStep } from './briefLogic.js';
import './BriefWizard.css';
import Attachments, { AttachmentCard } from './Attachments.jsx';
import { checkFiles } from './fileRules.js';
import { localStore } from '../data/localStore.js';
import { live, privacyUrl, submitLead } from '../data/leadService.js';
import SpamCheck from './SpamCheck.jsx';

function Field({ name, label, value, onChange, errors, multiline, options, ...props }) {
  const id = `brief-${name}`;
  const common = { id, name, value, onChange: (event) => onChange(name, event.target.value), 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `${id}-error` : undefined, ...props };
  return <div className="brief-field">
    <label htmlFor={id}>{label}</label>
    {options ? <select {...common}><option value="">Izaberite…</option>{options.map((item) => <option key={item.id || item} value={item.id || item}>{item.label || item}</option>)}</select>
      : multiline ? <textarea {...common} rows={3} maxLength={2000} /> : <input {...common} maxLength={200} />}
    {errors[name] && <p className="brief-error" id={`${id}-error`}>{errors[name]}</p>}
  </div>;
}

function ServiceChecklist({ options, selected, other, onToggle, onAll, onOther }) {
  const allSelected = options.length > 0 && options.every((item) => selected.includes(item.id));
  return <fieldset className="brief-checklist">
    <legend>Koje usluge su vam potrebne?</legend>
    <p>Označite sve što želite uključiti u ponudu. Konačan obim firma potvrđuje nakon razgovora.</p>
    <label className="brief-check-all"><input type="checkbox" checked={allSelected} onChange={(event) => onAll(event.target.checked)} /><span><strong>Kompletna usluga</strong><small>Označava sve stavke dostupne za ovaj projekat</small></span></label>
    <div className="brief-check-grid">{options.map((item) => <label key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} /><span>{item.label}</span></label>)}</div>
    <label className="brief-other" htmlFor="brief-servicesOther">Drugo ili posebna napomena</label>
    <textarea id="brief-servicesOther" value={other} onChange={(event) => onOther(event.target.value)} rows={2} maxLength={500} placeholder="Npr. unos bez lifta, montaža u dvije faze…" />
  </fieldset>;
}

export default function BriefWizard({ config, open, onClose }) {
  const dialog = useRef(null);
  const heading = useRef(null);
  const [data, setData] = useState({ ...emptyBrief });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const submissionId = useRef(crypto.randomUUID());
  const busyRef = useRef(false);

  useEffect(() => {
    if (!open) { dialog.current?.close(); return undefined; }
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    dialog.current.showModal();
    document.body.style.overflow = 'hidden';
    heading.current?.focus();
    return () => {
      dialog.current?.close();
      document.body.style.overflow = oldOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      heading.current?.focus();
      dialog.current?.scrollTo(0, 0);
    }
  }, [step, open]);

  function change(name, value) {
    setData((current) => {
      if (name !== 'projectType') return { ...current, [name]: value };
      const allowed = new Set(serviceOptionsForProject(value, config).map((item) => item.id));
      return { ...current, [name]: value, services: current.services.filter((id) => allowed.has(id)) };
    });
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus('');
  }
  function advance(event) {
    event.preventDefault();
    const found = validateStep(step, data, config);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`brief-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStep((current) => Math.min(current + 1, 4));
    setStatus('');
  }
  async function saveDraft() {
    setBusy(true);
    try {
      await localStore('drafts', 'put', { id: config.storageKey, version: DRAFT_VERSION, data, files, savedAt: Date.now() });
      setStatus('Unos i svi prilozi su sačuvani na ovom uređaju, u ovom pregledniku. Firmi ništa nije poslato.');
    } catch { setStatus('Čuvanje nije uspjelo. Unos i prilozi su još ovdje; ne zatvarajte stranicu dok ih ne pošaljete.'); }
    finally { setBusy(false); }
  }
  async function loadDraft() {
    setBusy(true);
    try {
      const stored = await localStore('drafts', 'get', config.storageKey);
      const raw = stored ? JSON.stringify(stored) : localStorage.getItem(config.storageKey);
      if (!raw) { setStatus('U ovom pregledniku nema sačuvanog nacrta.'); return; }
      setData(parseDraft(raw)); setStep(0); setErrors({}); setConfirmClear(false);
      setFiles(stored?.files || []); setConsent(false); submissionId.current = crypto.randomUUID();
      setStatus('Sačuvani unos je učitan' + (stored ? ', zajedno sa prilozima.' : '. Stara verzija nije čuvala priloge.'));
    } catch { setStatus('Nacrt nije moguće učitati. Možete nastaviti unos bez njega.'); }
    finally { setBusy(false); }
  }
  async function clearDraft() {
    setBusy(true);
    let cleared = true;
    try { await localStore('drafts', 'delete', config.storageKey); localStorage.removeItem(config.storageKey); } catch { cleared = false; }
    setData({ ...emptyBrief }); setStep(0); setErrors({}); setConfirmClear(false);
    setFiles([]); setConsent(false); submissionId.current = crypto.randomUUID(); setBusy(false);
    setStatus(cleared ? 'Unos i sačuvani nacrt su obrisani.' : 'Unos je očišćen, ali preglednik nije dozvolio brisanje sačuvanog nacrta.');
  }
  async function send() {
    if (busyRef.current) return;
    for (let index = 0; index < 4; index++) {
      const found = validateStep(index, data, config);
      if (Object.keys(found).length) { setStep(index); setErrors(found); return; }
    }
    const fileError = checkFiles(files);
    if (fileError) { setStatus(fileError); return; }
    if (!consent) { setStatus('Potvrdite da želite poslati navedene podatke i priloge.'); return; }
    if (live && !token) { setStatus('Sačekajte provjeru zaštite od spama.'); return; }
    busyRef.current = true; setBusy(true); setProgress(0); setStatus('');
    try {
      const result = await submitLead({ id: submissionId.current, data, files, token, onProgress: setProgress });
      setReceipt(result);
      // Only remove a saved draft if it exactly matches this submission. A different draft is kept.
      try {
        const saved = await localStore('drafts', 'get', config.storageKey);
        if (saved && JSON.stringify(saved.data) === JSON.stringify(data) && JSON.stringify(saved.files.map((f) => f.id)) === JSON.stringify(files.map((f) => f.id))) await localStore('drafts', 'delete', config.storageKey);
      } catch { /* Submission is already committed; cleanup failure must not invite a duplicate. */ }
      heading.current?.focus();
    } catch (error) { setStatus(error.message); }
    finally { busyRef.current = false; setBusy(false); setToken(''); setCaptchaKey((value) => value + 1); }
  }
  function newInquiry() {
    setReceipt(null); setData({ ...emptyBrief }); setFiles([]); setStep(0); setStatus(''); setConsent(false); setErrors({}); submissionId.current = crypto.randomUUID();
  }
  async function copySummary() {
    try { await navigator.clipboard.writeText(summaryText(data, config)); setStatus('Pregled je kopiran. Možete ga zalijepiti u poruku; ništa nije poslato automatski.'); }
    catch { setStatus('Kopiranje nije dostupno. Koristite dugme Preuzmi pregled.'); }
  }
  function downloadSummary() {
    const url = URL.createObjectURL(new Blob([summaryText(data, config)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'moj-projekat.txt';
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Pregled je pripremljen za preuzimanje. Upit nije poslat firmi.');
  }
  const field = (name, label, props = {}) => <Field key={name} name={name} label={label} value={data[name]} onChange={change} errors={errors} {...props} />;
  const details = detailFields(data.projectType, config);
  const serviceOptions = serviceOptionsForProject(data.projectType, config);
  function toggleService(id) {
    setData((current) => ({ ...current, services: current.services.includes(id) ? current.services.filter((item) => item !== id) : [...current.services, id] }));
    setStatus('');
  }
  const detailCopy = { appliances: ['Koji uređaji su planirani?', 'Npr. ugradna rerna, frižider, mašina za suđe…'], island: ['Da li želite kuhinjsko ostrvo?', 'Da, ne ili još razmatram…'], doorType: ['Kakva vrata želite?', 'Klizna, klasična ili još ne znam…'], storage: ['Šta treba smjestiti unutra?', 'Police, ladice, prostor za vješanje…'], lighting: ['Da li želite rasvjetu?', 'Da, ne ili želim preporuku…'] };

  return <dialog ref={dialog} className="brief-dialog" aria-labelledby="brief-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <header className="brief-dialog-header"><span>VAŠ PROJEKAT / SMART BRIEF</span><button type="button" disabled={busy} onClick={onClose} aria-label="Zatvori upitnik">Zatvori ×</button></header>
    <div className="brief-dialog-content">
      {receipt ? <div className="brief-receipt">
        <p className="brief-kicker">{receipt.demo ? 'PROBNI UPIT JE SAČUVAN' : 'UPIT JE PRIMLJEN'}</p>
        <h2 id="brief-title" tabIndex={-1} ref={heading}>{receipt.reference}</h2>
        <p>{receipt.demo ? 'Ovo je demonstracija na ovom uređaju. Upit i svi prilozi nalaze se u probnom sandučetu; stvarnoj firmi ništa nije poslato.' : 'Vaši podaci i prilozi sačuvani su u sandučetu firme. Firma će vas kontaktirati nakon pregleda. Sačuvajte ovaj broj upita.'}</p>
        <p>Konačna ponuda se dogovara nakon provjere mjera i detalja.</p>
        {receipt.demo && <a href="#/upiti" onClick={onClose}>Otvori probno sanduče stolara →</a>}
        <button type="button" onClick={newInquiry}>Novi upit</button>
      </div> : <>
      {!live && <p className="brief-demo-banner">PROBNI REŽIM · Upiti i prilozi ostaju u ovom pregledniku. Stvarno slanje firmi nije uključeno.</p>}
      <ol className="brief-progress" aria-label="Koraci upitnika">{stepLabels.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} data-complete={index < step}><span>{String(index + 1).padStart(2, '0')}</span>{label}</li>)}</ol>
      <p className="brief-kicker">KORAK {step + 1} OD 5</p>
      <h2 id="brief-title" ref={heading} tabIndex={-1}>{['Šta imate na umu?', 'Detalji vašeg prostora.', 'Budžet i očekivanja.', 'Kako da vas kontaktiramo?', 'Vaš projekat, na jednom mjestu.'][step]}</h2>
      <p className="brief-step-note">{['Izaberite vrstu projekta, lokaciju i objekat. Polja sa * su obavezna.', 'Dodajte mjere, fotografije i nacrt ako ih imate. Ovaj korak možete i preskočiti.', 'Okvirni odgovori su dovoljni. Ovo nije obračun cijene ni obećanje roka.', 'Navedite kontakt i pristup prostoru da bi firma mogla pripremiti razgovor i dostavu.', 'Provjerite odgovore i priloge prije slanja.'][step]}</p>
      <form onSubmit={advance} noValidate>
        <fieldset className="brief-form-body" disabled={busy}>
        <div className="brief-fields">
          {step === 0 && <>{field('projectType', 'Vrsta projekta *', { options: config.projectTypes })}{field('location', 'Grad / mjesto *', { autoComplete: 'address-level2', placeholder: 'Npr. Novi Sad' })}{field('propertyType', 'Vrsta objekta *', { options: ['Kuća', 'Stan', 'Poslovni prostor', 'Drugo'] })}</>}
          {step === 1 && <>
            {field('dimensions', 'Okvirne dimenzije (cm)', { placeholder: 'Širina × visina × dubina ili opis prostora', multiline: true })}
            {field('materials', 'Materijali i izgled', { placeholder: 'Boje, površine ili „treba mi preporuka“', multiline: true })}
            {Object.entries(detailCopy).filter(([key]) => details.includes(key)).map(([key, [label, placeholder]]) => field(key, label, { placeholder, multiline: true }))}
            {field('references', 'Linkovi za inspiraciju / opis ideje', { placeholder: 'Pinterest, Instagram ili opis onoga što vam se dopada…', multiline: true })}
            <Attachments files={files} onChange={setFiles} />
          </>}
          {step === 2 && <>{field('budget', 'Okvirni budžet *', { options: config.budgetRanges })}{field('timeline', 'Željeni rok *', { options: ['U naredna 1–3 mjeseca', 'U naredna 3–6 mjeseci', 'Kasnije', 'Fleksibilan rok / još ne znam'] })}<ServiceChecklist options={serviceOptions} selected={data.services} other={data.servicesOther} onToggle={toggleService} onAll={(checked) => change('services', checked ? serviceOptions.map((item) => item.id) : [])} onOther={(value) => change('servicesOther', value)} /></>}
          {step === 2 && <label className="brief-check-all"><input type="checkbox" checked={!!data.servicesUnsure} onChange={(event) => change('servicesUnsure', event.target.checked ? 'yes' : '')} />Nisam siguran koje usluge trebam — želim preporuku</label>}
          {step === 3 && <>{field('floor', 'Sprat / etaža', { placeholder: 'Prizemlje, četvrti sprat, potkrovlje…' })}{field('elevator', 'Da li postoji lift?', { options: ['Da', 'Ne', 'Nije potreban / prizemlje', 'Nisam siguran'] })}{field('access', 'Pristup za dostavu', { placeholder: 'Parking, prilaz kombijem, uzak ulaz ili stepenište…', multiline: true })}{field('address', 'Adresa (opcionalno)', { autoComplete: 'street-address', placeholder: 'Možete je dogovoriti i kasnije' })}{field('name', 'Ime *', { autoComplete: 'name' })}{field('email', 'Email (ili telefon)', { type: 'email', autoComplete: 'email' })}{field('phone', 'Telefon (ili email)', { type: 'tel', autoComplete: 'tel' })}{field('notes', 'Još nešto što treba da znamo?', { multiline: true })}</>}
        </div>
        {step === 4 && <>
          <dl className="brief-summary">{summaryRows(data, config).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <h3>Prilozi ({files.length})</h3><div className="attachment-grid">{files.map((item) => <AttachmentCard key={item.id} item={item} onRemove={(id) => setFiles(files.filter((file) => file.id !== id))} />)}</div>
          {!files.length && <p>Nema priloga. Možete poslati upit i bez njih.</p>}
          <label className="brief-check-all"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>{live ? 'Želim poslati navedene podatke i priloge firmi radi odgovora na upit.' : 'Želim sačuvati ovaj probni upit i priloge na ovom uređaju.'} {live && privacyUrl && <a href={privacyUrl} target="_blank" rel="noopener noreferrer">Informacije o privatnosti</a>}</span></label>
          {live && <SpamCheck onToken={setToken} resetKey={captchaKey} />}
          {busy && <div role="status"><progress max="100" value={progress} /><p>{progress >= 95 ? 'Čekamo potvrdu da su svi podaci sačuvani…' : `Slanje ${progress}%`}</p></div>}
          <details className="brief-backup"><summary>Kopija pregleda za vas</summary><div className="brief-export"><button type="button" onClick={downloadSummary}>Preuzmi pregled ↓</button><button type="button" onClick={copySummary}>Kopiraj pregled</button></div></details>
          <p className="brief-step-note">Konačna ponuda zahtijeva potvrđene mjere i dogovoreno rješenje.</p>
        </>}
        <div className="brief-step-actions"><button type="button" disabled={step === 0} onClick={() => { setStep((current) => current - 1); setErrors({}); setStatus(''); }}>← Nazad</button>{step < 4 ? <button className="brief-primary" type="submit">{step === 3 ? 'Pregledaj upit' : 'Dalje'} →</button> : <button type="button" className="brief-primary" onClick={send}>{busy ? 'Slanje…' : live ? 'Pošalji upit i zatraži procjenu →' : 'Pošalji probni upit →'}</button>}</div>
        </fieldset>
      </form>
      <aside className="brief-draft">
        <p>„Sačuvaj i nastavi kasnije“ čuva odgovore i originalne priloge samo na ovom uređaju i pregledniku. Učitavanje zamjenjuje trenutni unos. Nemojte čuvati na tuđem uređaju. Brisanje podataka preglednika briše i sačuvani unos.</p>
        <div><button type="button" disabled={busy} onClick={saveDraft}>Sačuvaj i nastavi kasnije</button><button type="button" disabled={busy} onClick={loadDraft}>Učitaj sačuvani unos</button><button type="button" disabled={busy} onClick={() => setConfirmClear(true)}>Obriši sačuvani unos</button></div>
        {confirmClear && <div className="brief-clear"><span>Obrisati trenutni i sačuvani unos, zajedno sa prilozima?</span><button type="button" disabled={busy} onClick={clearDraft}>Da, obriši</button><button type="button" disabled={busy} onClick={() => setConfirmClear(false)}>Odustani</button></div>}
        <p className="brief-status" role="status" aria-live="polite">{status}</p>
      </aside>
      </>}
    </div>
  </dialog>;
}
