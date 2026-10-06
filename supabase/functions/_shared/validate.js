import { projectBriefConfig } from '../../../shared/projectBriefConfig.js';
import { emptyBrief, parseDraft, serviceOptionsForProject, validateStep } from '../../../shared/briefLogic.js';
import { checkFiles, extension } from './fileRules.js';
export function validatePayload(payload, files) {
  if (!payload || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(payload.id || '')) throw new Error('Neispravan broj zahtjeva. Osvježite stranicu.');
  if (payload.consent !== true) throw new Error('Nedostaje potvrda slanja.');
  if (!payload.data || typeof payload.data !== 'object') throw new Error('Nedostaju podaci.');
  for (const key of Object.keys(emptyBrief)) {
    const value = payload.data[key];
    if (key === 'services') {
      if (!Array.isArray(value) || value.length > 20 || value.some((item) => typeof item !== 'string' || item.length > 80)) throw new Error('Neispravan izbor usluga.');
    } else if (typeof value !== 'string' || value.length > 2000) throw new Error('Tekstualno polje nedostaje ili je predugačko.');
  }
  const data = parseDraft(JSON.stringify({ version: 1, data: payload.data }));
  for (const [key, value] of Object.entries(data)) if (typeof value === 'string') data[key] = value.trim();
  const config = projectBriefConfig;
  for (let index = 0; index < 4; index++) {
    const errors = validateStep(index, data, config);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  }
  const allowed = new Set(serviceOptionsForProject(data.projectType, config).map((item) => item.id));
  data.services = [...new Set(data.services.filter((id) => allowed.has(id)))];
  const error = checkFiles(files);
  if (error) throw new Error(error);
  return data;
}
export async function verifySignature(file) {
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const text = new TextDecoder().decode(bytes);
  const ext = extension(file.name);
  const checks = {
    jpg: () => bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    jpeg: () => bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    png: () => [137,80,78,71,13,10,26,10].every((byte, index) => bytes[index] === byte),
    webp: () => text.startsWith('RIFF') && text.slice(8,12) === 'WEBP',
    pdf: () => text.startsWith('%PDF-'),
    heic: () => text.slice(4,8) === 'ftyp', heif: () => text.slice(4,8) === 'ftyp',
    dwg: () => text.startsWith('AC10'),
  };
  if (checks[ext] && !checks[ext]()) throw new Error(`Sadržaj fajla ne odgovara formatu: ${file.name}`);
  // DXF/SKP are accepted as opaque downloads. This is format validation, NOT antivirus scanning.
}
