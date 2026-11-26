/* Konstruktionslabbet – uppgifterna. Alla meningar är hela strängar så att
   gen_ljud.py kan göra en mp3-fil per mening. Fakta: Lgr22, Teknik åk 7–9,
   TK.7-9.2.3 (hållfasta och stabila konstruktioner, materialens egenskaper). */
(function (root) {
  var UPPGIFTER = [
    /* ---------- Nivå 1: stadiga ramar ---------- */
    {
      id: 1, niva: 1, scen: 'ram', typ: 'ram',
      fraga: 'Vikten ska ligga på ramen. Vilken ram håller sig rak?',
      alternativ: [
        { text: 'Fyrkant', ikon: 'fyrkant' },
        { text: 'Fyrkant med snedstag', ikon: 'snedstag' }
      ],
      ratt: 1,
      forklaring: 'En fyrkant kan vika sig till en romb. Ett snedstag delar den i två trianglar, och en triangel kan inte ändra form utan att en sida ändras. Därför blir ramen styv.'
    },
    {
      id: 2, niva: 1, scen: 'konsol', typ: 'ram',
      fraga: 'Hylla ska bära en tung bok. Vilken konsol håller?',
      alternativ: [
        { text: 'Rak vinkel', ikon: 'vinkel' },
        { text: 'Konsol med snedstag', ikon: 'konsol' }
      ],
      ratt: 1,
      forklaring: 'En rak vinkelkonsol böjs ner av bokens tyngd. Snedstaget bildar en triangel som tar upp kraften och för den ner i väggen.'
    },
    {
      id: 3, niva: 1, scen: 'bro', typ: 'ram',
      fraga: 'Bron ska bära last. Vilken ram blir styvast?',
      alternativ: [
        { text: 'Utan stag', ikon: 'fyrkant' },
        { text: 'Med kryss', ikon: 'kryss' }
      ],
      ratt: 1,
      forklaring: 'Krysset delar ramen i fyra trianglar. Då kan ramen inte vrida sig när lasten kommer på.'
    },

    /* ---------- Nivå 2: drag och tryck ---------- */
    {
      id: 4, niva: 2, scen: 'skylt', typ: 'kraft',
      fraga: 'Skylten hänger i en vajer. Vilken del utsätts för dragkraft?',
      alternativ: [
        { text: 'Vajern', ikon: 'vajer' },
        { text: 'Armen', ikon: 'balk' }
      ],
      ratt: 0,
      forklaring: 'Vajern håller emot skyltens tyngd och sträcks ut – det är dragkraft. Armen ovanför pressas ihop och får tryckkraft.'
    },
    {
      id: 5, niva: 2, scen: 'pelare', typ: 'kraft',
      fraga: 'Pelaren bär bron. Vilken del får tryckkraft?',
      alternativ: [
        { text: 'Pelaren', ikon: 'pelare' },
        { text: 'Vajern', ikon: 'vajer' }
      ],
      ratt: 0,
      forklaring: 'Pelaren bär lasten ovanifrån och pressas ihop – tryckkraft. Vajern som håller bron uppe är sträckt och får dragkraft.'
    },
    {
      id: 6, niva: 2, scen: 'fackverk', typ: 'kraft',
      fraga: 'I fackverksbron: vilken del pressas ihop när lasten kommer på?',
      alternativ: [
        { text: 'Överkanten', ikon: 'balk' },
        { text: 'Underkanten', ikon: 'balk' }
      ],
      ratt: 0,
      forklaring: 'När bron böjs ner pressas överkanten ihop (tryckkraft) medan underkanten sträcks (dragkraft). Därför är de byggda för olika krafter.'
    },

    /* ---------- Nivå 3: material ---------- */
    {
      id: 7, niva: 3, scen: 'container', typ: 'material',
      fraga: 'Containern ska hissas. Vad ska linan vara gjord av?',
      alternativ: [
        { text: 'Gummisnodd', ikon: 'gummi' },
        { text: 'Stålvajer', ikon: 'stal' },
        { text: 'Glas', ikon: 'glas' }
      ],
      ratt: 1,
      forklaring: 'Stålvajer tål stor dragkraft utan att töjas. Gummisnodden töjs och går till slut av, och glas är sprött och spricker.'
    },
    {
      id: 8, niva: 3, scen: 'lucka', typ: 'material',
      fraga: 'Luckan ska kunna böjas och täta. Vilket material passar?',
      alternativ: [
        { text: 'Gummi', ikon: 'gummi' },
        { text: 'Stål', ikon: 'stal' },
        { text: 'Glas', ikon: 'glas' }
      ],
      ratt: 0,
      forklaring: 'Gummi är elastiskt: det böjs och fjädrar tillbaka och sluter tätt. Stål är styvt och glas är sprött – båda spricker eller står emot i stället för att fjädra.'
    },
    {
      id: 9, niva: 3, scen: 'fjader', typ: 'material',
      fraga: 'Fjädern ska tryckas ihop och fjädra tillbaka många gånger. Vilket material?',
      alternativ: [
        { text: 'Fjäderstål', ikon: 'stal' },
        { text: 'Lera', ikon: 'lera' },
        { text: 'Glas', ikon: 'glas' }
      ],
      ratt: 0,
      forklaring: 'Fjäderstål är elastiskt inom sin gräns och går tillbaka till samma form varje gång. Lera formas om och stannar böjd, och glas spricker.'
    }
  ];

  var NIVANAMN = {
    1: 'Nivå 1: stadiga ramar',
    2: 'Nivå 2: drag och tryck',
    3: 'Nivå 3: rätt material'
  };

  function meningar() {
    var ut = ['Konstruktionslabbet. Bygg stadigt – välj den ram och det material som håller.'];
    [1, 2, 3].forEach(function (n) {
      ut.push(NIVANAMN[n] + '.');
    });
    UPPGIFTER.forEach(function (u) {
      ut.push(u.fraga);
      ut.push('Rätt! ' + u.forklaring);
      ut.push('Nästan. ' + u.forklaring);
    });
    ut.push('Alla nio uppgifter klara! Nu vet du varför trianglar håller och vilka material som tål vad.');
    return Array.from(new Set(ut));
  }
  var CITAT = 'Tekniska lösningar för hållfasta och stabila konstruktioner samt betydelsen av materialens egenskaper, till exempel drag- och tryckhållfasthet, hårdhet och elasticitet.';

  var DATA = { uppgifter: UPPGIFTER, nivaNamn: NIVANAMN, meningar: meningar, citat: CITAT, punkt: 'TK.7-9.2.3' };
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  else root.KDATA = DATA;
})(typeof window !== 'undefined' ? window : this);