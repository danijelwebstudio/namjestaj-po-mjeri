# Stvarno slanje i privatno sanduče

Probni režim radi odmah. Ovi koraci uključuju prijem upita sa drugih uređaja. U ovoj verziji jedna firma koristi jedan Supabase projekat. Različite firme ne dijele istu bazu.

## 1. Napravi Supabase projekat

U svom Supabase nalogu napravi nov projekat i sačuvaj URL projekta, njegov project ref i javni publishable/anon ključ. Tajni service_role ključ nikad ne ide u React kod, VITE varijable ili javni repozitorijum.

U SQL Editoru novog projekta pokreni sadržaj `supabase/migrations/202610010001_brief_inbox.sql` jednom. Skripta pravi tabelu upita, članstvo zaposlenih, privatni prostor za fajlove i pravila pristupa. Ne isključuj RLS. Ako je skripta već primijenjena, nemoj je ponovo izvršavati jer su pravila već kreirana.

## 2. Napravi nalog stolara

U Authentication → Users kreiraj korisnika sa emailom i lozinkom, potvrdi email kroz administratorsku opciju, pa kopiraj njegov User UID. Klijenti ne otvaraju naloge. U postavkama isključi javno kreiranje novih naloga jer zaposlene dodaje administrator.

U SQL Editoru izvrši, uz zamjenu UUID-a:

```sql
insert into public.staff(user_id)
values ('OVDJE-USER-UID')
on conflict do nothing;
```

Samo nalog iz ove tabele može čitati upite i privatne fajlove. Drugi prijavljeni nalozi ne dobijaju pristup. Zaposleni mogu mijenjati samo status i internu bilješku, ne klijentove odgovore.

## 3. Uključi zaštitu javnog formulara

U Cloudflare Turnstile napravi widget za domen sajta i, za testiranje, localhost. Dobijaš javni Site key i tajni Secret key.

U Supabase Edge Functions → Secrets postavi:

- `TURNSTILE_SECRET_KEY`: tajni ključ widgeta.
- `ALLOWED_ORIGINS`: tačna porijekla sajta, odvojena zarezom; npr. `https://firma.rs,https://www.firma.rs,http://localhost:5173`. Bez završne kose crte i bez putanje.

Za GitHub Pages porijeklo je `https://korisnik.github.io`, bez imena repozitorijuma. Ako Vite pokrene drugi port, dodaj i taj port. SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY obezbjeđuje Supabase okruženje.

## 4. Objavi funkciju

U terminalu, u folderu projekta:

```bash
npx supabase login
npx supabase link --project-ref TVOJ_PROJECT_REF
npx supabase functions deploy submit-brief --no-verify-jwt
```

Funkcija je javni ulaz za kupce bez naloga. Sama provjerava porijeklo, Turnstile token, podatke, priloge i limit upita. Ostale operacije ostaju zaštićene prijavom i RLS pravilima. Funkcija uvozi zajedničku validaciju iz src; pri deployu koristi cijeli projekat, nemoj kopirati samo index.ts u editor.

## 5. Poveži sajt

Kopiraj `.env.example` u `.env.local`, popuni vrijednosti i postavi:

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://TVOJ_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=TVOJ_JAVNI_KLJUC
VITE_TURNSTILE_SITE_KEY=TVOJ_JAVNI_SITE_KEY
VITE_PRIVACY_URL=https://tvoj-domen.rs/privatnost
```

Link privatnosti mora voditi do stvarnih informacija firme o obradi podataka, ne prazne stranice. VITE varijable su javne; ne unosi nikakav tajni ključ. Restartuj `npm run dev`. Za objavljen sajt ponovo uradi build sa ovim varijablama u okruženju hostinga. `.env.local` ne šalji na GitHub.

## 6. Provjeri između dva uređaja

Na telefonu popuni upit sa fotografijom i PDF-om. Sačekaj potvrdu sa brojem upita. Na računaru otvori `/#/upiti`, prijavi se nalogom stolara i provjeri podatke i oba priloga. Promijeni status i sačuvaj bilješku, pa osvježi. Odjavi se i provjeri da se sanduče više ne vidi.

Prilozi su privatni. Klik na prilog izdaje link od 5 minuta; ko dobije taj link može ga koristiti tokom tih 5 minuta, zato ga ne objavljuj. DWG/DXF/SKP i HEIC mogu zahtijevati odgovarajući program. CAD fajlovi se ne renderuju u aplikaciji.

## Operativne napomene

- Sanduče prikazuje do 200 najnovijih upita i osvježava se na 30 sekundi dok je otvoreno. Push/SMS obavještenja nisu uključena.
- Token prijave je u memoriji, ne u trajnom browser skladištu. Nakon osvježavanja ili isteka sesije korisnik se prijavljuje ponovo. Lozinka se ne čuva.
- Sačuvaj i nastavi kasnije čuva upit i fajlove lokalno; to nije slanje firmi i ne radi između uređaja. Brisanje podataka preglednika briše sačuvani unos.
- Server potvrđuje prijem tek kada su svi fajlovi sačuvani i upit upisan. Ponovljeni identičan zahtjev ne kreira duplikat. Ako istekne mreža, ponovi neizmijenjen zahtjev sa novom spam provjerom.
- Format, broj i veličina priloga se provjeravaju na serveru. To nije antivirus skeniranje: projektne fajlove otvarajte kao i druge primljene dokumente. Servis za antivirus provjeru nije integrisan.
- Ako server bude nasilno zaustavljen tokom slanja, rezervacija može ostati u `processing`. Administrator treba da provjeri da za taj ID nema reda u leads, ukloni nepotpune fajlove iz foldera tog ID-a, pa označi rezervaciju kao `failed`. Ne briši priložene fajlove postojećeg upita.
- Dogovorite rok čuvanja sa firmom. Brisanje se za sada radi administratorski: prvo prilozi iz privatnog bucket-a za taj ID, zatim upit i njegova rezervacija. Automatsko brisanje i backup plan nisu podešeni ovim paketom.
- Ovaj paket nije povezan sa stvarnim nalogom. Serverski pozivi provjereni su simulacijama; završni test stvarnog servisa obavezan je po povezivanju.

Zvanična dokumentacija: [Supabase deploy](https://supabase.com/docs/guides/functions/deploy), [secrets](https://supabase.com/docs/guides/functions/secrets), [privatni bucket](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Turnstile provjera](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
