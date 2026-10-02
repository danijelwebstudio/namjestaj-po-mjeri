# Priprema za GitHub Pages

Ovaj paket sadrži cijeli projekat sa fotografijama i README prikazima. Sačuvajte postojeći .env.local: lokalne vrijednosti nisu uključene u paket.

Pripremljeno: Vite putanja koja prati stvarnu Pages adresu, workflow za objavu sa main grane, provjera javnih vrijednosti i .gitignore za lokalne ključeve.

U GitHub repozitorijumu postaviti Settings > Pages > Source > GitHub Actions.
U Settings > Secrets and variables > Actions > Variables dodati:

- VITE_SUPABASE_URL: stvarni Project URL.
- VITE_SUPABASE_ANON_KEY: javni publishable/anon ključ.
- VITE_TURNSTILE_SITE_KEY: javni ključ postojećeg widgeta.
- VITE_PRIVACY_URL: stvarna javna HTTPS stranica o privatnosti.

Workflow sam postavlja VITE_DATA_MODE=supabase. Secret/service_role/Turnstile secret ne idu ovdje.

Za nalog danijelwebstudio na GitHub Pagesu:
- Cloudflare Turnstile: u postojeći widget dodati hostname danijelwebstudio.github.io (bez https, putanje ili porta).
- Supabase Edge Functions > Secrets: ALLOWED_ORIGINS treba uključivati https://danijelwebstudio.github.io. Sačuvati postojeće dozvoljene adrese; za lokalnu probu http://localhost:5173.
- Cloudflare hostname localhost ostaje isti kada se promijeni lokalni port; samo Supabase ALLOWED_ORIGINS mora imati tačan port.

Fotografije su uključene u src/assets/images. Prije javne objave treba popuniti stvarne podatke o privatnosti iz PRIVATNOST-NACRT.md i objaviti tu stranicu.

Objava: push na main pokreće workflow. Sačekati uspješan Deploy. Na objavljenoj adresi poslati označen probni upit sa probnom slikom i PDF-om. Otvoriti adresu sajta sa #/upiti, prijaviti se, provjeriti priloge, promjenu statusa i bilješku. Testirati i odjavu. Test preko dva fizička uređaja ostaje korisnikova provjera ako agent nema pristup tim uređajima.

Status ovog paketa: lokalni build provjeren; repozitorijum, GitHub variables, Cloudflare i Supabase postavke nisu promijenjeni ovim paketom. Javna objava još nije izvršena.
