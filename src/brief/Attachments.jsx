import { useEffect, useState } from 'react';
import { checkFiles, PHOTO_EXTENSIONS, PLAN_EXTENSIONS, previewable, safeMime, sizeLabel } from './fileRules.js';

export function AttachmentCard({ item, onRemove }) {
  const [url, setURL] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const next = URL.createObjectURL(new Blob([item.file], { type: safeMime(item.file.name) }));
    setURL(next); return () => URL.revokeObjectURL(next);
  }, [item.file]);
  return <div className="attachment-card">
    {url && previewable(item.file.name) && !failed ? <img src={url} alt={item.file.name} onError={() => setFailed(true)} /> : <span className="attachment-icon">{item.file.name.split('.').pop().toUpperCase()}</span>}
    <div><strong>{item.file.name}</strong><small>{sizeLabel(item.file.size)} · {item.kind === 'photo' ? 'Fotografija' : 'Nacrt / projekat'}</small>
      <a href={url} download={item.file.name}>Preuzmi</a> {onRemove && <button type="button" onClick={() => onRemove(item.id)} aria-label={`Ukloni ${item.file.name}`}>Ukloni</button>}
    </div>
  </div>;
}
export default function Attachments({ files, onChange }) {
  const [error, setError] = useState('');
  function add(kind, chosen) {
    const additions = Array.from(chosen).map((file) => ({ id: crypto.randomUUID(), kind, file }));
    const combined = [...files, ...additions];
    const problem = checkFiles(combined);
    setError(problem);
    if (!problem) onChange(combined);
  }
  return <section className="brief-attachments" aria-label="Fotografije i projektni fajlovi">
    {[['photo', 'Fotografije prostora', PHOTO_EXTENSIONS, 'Do 8 fotografija, do 10 MB po fotografiji.'], ['plan', 'Nacrti, skice i projekti dizajnera', PLAN_EXTENSIONS, 'Do 3 fajla, do 25 MB po fajlu. PDF, slike, DWG, DXF ili SKP.']].map(([kind, title, extensions, note]) => <div key={kind}>
      <h3>{title}</h3><p>{note}</p>
      <label className="attachment-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); add(kind, event.dataTransfer.files); }}>
        <span>+ Izaberite fajlove ili ih prevucite ovdje</span>
        <input type="file" multiple accept={extensions.map((ext) => `.${ext}`).join(',')} aria-label={title} onChange={(event) => { add(kind, event.target.files); event.target.value = ''; }} />
      </label>
      <div className="attachment-grid">{files.filter((item) => item.kind === kind).map((item) => <AttachmentCard key={item.id} item={item} onRemove={(id) => onChange(files.filter((file) => file.id !== id))} />)}</div>
    </div>)}
    <p>Prilozi nisu obavezni. Ako nemate nacrt, nastavite bez njega. Ukupno do 40 MB. HEIC i projektni fajlovi mogu se preuzeti i kada pregled nije dostupan.</p>
    {error && <p className="brief-error" role="alert">{error} Novi izbor nije dodat; postojeći prilozi su sačuvani.</p>}
  </section>;
}
