# విద్యా సేవ – వనపర్తి (ప్రారంభ ప్రాజెక్ట్)

ఈ ప్రాజెక్ట్ విద్యా సంస్థల సర్వేలు, విద్యార్థుల సమస్యలు నమోదు చేయడానికి రూపొందించిన ప్రారంభ వెబ్ యాప్. ఇది ఇంకా లైవ్‌లో ప్రచురించబడలేదు; నిజమైన క్లౌడ్ సేవ్ కోసం క్రింది సెటప్ అవసరం.

## ఇందులో ఉన్నవి
- తెలుగు మొబైల్-ఫ్రెండ్లీ డ్యాష్‌బోర్డ్
- విద్యా సంస్థ సర్వే ఫారం
- విద్యార్థుల సమస్య నమోదు ఫారం
- రికార్డుల జాబితా
- Supabase/PostgreSQL డేటాబేస్ స్కీమా
- రిఫరెన్స్ నంబర్ ఆటోమేటిక్‌గా రూపొందించే complaint table

## అవసరమైనవి
- Node.js 20 లేదా తదుపరి LTS వెర్షన్
- Supabase ఖాతా
- GitHub ఖాతా మరియు Vercel వంటి హోస్టింగ్ సేవ (లైవ్ ప్రచురణ కోసం)

## స్థానికంగా ప్రారంభించడం
1. ZIP ఫైల్‌ను extract చేయండి.
2. ప్రాజెక్ట్ ఫోల్డర్‌లో terminal తెరవండి.
3. `npm install` అమలు చేయండి.
4. `.env.example` కాపీ చేసి `.env.local` అనే ఫైల్ చేయండి.
5. Supabase Project URL, Publishable/anon key ను `.env.local` లో పెట్టండి.
6. Supabase Dashboard → SQL Editor లో `supabase/schema.sql` కంటెంట్‌ను అమలు చేయండి.
7. `npm run dev` అమలు చేసి `http://localhost:3000` తెరవండి.

## Supabase సెటప్
1. Supabase లో కొత్త project సృష్టించండి.
2. Project Settings → API లో Project URL, publishable/anon key తీసుకోండి.
3. SQL Editor లో `supabase/schema.sql` అమలు చేయండి.
4. Authentication → Providers లో Email login ను enable చేయండి.
5. Authentication → Users లో అనుమతించిన టీమ్ సభ్యుల అకౌంట్లు సృష్టించండి.
6. `profiles` టేబుల్‌లో ప్రతి యూజర్‌కు అదే auth user UUID తో profile row జోడించండి.

## ముఖ్యమైన పరిమితులు
- ఈ starter లో login screen ఇంకా జోడించలేదు. అందువల్ల డేటా సేవ్ చేసే UI ను నిజమైన టీమ్‌కు అందించే ముందు authentication flow అమలు చేయాలి.
- Database policies authenticated users కు మాత్రమే access ఇస్తాయి; అయినా role/mandal ఆధారిత నియంత్రణలు పూర్తిగా అమలు కాలేదు. Public launch కు ముందు వాటిని కట్టుదిట్టం చేయాలి.
- Public complaint form ఇంకా లేదు. విద్యార్థుల వ్యక్తిగత వివరాలు లేదా ఫోన్ నంబర్లు సేకరించే ముందు consent, privacy notice, access controls అవసరం.
- Excel/PDF export, photo uploads, offline queue/sync, edit/status update, audit log ఇంకా అమలు కాలేదు.
- డేటా నిజంగా క్లౌడ్‌లో సేవ్ అవ్వాలంటే Supabase project, environment keys, SQL setup పూర్తి చేయాలి.
- Supabase service-role key ను browser/client code లో ఎప్పుడూ పెట్టవద్దు. Publishable/anon key మాత్రమే client లో వాడాలి; RLS తప్పనిసరి.

## Production కు ముందు తప్పనిసరి పనులు
- login/logout మరియు password reset
- admin/field worker పాత్రల ఆధారంగా అనుమతులు
- మండల వారీగా record visibility
- complaint status update మరియు audit trail
- private photo storage, file type/size validation
- backups, data retention, privacy notice
- export, testing, deployment


## ముఖ్యమైన భద్రతా గమనిక
ఈ ప్రాజెక్ట్ ప్రారంభ నమూనా మాత్రమే; productionలో ప్రచురించే ముందు login/role access ను పరీక్షించాలి. మీ Supabase policies ప్రస్తుతం `authenticated` role కు మాత్రమే insert/select అనుమతిస్తే, login లేకుండా ఫారమ్‌లు పనిచేయవు. నిజమైన విద్యార్థుల వ్యక్తిగత వివరాలు నమోదు చేయకండి. `service_role`/secret key ను ఎప్పుడూ browser app లో పెట్టకండి.
