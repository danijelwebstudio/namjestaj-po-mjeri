export const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
export const PLAN_EXTENSIONS = [...PHOTO_EXTENSIONS, 'pdf', 'dwg', 'dxf', 'skp'];
export const TOTAL_LIMIT = 40 * 1024 * 1024;
export const extension = (name) => name.split('.').pop().toLowerCase();
export const sizeLabel = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export const previewable = (name) => ['jpg', 'jpeg', 'png', 'webp'].includes(extension(name));
export function checkFiles(items) {
  if (items.filter((item) => item.kind === 'photo').length > 8) return 'Možete dodati najviše 8 fotografija prostora.';
  if (items.filter((item) => item.kind === 'plan').length > 3) return 'Možete dodati najviše 3 nacrta ili projektna fajla.';
  let total = 0;
  for (const item of items) {
    const file = item.file || item;
    if (!['photo', 'plan'].includes(item.kind)) return 'Nepoznata vrsta priloga.';
    if (!(item.kind === 'photo' ? PHOTO_EXTENSIONS : PLAN_EXTENSIONS).includes(extension(file.name))) return `Nepodržan format: ${file.name}`;
    if (!file.size || file.size > (item.kind === 'photo' ? 10 : 25) * 1024 * 1024) return `${file.name}: dozvoljeno je do ${item.kind === 'photo' ? 10 : 25} MB; fajl ne smije biti prazan.`;
    total += file.size;
  }
  return total > TOTAL_LIMIT ? 'Svi prilozi zajedno mogu imati najviše 40 MB.' : '';
}
export function safeMime(name) {
  return ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' })[extension(name)] || 'application/octet-stream';
}
