# Kako se Smart Project Brief šalje firmi

## Konačni tok

1. Posjetilac popunjava upit, označava potrebne usluge i provjerava pregled.
2. Na završnom koraku prihvata politiku privatnosti i klikne **Pošalji upit**.
3. Sajt šalje podatke serverskoj funkciji. Tajna za slanje emaila nikada nije u kodu preglednika.
4. Serverska funkcija ponovo provjerava podatke, zaštitu od spama i ograničenja priloga.
5. Upit se prvo čuva u bazi sa jedinstvenim brojem, vremenom i statusom `new`.
6. Fotografije prostora i skice čuvaju se privatno. Firma dobija vremenski ograničene linkove, ne javne URL adrese.
7. Firma dobija formatiran email sa najvažnijim podacima i kompletnim pregledom upita.
8. Klijent dobija kratku potvrdu sa brojem upita i jasnom porukom kada može očekivati odgovor.
9. Sajt prikazuje ekran uspjeha tek kada server potvrdi da je upit sačuvan.

## Predložena infrastruktura

- Supabase baza: upiti i njihov status.
- Supabase Storage, privatni bucket: fotografije i skice.
- Supabase Edge Function: provjera, čuvanje i pokretanje emaila.
- Resend: email firmi i potvrda klijentu sa verifikovanog domena firme.
- Cloudflare Turnstile ili jednaka serverski provjerena zaštita: spam i botovi.

Ovo radi i kada je frontend objavljen kao statičan sajt, uključujući GitHub Pages. API ključevi i adresa firme ostaju na serveru.

## Šta firma dobija

- broj i vrijeme upita;
- tip projekta i lokaciju;
- okvirne mjere, materijale i reference;
- budžet i željeni rok;
- svaku označenu uslugu kao zasebnu stavku;
- ime, email, telefon i napomenu;
- privatne linkove ka fotografijama;
- dugmad **Pozovi**, **Odgovori emailom** i, ako firma koristi broj, **Otvori WhatsApp**.

## Šta klijent vidi

Primarno dugme na pregledu biće **Pošalji upit**. Poslije uspjeha vidi broj upita i poruku da je firma primila podatke. Opcija **Sačuvaj nacrt** ostaje prije slanja. Kopiranje i TXT preuzimanje mogu ostati samo kao diskretna rezerva u demo verziji, a u pravoj verziji nisu glavni poziv na akciju.

## Podaci potrebni za aktivaciju

- domen i email sa kojeg firma šalje potvrde;
- email na koji firma prima upite;
- naziv firme i broj telefona / WhatsApp ako se prikazuju;
- tekst politike privatnosti i rok čuvanja podataka;
- Supabase projekat, Resend nalog i zaštita od spama.

Bez ovih podataka frontend ostaje potpuno testabilan, ali ne prikazuje lažan uspjeh slanja.
