import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "pt" | "en" | "es" | "ar" | "de" | "nl" | "tl" | "tr" | "bs" | "fr" | "it" | "hu" | "pl" | "pt-pt" | "ro" | "sr" | "th";

const SUPPORTED_LANGUAGES: Language[] = ["pt", "en", "es", "ar", "de", "nl", "tl", "tr", "bs", "fr", "it", "hu", "pl", "pt-pt", "ro", "sr", "th"];
const STORAGE_KEY = "labxat:lang";

// All locales except `pt` and `en` are optional. Missing values fall back to en → pt → key.
interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es?: string;
    ar?: string;
    de?: string;
    nl?: string;
    tl?: string;
    tr?: string;
    bs?: string;
    fr?: string;
    it?: string;
    hu?: string;
    pl?: string;
    "pt-pt"?: string;
    ro?: string;
    sr?: string;
    th?: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { 
    pt: "Início", en: "Home", es: "Inicio", ar: "الرئيسية",
    de: "Startseite", nl: "Home", tl: "Home", tr: "Ana Sayfa", bs: "Početna", fr: "Accueil", it: "Home", hu: "Kezdőlap", pl: "Strona główna", "pt-pt": "Início", ro: "Acasă", sr: "Početna", th: "หน้าแรก"
  },
  about: { 
    pt: "Sobre", en: "About", es: "Acerca de", ar: "حول",
    de: "Über uns", nl: "Over ons", tl: "Tungkol", tr: "Hakkında", bs: "O nama", fr: "À propos", it: "Chi siamo", hu: "Rólunk", pl: "O nas", "pt-pt": "Sobre", ro: "Despre", sr: "O nama", th: "เกี่ยวกับ"
  },
  privacyPolicy: { 
    pt: "Privacidade", en: "Privacy", es: "Privacidad", ar: "الخصوصية",
    de: "Datenschutz", nl: "Privacy", tl: "Privacy", tr: "Gizlilik", bs: "Privatnost", fr: "Confidentialité", it: "Privacy", hu: "Adatvédelem", pl: "Prywatność", "pt-pt": "Privacidade", ro: "Confidențialitate", sr: "Privatnost", th: "ความเป็นส่วนตัว"
  },
  
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
  
  // About Page
  aboutTitle: { 
    pt: "Sobre o Labxat", en: "About Labxat", es: "Acerca de Labxat", ar: "حول Labxat",
    de: "Über Labxat", nl: "Over Labxat", tl: "Tungkol sa Labxat", tr: "Labxat Hakkında", bs: "O Labxat-u", fr: "À propos de Labxat", it: "Chi è Labxat", hu: "A Labxat-ról", pl: "O Labxat", "pt-pt": "Sobre o Labxat", ro: "Despre Labxat", sr: "O Labxat-u", th: "เกี่ยวกับ Labxat"
  },
  aboutIntro: { 
    pt: "O Labxat é um portal independente criado para reunir notícias, novidades, utilidades e ferramentas voltadas à comunidade do xat.com.", 
    en: "Labxat is an independent portal created to gather news, updates, utilities and tools aimed at the xat.com community.", 
    es: "Labxat es un portal independiente creado para reunir noticias, novedades, utilidades y herramientas dirigidas a la comunidad de xat.com.", 
    ar: "Labxat هو بوابة مستقلة تم إنشاؤها لجمع الأخبار والتحديثات والأدوات المساعدة الموجهة لمجتمع xat.com.",
    de: "Labxat ist ein unabhängiges Portal, das erstellt wurde, um Nachrichten, Updates, Dienstprogramme und Tools für die xat.com-Community zu sammeln.", 
    nl: "Labxat is een onafhankelijk portaal gemaakt om nieuws, updates, hulpprogramma's en tools voor de xat.com-community te verzamelen.", 
    tl: "Ang Labxat ay isang independenteng portal na nilikha upang magtipon ng balita, updates, utilities at tools para sa xat.com community.", 
    tr: "Labxat, xat.com topluluğu için haberler, güncellemeler, yardımcı programlar ve araçlar toplamak için oluşturulmuş bağımsız bir portaldır.", 
    bs: "Labxat je nezavisni portal kreiran za prikupljanje vijesti, novosti, alata i usluga namijenjenih xat.com zajednici.", 
    fr: "Labxat est un portail indépendant créé pour rassembler des nouvelles, des mises à jour, des utilitaires et des outils destinés à la communauté xat.com.", 
    it: "Labxat è un portale indipendente creato per raccogliere notizie, aggiornamenti, utility e strumenti per la community di xat.com.", 
    hu: "A Labxat egy független portál, amelyet a xat.com közösség híreinek, frissítéseinek, segédprogramjainak és eszközeinek összegyűjtésére hoztak létre.", 
    pl: "Labxat to niezależny portal stworzony w celu gromadzenia wiadomości, aktualizacji, narzędzi i usług dla społeczności xat.com.", 
    "pt-pt": "O Labxat é um portal independente criado para reunir notícias, novidades, utilidades e ferramentas voltadas à comunidade do xat.com.", 
    ro: "Labxat este un portal independent creat pentru a aduna știri, actualizări, utilități și instrumente pentru comunitatea xat.com.", 
    sr: "Labxat je nezavisni portal kreiran za prikupljanje vesti, novosti, alata i usluga namenjenih xat.com zajednici.", 
    th: "Labxat เป็นพอร์ทัลอิสระที่สร้างขึ้นเพื่อรวบรวมข่าวสาร อัปเดต ยูทิลิตี้ และเครื่องมือสำหรับชุมชน xat.com"
  },
  aboutObjective: { 
    pt: "Nosso objetivo é facilitar a experiência dos usuários, oferecendo conteúdos atualizados e recursos práticos como gerador de nicks, gerador de cores, roleta de bingo, códigos, smilies, dicas e informações que ajudam tanto usuários iniciantes quanto os mais experientes.", 
    en: "Our goal is to enhance the user experience by offering updated content and practical resources such as nick generator, color generator, bingo roulette, codes, smilies, tips and information that help both beginners and experienced users.", 
    es: "Nuestro objetivo es facilitar la experiencia de los usuarios, ofreciendo contenido actualizado y recursos prácticos como generador de nicks, generador de colores, ruleta de bingo, códigos, smilies, consejos e información que ayudan tanto a usuarios principiantes como experimentados.", 
    ar: "هدفنا هو تحسين تجربة المستخدم من خلال تقديم محتوى محدث وموارد عملية مثل مولد الألقاب ومولد الألوان وروليت البينغو والأكواد والسمايلات والنصائح والمعلومات التي تساعد المبتدئين والمستخدمين ذوي الخبرة.",
    de: "Unser Ziel ist es, das Benutzererlebnis zu verbessern, indem wir aktualisierte Inhalte und praktische Ressourcen wie Nick-Generator, Farbgenerator, Bingo-Roulette, Codes, Smilies, Tipps und Informationen anbieten.", 
    nl: "Ons doel is de gebruikerservaring te verbeteren door bijgewerkte content en praktische bronnen aan te bieden zoals nick generator, kleurengenerator, bingo roulette, codes, smilies, tips en informatie.", 
    tl: "Ang aming layunin ay pahusayin ang karanasan ng user sa pamamagitan ng pag-aalok ng updated na content at praktikal na resources tulad ng nick generator, color generator, bingo roulette, codes, smilies, tips at impormasyon.", 
    tr: "Amacımız, nick oluşturucu, renk oluşturucu, bingo rulet, kodlar, smilies, ipuçları ve bilgiler gibi güncellenmiş içerik ve pratik kaynaklar sunarak kullanıcı deneyimini geliştirmektir.", 
    bs: "Naš cilj je poboljšati korisničko iskustvo nudeći ažurirani sadržaj i praktične resurse kao što su generator nadimaka, generator boja, bingo rulet, kodovi, smajlići, savjeti i informacije.", 
    fr: "Notre objectif est d'améliorer l'expérience utilisateur en proposant du contenu à jour et des ressources pratiques comme le générateur de nicks, le générateur de couleurs, la roulette bingo, les codes, les smilies, les astuces et les informations.", 
    it: "Il nostro obiettivo è migliorare l'esperienza utente offrendo contenuti aggiornati e risorse pratiche come generatore di nick, generatore di colori, roulette bingo, codici, smilies, suggerimenti e informazioni.", 
    hu: "Célunk a felhasználói élmény javítása frissített tartalmak és praktikus erőforrások kínálásával, mint a nick generátor, színgenerátor, bingo rulett, kódok, smiliek, tippek és információk.", 
    pl: "Naszym celem jest ulepszenie doświadczenia użytkowników poprzez oferowanie aktualnych treści i praktycznych zasobów, takich jak generator nicków, generator kolorów, ruletka bingo, kody, smilies, porady i informacje.", 
    "pt-pt": "O nosso objetivo é facilitar a experiência dos utilizadores, oferecendo conteúdos atualizados e recursos práticos como gerador de nicks, gerador de cores, roleta de bingo, códigos, smilies, dicas e informações.", 
    ro: "Obiectivul nostru este de a îmbunătăți experiența utilizatorilor oferind conținut actualizat și resurse practice precum generator de nickuri, generator de culori, ruletă bingo, coduri, smilies, sfaturi și informații.", 
    sr: "Naš cilj je poboljšati korisničko iskustvo nudeći ažurirani sadržaj i praktične resurse kao što su generator nadimaka, generator boja, bingo rulet, kodovi, smajlići, saveti i informacije.", 
    th: "เป้าหมายของเราคือการปรับปรุงประสบการณ์ผู้ใช้โดยนำเสนอเนื้อหาที่อัปเดตและทรัพยากรที่ใช้งานได้จริง เช่น เครื่องสร้างนิค เครื่องสร้างสี รูเล็ตบิงโก โค้ด สไมลี่ เคล็ดลับและข้อมูล"
  },
  aboutMission: { 
    pt: "O Labxat nasce como um espaço de experimentação e apoio à comunidade, trazendo soluções simples, rápidas e acessíveis, sempre com foco em usabilidade, criatividade e praticidade.", 
    en: "Labxat was born as a space for experimentation and community support, bringing simple, fast and accessible solutions, always focused on usability, creativity and practicality.", 
    es: "Labxat nace como un espacio de experimentación y apoyo a la comunidad, trayendo soluciones simples, rápidas y accesibles, siempre con enfoque en usabilidad, creatividad y practicidad.", 
    ar: "ولد Labxat كمساحة للتجريب ودعم المجتمع، مما يوفر حلولاً بسيطة وسريعة وسهلة الوصول، مع التركيز دائمًا على سهولة الاستخدام والإبداع والتطبيق العملي.",
    de: "Labxat wurde als Raum für Experimente und Community-Unterstützung geboren, der einfache, schnelle und zugängliche Lösungen bietet, immer mit Fokus auf Benutzerfreundlichkeit, Kreativität und Praktikabilität.", 
    nl: "Labxat is geboren als een ruimte voor experimentatie en community-ondersteuning, met eenvoudige, snelle en toegankelijke oplossingen, altijd gericht op bruikbaarheid, creativiteit en praktisch nut.", 
    tl: "Ang Labxat ay ipinanganak bilang isang espasyo para sa eksperimento at suporta sa komunidad, na nagdadala ng simple, mabilis at accessible na solusyon, palaging nakatuon sa usability, creativity at practicality.", 
    tr: "Labxat, kullanılabilirlik, yaratıcılık ve pratikliğe her zaman odaklanarak basit, hızlı ve erişilebilir çözümler sunan bir deneme ve topluluk destek alanı olarak doğdu.", 
    bs: "Labxat je nastao kao prostor za eksperimentiranje i podršku zajednici, donoseći jednostavna, brza i pristupačna rješenja, uvijek s fokusom na upotrebljivost, kreativnost i praktičnost.", 
    fr: "Labxat est né comme un espace d'expérimentation et de soutien communautaire, apportant des solutions simples, rapides et accessibles, toujours axées sur la convivialité, la créativité et la praticité.", 
    it: "Labxat è nato come uno spazio di sperimentazione e supporto alla community, portando soluzioni semplici, veloci e accessibili, sempre focalizzate su usabilità, creatività e praticità.", 
    hu: "A Labxat kísérletezési és közösségi támogatási térként született, egyszerű, gyors és hozzáférhető megoldásokat kínálva, mindig a használhatóságra, kreativitásra és praktikusságra összpontosítva.", 
    pl: "Labxat powstał jako przestrzeń do eksperymentów i wsparcia społeczności, oferując proste, szybkie i dostępne rozwiązania, zawsze skupione na użyteczności, kreatywności i praktyczności.", 
    "pt-pt": "O Labxat nasce como um espaço de experimentação e apoio à comunidade, trazendo soluções simples, rápidas e acessíveis, sempre com foco em usabilidade, criatividade e praticidade.", 
    ro: "Labxat s-a născut ca un spațiu de experimentare și suport pentru comunitate, aducând soluții simple, rapide și accesibile, mereu concentrate pe utilizare, creativitate și practică.", 
    sr: "Labxat je nastao kao prostor za eksperimentisanje i podršku zajednici, donoseći jednostavna, brza i pristupačna rešenja, uvijek s fokusom na upotrebljivost, kreativnost i praktičnost.", 
    th: "Labxat เกิดขึ้นเพื่อเป็นพื้นที่สำหรับการทดลองและการสนับสนุนชุมชน นำเสนอโซลูชันที่เรียบง่าย รวดเร็ว และเข้าถึงได้ โดยเน้นที่ความสามารถในการใช้งาน ความคิดสร้างสรรค์ และความเป็นจริง"
  },
  aboutDisclaimer: { 
    pt: "Não temos vínculo oficial com o xat.com. Todo o conteúdo disponibilizado aqui é de caráter informativo e educativo, criado para apoiar e fortalecer a comunidade.", 
    en: "We have no official affiliation with xat.com. All content provided here is informational and educational, created to support and strengthen the community.", 
    es: "No tenemos vínculo oficial con xat.com. Todo el contenido proporcionado aquí es de carácter informativo y educativo, creado para apoyar y fortalecer la comunidad.", 
    ar: "ليس لدينا أي ارتباط رسمي مع xat.com. كل المحتوى المقدم هنا تعليمي وإعلامي، تم إنشاؤه لدعم وتقوية المجتمع.",
    de: "Wir haben keine offizielle Verbindung zu xat.com. Alle hier bereitgestellten Inhalte sind informativer und bildender Natur, erstellt zur Unterstützung und Stärkung der Community.", 
    nl: "We hebben geen officiële banden met xat.com. Alle hier verstrekte inhoud is informatief en educatief, gemaakt om de community te ondersteunen en te versterken.", 
    tl: "Wala kaming opisyal na ugnayan sa xat.com. Lahat ng content dito ay informational at educational, nilikha upang suportahan at palakasin ang komunidad.", 
    tr: "xat.com ile resmi bir bağlantımız yoktur. Burada sağlanan tüm içerik bilgilendirici ve eğitici niteliktedir, topluluğu desteklemek ve güçlendirmek için oluşturulmuştur.", 
    bs: "Nemamo službenu povezanost s xat.com. Sav sadržaj ovdje je informativan i obrazovan, stvoren za podršku i jačanje zajednice.", 
    fr: "Nous n'avons aucune affiliation officielle avec xat.com. Tout le contenu fourni ici est informatif et éducatif, créé pour soutenir et renforcer la communauté.", 
    it: "Non abbiamo alcuna affiliazione ufficiale con xat.com. Tutto il contenuto fornito qui è informativo ed educativo, creato per supportare e rafforzare la community.", 
    hu: "Nincs hivatalos kapcsolatunk a xat.com-mal. Az itt található összes tartalom tájékoztató és oktatási jellegű, a közösség támogatására és erősítésére készült.", 
    pl: "Nie mamy oficjalnego powiązania z xat.com. Cała zawartość tutaj jest informacyjna i edukacyjna, stworzona w celu wspierania i wzmacniania społeczności.", 
    "pt-pt": "Não temos vínculo oficial com o xat.com. Todo o conteúdo disponibilizado aqui é de caráter informativo e educativo, criado para apoiar e fortalecer a comunidade.", 
    ro: "Nu avem nicio afiliere oficială cu xat.com. Tot conținutul furnizat aici este informativ și educativ, creat pentru a sprijini și consolida comunitatea.", 
    sr: "Nemamo službenu povezanost s xat.com. Sav sadržaj ovde je informativan i obrazovan, stvoren za podršku i jačanje zajednice.", 
    th: "เราไม่มีความเกี่ยวข้องอย่างเป็นทางการกับ xat.com เนื้อหาทั้งหมดที่ให้ไว้ที่นี่มีลักษณะให้ข้อมูลและการศึกษา สร้างขึ้นเพื่อสนับสนุนและเสริมสร้างชุมชน"
  },
  
  // Privacy Policy Page
  privacyTitle: { 
    pt: "Política de Privacidade", en: "Privacy Policy", es: "Política de Privacidad", ar: "سياسة الخصوصية",
    de: "Datenschutzrichtlinie", nl: "Privacybeleid", tl: "Patakaran sa Privacy", tr: "Gizlilik Politikası", bs: "Politika privatnosti", fr: "Politique de Confidentialité", it: "Informativa sulla Privacy", hu: "Adatvédelmi irányelvek", pl: "Polityka prywatności", "pt-pt": "Política de Privacidade", ro: "Politica de Confidențialitate", sr: "Politika privatnosti", th: "นโยบายความเป็นส่วนตัว"
  },
  privacyIntro: { 
    pt: "A sua privacidade é importante para nós. No Labxat, respeitamos a privacidade dos usuários e estamos comprometidos em proteger as informações coletadas durante a navegação.", 
    en: "Your privacy is important to us. At Labxat, we respect user privacy and are committed to protecting the information collected during browsing.", 
    es: "Tu privacidad es importante para nosotros. En Labxat, respetamos la privacidad de los usuarios y estamos comprometidos a proteger la información recopilada durante la navegación.", 
    ar: "خصوصيتك مهمة بالنسبة لنا. في Labxat، نحترم خصوصية المستخدمين ونلتزم بحماية المعلومات التي يتم جمعها أثناء التصفح.",
    de: "Ihre Privatsphäre ist uns wichtig. Bei Labxat respektieren wir die Privatsphäre der Benutzer und verpflichten uns, die während des Surfens gesammelten Informationen zu schützen.", 
    nl: "Uw privacy is belangrijk voor ons. Bij Labxat respecteren we de privacy van gebruikers en zijn we toegewijd aan het beschermen van de informatie die tijdens het browsen wordt verzameld.", 
    tl: "Mahalaga sa amin ang iyong privacy. Sa Labxat, nirerespeto namin ang privacy ng mga user at nangangako kaming protektahan ang impormasyong nakolekta habang nagba-browse.", 
    tr: "Gizliliğiniz bizim için önemlidir. Labxat'ta kullanıcı gizliliğine saygı duyuyor ve gezinme sırasında toplanan bilgileri korumaya kararlıyız.", 
    bs: "Vaša privatnost nam je važna. U Labxat-u poštujemo privatnost korisnika i posvećeni smo zaštiti informacija prikupljenih tijekom pregledavanja.", 
    fr: "Votre vie privée nous est importante. Chez Labxat, nous respectons la vie privée des utilisateurs et nous nous engageons à protéger les informations collectées lors de la navigation.", 
    it: "La tua privacy è importante per noi. In Labxat, rispettiamo la privacy degli utenti e ci impegniamo a proteggere le informazioni raccolte durante la navigazione.", 
    hu: "Az Ön adatvédelme fontos számunkra. A Labxat-nál tiszteletben tartjuk a felhasználók adatvédelmét, és elkötelezettek vagyunk a böngészés során gyűjtött információk védelme mellett.", 
    pl: "Twoja prywatność jest dla nas ważna. W Labxat szanujemy prywatność użytkowników i zobowiązujemy się do ochrony informacji zebranych podczas przeglądania.", 
    "pt-pt": "A sua privacidade é importante para nós. No Labxat, respeitamos a privacidade dos utilizadores e estamos comprometidos em proteger as informações recolhidas durante a navegação.", 
    ro: "Confidențialitatea dvs. este importantă pentru noi. La Labxat, respectăm confidențialitatea utilizatorilor și ne angajăm să protejăm informațiile colectate în timpul navigării.", 
    sr: "Vaša privatnost nam je važna. U Labxat-u poštujemo privatnost korisnika i posvećeni smo zaštiti informacija prikupljenih tokom pregledanja.", 
    th: "ความเป็นส่วนตัวของคุณสำคัญสำหรับเรา ที่ Labxat เราเคารพความเป็นส่วนตัวของผู้ใช้และมุ่งมั่นที่จะปกป้องข้อมูลที่รวบรวมระหว่างการเรียกดู"
  },
  privacyCollectionTitle: { 
    pt: "Coleta de Informações", en: "Information Collection", es: "Recopilación de Información", ar: "جمع المعلومات",
    de: "Informationserfassung", nl: "Informatieverzameling", tl: "Koleksyon ng Impormasyon", tr: "Bilgi Toplama", bs: "Prikupljanje informacija", fr: "Collecte d'Informations", it: "Raccolta di Informazioni", hu: "Információgyűjtés", pl: "Zbieranie informacji", "pt-pt": "Recolha de Informações", ro: "Colectarea Informațiilor", sr: "Prikupljanje informacija", th: "การรวบรวมข้อมูล"
  },
  privacyCollectionContent: { 
    pt: "Podemos coletar informações de forma automática, como:\n• Endereço IP\n• Tipo de navegador\n• Páginas acessadas\n• Tempo de navegação\n\nEsses dados são utilizados apenas para fins estatísticos, melhoria do site e experiência do usuário.", 
    en: "We may automatically collect information such as:\n• IP Address\n• Browser type\n• Pages accessed\n• Browsing time\n\nThis data is used only for statistical purposes, site improvement and user experience.", 
    es: "Podemos recopilar información de forma automática, como:\n• Dirección IP\n• Tipo de navegador\n• Páginas accedidas\n• Tiempo de navegación\n\nEstos datos se utilizan solo para fines estadísticos, mejora del sitio y experiencia del usuario.", 
    ar: "قد نجمع المعلومات تلقائيًا مثل:\n• عنوان IP\n• نوع المتصفح\n• الصفحات التي تم الوصول إليها\n• وقت التصفح\n\nتُستخدم هذه البيانات فقط للأغراض الإحصائية وتحسين الموقع وتجربة المستخدم.",
    de: "Wir können automatisch Informationen sammeln wie:\n• IP-Adresse\n• Browsertyp\n• Aufgerufene Seiten\n• Browsing-Zeit\n\nDiese Daten werden nur für statistische Zwecke, Website-Verbesserung und Benutzererfahrung verwendet.", 
    nl: "We kunnen automatisch informatie verzamelen zoals:\n• IP-adres\n• Browsertype\n• Bezochte pagina's\n• Browsetijd\n\nDeze gegevens worden alleen gebruikt voor statistische doeleinden, siteverbetering en gebruikerservaring.", 
    tl: "Maaaring automatic kaming mangolekta ng impormasyon tulad ng:\n• IP Address\n• Uri ng browser\n• Mga page na na-access\n• Oras ng pag-browse\n\nGinagamit lang ang data na ito para sa statistical purposes, pagpapabuti ng site at user experience.", 
    tr: "Aşağıdaki bilgileri otomatik olarak toplayabiliriz:\n• IP Adresi\n• Tarayıcı türü\n• Erişilen sayfalar\n• Gezinme süresi\n\nBu veriler yalnızca istatistiksel amaçlar, site iyileştirme ve kullanıcı deneyimi için kullanılır.", 
    bs: "Možemo automatski prikupljati informacije kao što su:\n• IP adresa\n• Vrsta preglednika\n• Pristupljene stranice\n• Vrijeme pregledavanja\n\nOvi podaci se koriste samo u statističke svrhe, poboljšanje stranice i korisničko iskustvo.", 
    fr: "Nous pouvons collecter automatiquement des informations telles que:\n• Adresse IP\n• Type de navigateur\n• Pages consultées\n• Temps de navigation\n\nCes données sont utilisées uniquement à des fins statistiques, d'amélioration du site et d'expérience utilisateur.", 
    it: "Potremmo raccogliere automaticamente informazioni come:\n• Indirizzo IP\n• Tipo di browser\n• Pagine visitate\n• Tempo di navigazione\n\nQuesti dati vengono utilizzati solo per scopi statistici, miglioramento del sito ed esperienza utente.", 
    hu: "Automatikusan gyűjthetünk információkat, mint például:\n• IP-cím\n• Böngésző típusa\n• Meglátogatott oldalak\n• Böngészési idő\n\nEzeket az adatokat csak statisztikai célokra, a webhely fejlesztésére és a felhasználói élményre használjuk.", 
    pl: "Możemy automatycznie zbierać informacje takie jak:\n• Adres IP\n• Typ przeglądarki\n• Odwiedzone strony\n• Czas przeglądania\n\nTe dane są wykorzystywane wyłącznie do celów statystycznych, ulepszania strony i doświadczeń użytkownika.", 
    "pt-pt": "Podemos recolher informações de forma automática, como:\n• Endereço IP\n• Tipo de navegador\n• Páginas acedidas\n• Tempo de navegação\n\nEstes dados são utilizados apenas para fins estatísticos, melhoria do site e experiência do utilizador.", 
    ro: "Putem colecta automat informații precum:\n• Adresă IP\n• Tip de browser\n• Pagini accesate\n• Timp de navigare\n\nAceste date sunt utilizate doar în scopuri statistice, îmbunătățirea site-ului și experiența utilizatorului.", 
    sr: "Možemo automatski prikupljati informacije kao što su:\n• IP adresa\n• Vrsta pregledača\n• Pristupljene stranice\n• Vreme pregledanja\n\nOvi podaci se koriste samo u statističke svrhe, poboljšanje stranice i korisničko iskustvo.", 
    th: "เราอาจรวบรวมข้อมูลโดยอัตโนมัติ เช่น:\n• ที่อยู่ IP\n• ประเภทเบราว์เซอร์\n• หน้าที่เข้าถึง\n• เวลาในการเรียกดู\n\nข้อมูลนี้ใช้เพื่อวัตถุประสงค์ทางสถิติ การปรับปรุงเว็บไซต์ และประสบการณ์ผู้ใช้เท่านั้น"
  },
  privacyCookiesTitle: { 
    pt: "Uso de Cookies", en: "Use of Cookies", es: "Uso de Cookies", ar: "استخدام ملفات تعريف الارتباط",
    de: "Verwendung von Cookies", nl: "Gebruik van Cookies", tl: "Paggamit ng Cookies", tr: "Çerez Kullanımı", bs: "Korištenje kolačića", fr: "Utilisation des Cookies", it: "Uso dei Cookie", hu: "Cookie-k használata", pl: "Użycie Cookies", "pt-pt": "Uso de Cookies", ro: "Utilizarea Cookie-urilor", sr: "Korišćenje kolačića", th: "การใช้คุกกี้"
  },
  privacyCookiesContent: { 
    pt: "Utilizamos cookies para:\n• Melhorar a navegação\n• Analisar tráfego e desempenho do site\n• Salvar preferências do usuário\n\nVocê pode desativar os cookies a qualquer momento nas configurações do seu navegador.", 
    en: "We use cookies to:\n• Improve navigation\n• Analyze traffic and site performance\n• Save user preferences\n\nYou can disable cookies at any time in your browser settings.", 
    es: "Utilizamos cookies para:\n• Mejorar la navegación\n• Analizar el tráfico y rendimiento del sitio\n• Guardar preferencias del usuario\n\nPuedes desactivar las cookies en cualquier momento en la configuración de tu navegador.", 
    ar: "نستخدم ملفات تعريف الارتباط من أجل:\n• تحسين التنقل\n• تحليل حركة المرور وأداء الموقع\n• حفظ تفضيلات المستخدم\n\nيمكنك تعطيل ملفات تعريف الارتباط في أي وقت في إعدادات متصفحك.",
    de: "Wir verwenden Cookies um:\n• Die Navigation zu verbessern\n• Verkehr und Website-Leistung zu analysieren\n• Benutzereinstellungen zu speichern\n\nSie können Cookies jederzeit in Ihren Browsereinstellungen deaktivieren.", 
    nl: "We gebruiken cookies om:\n• Navigatie te verbeteren\n• Verkeer en siteprestaties te analyseren\n• Gebruikersvoorkeuren op te slaan\n\nU kunt cookies op elk moment uitschakelen in uw browserinstellingen.", 
    tl: "Gumagamit kami ng cookies para:\n• Mapabuti ang navigation\n• Suriin ang traffic at performance ng site\n• I-save ang mga preference ng user\n\nMaaari mong i-disable ang cookies anumang oras sa settings ng iyong browser.", 
    tr: "Çerezleri şunlar için kullanıyoruz:\n• Gezinmeyi iyileştirmek\n• Trafik ve site performansını analiz etmek\n• Kullanıcı tercihlerini kaydetmek\n\nÇerezleri tarayıcı ayarlarınızdan istediğiniz zaman devre dışı bırakabilirsiniz.", 
    bs: "Koristimo kolačiće za:\n• Poboljšanje navigacije\n• Analizu prometa i performansi stranice\n• Spremanje korisničkih preferencija\n\nMožete onemogućiti kolačiće u bilo kojem trenutku u postavkama preglednika.", 
    fr: "Nous utilisons des cookies pour:\n• Améliorer la navigation\n• Analyser le trafic et les performances du site\n• Sauvegarder les préférences utilisateur\n\nVous pouvez désactiver les cookies à tout moment dans les paramètres de votre navigateur.", 
    it: "Utilizziamo i cookie per:\n• Migliorare la navigazione\n• Analizzare il traffico e le prestazioni del sito\n• Salvare le preferenze utente\n\nPuoi disabilitare i cookie in qualsiasi momento nelle impostazioni del browser.", 
    hu: "Cookie-kat használunk a következőkre:\n• Navigáció javítása\n• Forgalom és webhely teljesítmény elemzése\n• Felhasználói beállítások mentése\n\nA cookie-kat bármikor letilthatja a böngésző beállításaiban.", 
    pl: "Używamy cookies do:\n• Poprawy nawigacji\n• Analizy ruchu i wydajności strony\n• Zapisywania preferencji użytkownika\n\nMożesz wyłączyć cookies w dowolnym momencie w ustawieniach przeglądarki.", 
    "pt-pt": "Utilizamos cookies para:\n• Melhorar a navegação\n• Analisar tráfego e desempenho do site\n• Guardar preferências do utilizador\n\nPode desativar os cookies a qualquer momento nas definições do seu navegador.", 
    ro: "Folosim cookie-uri pentru:\n• Îmbunătățirea navigării\n• Analiza traficului și performanței site-ului\n• Salvarea preferințelor utilizatorului\n\nPuteți dezactiva cookie-urile oricând din setările browserului.", 
    sr: "Koristimo kolačiće za:\n• Poboljšanje navigacije\n• Analizu prometa i performansi stranice\n• Čuvanje korisničkih preferencija\n\nMožete onemogućiti kolačiće u bilo kom trenutku u postavkama pregledača.", 
    th: "เราใช้คุกกี้เพื่อ:\n• ปรับปรุงการนำทาง\n• วิเคราะห์การเข้าชมและประสิทธิภาพของเว็บไซต์\n• บันทึกการตั้งค่าของผู้ใช้\n\nคุณสามารถปิดใช้งานคุกกี้ได้ตลอดเวลาในการตั้งค่าเบราว์เซอร์"
  },
  privacySharingTitle: { 
    pt: "Compartilhamento de Dados", en: "Data Sharing", es: "Compartición de Datos", ar: "مشاركة البيانات",
    de: "Datenweitergabe", nl: "Gegevensdeling", tl: "Pagbabahagi ng Data", tr: "Veri Paylaşımı", bs: "Dijeljenje podataka", fr: "Partage de Données", it: "Condivisione Dati", hu: "Adatmegosztás", pl: "Udostępnianie danych", "pt-pt": "Partilha de Dados", ro: "Partajarea Datelor", sr: "Deljenje podataka", th: "การแบ่งปันข้อมูล"
  },
  privacySharingContent: { 
    pt: "O Labxat não vende, troca ou compartilha informações pessoais dos usuários com terceiros, exceto quando exigido por lei.", 
    en: "Labxat does not sell, trade or share users' personal information with third parties, except when required by law.", 
    es: "Labxat no vende, intercambia ni comparte información personal de los usuarios con terceros, excepto cuando lo exija la ley.", 
    ar: "لا يقوم Labxat ببيع أو تبادل أو مشاركة المعلومات الشخصية للمستخدمين مع أطراف ثالثة، إلا عندما يقتضي القانون ذلك.",
    de: "Labxat verkauft, handelt oder teilt keine persönlichen Informationen der Benutzer mit Dritten, außer wenn dies gesetzlich vorgeschrieben ist.", 
    nl: "Labxat verkoopt, ruilt of deelt geen persoonlijke informatie van gebruikers met derden, behalve wanneer dit wettelijk vereist is.", 
    tl: "Hindi ibinebenta, ipinagpapalit o ibinabahagi ng Labxat ang personal na impormasyon ng mga user sa third parties, maliban kung kinakailangan ng batas.", 
    tr: "Labxat, kullanıcıların kişisel bilgilerini yasal olarak gerekli olmadıkça üçüncü taraflarla satmaz, takas etmez veya paylaşmaz.", 
    bs: "Labxat ne prodaje, ne trguje niti dijeli osobne podatke korisnika s trećim stranama, osim kada to zahtijeva zakon.", 
    fr: "Labxat ne vend, n'échange ni ne partage les informations personnelles des utilisateurs avec des tiers, sauf lorsque la loi l'exige.", 
    it: "Labxat non vende, scambia o condivide le informazioni personali degli utenti con terze parti, salvo quando richiesto dalla legge.", 
    hu: "A Labxat nem adja el, nem cseréli és nem osztja meg a felhasználók személyes adatait harmadik felekkel, kivéve, ha a törvény előírja.", 
    pl: "Labxat nie sprzedaje, nie wymienia ani nie udostępnia danych osobowych użytkowników stronom trzecim, chyba że wymaga tego prawo.", 
    "pt-pt": "O Labxat não vende, troca ou partilha informações pessoais dos utilizadores com terceiros, exceto quando exigido por lei.", 
    ro: "Labxat nu vinde, nu schimbă și nu partajează informațiile personale ale utilizatorilor cu terți, cu excepția cazului în care legea o impune.", 
    sr: "Labxat ne prodaje, ne trguje niti deli lične podatke korisnika sa trećim stranama, osim kada to zahteva zakon.", 
    th: "Labxat ไม่ขาย แลกเปลี่ยน หรือแบ่งปันข้อมูลส่วนบุคคลของผู้ใช้กับบุคคลที่สาม ยกเว้นเมื่อกฎหมายกำหนด"
  },
  privacyLinksTitle: { 
    pt: "Links Externos", en: "External Links", es: "Enlaces Externos", ar: "الروابط الخارجية",
    de: "Externe Links", nl: "Externe Links", tl: "External Links", tr: "Harici Bağlantılar", bs: "Vanjski linkovi", fr: "Liens Externes", it: "Link Esterni", hu: "Külső linkek", pl: "Linki zewnętrzne", "pt-pt": "Links Externos", ro: "Linkuri Externe", sr: "Spoljni linkovi", th: "ลิงก์ภายนอก"
  },
  privacyLinksContent: { 
    pt: "Nosso site pode conter links para sites externos. Não nos responsabilizamos pelas práticas de privacidade de sites de terceiros.", 
    en: "Our site may contain links to external sites. We are not responsible for the privacy practices of third-party sites.", 
    es: "Nuestro sitio puede contener enlaces a sitios externos. No nos responsabilizamos por las prácticas de privacidad de sitios de terceros.", 
    ar: "قد يحتوي موقعنا على روابط لمواقع خارجية. نحن غير مسؤولين عن ممارسات الخصوصية لمواقع الطرف الثالث.",
    de: "Unsere Website kann Links zu externen Websites enthalten. Wir sind nicht verantwortlich für die Datenschutzpraktiken von Drittanbieter-Websites.", 
    nl: "Onze site kan links naar externe sites bevatten. Wij zijn niet verantwoordelijk voor het privacybeleid van sites van derden.", 
    tl: "Ang aming site ay maaaring maglaman ng mga link sa external sites. Hindi kami responsable sa privacy practices ng third-party sites.", 
    tr: "Sitemiz harici sitelere bağlantılar içerebilir. Üçüncü taraf sitelerin gizlilik uygulamalarından sorumlu değiliz.", 
    bs: "Naša stranica može sadržavati linkove na vanjske stranice. Nismo odgovorni za prakse privatnosti stranica trećih strana.", 
    fr: "Notre site peut contenir des liens vers des sites externes. Nous ne sommes pas responsables des pratiques de confidentialité des sites tiers.", 
    it: "Il nostro sito potrebbe contenere link a siti esterni. Non siamo responsabili delle pratiche sulla privacy di siti di terze parti.", 
    hu: "Weboldalunk tartalmazhat külső oldalakra mutató linkeket. Nem vállalunk felelősséget harmadik felek webhelyeinek adatvédelmi gyakorlatáért.", 
    pl: "Nasza strona może zawierać linki do zewnętrznych stron. Nie ponosimy odpowiedzialności za praktyki prywatności stron trzecich.", 
    "pt-pt": "O nosso site pode conter links para sites externos. Não nos responsabilizamos pelas práticas de privacidade de sites de terceiros.", 
    ro: "Site-ul nostru poate conține linkuri către site-uri externe. Nu suntem responsabili pentru practicile de confidențialitate ale site-urilor terțe.", 
    sr: "Naša stranica može sadržavati linkove na spoljne stranice. Nismo odgovorni za prakse privatnosti stranica trećih strana.", 
    th: "เว็บไซต์ของเราอาจมีลิงก์ไปยังเว็บไซต์ภายนอก เราไม่รับผิดชอบต่อแนวปฏิบัติด้านความเป็นส่วนตัวของเว็บไซต์ของบุคคลที่สาม"
  },
  privacyConsentTitle: { 
    pt: "Consentimento", en: "Consent", es: "Consentimiento", ar: "الموافقة",
    de: "Einwilligung", nl: "Toestemming", tl: "Pahintulot", tr: "Onay", bs: "Pristanak", fr: "Consentement", it: "Consenso", hu: "Hozzájárulás", pl: "Zgoda", "pt-pt": "Consentimento", ro: "Consimțământ", sr: "Pristanak", th: "ความยินยอม"
  },
  privacyConsentContent: { 
    pt: "Ao utilizar o Labxat, você concorda com esta Política de Privacidade.", 
    en: "By using Labxat, you agree to this Privacy Policy.", 
    es: "Al usar Labxat, aceptas esta Política de Privacidad.", 
    ar: "باستخدام Labxat، فإنك توافق على سياسة الخصوصية هذه.",
    de: "Durch die Nutzung von Labxat stimmen Sie dieser Datenschutzrichtlinie zu.", 
    nl: "Door Labxat te gebruiken, gaat u akkoord met dit Privacybeleid.", 
    tl: "Sa paggamit ng Labxat, sumasang-ayon ka sa Privacy Policy na ito.", 
    tr: "Labxat'ı kullanarak bu Gizlilik Politikasını kabul etmiş olursunuz.", 
    bs: "Korištenjem Labxat-a pristajete na ovu Politiku privatnosti.", 
    fr: "En utilisant Labxat, vous acceptez cette Politique de Confidentialité.", 
    it: "Utilizzando Labxat, accetti questa Informativa sulla Privacy.", 
    hu: "A Labxat használatával elfogadja ezt az Adatvédelmi irányelvet.", 
    pl: "Korzystając z Labxat, zgadzasz się z niniejszą Polityką prywatności.", 
    "pt-pt": "Ao utilizar o Labxat, concorda com esta Política de Privacidade.", 
    ro: "Prin utilizarea Labxat, sunteți de acord cu această Politică de Confidențialitate.", 
    sr: "Korišćenjem Labxat-a pristajete na ovu Politiku privatnosti.", 
    th: "การใช้ Labxat แสดงว่าคุณยอมรับนโยบายความเป็นส่วนตัวนี้"
  },
  
  // Cookie Consent
  cookieMessage: { 
    pt: "Este site utiliza cookies para melhorar sua experiência de navegação, analisar o tráfego e personalizar conteúdos. Ao continuar navegando, você concorda com o uso de cookies conforme descrito em nossa", 
    en: "This site uses cookies to improve your browsing experience, analyze traffic and personalize content. By continuing to browse, you agree to the use of cookies as described in our", 
    es: "Este sitio utiliza cookies para mejorar su experiencia de navegación, analizar el tráfico y personalizar contenidos. Al continuar navegando, acepta el uso de cookies como se describe en nuestra", 
    ar: "يستخدم هذا الموقع ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة المرور وتخصيص المحتوى. من خلال الاستمرار في التصفح، فإنك توافق على استخدام ملفات تعريف الارتباط كما هو موضح في",
    de: "Diese Website verwendet Cookies, um Ihr Browsererlebnis zu verbessern, den Datenverkehr zu analysieren und Inhalte zu personalisieren. Wenn Sie weiter surfen, stimmen Sie der Verwendung von Cookies gemäß unserer zu", 
    nl: "Deze site gebruikt cookies om uw browse-ervaring te verbeteren, verkeer te analyseren en inhoud te personaliseren. Door verder te bladeren, gaat u akkoord met het gebruik van cookies zoals beschreven in ons", 
    tl: "Ang site na ito ay gumagamit ng cookies upang mapabuti ang iyong karanasan sa pag-browse, suriin ang traffic at i-personalize ang content. Sa patuloy na pag-browse, sumasang-ayon ka sa paggamit ng cookies tulad ng inilarawan sa aming", 
    tr: "Bu site, göz atma deneyiminizi geliştirmek, trafiği analiz etmek ve içeriği kişiselleştirmek için çerezler kullanır. Göz atmaya devam ederek, çerezlerin kullanımını kabul etmiş olursunuz", 
    bs: "Ova stranica koristi kolačiće za poboljšanje vašeg iskustva pregledavanja, analizu prometa i personalizaciju sadržaja. Nastavkom pregledavanja pristajete na korištenje kolačića kako je opisano u našoj", 
    fr: "Ce site utilise des cookies pour améliorer votre expérience de navigation, analyser le trafic et personnaliser le contenu. En continuant à naviguer, vous acceptez l'utilisation de cookies comme décrit dans notre", 
    it: "Questo sito utilizza cookie per migliorare la tua esperienza di navigazione, analizzare il traffico e personalizzare i contenuti. Continuando a navigare, accetti l'uso dei cookie come descritto nella nostra", 
    hu: "Ez a webhely sütiket használ a böngészési élmény javítására, a forgalom elemzésére és a tartalom személyre szabására. A böngészés folytatásával elfogadja a sütik használatát a mi leírásunk szerint", 
    pl: "Ta strona używa plików cookie, aby poprawić wrażenia z przeglądania, analizować ruch i personalizować treści. Kontynuując przeglądanie, zgadzasz się na używanie plików cookie zgodnie z opisem w naszej", 
    "pt-pt": "Este site utiliza cookies para melhorar a sua experiência de navegação, analisar o tráfego e personalizar conteúdos. Ao continuar a navegar, concorda com o uso de cookies conforme descrito na nossa", 
    ro: "Acest site folosește cookie-uri pentru a îmbunătăți experiența de navigare, a analiza traficul și a personaliza conținutul. Continuând să navigați, sunteți de acord cu utilizarea cookie-urilor conform descrierii din", 
    sr: "Ova stranica koristi kolačiće za poboljšanje vašeg iskustva pregledanja, analizu prometa i personalizaciju sadržaja. Nastavljanjem pregledanja pristajete na korišćenje kolačića kako je opisano u našoj", 
    th: "เว็บไซต์นี้ใช้คุกกี้เพื่อปรับปรุงประสบการณ์การเรียกดูของคุณ วิเคราะห์การเข้าชม และปรับแต่งเนื้อหา การเรียกดูต่อไปแสดงว่าคุณยอมรับการใช้คุกกี้ตามที่อธิบายไว้ใน"
  },
  acceptCookies: { 
    pt: "Aceitar cookies", en: "Accept cookies", es: "Aceptar cookies", ar: "قبول ملفات تعريف الارتباط",
    de: "Cookies akzeptieren", nl: "Cookies accepteren", tl: "Tanggapin ang cookies", tr: "Çerezleri kabul et", bs: "Prihvati kolačiće", fr: "Accepter les cookies", it: "Accetta cookie", hu: "Sütik elfogadása", pl: "Akceptuj cookies", "pt-pt": "Aceitar cookies", ro: "Acceptă cookie-uri", sr: "Prihvati kolačiće", th: "ยอมรับคุกกี้"
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
  
  // ShopLAB Section
  shopLabTitle: {
    pt: "ShopLAB", en: "ShopLAB", es: "ShopLAB", ar: "ShopLAB",
    de: "ShopLAB", nl: "ShopLAB", tl: "ShopLAB", tr: "ShopLAB", bs: "ShopLAB", fr: "ShopLAB", it: "ShopLAB", hu: "ShopLAB", pl: "ShopLAB", "pt-pt": "ShopLAB", ro: "ShopLAB", sr: "ShopLAB", th: "ShopLAB"
  },
  contact: {
    pt: "Fale comigo!", en: "Talk to me!", es: "¡Habla conmigo!", ar: "!تحدث معي",
    de: "Sprich mit mir!", nl: "Praat met mij!", tl: "Kausapin mo ako!", tr: "Benimle konuş!", bs: "Razgovaraj sa mnom!", fr: "Parle-moi !", it: "Parla con me!", hu: "Beszélj velem!", pl: "Porozmawiaj ze mną!", "pt-pt": "Fala comigo!", ro: "Vorbește cu mine!", sr: "Razgovaraj sa mnom!", th: "คุยกับฉัน!"
  },
  fundos: {
    pt: "Fundos", en: "Backgrounds", es: "Fondos", ar: "خلفيات",
    de: "Hintergründe", nl: "Achtergronden", tl: "Mga Background", tr: "Arka Planlar", bs: "Pozadine", fr: "Fonds", it: "Sfondi", hu: "Hátterek", pl: "Tła", "pt-pt": "Fundos", ro: "Fundaluri", sr: "Pozadine", th: "พื้นหลัง"
  },
  pcbacks: {
    pt: "Pcbacks", en: "Pcbacks", es: "Pcbacks", ar: "Pcbacks",
    de: "Pcbacks", nl: "Pcbacks", tl: "Pcbacks", tr: "Pcbacks", bs: "Pcbacks", fr: "Pcbacks", it: "Pcbacks", hu: "Pcbacks", pl: "Pcbacks", "pt-pt": "Pcbacks", ro: "Pcbacks", sr: "Pcbacks", th: "Pcbacks"
  },
  xatspace: {
    pt: "Xatspace", en: "Xatspace", es: "Xatspace", ar: "Xatspace",
    de: "Xatspace", nl: "Xatspace", tl: "Xatspace", tr: "Xatspace", bs: "Xatspace", fr: "Xatspace", it: "Xatspace", hu: "Xatspace", pl: "Xatspace", "pt-pt": "Xatspace", ro: "Xatspace", sr: "Xatspace", th: "Xatspace"
  },
  logotipo: {
    pt: "Logotipo", en: "Logo", es: "Logotipo", ar: "شعار",
    de: "Logo", nl: "Logo", tl: "Logo", tr: "Logo", bs: "Logo", fr: "Logo", it: "Logo", hu: "Logó", pl: "Logo", "pt-pt": "Logótipo", ro: "Logo", sr: "Logo", th: "โลโก้"
  },
  pstyle: {
    pt: "Pstyle", en: "Pstyle", es: "Pstyle", ar: "Pstyle",
    de: "Pstyle", nl: "Pstyle", tl: "Pstyle", tr: "Pstyle", bs: "Pstyle", fr: "Pstyle", it: "Pstyle", hu: "Pstyle", pl: "Pstyle", "pt-pt": "Pstyle", ro: "Pstyle", sr: "Pstyle", th: "Pstyle"
  },
  xmoji: {
    pt: "Xmoji", en: "Xmoji", es: "Xmoji", ar: "Xmoji",
    de: "Xmoji", nl: "Xmoji", tl: "Xmoji", tr: "Xmoji", bs: "Xmoji", fr: "Xmoji", it: "Xmoji", hu: "Xmoji", pl: "Xmoji", "pt-pt": "Xmoji", ro: "Xmoji", sr: "Xmoji", th: "Xmoji"
  },
  
  // Terms of Service
  termsTitle: {
    pt: "Termos de Serviço", en: "Terms of Service", es: "Términos de Servicio", ar: "شروط الخدمة",
    de: "Nutzungsbedingungen", nl: "Servicevoorwaarden", tl: "Mga Tuntunin ng Serbisyo", tr: "Hizmet Şartları", bs: "Uslovi korištenja", fr: "Conditions d'utilisation", it: "Termini di Servizio", hu: "Szolgáltatási feltételek", pl: "Warunki usługi", "pt-pt": "Termos de Serviço", ro: "Termeni și condiții", sr: "Uslovi korišćenja", th: "ข้อกำหนดในการให้บริการ"
  },
  termsIntro: {
    pt: "Bem-vindo ao Labxat. Ao acessar e usar este site, você concorda com os seguintes termos e condições.",
    en: "Welcome to Labxat. By accessing and using this website, you agree to the following terms and conditions.",
    es: "Bienvenido a Labxat. Al acceder y usar este sitio web, usted acepta los siguientes términos y condiciones.",
    ar: "مرحبًا بك في Labxat. من خلال الوصول إلى هذا الموقع واستخدامه، فإنك توافق على الشروط والأحكام التالية.",
    de: "Willkommen bei Labxat. Durch den Zugriff auf und die Nutzung dieser Website stimmen Sie den folgenden Geschäftsbedingungen zu.",
    nl: "Welkom bij Labxat. Door deze website te bezoeken en te gebruiken, gaat u akkoord met de volgende voorwaarden.",
    tl: "Maligayang pagdating sa Labxat. Sa pag-access at paggamit ng website na ito, sumasang-ayon ka sa mga sumusunod na tuntunin at kundisyon.",
    tr: "Labxat'a hoş geldiniz. Bu web sitesine erişerek ve kullanarak aşağıdaki şartları ve koşulları kabul etmiş olursunuz.",
    bs: "Dobrodošli na Labxat. Pristupom i korištenjem ove web stranice prihvaćate sljedeće uvjete i odredbe.",
    fr: "Bienvenue sur Labxat. En accédant et en utilisant ce site Web, vous acceptez les termes et conditions suivants.",
    it: "Benvenuto su Labxat. Accedendo e utilizzando questo sito web, accetti i seguenti termini e condizioni.",
    hu: "Üdvözöljük a Labxat-on. A weboldal elérésével és használatával elfogadja az alábbi feltételeket.",
    pl: "Witamy w Labxat. Uzyskując dostęp i korzystając z tej strony internetowej, zgadzasz się na następujące warunki.",
    "pt-pt": "Bem-vindo ao Labxat. Ao aceder e utilizar este site, concorda com os seguintes termos e condições.",
    ro: "Bun venit la Labxat. Accesând și utilizând acest site web, sunteți de acord cu următorii termeni și condiții.",
    sr: "Dobrodošli na Labxat. Pristupom i korišćenjem ove veb stranice prihvatate sledeće uslove i odredbe.",
    th: "ยินดีต้อนรับสู่ Labxat เมื่อเข้าถึงและใช้เว็บไซต์นี้ คุณยอมรับข้อกำหนดและเงื่อนไขต่อไปนี้"
  },
  termsUseTitle: {
    pt: "Uso do Site", en: "Website Use", es: "Uso del Sitio", ar: "استخدام الموقع",
    de: "Nutzung der Website", nl: "Gebruik van de Website", tl: "Paggamit ng Website", tr: "Web Sitesi Kullanımı", bs: "Korištenje stranice", fr: "Utilisation du Site", it: "Uso del Sito", hu: "Weboldal használata", pl: "Korzystanie ze strony", "pt-pt": "Uso do Site", ro: "Utilizarea Site-ului", sr: "Korišćenje stranice", th: "การใช้เว็บไซต์"
  },
  termsUseContent: {
    pt: "O conteúdo deste site é fornecido apenas para fins informativos e de entretenimento. Você concorda em usar o site de forma responsável e em conformidade com todas as leis aplicáveis. É proibido usar o site para atividades ilegais ou prejudiciais.",
    en: "The content of this website is provided for informational and entertainment purposes only. You agree to use the site responsibly and in compliance with all applicable laws. Using the site for illegal or harmful activities is prohibited.",
    es: "El contenido de este sitio web se proporciona solo con fines informativos y de entretenimiento. Usted acepta usar el sitio de manera responsable y de acuerdo con todas las leyes aplicables. Está prohibido usar el sitio para actividades ilegales o dañinas.",
    ar: "يتم توفير محتوى هذا الموقع لأغراض إعلامية وترفيهية فقط. توافق على استخدام الموقع بمسؤولية وبما يتوافق مع جميع القوانين المعمول بها. يُحظر استخدام الموقع للأنشطة غير القانونية أو الضارة.",
    de: "Der Inhalt dieser Website dient nur zu Informations- und Unterhaltungszwecken. Sie stimmen zu, die Website verantwortungsvoll und in Übereinstimmung mit allen geltenden Gesetzen zu nutzen.",
    nl: "De inhoud van deze website is alleen bedoeld voor informatieve en entertainmentdoeleinden. U stemt ermee in de site verantwoordelijk te gebruiken en in overeenstemming met alle toepasselijke wetten.",
    tl: "Ang nilalaman ng website na ito ay ibinibigay para sa impormasyon at entertainment lamang. Sumasang-ayon kang gamitin ang site nang responsable at ayon sa lahat ng naaangkop na batas.",
    tr: "Bu web sitesinin içeriği yalnızca bilgilendirme ve eğlence amaçlı sunulmaktadır. Siteyi sorumlu bir şekilde ve geçerli tüm yasalara uygun olarak kullanmayı kabul ediyorsunuz.",
    bs: "Sadržaj ove web stranice pružen je samo u informativne i zabavne svrhe. Slažete se da ćete stranicu koristiti odgovorno i u skladu sa svim primjenjivim zakonima.",
    fr: "Le contenu de ce site Web est fourni à des fins d'information et de divertissement uniquement. Vous acceptez d'utiliser le site de manière responsable et conformément à toutes les lois applicables.",
    it: "Il contenuto di questo sito web è fornito solo a scopo informativo e di intrattenimento. Accetti di utilizzare il sito in modo responsabile e nel rispetto di tutte le leggi applicabili.",
    hu: "Ennek a weboldalnak a tartalma csak tájékoztatási és szórakoztatási célokra szolgál. Ön vállalja, hogy felelősségteljesen és a vonatkozó jogszabályoknak megfelelően használja az oldalt.",
    pl: "Treść tej strony internetowej jest udostępniana wyłącznie w celach informacyjnych i rozrywkowych. Zgadzasz się korzystać ze strony w sposób odpowiedzialny i zgodny ze wszystkimi obowiązującymi przepisami.",
    "pt-pt": "O conteúdo deste site é fornecido apenas para fins informativos e de entretenimento. Concorda em usar o site de forma responsável e em conformidade com todas as leis aplicáveis.",
    ro: "Conținutul acestui site web este furnizat doar în scopuri informative și de divertisment. Sunteți de acord să utilizați site-ul în mod responsabil și în conformitate cu toate legile aplicabile.",
    sr: "Sadržaj ove veb stranice pružen je samo u informativne i zabavne svrhe. Slažete se da ćete stranicu koristiti odgovorno i u skladu sa svim primenjivim zakonima.",
    th: "เนื้อหาของเว็บไซต์นี้มีไว้เพื่อวัตถุประสงค์ด้านข้อมูลและความบันเทิงเท่านั้น คุณตกลงที่จะใช้เว็บไซต์อย่างรับผิดชอบและปฏิบัติตามกฎหมายที่เกี่ยวข้องทั้งหมด"
  },
  termsIntellectualTitle: {
    pt: "Propriedade Intelectual", en: "Intellectual Property", es: "Propiedad Intelectual", ar: "الملكية الفكرية",
    de: "Geistiges Eigentum", nl: "Intellectueel Eigendom", tl: "Intelektwal na Ari-arian", tr: "Fikri Mülkiyet", bs: "Intelektualno vlasništvo", fr: "Propriété Intellectuelle", it: "Proprietà Intellettuale", hu: "Szellemi tulajdon", pl: "Własność intelektualna", "pt-pt": "Propriedade Intelectual", ro: "Proprietate Intelectuală", sr: "Intelektualno vlasništvo", th: "ทรัพย์สินทางปัญญา"
  },
  termsIntellectualContent: {
    pt: "Todo o conteúdo do Labxat, incluindo textos, gráficos, logos, ícones e software, é propriedade do Labxat ou de seus criadores de conteúdo e está protegido por leis de direitos autorais. É proibida a reprodução não autorizada.",
    en: "All Labxat content, including texts, graphics, logos, icons and software, is the property of Labxat or its content creators and is protected by copyright laws. Unauthorized reproduction is prohibited.",
    es: "Todo el contenido de Labxat, incluidos textos, gráficos, logotipos, iconos y software, es propiedad de Labxat o de sus creadores de contenido y está protegido por las leyes de derechos de autor. Se prohíbe la reproducción no autorizada.",
    ar: "جميع محتويات Labxat، بما في ذلك النصوص والرسومات والشعارات والأيقونات والبرامج، هي ملك Labxat أو منشئي المحتوى التابعين له ومحمية بموجب قوانين حقوق النشر. النسخ غير المصرح به محظور.",
    de: "Alle Labxat-Inhalte, einschließlich Texte, Grafiken, Logos, Icons und Software, sind Eigentum von Labxat oder seinen Inhaltserstellern und durch Urheberrechtsgesetze geschützt.",
    nl: "Alle Labxat-inhoud, inclusief teksten, afbeeldingen, logo's, pictogrammen en software, is eigendom van Labxat of zijn contentmakers en wordt beschermd door auteursrechtwetten.",
    tl: "Lahat ng nilalaman ng Labxat, kabilang ang mga teksto, graphics, logos, icons at software, ay pag-aari ng Labxat o ng mga tagalikha ng nilalaman nito at protektado ng mga batas sa copyright.",
    tr: "Metinler, grafikler, logolar, simgeler ve yazılımlar dahil tüm Labxat içeriği, Labxat'a veya içerik oluşturucularına aittir ve telif hakkı yasalarıyla korunmaktadır.",
    bs: "Sav sadržaj Labxat-a, uključujući tekstove, grafike, logotipe, ikone i softver, vlasništvo je Labxat-a ili njegovih kreatora sadržaja i zaštićen je zakonima o autorskim pravima.",
    fr: "Tout le contenu de Labxat, y compris les textes, graphiques, logos, icônes et logiciels, est la propriété de Labxat ou de ses créateurs de contenu et est protégé par les lois sur le droit d'auteur.",
    it: "Tutti i contenuti di Labxat, inclusi testi, grafica, loghi, icone e software, sono di proprietà di Labxat o dei suoi creatori di contenuti e sono protetti dalle leggi sul copyright.",
    hu: "A Labxat minden tartalma, beleértve a szövegeket, grafikákat, logókat, ikonokat és szoftvereket, a Labxat vagy tartalomkészítőinek tulajdona, és szerzői jogi törvények védik.",
    pl: "Cała zawartość Labxat, w tym teksty, grafiki, logo, ikony i oprogramowanie, jest własnością Labxat lub twórców treści i jest chroniona prawem autorskim.",
    "pt-pt": "Todo o conteúdo do Labxat, incluindo textos, gráficos, logos, ícones e software, é propriedade do Labxat ou dos seus criadores de conteúdo e está protegido por leis de direitos de autor.",
    ro: "Tot conținutul Labxat, inclusiv texte, grafică, logo-uri, pictograme și software, este proprietatea Labxat sau a creatorilor săi de conținut și este protejat de legile privind drepturile de autor.",
    sr: "Sav sadržaj Labxat-a, uključujući tekstove, grafike, logotipe, ikone i softver, vlasništvo je Labxat-a ili njegovih kreatora sadržaja i zaštićen je zakonima o autorskim pravima.",
    th: "เนื้อหาทั้งหมดของ Labxat รวมถึงข้อความ กราฟิก โลโก้ ไอคอน และซอฟต์แวร์ เป็นทรัพย์สินของ Labxat หรือผู้สร้างเนื้อหาและได้รับการคุ้มครองโดยกฎหมายลิขสิทธิ์"
  },
  termsLiabilityTitle: {
    pt: "Limitação de Responsabilidade", en: "Limitation of Liability", es: "Limitación de Responsabilidad", ar: "تحديد المسؤولية",
    de: "Haftungsbeschränkung", nl: "Beperking van Aansprakelijkheid", tl: "Limitasyon ng Pananagutan", tr: "Sorumluluk Sınırlaması", bs: "Ograničenje odgovornosti", fr: "Limitation de Responsabilité", it: "Limitazione di Responsabilità", hu: "Felelősség korlátozása", pl: "Ograniczenie odpowiedzialności", "pt-pt": "Limitação de Responsabilidade", ro: "Limitarea Răspunderii", sr: "Ograničenje odgovornosti", th: "ข้อจำกัดความรับผิดชอบ"
  },
  termsLiabilityContent: {
    pt: "O Labxat não se responsabiliza por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou incapacidade de usar este site. Usamos ferramentas de terceiros e não garantimos disponibilidade contínua.",
    en: "Labxat is not liable for any direct, indirect, incidental or consequential damages resulting from the use or inability to use this website. We use third-party tools and do not guarantee continuous availability.",
    es: "Labxat no es responsable de ningún daño directo, indirecto, incidental o consecuente resultante del uso o la incapacidad de usar este sitio web. Usamos herramientas de terceros y no garantizamos disponibilidad continua.",
    ar: "Labxat غير مسؤول عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية ناتجة عن استخدام هذا الموقع أو عدم القدرة على استخدامه. نستخدم أدوات طرف ثالث ولا نضمن التوفر المستمر.",
    de: "Labxat haftet nicht für direkte, indirekte, zufällige oder Folgeschäden, die aus der Nutzung oder der Unfähigkeit zur Nutzung dieser Website entstehen.",
    nl: "Labxat is niet aansprakelijk voor directe, indirecte, incidentele of gevolgschade als gevolg van het gebruik of het onvermogen om deze website te gebruiken.",
    tl: "Ang Labxat ay hindi mananagot para sa anumang direkta, hindi direkta, insidental o consequential na pinsala na nagmumula sa paggamit o kawalan ng kakayahang gamitin ang website na ito.",
    tr: "Labxat, bu web sitesinin kullanımından veya kullanılamamasından kaynaklanan doğrudan, dolaylı, arızi veya sonuç olarak ortaya çıkan zararlardan sorumlu değildir.",
    bs: "Labxat nije odgovoran za bilo kakve direktne, indirektne, slučajne ili posljedične štete koje proizlaze iz korištenja ili nemogućnosti korištenja ove web stranice.",
    fr: "Labxat n'est pas responsable des dommages directs, indirects, accessoires ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser ce site Web.",
    it: "Labxat non è responsabile per eventuali danni diretti, indiretti, incidentali o consequenziali derivanti dall'uso o dall'impossibilità di utilizzare questo sito web.",
    hu: "A Labxat nem vállal felelősséget a weboldal használatából vagy használhatatlanságából eredő közvetlen, közvetett, véletlen vagy következményes károkért.",
    pl: "Labxat nie ponosi odpowiedzialności za jakiekolwiek bezpośrednie, pośrednie, przypadkowe lub wynikowe szkody wynikające z korzystania lub niemożności korzystania z tej strony internetowej.",
    "pt-pt": "O Labxat não se responsabiliza por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou incapacidade de usar este site.",
    ro: "Labxat nu este răspunzător pentru daune directe, indirecte, incidentale sau consecutive care rezultă din utilizarea sau incapacitatea de a utiliza acest site web.",
    sr: "Labxat nije odgovoran za bilo kakve direktne, indirektne, slučajne ili posledične štete koje proizlaze iz korišćenja ili nemogućnosti korišćenja ove veb stranice.",
    th: "Labxat ไม่รับผิดชอบต่อความเสียหายโดยตรง โดยอ้อม โดยบังเอิญ หรือเป็นผลสืบเนื่องจากการใช้หรือไม่สามารถใช้เว็บไซต์นี้ได้"
  },
  termsAcceptTitle: {
    pt: "Aceitação dos Termos", en: "Acceptance of Terms", es: "Aceptación de los Términos", ar: "قبول الشروط",
    de: "Annahme der Bedingungen", nl: "Acceptatie van Voorwaarden", tl: "Pagtanggap ng mga Tuntunin", tr: "Şartların Kabulü", bs: "Prihvatanje uslova", fr: "Acceptation des Conditions", it: "Accettazione dei Termini", hu: "Feltételek elfogadása", pl: "Akceptacja warunków", "pt-pt": "Aceitação dos Termos", ro: "Acceptarea Termenilor", sr: "Prihvatanje uslova", th: "การยอมรับข้อกำหนด"
  },
  termsAcceptContent: {
    pt: "Ao continuar a usar o Labxat, você confirma que leu, entendeu e concorda com estes Termos de Serviço. Reservamo-nos o direito de modificar estes termos a qualquer momento.",
    en: "By continuing to use Labxat, you confirm that you have read, understood and agree to these Terms of Service. We reserve the right to modify these terms at any time.",
    es: "Al continuar usando Labxat, confirma que ha leído, entendido y acepta estos Términos de Servicio. Nos reservamos el derecho de modificar estos términos en cualquier momento.",
    ar: "من خلال الاستمرار في استخدام Labxat، فإنك تؤكد أنك قد قرأت وفهمت ووافقت على شروط الخدمة هذه. نحتفظ بالحق في تعديل هذه الشروط في أي وقت.",
    de: "Durch die weitere Nutzung von Labxat bestätigen Sie, dass Sie diese Nutzungsbedingungen gelesen, verstanden und akzeptiert haben. Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern.",
    nl: "Door Labxat te blijven gebruiken, bevestigt u dat u deze Servicevoorwaarden hebt gelezen, begrepen en ermee akkoord gaat. We behouden ons het recht voor om deze voorwaarden op elk moment te wijzigen.",
    tl: "Sa patuloy na paggamit ng Labxat, kinukumpirma mo na nabasa, naunawaan at sumasang-ayon ka sa mga Tuntunin ng Serbisyong ito. Inilalaan namin ang karapatan na baguhin ang mga tuntuning ito anumang oras.",
    tr: "Labxat'ı kullanmaya devam ederek bu Hizmet Şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi onaylarsınız. Bu şartları herhangi bir zamanda değiştirme hakkını saklı tutarız.",
    bs: "Nastavkom korištenja Labxat-a potvrđujete da ste pročitali, razumjeli i prihvatili ove Uvjete korištenja. Zadržavamo pravo izmjene ovih uvjeta u bilo kojem trenutku.",
    fr: "En continuant à utiliser Labxat, vous confirmez avoir lu, compris et accepté ces Conditions d'utilisation. Nous nous réservons le droit de modifier ces conditions à tout moment.",
    it: "Continuando a utilizzare Labxat, confermi di aver letto, compreso e accettato questi Termini di Servizio. Ci riserviamo il diritto di modificare questi termini in qualsiasi momento.",
    hu: "A Labxat további használatával megerősíti, hogy elolvasta, megértette és elfogadja ezeket a Szolgáltatási feltételeket. Fenntartjuk a jogot, hogy bármikor módosítsuk ezeket a feltételeket.",
    pl: "Kontynuując korzystanie z Labxat, potwierdzasz, że przeczytałeś, zrozumiałeś i zgadzasz się z niniejszymi Warunkami usługi. Zastrzegamy sobie prawo do zmiany tych warunków w dowolnym momencie.",
    "pt-pt": "Ao continuar a usar o Labxat, confirma que leu, compreendeu e concorda com estes Termos de Serviço. Reservamo-nos o direito de modificar estes termos a qualquer momento.",
    ro: "Continuând să utilizați Labxat, confirmați că ați citit, înțeles și sunteți de acord cu acești Termeni de Serviciu. Ne rezervăm dreptul de a modifica acești termeni în orice moment.",
    sr: "Nastavljanjem korišćenja Labxat-a potvrđujete da ste pročitali, razumeli i prihvatili ove Uslove korišćenja. Zadržavamo pravo izmene ovih uslova u bilo kom trenutku.",
    th: "เมื่อใช้ Labxat ต่อไป คุณยืนยันว่าคุณได้อ่าน เข้าใจ และยอมรับข้อกำหนดในการให้บริการเหล่านี้ เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา"
  },
  termsOfService: {
    pt: "Termos", en: "Terms", es: "Términos", ar: "الشروط",
    de: "AGB", nl: "Voorwaarden", tl: "Mga Tuntunin", tr: "Şartlar", bs: "Uslovi", fr: "Conditions", it: "Termini", hu: "Feltételek", pl: "Warunki", "pt-pt": "Termos", ro: "Termeni", sr: "Uslovi", th: "ข้อกำหนด"
  },

  // ===== Additional UI strings (pt + en, with auto-fallback) =====
  // NotFound page
  notFoundTitle: { pt: "Página não encontrada", en: "Page not found" },
  notFoundDesc: { pt: "Oops! A página que você procura não existe.", en: "Oops! The page you're looking for doesn't exist." },
  returnHome: { pt: "Voltar para o início", en: "Return to Home" },

  // Works page
  worksTitle: { pt: "Meus Trabalhos", en: "My Works", es: "Mis Trabajos", fr: "Mes Travaux", it: "I Miei Lavori", de: "Meine Arbeiten" },
  worksSubtitle: {
    pt: "Uma seleção dos projetos que desenvolvi para meus clientes",
    en: "A selection of projects I've developed for my clients",
    es: "Una selección de proyectos que he desarrollado para mis clientes",
    fr: "Une sélection de projets que j'ai développés pour mes clients",
  },

  // Common actions
  back: { pt: "Voltar", en: "Back", es: "Volver", fr: "Retour", it: "Indietro", de: "Zurück", ar: "رجوع" },
  copy: { pt: "Copiar", en: "Copy", es: "Copiar", fr: "Copier", it: "Copia", de: "Kopieren" },
  copied: { pt: "Copiado!", en: "Copied!", es: "¡Copiado!", fr: "Copié!", it: "Copiato!", de: "Kopiert!" },
  copyError: { pt: "Erro ao copiar", en: "Copy failed", es: "Error al copiar", fr: "Échec de la copie" },
  share: { pt: "Compartilhar", en: "Share", es: "Compartir", fr: "Partager", it: "Condividi", de: "Teilen" },
  linkCopied: { pt: "Link copiado!", en: "Link copied!", es: "¡Enlace copiado!", fr: "Lien copié!" },
  loading: { pt: "Carregando...", en: "Loading...", es: "Cargando...", fr: "Chargement..." },

  // Floating radio
  playRadio: { pt: "Tocar rádio", en: "Play radio", es: "Reproducir radio", fr: "Lancer la radio" },
  pauseRadio: { pt: "Pausar rádio", en: "Pause radio", es: "Pausar radio", fr: "Mettre la radio en pause" },

  // Floating language selector
  changeLanguage: { pt: "Mudar idioma", en: "Change language", es: "Cambiar idioma", fr: "Changer de langue" },

  // Blog
  blogTitle: { pt: "Blog Labxat", en: "Labxat Blog" },
  blogSubtitle: {
    pt: "Tech, curiosidades e comunicação — um artigo novo todos os dias.",
    en: "Tech, curiosities and communication — a new article every day.",
  },
  blogEmpty: { pt: "Nenhum artigo publicado ainda. Volte em breve!", en: "No articles published yet. Check back soon!" },
  blogAll: { pt: "Todos", en: "All", es: "Todos", fr: "Tous", it: "Tutti", de: "Alle" },
  blogBack: { pt: "Voltar ao Blog", en: "Back to Blog" },
  blogMinRead: { pt: "min de leitura", en: "min read" },
  blogViews: { pt: "visualizações", en: "views" },
  blogMore: { pt: "Ver mais artigos", en: "See more articles" },
  catTech: { pt: "Tech", en: "Tech" },
  catCuriosities: { pt: "Curiosidades", en: "Curiosities", es: "Curiosidades", fr: "Curiosités" },
  catCommunication: { pt: "Comunicação", en: "Communication", es: "Comunicación", fr: "Communication" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectInitialLanguage = (): Language => {
  if (typeof window === "undefined") return "pt";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;
  } catch { /* ignore */ }
  const nav = window.navigator?.language?.toLowerCase() ?? "";
  if (nav.startsWith("pt-pt")) return "pt-pt";
  if (nav.startsWith("pt")) return "pt";
  const short = nav.split("-")[0] as Language;
  if (SUPPORTED_LANGUAGES.includes(short)) return short;
  return "pt";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    } catch { /* ignore */ }
  }, [language]);

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || entry.pt || key;
  };

  const isRTL = language === "ar";


const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
