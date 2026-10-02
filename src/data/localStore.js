// IndexedDB stores structured records AND original file blobs, unlike localStorage.
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('po-mjeri-workspace-v1', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('drafts', { keyPath: 'id' });
      request.result.createObjectStore('leads', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Preglednik nije dozvolio lokalno čuvanje.'));
  });
}
export async function localStore(store, method, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, ['get', 'getAll'].includes(method) ? 'readonly' : 'readwrite');
    const request = tx.objectStore(store)[method](value);
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onabort = tx.onerror = () => { db.close(); reject(new Error('Čuvanje nije uspjelo. Provjerite slobodan prostor i dozvole preglednika.')); };
  });
}
