#!/usr/bin/env node
/* verify.cjs — kontrollerar Konstruktionslabbet utan webbläsare.
   node verify.cjs  → 0 fel eller lista med fel. */
const fs = require('fs');
const path = require('path');
const D = require('./public/data.js');
const fel = [];
const UPP = D.uppgifter;

/* Oberoende svarsnyckel, skriven för hand ur uppgifterna – inte ur `ratt`. */
const NYCKEL = { 1: 1, 2: 1, 3: 1, 4: 0, 5: 0, 6: 0, 7: 1, 8: 0, 9: 0 };
const IKONER = ['fyrkant', 'snedstag', 'kryss', 'vinkel', 'konsol', 'vajer', 'balk', 'pelare', 'gummi', 'stal', 'glas', 'lera'];

if (UPP.length !== 9) fel.push('Antal uppgifter: ' + UPP.length + ', väntat 9');
const idar = new Set();
const perNiva = { 1: 0, 2: 0, 3: 0 };
UPP.forEach(u => {
  if (idar.has(u.id)) fel.push('Dubbelt id ' + u.id);
  idar.add(u.id);
  if (!perNiva[u.niva] && perNiva[u.niva] !== 0) fel.push('Okänd nivå ' + u.niva);
  perNiva[u.niva]++;
  if (!(u.alternativ.length >= 2 && u.alternativ.length <= 3)) fel.push('Uppgift ' + u.id + ': ' + u.alternativ.length + ' alternativ');
  if (!(u.ratt >= 0 && u.ratt < u.alternativ.length)) fel.push('Uppgift ' + u.id + ': ratt utanför listan');
  if (NYCKEL[u.id] !== u.ratt) fel.push('Uppgift ' + u.id + ': ratt=' + u.ratt + ' men facit säger ' + NYCKEL[u.id]);
  if (!u.fraga.trim().endsWith('?')) fel.push('Uppgift ' + u.id + ': frågan slutar inte med ?');
  if (!u.forklaring || u.forklaring.length < 40) fel.push('Uppgift ' + u.id + ': förklaringen är för kort');
  u.alternativ.forEach(a => {
    if (!IKONER.includes(a.ikon)) fel.push('Uppgift ' + u.id + ': okänd ikon ' + a.ikon);
    if (!a.text || a.text.length < 2) fel.push('Uppgift ' + u.id + ': tomt alternativ');
    if (/[A-Za-zÅÄÖåäö]/.test(a.text) === false) fel.push('Uppgift ' + u.id + ': alternativ utan text');
  });
  // rätt svar får inte vara det enda som är rimligt formulerat – dubbletter är en bugg
  const texter = u.alternativ.map(a => a.text.toLowerCase());
  if (new Set(texter).size !== texter.length) fel.push('Uppgift ' + u.id + ': två alternativ har samma text');
});
[1, 2, 3].forEach(n => { if (perNiva[n] !== 3) fel.push('Nivå ' + n + ' har ' + perNiva[n] + ' uppgifter, väntat 3'); });

/* Varje mening appen säger ska finnas i röstlistan. */
const meningar = D.meningar();
UPP.forEach(u => {
  if (!meningar.includes(u.fraga)) fel.push('Frågan saknas i meningar(): ' + u.fraga.slice(0, 40));
  if (!meningar.includes('Rätt! ' + u.forklaring)) fel.push('Rätt-mening saknas: ' + u.id);
  if (!meningar.includes('Nästan. ' + u.forklaring)) fel.push('Nästan-mening saknas: ' + u.id);
});
const unika = new Set(meningar);
if (unika.size !== meningar.length) fel.push('meningar() innehåller dubbletter');

/* Lgr22-citatet måste stå ordagrant i både data.js och index.html. */
const html = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8').replace(/\s+/g, ' ');
if (!html.includes(D.citat.replace(/\s+/g, ' '))) fel.push('Lgr22-citatet står inte ordagrant i index.html');
if (!D.citat.includes('drag- och tryckhållfasthet, hårdhet och elasticitet')) fel.push('Citatet avviker från kunskapskravet');

/* Bundna filer ska finnas. */
const krav = ['public/index.html', 'public/styles.css', 'public/app.js', 'public/data.js',
  'public/ljud/lines.js', 'public/ljud/rosten.js', 'public/favicon.svg', 'public/site.webmanifest',
  'public/kort.png', 'Dockerfile', 'deploy/nginx.conf'];
krav.forEach(f => { if (!fs.existsSync(path.join(__dirname, f))) fel.push('Saknar fil: ' + f); });

/* Varje mening i röstlistan ska ha en mp3-fil större än 800 byte. */
const lines = fs.readFileSync(path.join(__dirname, 'public/ljud/lines.js'), 'utf8');
const ROST = JSON.parse(lines.slice(lines.indexOf('{'), lines.lastIndexOf('}') + 1));
meningar.forEach(m => {
  const id = ROST[m];
  if (!id) { fel.push('Ingen röstfil för: ' + m.slice(0, 40)); return; }
  const f = path.join(__dirname, 'public/ljud', id + '.mp3');
  if (!fs.existsSync(f) || fs.statSync(f).size < 800) fel.push('Dålig mp3: ' + id + ' (' + m.slice(0, 30) + ')');
});

console.log('Uppgifter: ' + UPP.length + ' (nivå 1: ' + perNiva[1] + ', nivå 2: ' + perNiva[2] + ', nivå 3: ' + perNiva[3] + ')');
console.log('Meningar: ' + meningar.length + ', röstfiler: ' + Object.keys(ROST).length);
if (fel.length) { console.error('\n' + fel.length + ' FEL:'); fel.forEach(f => console.error(' - ' + f)); process.exit(1); }
console.log('0 fel');