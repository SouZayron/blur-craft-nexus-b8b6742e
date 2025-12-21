import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "pt" | "en" | "es" | "ar" | "de" | "nl" | "tl" | "tr" | "bs" | "fr" | "it" | "hu" | "pl" | "pt-pt" | "ro" | "sr" | "th";

interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
    ar: string;
    de: string;
    nl: string;
    tl: string;
    tr: string;
    bs: string;
    fr: string;
    it: string;
    hu: string;
    pl: string;
    "pt-pt": string;
    ro: string;
    sr: string;
    th: string;
  };
}

const translations: Translations = {
  // Header
  nicks: { 
    pt: "Nicks", en: "Nicks", es: "Nicks", ar: "الألقاب",
    de: "Nicks", nl: "Nicks", tl: "Nicks", tr: "Nicks", bs: "Nicks", fr: "Nicks", it: "Nicks", hu: "Nicks", pl: "Nicks", "pt-pt": "Nicks", ro: "Nicks", sr: "Nicks", th: "นิค"
  },
  cores: { 
    pt: "Cores", en: "Colors", es: "Colores", ar: "الألوان",
    de: "Farben", nl: "Kleuren", tl: "Mga Kulay", tr: "Renkler", bs: "Boje", fr: "Couleurs", it: "Colori", hu: "Színek", pl: "Kolory", "pt-pt": "Cores", ro: "Culori", sr: "Boje", th: "สี"
  },
  bingo: { 
    pt: "Bingo", en: "Bingo", es: "Bingo", ar: "بينغو",
    de: "Bingo", nl: "Bingo", tl: "Bingo", tr: "Bingo", bs: "Bingo", fr: "Bingo", it: "Bingo", hu: "Bingó", pl: "Bingo", "pt-pt": "Bingo", ro: "Bingo", sr: "Bingo", th: "บิงโก"
  },
  
  // Power Card
  ultimoPower: { 
    pt: "Ultimo Power", en: "Latest Power", es: "Último Power", ar: "آخر باور",
    de: "Neuestes Power", nl: "Laatste Power", tl: "Pinakabagong Power", tr: "Son Power", bs: "Najnoviji Power", fr: "Dernier Power", it: "Ultimo Power", hu: "Legújabb Power", pl: "Najnowszy Power", "pt-pt": "Último Power", ro: "Ultimul Power", sr: "Najnoviji Power", th: "พาวเวอร์ล่าสุด"
  },
  status: { 
    pt: "Status", en: "Status", es: "Estado", ar: "الحالة",
    de: "Status", nl: "Status", tl: "Katayuan", tr: "Durum", bs: "Status", fr: "Statut", it: "Stato", hu: "Állapot", pl: "Status", "pt-pt": "Estado", ro: "Stare", sr: "Status", th: "สถานะ"
  },
  group: { 
    pt: "Group", en: "Group", es: "Grupo", ar: "مجموعة",
    de: "Gruppe", nl: "Groep", tl: "Grupo", tr: "Grup", bs: "Grupa", fr: "Groupe", it: "Gruppo", hu: "Csoport", pl: "Grupa", "pt-pt": "Grupo", ro: "Grup", sr: "Grupa", th: "กลุ่ม"
  },
  epic: { 
    pt: "Epic", en: "Epic", es: "Épico", ar: "ملحمي",
    de: "Episch", nl: "Episch", tl: "Epiko", tr: "Epik", bs: "Epski", fr: "Épique", it: "Epico", hu: "Epikus", pl: "Epicki", "pt-pt": "Épico", ro: "Epic", sr: "Epski", th: "มหากาพย์"
  },
  storePrice: { 
    pt: "Store Price", en: "Store Price", es: "Precio Tienda", ar: "سعر المتجر",
    de: "Ladenpreis", nl: "Winkelprijs", tl: "Presyo sa Tindahan", tr: "Mağaza Fiyatı", bs: "Cijena u trgovini", fr: "Prix Boutique", it: "Prezzo Negozio", hu: "Bolti ár", pl: "Cena sklepowa", "pt-pt": "Preço Loja", ro: "Preț Magazin", sr: "Cena u prodavnici", th: "ราคาร้านค้า"
  },
  tradePrice: { 
    pt: "Trade Price", en: "Trade Price", es: "Precio Trade", ar: "سعر التداول",
    de: "Handelspreis", nl: "Handelsprijs", tl: "Presyo ng Trade", tr: "Trade Fiyatı", bs: "Cijena razmjene", fr: "Prix Trade", it: "Prezzo Trade", hu: "Csere ár", pl: "Cena wymiany", "pt-pt": "Preço Trade", ro: "Preț Schimb", sr: "Cena razmene", th: "ราคาแลกเปลี่ยน"
  },
  tradeDays: { 
    pt: "Trade Days", en: "Trade Days", es: "Días Trade", ar: "أيام التداول",
    de: "Handelstage", nl: "Handelsdagen", tl: "Mga Araw ng Trade", tr: "Trade Günleri", bs: "Dani razmjene", fr: "Jours Trade", it: "Giorni Trade", hu: "Csere napok", pl: "Dni wymiany", "pt-pt": "Dias Trade", ro: "Zile Schimb", sr: "Dani razmene", th: "วันแลกเปลี่ยน"
  },
  smiliesOfPower: { 
    pt: "Smilies of the power:", en: "Smilies of the power:", es: "Smilies del power:", ar: "سمايلات الباور:",
    de: "Smilies des Powers:", nl: "Smilies van de power:", tl: "Mga Smilies ng power:", tr: "Power'ın Smilies'i:", bs: "Smilies power-a:", fr: "Smilies du power:", it: "Smilies del power:", hu: "Power smilies:", pl: "Smilies powera:", "pt-pt": "Smilies do power:", ro: "Smilies ale power-ului:", sr: "Smilies power-a:", th: "สไมลี่ของพาวเวอร์:"
  },
  unlimited: { 
    pt: "Unlimited", en: "Unlimited", es: "Ilimitado", ar: "غير محدود",
    de: "Unbegrenzt", nl: "Onbeperkt", tl: "Walang limitasyon", tr: "Sınırsız", bs: "Neograničeno", fr: "Illimité", it: "Illimitato", hu: "Korlátlan", pl: "Nieograniczony", "pt-pt": "Ilimitado", ro: "Nelimitat", sr: "Neograničeno", th: "ไม่จำกัด"
  },
  unknown: { 
    pt: "Desconhecido", en: "Unknown", es: "Desconocido", ar: "غير معروف",
    de: "Unbekannt", nl: "Onbekend", tl: "Hindi alam", tr: "Bilinmeyen", bs: "Nepoznato", fr: "Inconnu", it: "Sconosciuto", hu: "Ismeretlen", pl: "Nieznany", "pt-pt": "Desconhecido", ro: "Necunoscut", sr: "Nepoznato", th: "ไม่ทราบ"
  },
  
  // Tools
  nickGenerator: { 
    pt: "Gerador de Nicks", en: "Nick Generator", es: "Generador de Nicks", ar: "مولد الألقاب",
    de: "Nick-Generator", nl: "Nick Generator", tl: "Nick Generator", tr: "Nick Oluşturucu", bs: "Generator nadimaka", fr: "Générateur de Nicks", it: "Generatore di Nick", hu: "Nick Generátor", pl: "Generator nicków", "pt-pt": "Gerador de Nicks", ro: "Generator de Nickuri", sr: "Generator nadimaka", th: "เครื่องสร้างนิค"
  },
  colorGenerator: { 
    pt: "Gerador de Cores", en: "Color Generator", es: "Generador de Colores", ar: "مولد الألوان",
    de: "Farbgenerator", nl: "Kleurengenerator", tl: "Generator ng Kulay", tr: "Renk Oluşturucu", bs: "Generator boja", fr: "Générateur de Couleurs", it: "Generatore di Colori", hu: "Szín Generátor", pl: "Generator kolorów", "pt-pt": "Gerador de Cores", ro: "Generator de Culori", sr: "Generator boja", th: "เครื่องสร้างสี"
  },
  bingoGame: { 
    pt: "Bingo", en: "Bingo", es: "Bingo", ar: "بينغو",
    de: "Bingo", nl: "Bingo", tl: "Bingo", tr: "Bingo", bs: "Bingo", fr: "Bingo", it: "Bingo", hu: "Bingó", pl: "Bingo", "pt-pt": "Bingo", ro: "Bingo", sr: "Bingo", th: "บิงโก"
  },
  
  // Footer
  copyright: { 
    pt: "Todos os direitos reservados.", en: "All rights reserved.", es: "Todos los derechos reservados.", ar: "جميع الحقوق محفوظة.",
    de: "Alle Rechte vorbehalten.", nl: "Alle rechten voorbehouden.", tl: "Nakalaan ang lahat ng karapatan.", tr: "Tüm hakları saklıdır.", bs: "Sva prava zadržana.", fr: "Tous droits réservés.", it: "Tutti i diritti riservati.", hu: "Minden jog fenntartva.", pl: "Wszelkie prawa zastrzeżone.", "pt-pt": "Todos os direitos reservados.", ro: "Toate drepturile rezervate.", sr: "Sva prava zadržana.", th: "สงวนลิขสิทธิ์"
  },
  
  // Color Generator Page
  colorTitle: { 
    pt: "Gerador de Cores", en: "Color Generator", es: "Generador de Colores", ar: "مولد الألوان",
    de: "Farbgenerator", nl: "Kleurengenerator", tl: "Generator ng Kulay", tr: "Renk Oluşturucu", bs: "Generator boja", fr: "Générateur de Couleurs", it: "Generatore di Colori", hu: "Szín Generátor", pl: "Generator kolorów", "pt-pt": "Gerador de Cores", ro: "Generator de Culori", sr: "Generator boja", th: "เครื่องสร้างสี"
  },
  colorSubtitle: { 
    pt: "Digite um tema e deixe que a gente cria as paletas de cores incríveis para você!", en: "Enter a theme and let us create amazing color palettes for you!", es: "¡Escribe un tema y deja que creemos paletas de colores increíbles para ti!", ar: "أدخل موضوعًا ودعنا ننشئ لوحات ألوان مذهلة لك!",
    de: "Geben Sie ein Thema ein und lassen Sie uns erstaunliche Farbpaletten für Sie erstellen!", nl: "Voer een thema in en laat ons geweldige kleurenpaletten voor u maken!", tl: "Maglagay ng tema at hayaan kaming gumawa ng kahanga-hangang color palettes para sa iyo!", tr: "Bir tema girin ve sizin için harika renk paletleri oluşturalım!", bs: "Unesite temu i pustite nas da kreiramo nevjerovatne palete boja za vas!", fr: "Entrez un thème et laissez-nous créer des palettes de couleurs incroyables pour vous!", it: "Inserisci un tema e lasciaci creare fantastiche palette di colori per te!", hu: "Adjon meg egy témát, és mi létrehozunk csodálatos színpalettákat Önnek!", pl: "Wpisz temat, a my stworzymy dla Ciebie niesamowite palety kolorów!", "pt-pt": "Digite um tema e deixe-nos criar paletas de cores incríveis para si!", ro: "Introduceți o temă și lăsați-ne să creăm palete de culori uimitoare pentru dvs.!", sr: "Unesite temu i pustite nas da kreiramo neverovatne palete boja za vas!", th: "ป้อนธีมและให้เราสร้างชุดสีที่น่าทึ่งสำหรับคุณ!"
  },
  colorPlaceholder: { 
    pt: "Digite um tema (ex: praia, fogo, floresta...)", en: "Enter a theme (e.g., beach, fire, forest...)", es: "Escribe un tema (ej: playa, fuego, bosque...)", ar: "أدخل موضوعًا (مثال: شاطئ، نار، غابة...)",
    de: "Geben Sie ein Thema ein (z.B. Strand, Feuer, Wald...)", nl: "Voer een thema in (bijv. strand, vuur, bos...)", tl: "Maglagay ng tema (hal. beach, apoy, kagubatan...)", tr: "Bir tema girin (örn. plaj, ateş, orman...)", bs: "Unesite temu (npr. plaža, vatra, šuma...)", fr: "Entrez un thème (ex: plage, feu, forêt...)", it: "Inserisci un tema (es. spiaggia, fuoco, foresta...)", hu: "Adjon meg egy témát (pl. strand, tűz, erdő...)", pl: "Wpisz temat (np. plaża, ogień, las...)", "pt-pt": "Digite um tema (ex: praia, fogo, floresta...)", ro: "Introduceți o temă (ex: plajă, foc, pădure...)", sr: "Unesite temu (npr. plaža, vatra, šuma...)", th: "ป้อนธีม (เช่น ชายหาด ไฟ ป่า...)"
  },
  generate: { 
    pt: "Gerar", en: "Generate", es: "Generar", ar: "إنشاء",
    de: "Generieren", nl: "Genereren", tl: "Lumikha", tr: "Oluştur", bs: "Generiši", fr: "Générer", it: "Genera", hu: "Generálás", pl: "Generuj", "pt-pt": "Gerar", ro: "Generează", sr: "Generiši", th: "สร้าง"
  },
  copied: { 
    pt: "Copiado!", en: "Copied!", es: "¡Copiado!", ar: "تم النسخ!",
    de: "Kopiert!", nl: "Gekopieerd!", tl: "Nakopya!", tr: "Kopyalandı!", bs: "Kopirano!", fr: "Copié!", it: "Copiato!", hu: "Másolva!", pl: "Skopiowano!", "pt-pt": "Copiado!", ro: "Copiat!", sr: "Kopirano!", th: "คัดลอกแล้ว!"
  },
  copyCode: { 
    pt: "Copiar código", en: "Copy code", es: "Copiar código", ar: "نسخ الكود",
    de: "Code kopieren", nl: "Code kopiëren", tl: "Kopyahin ang code", tr: "Kodu kopyala", bs: "Kopiraj kod", fr: "Copier le code", it: "Copia codice", hu: "Kód másolása", pl: "Kopiuj kod", "pt-pt": "Copiar código", ro: "Copiază codul", sr: "Kopiraj kod", th: "คัดลอกโค้ด"
  },
  enterTheme: { 
    pt: "Digite um tema", en: "Enter a theme", es: "Escribe un tema", ar: "أدخل موضوعًا",
    de: "Geben Sie ein Thema ein", nl: "Voer een thema in", tl: "Maglagay ng tema", tr: "Bir tema girin", bs: "Unesite temu", fr: "Entrez un thème", it: "Inserisci un tema", hu: "Adjon meg egy témát", pl: "Wpisz temat", "pt-pt": "Digite um tema", ro: "Introduceți o temă", sr: "Unesite temu", th: "ป้อนธีม"
  },
  enterThemeDesc: { 
    pt: "Por favor, insira um tema para gerar as paletas.", en: "Please enter a theme to generate palettes.", es: "Por favor, ingresa un tema para generar las paletas.", ar: "يرجى إدخال موضوع لإنشاء اللوحات.",
    de: "Bitte geben Sie ein Thema ein, um Paletten zu generieren.", nl: "Voer een thema in om paletten te genereren.", tl: "Mangyaring maglagay ng tema para makagawa ng palettes.", tr: "Paletler oluşturmak için lütfen bir tema girin.", bs: "Molimo unesite temu za generisanje paleta.", fr: "Veuillez entrer un thème pour générer des palettes.", it: "Inserisci un tema per generare le palette.", hu: "Kérjük, adjon meg egy témát a paletták generálásához.", pl: "Proszę wpisać temat, aby wygenerować palety.", "pt-pt": "Por favor, insira um tema para gerar as paletas.", ro: "Vă rugăm să introduceți o temă pentru a genera palete.", sr: "Molimo unesite temu za generisanje paleta.", th: "กรุณาป้อนธีมเพื่อสร้างชุดสี"
  },
  processingError: { 
    pt: "Erro ao processar", en: "Processing error", es: "Error al procesar", ar: "خطأ في المعالجة",
    de: "Verarbeitungsfehler", nl: "Verwerkingsfout", tl: "Error sa pagproseso", tr: "İşleme hatası", bs: "Greška pri obradi", fr: "Erreur de traitement", it: "Errore di elaborazione", hu: "Feldolgozási hiba", pl: "Błąd przetwarzania", "pt-pt": "Erro ao processar", ro: "Eroare de procesare", sr: "Greška pri obradi", th: "ข้อผิดพลาดในการประมวลผล"
  },
  processingErrorDesc: { 
    pt: "Não foi possível processar as paletas. Tente novamente.", en: "Could not process palettes. Try again.", es: "No se pudieron procesar las paletas. Inténtalo de nuevo.", ar: "تعذرت معالجة اللوحات. حاول مرة أخرى.",
    de: "Paletten konnten nicht verarbeitet werden. Versuchen Sie es erneut.", nl: "Kon paletten niet verwerken. Probeer opnieuw.", tl: "Hindi maproseso ang palettes. Subukan muli.", tr: "Paletler işlenemedi. Tekrar deneyin.", bs: "Nije moguće obraditi palete. Pokušajte ponovo.", fr: "Impossible de traiter les palettes. Réessayez.", it: "Impossibile elaborare le palette. Riprova.", hu: "Nem sikerült feldolgozni a palettákat. Próbálja újra.", pl: "Nie można przetworzyć palet. Spróbuj ponownie.", "pt-pt": "Não foi possível processar as paletas. Tente novamente.", ro: "Nu s-au putut procesa paletele. Încercați din nou.", sr: "Nije moguće obraditi palete. Pokušajte ponovo.", th: "ไม่สามารถประมวลผลชุดสีได้ ลองอีกครั้ง"
  },
  error: { 
    pt: "Erro", en: "Error", es: "Error", ar: "خطأ",
    de: "Fehler", nl: "Fout", tl: "Error", tr: "Hata", bs: "Greška", fr: "Erreur", it: "Errore", hu: "Hiba", pl: "Błąd", "pt-pt": "Erro", ro: "Eroare", sr: "Greška", th: "ข้อผิดพลาด"
  },
  errorGenerating: { 
    pt: "Erro ao gerar paletas. Tente novamente.", en: "Error generating palettes. Try again.", es: "Error al generar paletas. Inténtalo de nuevo.", ar: "خطأ في إنشاء اللوحات. حاول مرة أخرى.",
    de: "Fehler beim Generieren von Paletten. Versuchen Sie es erneut.", nl: "Fout bij het genereren van paletten. Probeer opnieuw.", tl: "Error sa paggawa ng palettes. Subukan muli.", tr: "Palet oluşturma hatası. Tekrar deneyin.", bs: "Greška pri generisanju paleta. Pokušajte ponovo.", fr: "Erreur lors de la génération des palettes. Réessayez.", it: "Errore nella generazione delle palette. Riprova.", hu: "Hiba a paletták generálásakor. Próbálja újra.", pl: "Błąd generowania palet. Spróbuj ponownie.", "pt-pt": "Erro ao gerar paletas. Tente novamente.", ro: "Eroare la generarea paletelor. Încercați din nou.", sr: "Greška pri generisanju paleta. Pokušajte ponovo.", th: "ข้อผิดพลาดในการสร้างชุดสี ลองอีกครั้ง"
  },
  emptyStateColors: { 
    pt: "Necessários os powers Namecolor + Namegrad/Namewave para funcionar.", en: "Requires Namecolor + Namegrad/Namewave powers to work.", es: "Requiere los powers Namecolor + Namegrad/Namewave para funcionar.", ar: "مطلوب باورات Namecolor + Namegrad/Namewave للعمل.",
    de: "Erfordert Namecolor + Namegrad/Namewave Powers zum Funktionieren.", nl: "Vereist Namecolor + Namegrad/Namewave powers om te werken.", tl: "Kailangan ang Namecolor + Namegrad/Namewave powers para gumana.", tr: "Çalışması için Namecolor + Namegrad/Namewave powers gereklidir.", bs: "Potrebni su Namecolor + Namegrad/Namewave powers za rad.", fr: "Nécessite les powers Namecolor + Namegrad/Namewave pour fonctionner.", it: "Richiede i powers Namecolor + Namegrad/Namewave per funzionare.", hu: "Namecolor + Namegrad/Namewave powers szükséges a működéshez.", pl: "Wymaga powers Namecolor + Namegrad/Namewave do działania.", "pt-pt": "Necessários os powers Namecolor + Namegrad/Namewave para funcionar.", ro: "Necesită powers Namecolor + Namegrad/Namewave pentru a funcționa.", sr: "Potrebni su Namecolor + Namegrad/Namewave powers za rad.", th: "ต้องใช้พาวเวอร์ Namecolor + Namegrad/Namewave เพื่อให้ทำงานได้"
  },
  
  // Nick Generator Page
  nickTitle: { 
    pt: "Gerador de Nicks", en: "Nick Generator", es: "Generador de Nicks", ar: "مولد الألقاب",
    de: "Nick-Generator", nl: "Nick Generator", tl: "Nick Generator", tr: "Nick Oluşturucu", bs: "Generator nadimaka", fr: "Générateur de Nicks", it: "Generatore di Nick", hu: "Nick Generátor", pl: "Generator nicków", "pt-pt": "Gerador de Nicks", ro: "Generator de Nickuri", sr: "Generator nadimaka", th: "เครื่องสร้างนิค"
  },
  nickSubtitle: { 
    pt: "Transforme seu nome em 139 estilos únicos", en: "Transform your name into 139 unique styles", es: "Transforma tu nombre en 139 estilos únicos", ar: "حوّل اسمك إلى 139 نمطًا فريدًا",
    de: "Verwandeln Sie Ihren Namen in 139 einzigartige Stile", nl: "Verander je naam in 139 unieke stijlen", tl: "Baguhin ang iyong pangalan sa 139 natatanging istilo", tr: "Adınızı 139 benzersiz stile dönüştürün", bs: "Transformišite svoje ime u 139 jedinstvenih stilova", fr: "Transformez votre nom en 139 styles uniques", it: "Trasforma il tuo nome in 139 stili unici", hu: "Alakítsa át nevét 139 egyedi stílusra", pl: "Przekształć swoje imię w 139 unikalnych stylów", "pt-pt": "Transforme o seu nome em 139 estilos únicos", ro: "Transformă-ți numele în 139 de stiluri unice", sr: "Transformišite svoje ime u 139 jedinstvenih stilova", th: "เปลี่ยนชื่อของคุณเป็น 139 สไตล์ที่ไม่ซ้ำใคร"
  },
  nickPlaceholder: { 
    pt: "Digite seu nome ou apelido...", en: "Enter your name or nickname...", es: "Escribe tu nombre o apodo...", ar: "أدخل اسمك أو لقبك...",
    de: "Geben Sie Ihren Namen oder Spitznamen ein...", nl: "Voer uw naam of bijnaam in...", tl: "Ilagay ang iyong pangalan o palayaw...", tr: "Adınızı veya takma adınızı girin...", bs: "Unesite svoje ime ili nadimak...", fr: "Entrez votre nom ou surnom...", it: "Inserisci il tuo nome o soprannome...", hu: "Adja meg nevét vagy becenevét...", pl: "Wpisz swoje imię lub pseudonim...", "pt-pt": "Digite o seu nome ou alcunha...", ro: "Introduceți numele sau porecla dvs....", sr: "Unesite svoje ime ili nadimak...", th: "ป้อนชื่อหรือชื่อเล่นของคุณ..."
  },
  filterStyles: { 
    pt: "Filtrar estilos...", en: "Filter styles...", es: "Filtrar estilos...", ar: "تصفية الأنماط...",
    de: "Stile filtern...", nl: "Stijlen filteren...", tl: "I-filter ang mga istilo...", tr: "Stilleri filtrele...", bs: "Filtriraj stilove...", fr: "Filtrer les styles...", it: "Filtra stili...", hu: "Stílusok szűrése...", pl: "Filtruj style...", "pt-pt": "Filtrar estilos...", ro: "Filtrează stiluri...", sr: "Filtriraj stilove...", th: "กรองสไตล์..."
  },
  showingOf: { 
    pt: "Mostrando", en: "Showing", es: "Mostrando", ar: "عرض",
    de: "Zeige", nl: "Tonen", tl: "Ipinapakita", tr: "Gösteriliyor", bs: "Prikazuje se", fr: "Affichage", it: "Visualizzazione", hu: "Megjelenítés", pl: "Wyświetlanie", "pt-pt": "A mostrar", ro: "Se afișează", sr: "Prikazuje se", th: "แสดง"
  },
  of: { 
    pt: "de", en: "of", es: "de", ar: "من",
    de: "von", nl: "van", tl: "ng", tr: "of", bs: "od", fr: "de", it: "di", hu: "ból", pl: "z", "pt-pt": "de", ro: "din", sr: "od", th: "จาก"
  },
  styles: { 
    pt: "estilos", en: "styles", es: "estilos", ar: "أنماط",
    de: "Stile", nl: "stijlen", tl: "mga istilo", tr: "stil", bs: "stilova", fr: "styles", it: "stili", hu: "stílus", pl: "stylów", "pt-pt": "estilos", ro: "stiluri", sr: "stilova", th: "สไตล์"
  },
  nickCopied: { 
    pt: "Nick copiado!", en: "Nick copied!", es: "¡Nick copiado!", ar: "تم نسخ اللقب!",
    de: "Nick kopiert!", nl: "Nick gekopieerd!", tl: "Nakopya ang nick!", tr: "Nick kopyalandı!", bs: "Nadimak kopiran!", fr: "Nick copié!", it: "Nick copiato!", hu: "Nick másolva!", pl: "Nick skopiowany!", "pt-pt": "Nick copiado!", ro: "Nick copiat!", sr: "Nadimak kopiran!", th: "คัดลอกนิคแล้ว!"
  },
  copyError: { 
    pt: "Erro ao copiar", en: "Copy error", es: "Error al copiar", ar: "خطأ في النسخ",
    de: "Kopierfehler", nl: "Kopieerfout", tl: "Error sa pagkopya", tr: "Kopyalama hatası", bs: "Greška pri kopiranju", fr: "Erreur de copie", it: "Errore di copia", hu: "Másolási hiba", pl: "Błąd kopiowania", "pt-pt": "Erro ao copiar", ro: "Eroare la copiere", sr: "Greška pri kopiranju", th: "ข้อผิดพลาดในการคัดลอก"
  },
  enterName: { 
    pt: "Digite um nome para gerar os nicks!", en: "Enter a name to generate nicks!", es: "¡Escribe un nombre para generar los nicks!", ar: "أدخل اسمًا لإنشاء الألقاب!",
    de: "Geben Sie einen Namen ein, um Nicks zu generieren!", nl: "Voer een naam in om nicks te genereren!", tl: "Maglagay ng pangalan para makagawa ng nicks!", tr: "Nick oluşturmak için bir isim girin!", bs: "Unesite ime za generisanje nadimaka!", fr: "Entrez un nom pour générer des nicks!", it: "Inserisci un nome per generare nick!", hu: "Adjon meg egy nevet a nickek generálásához!", pl: "Wpisz imię, aby wygenerować nicki!", "pt-pt": "Digite um nome para gerar os nicks!", ro: "Introduceți un nume pentru a genera nickuri!", sr: "Unesite ime za generisanje nadimaka!", th: "ป้อนชื่อเพื่อสร้างนิค!"
  },
  nicksGenerated: { 
    pt: "nicks gerados com sucesso!", en: "nicks generated successfully!", es: "¡nicks generados con éxito!", ar: "تم إنشاء الألقاب بنجاح!",
    de: "Nicks erfolgreich generiert!", nl: "nicks succesvol gegenereerd!", tl: "matagumpay na nagawa ang mga nicks!", tr: "nickler başarıyla oluşturuldu!", bs: "nadimci uspješno generirani!", fr: "nicks générés avec succès!", it: "nick generati con successo!", hu: "nickek sikeresen generálva!", pl: "nicki wygenerowane pomyślnie!", "pt-pt": "nicks gerados com sucesso!", ro: "nickuri generate cu succes!", sr: "nadimci uspešno generisani!", th: "สร้างนิคสำเร็จ!"
  },
  emptyStateNicks: { 
    pt: "Digite um nome e clique em Gerar para ver a mágica acontecer!", en: "Enter a name and click Generate to see the magic happen!", es: "¡Escribe un nombre y haz clic en Generar para ver la magia!", ar: "أدخل اسمًا وانقر على إنشاء لترى السحر!",
    de: "Geben Sie einen Namen ein und klicken Sie auf Generieren, um die Magie zu sehen!", nl: "Voer een naam in en klik op Genereren om de magie te zien!", tl: "Maglagay ng pangalan at i-click ang Lumikha para makita ang magic!", tr: "Bir isim girin ve sihri görmek için Oluştur'a tıklayın!", bs: "Unesite ime i kliknite Generiši da vidite magiju!", fr: "Entrez un nom et cliquez sur Générer pour voir la magie!", it: "Inserisci un nome e clicca su Genera per vedere la magia!", hu: "Adjon meg egy nevet és kattintson a Generálás gombra a varázslatért!", pl: "Wpisz imię i kliknij Generuj, aby zobaczyć magię!", "pt-pt": "Digite um nome e clique em Gerar para ver a magia acontecer!", ro: "Introduceți un nume și faceți clic pe Generează pentru a vedea magia!", sr: "Unesite ime i kliknite Generiši da vidite magiju!", th: "ป้อนชื่อแล้วคลิกสร้างเพื่อดูความมหัศจรรย์!"
  },
  
  // Bingo Page
  bingoTitle: { 
    pt: "Bingo 1-90", en: "Bingo 1-90", es: "Bingo 1-90", ar: "بينغو 1-90",
    de: "Bingo 1-90", nl: "Bingo 1-90", tl: "Bingo 1-90", tr: "Bingo 1-90", bs: "Bingo 1-90", fr: "Bingo 1-90", it: "Bingo 1-90", hu: "Bingó 1-90", pl: "Bingo 1-90", "pt-pt": "Bingo 1-90", ro: "Bingo 1-90", sr: "Bingo 1-90", th: "บิงโก 1-90"
  },
  back: { 
    pt: "Voltar", en: "Back", es: "Volver", ar: "رجوع",
    de: "Zurück", nl: "Terug", tl: "Bumalik", tr: "Geri", bs: "Nazad", fr: "Retour", it: "Indietro", hu: "Vissza", pl: "Wstecz", "pt-pt": "Voltar", ro: "Înapoi", sr: "Nazad", th: "กลับ"
  },
  verificationPanel: { 
    pt: "Painel de Conferência", en: "Verification Panel", es: "Panel de Verificación", ar: "لوحة التحقق",
    de: "Überprüfungspanel", nl: "Verificatiepaneel", tl: "Panel ng Pagpapatunay", tr: "Doğrulama Paneli", bs: "Panel za verifikaciju", fr: "Panneau de Vérification", it: "Pannello di Verifica", hu: "Ellenőrzési Panel", pl: "Panel weryfikacji", "pt-pt": "Painel de Conferência", ro: "Panou de Verificare", sr: "Panel za verifikaciju", th: "แผงตรวจสอบ"
  },
  takeScreenshot: { 
    pt: "Tirar Print", en: "Take Screenshot", es: "Tomar Captura", ar: "أخذ لقطة",
    de: "Screenshot machen", nl: "Screenshot maken", tl: "Kumuha ng Screenshot", tr: "Ekran Görüntüsü Al", bs: "Napravi snimak ekrana", fr: "Prendre une Capture", it: "Fai Screenshot", hu: "Képernyőkép készítése", pl: "Zrób zrzut ekranu", "pt-pt": "Tirar Captura", ro: "Fă Captură", sr: "Napravi snimak ekrana", th: "ถ่ายภาพหน้าจอ"
  },
  sending: { 
    pt: "Enviando...", en: "Sending...", es: "Enviando...", ar: "جاري الإرسال...",
    de: "Senden...", nl: "Verzenden...", tl: "Nagpapadala...", tr: "Gönderiliyor...", bs: "Slanje...", fr: "Envoi...", it: "Invio...", hu: "Küldés...", pl: "Wysyłanie...", "pt-pt": "A enviar...", ro: "Se trimite...", sr: "Slanje...", th: "กำลังส่ง..."
  },
  imageLink: { 
    pt: "Link da imagem:", en: "Image link:", es: "Enlace de la imagen:", ar: "رابط الصورة:",
    de: "Bildlink:", nl: "Afbeeldingslink:", tl: "Link ng larawan:", tr: "Resim linki:", bs: "Link slike:", fr: "Lien de l'image:", it: "Link immagine:", hu: "Kép link:", pl: "Link do obrazu:", "pt-pt": "Link da imagem:", ro: "Link imagine:", sr: "Link slike:", th: "ลิงก์รูปภาพ:"
  },
  linkCopied: { 
    pt: "Link copiado!", en: "Link copied!", es: "¡Enlace copiado!", ar: "تم نسخ الرابط!",
    de: "Link kopiert!", nl: "Link gekopieerd!", tl: "Nakopya ang link!", tr: "Link kopyalandı!", bs: "Link kopiran!", fr: "Lien copié!", it: "Link copiato!", hu: "Link másolva!", pl: "Link skopiowany!", "pt-pt": "Link copiado!", ro: "Link copiat!", sr: "Link kopiran!", th: "คัดลอกลิงก์แล้ว!"
  },
  printGenerated: { 
    pt: "Print gerado!", en: "Screenshot generated!", es: "¡Captura generada!", ar: "تم إنشاء اللقطة!",
    de: "Screenshot generiert!", nl: "Screenshot gegenereerd!", tl: "Nagawa ang screenshot!", tr: "Ekran görüntüsü oluşturuldu!", bs: "Snimak ekrana generisan!", fr: "Capture générée!", it: "Screenshot generato!", hu: "Képernyőkép elkészült!", pl: "Zrzut ekranu wygenerowany!", "pt-pt": "Captura gerada!", ro: "Captură generată!", sr: "Snimak ekrana generisan!", th: "สร้างภาพหน้าจอแล้ว!"
  },
  printGeneratedDesc: { 
    pt: "Link da imagem disponível abaixo.", en: "Image link available below.", es: "Enlace de imagen disponible abajo.", ar: "رابط الصورة متاح أدناه.",
    de: "Bildlink unten verfügbar.", nl: "Afbeeldingslink hieronder beschikbaar.", tl: "Available ang link ng larawan sa ibaba.", tr: "Resim linki aşağıda mevcut.", bs: "Link slike dostupan ispod.", fr: "Lien de l'image disponible ci-dessous.", it: "Link immagine disponibile sotto.", hu: "Kép link alább elérhető.", pl: "Link do obrazu dostępny poniżej.", "pt-pt": "Link da imagem disponível abaixo.", ro: "Link imagine disponibil mai jos.", sr: "Link slike dostupan ispod.", th: "ลิงก์รูปภาพด้านล่าง"
  },
  printError: { 
    pt: "Falha ao gerar o print", en: "Failed to generate screenshot", es: "Error al generar la captura", ar: "فشل في إنشاء اللقطة",
    de: "Screenshot konnte nicht generiert werden", nl: "Screenshot genereren mislukt", tl: "Nabigo sa paggawa ng screenshot", tr: "Ekran görüntüsü oluşturulamadı", bs: "Nije uspjelo generisanje snimka ekrana", fr: "Échec de la génération de la capture", it: "Impossibile generare lo screenshot", hu: "Nem sikerült a képernyőkép létrehozása", pl: "Nie udało się wygenerować zrzutu ekranu", "pt-pt": "Falha ao gerar a captura", ro: "Eroare la generarea capturii", sr: "Nije uspelo generisanje snimka ekrana", th: "ไม่สามารถสร้างภาพหน้าจอได้"
  },
  last10Balls: { 
    pt: "Últimas 10 Bolas", en: "Last 10 Balls", es: "Últimas 10 Bolas", ar: "آخر 10 كرات",
    de: "Letzte 10 Kugeln", nl: "Laatste 10 Ballen", tl: "Huling 10 Bola", tr: "Son 10 Top", bs: "Zadnjih 10 kuglica", fr: "10 Dernières Boules", it: "Ultime 10 Palline", hu: "Utolsó 10 Golyó", pl: "Ostatnie 10 Kul", "pt-pt": "Últimas 10 Bolas", ro: "Ultimele 10 Bile", sr: "Poslednjih 10 kuglica", th: "10 ลูกบอลล่าสุด"
  },
  play: { 
    pt: "PLAY", en: "PLAY", es: "PLAY", ar: "تشغيل",
    de: "PLAY", nl: "PLAY", tl: "PLAY", tr: "OYNAT", bs: "PLAY", fr: "JOUER", it: "GIOCA", hu: "JÁTÉK", pl: "GRAJ", "pt-pt": "PLAY", ro: "PLAY", sr: "PLAY", th: "เล่น"
  },
  pause: { 
    pt: "PAUSA", en: "PAUSE", es: "PAUSA", ar: "إيقاف",
    de: "PAUSE", nl: "PAUZE", tl: "PAUSE", tr: "DURAKLAT", bs: "PAUZA", fr: "PAUSE", it: "PAUSA", hu: "SZÜNET", pl: "PAUZA", "pt-pt": "PAUSA", ro: "PAUZĂ", sr: "PAUZA", th: "หยุดชั่วคราว"
  },
  remaining: { 
    pt: "Restam", en: "Remaining", es: "Quedan", ar: "متبقي",
    de: "Verbleibend", nl: "Resterend", tl: "Natitirang", tr: "Kalan", bs: "Preostalo", fr: "Restant", it: "Rimanenti", hu: "Maradt", pl: "Pozostało", "pt-pt": "Restam", ro: "Rămase", sr: "Preostalo", th: "เหลือ"
  },
  balls: { 
    pt: "bolas", en: "balls", es: "bolas", ar: "كرات",
    de: "Kugeln", nl: "ballen", tl: "bola", tr: "top", bs: "kuglica", fr: "boules", it: "palline", hu: "golyó", pl: "kul", "pt-pt": "bolas", ro: "bile", sr: "kuglica", th: "ลูกบอล"
  },
  drawn: { 
    pt: "Sorteadas", en: "Drawn", es: "Sorteadas", ar: "مسحوبة",
    de: "Gezogen", nl: "Getrokken", tl: "Nahugot", tr: "Çekilen", bs: "Izvučeno", fr: "Tirées", it: "Estratte", hu: "Húzott", pl: "Wylosowane", "pt-pt": "Sorteadas", ro: "Extrase", sr: "Izvučeno", th: "จับแล้ว"
  },
  
  // Graphics FREE
  graphicsFree: { 
    pt: "Graphics FREE", en: "Graphics FREE", es: "Graphics FREE", ar: "جرافيكس مجاني",
    de: "Graphics FREE", nl: "Graphics FREE", tl: "Graphics FREE", tr: "Graphics FREE", bs: "Graphics FREE", fr: "Graphics FREE", it: "Graphics FREE", hu: "Graphics FREE", pl: "Graphics FREE", "pt-pt": "Graphics FREE", ro: "Graphics FREE", sr: "Graphics FREE", th: "กราฟิกฟรี"
  },
  graphicsFreeDesc: { 
    pt: "Packs gratuitos para baixar", en: "Free packs to download", es: "Packs gratuitos para descargar", ar: "حزم مجانية للتحميل",
    de: "Kostenlose Packs zum Download", nl: "Gratis packs om te downloaden", tl: "Libreng packs para i-download", tr: "İndirilecek ücretsiz paketler", bs: "Besplatni paketi za preuzimanje", fr: "Packs gratuits à télécharger", it: "Pack gratuiti da scaricare", hu: "Ingyenes csomagok letöltésre", pl: "Darmowe paczki do pobrania", "pt-pt": "Packs gratuitos para descarregar", ro: "Pachete gratuite de descărcat", sr: "Besplatni paketi za preuzimanje", th: "แพ็คฟรีสำหรับดาวน์โหลด"
  },
  images: { 
    pt: "imagens", en: "images", es: "imágenes", ar: "صور",
    de: "Bilder", nl: "afbeeldingen", tl: "mga larawan", tr: "resim", bs: "slika", fr: "images", it: "immagini", hu: "kép", pl: "obrazów", "pt-pt": "imagens", ro: "imagini", sr: "slika", th: "รูปภาพ"
  },
  copyLink: { 
    pt: "Copiar", en: "Copy", es: "Copiar", ar: "نسخ",
    de: "Kopieren", nl: "Kopiëren", tl: "Kopyahin", tr: "Kopyala", bs: "Kopiraj", fr: "Copier", it: "Copia", hu: "Másolás", pl: "Kopiuj", "pt-pt": "Copiar", ro: "Copiază", sr: "Kopiraj", th: "คัดลอก"
  },
  comingSoon: { 
    pt: "Em breve", en: "Coming soon", es: "Próximamente", ar: "قريبًا",
    de: "Demnächst", nl: "Binnenkort", tl: "Malapit na", tr: "Yakında", bs: "Uskoro", fr: "Bientôt", it: "Prossimamente", hu: "Hamarosan", pl: "Wkrótce", "pt-pt": "Em breve", ro: "În curând", sr: "Uskoro", th: "เร็วๆ นี้"
  },
  copyLinkError: { 
    pt: "Erro ao copiar link", en: "Error copying link", es: "Error al copiar enlace", ar: "خطأ في نسخ الرابط",
    de: "Fehler beim Kopieren des Links", nl: "Fout bij kopiëren van link", tl: "Error sa pagkopya ng link", tr: "Link kopyalama hatası", bs: "Greška pri kopiranju linka", fr: "Erreur lors de la copie du lien", it: "Errore nella copia del link", hu: "Hiba a link másolásakor", pl: "Błąd kopiowania linku", "pt-pt": "Erro ao copiar link", ro: "Eroare la copierea linkului", sr: "Greška pri kopiranju linka", th: "ข้อผิดพลาดในการคัดลอกลิงก์"
  },
  newYearBackgrounds: { 
    pt: "10 fundos de Ano Novo para o seu xat", en: "10 New Year backgrounds for your xat", es: "10 fondos de Año Nuevo para tu xat", ar: "10 خلفيات رأس السنة لـ xat الخاص بك",
    de: "10 Neujahrs-Hintergründe für dein xat", nl: "10 Nieuwjaars achtergronden voor je xat", tl: "10 New Year backgrounds para sa iyong xat", tr: "xat'ınız için 10 Yeni Yıl arka planı", bs: "10 novogodišnjih pozadina za tvoj xat", fr: "10 fonds d'écran Nouvel An pour ton xat", it: "10 sfondi di Capodanno per il tuo xat", hu: "10 újévi háttér a xat-odhoz", pl: "10 noworocznych teł dla twojego xat", "pt-pt": "10 fundos de Ano Novo para o seu xat", ro: "10 fundaluri de Anul Nou pentru xat-ul tău", sr: "10 novogodišnjih pozadina za tvoj xat", th: "10 พื้นหลังปีใหม่สำหรับ xat ของคุณ"
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("pt");

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? "rtl" : "ltr"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
