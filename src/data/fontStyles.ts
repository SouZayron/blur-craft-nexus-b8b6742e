// Font styles database with 139 unique Unicode character mappings
export interface FontStyle {
  id: number;
  name: string;
  alphabet: string;
  numbers: string;
}

const baseAlphabet = "abcdefghijklmnopqrstuvwxyz";
const baseNumbers = "1234567890";

export const fontStyles: FontStyle[] = [
  { id: 1, name: "Brisa Elegante", alphabet: "𝑎𝑏𝑐𝑑𝑒𝑓𝑔𝘩𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧", numbers: "𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶" },
  { id: 2, name: "Titã Negrito", alphabet: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳", numbers: "𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟎" },
  { id: 3, name: "Sans Suave", alphabet: "𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓", numbers: "𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫𝟢" },
  { id: 4, name: "Real Majestoso", alphabet: "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛", numbers: "𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟎" },
  { id: 5, name: "Mono Digital", alphabet: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣", numbers: "𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶" },
  { id: 6, name: "Lilia Delicada", alphabet: "αbcdefghıjklmnopqrstuvwxчz", numbers: "1234567890" },
  { id: 7, name: "Realeza Dourada", alphabet: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃", numbers: "𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟎" },
  { id: 8, name: "Sans Forte", alphabet: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇", numbers: "𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵𝟬" },
  { id: 9, name: "Smooth Fusion", alphabet: "αвc∂єƒgнιנкℓмησρqяѕтυνωxyz", numbers: "1234567890" },
  { id: 10, name: "Cavaleiro Medieval", alphabet: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟", numbers: "𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟎" },
  { id: 11, name: "Itálico Clássico", alphabet: "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤$𝑥$𝑦$𝑧", numbers: "𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶" },
  { id: 12, name: "Anão Místico", alphabet: "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖ۹ʳˢᵗᵘᵛʷˣʸᶻ", numbers: "¹²³⁴⁵⁶⁷⁸⁹⁰" },
  { id: 13, name: "Cherokee Ancestral", alphabet: "ꭺᏼꮯꭰꭼғꮐꮋꮖꭻꮶꮮꮇɴꮻꮲꮔꭱꮪꭲꮜꮩꮃxꭹꮓ", numbers: "1234567890" },
  { id: 14, name: "Escrita Real", alphabet: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏", numbers: "𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶" },
  { id: 15, name: "Capitais Leves", alphabet: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘϙʀsᴛᴜᴠᴡxʏᴢ", numbers: "1234567890" },
  { id: 16, name: "Script Suave", alphabet: "ɑbcdefghijklmnopqɾstuvwxγz", numbers: "1234567890" },
  { id: 17, name: "Tai Le Oriental", alphabet: "ᥲbᥴdᥱfghιjkᥣmᥒoρqrstᥙvᥕxყz", numbers: "1234567890" },
  { id: 18, name: "Cherokee Místico", alphabet: "ᎯᏰᏣᎠᏋ𐠰ᎶᎻᏐᏠᏦᏓᎷᏁᎧᎮᎤᎡᏕͳᏬᏉᏯxᎩፚ", numbers: "1234567890" },
  { id: 19, name: "Sans Itálico", alphabet: "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻", numbers: "𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫𝟢" },
  { id: 20, name: "Sans Bold Itálico", alphabet: "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯", numbers: "𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵𝟬" },
  { id: 21, name: "Sereno Tranquilo", alphabet: "ᥲᑲᥴᏧᥱ𝖿ɡhιȷkᥣɱᥒoρɋɾstυνωxყᴢ", numbers: "1234567890" },
  { id: 22, name: "Script Personalizado", alphabet: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏", numbers: "𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶" },
  { id: 23, name: "Double Struck", alphabet: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫", numbers: "𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡𝟘" },
  { id: 24, name: "Fraktur Editado", alphabet: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝐤𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝐲𝖟", numbers: "𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟎" },
  { id: 25, name: "Anão Pequenino", alphabet: "ₐᵦ꜀𑀘ₑ𝔣₉ₕᵢⱼₖₗₘₙₒₚᵩᵣₛₜᵤᵥ⧢ₓᵧ₂", numbers: "₁₂₃₄₅₆₇₈₉₀" },
  { id: 26, name: "Fraktur Normal", alphabet: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷", numbers: "𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶" },
  { id: 27, name: "Grego Itálico", alphabet: "𝛼𝑏𝑐𝜕𝜀𝑓𝑔𝘩𝜄𝑗𝜅𝑙𝑚𝜋𝜎𝜌𝑞𝑟𝑠𝜏𝜇𝜈𝜔x𝜑𝑧", numbers: "𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶" },
  { id: 28, name: "Tai Le Estilizado", alphabet: "ᥲᑲᥴᑯᥱƒɠᖾɩʝƙꙆຕᥒoρϙɾ⳽tᥙʋωxყⱬ", numbers: "1234567890" },
  { id: 29, name: "Recorte de Jornal", alphabet: "𝖺𝘣𝖼𝖽𝗲𝗳𝗴𝘩𝗂𝗃𝙠𝗹𝗺𝗇𝗼𝗽𝙦𝙧𝙨t𝗎𝘃𝘸𝘹𝘆𝘻", numbers: "𝟭𝟤𝟯𝟦𝟱𝟨𝟳𝟪𝟵𝟢" },
  { id: 30, name: "Smooth Russo", alphabet: "αвcɗєfgнιנкƖмησρqяѕтυνωxyуz", numbers: "1234567890" },
  { id: 31, name: "Espelhado", alphabet: "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz", numbers: "0987654321" },
  { id: 32, name: "Largura Total", alphabet: "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ", numbers: "１２３４５６７８９０" },
  { id: 33, name: "Canadense Curvo", alphabet: "ᥲᑲᥴᑯᥱƒɠᖾɩʝƙꙆຕᥒoρϙɾ⳽tᥙʋωxƳⱬ", numbers: "1234567890" },
  { id: 34, name: "Fonético Leve", alphabet: "ɑbcɗeʄgɦijƙlɱƞσpqɾstuvwxʮz", numbers: "1234567890" },
  { id: 35, name: "Script A", alphabet: "ɑbcdefghijklmnopqrstuvwxyz", numbers: "1234567890" },
  { id: 36, name: "Copta Padrão", alphabet: "ⲇⲃⲥ𝖽ⲉ⳨ⳋⲏⲓⳗⲕⳑⲙⲛⲟⲣⲫⲅ⳽ⲧⳙⳳⲱxⲩⲍ", numbers: "1234567890" },
  { id: 37, name: "Carrier Marcante", alphabet: "ᗩᗷᑕᗪᕮᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇSTᑌᐯᗯXYᘔ", numbers: "1234567890" },
  { id: 38, name: "Paleótipo", alphabet: "𝑎b𝑐d𝑒𝑓𝑔ℎ𝑖j𝑘𝑙mn𝑜p𝑞𝑟𝑠𝑡𝑢𝑣ɯx𝑦z", numbers: "1234567890" },
  { id: 39, name: "Messletters", alphabet: "αʙᴄɗєғɢʜɪᴊᴋƖຕηᴏᴘϙяѕᴛᴜᴠωxуᴢ", numbers: "1234567890" },
  { id: 40, name: "Grego Clássico", alphabet: "αbcδεfghιjκlmησρςrsτυνωxγz", numbers: "1234567890" },
  { id: 41, name: "Bandeiras", alphabet: "🇦​🇧​🇨​🇩​🇪​🇫​🇬​🇭​🇮​🇯​🇰​🇱​🇲​🇳​🇴​🇵​🇶​🇷​🇸​🇹​🇺​🇻​🇼​🇽​🇾​🇿​", numbers: "1234567890" },
  { id: 42, name: "Fonético Puro", alphabet: "ɑbcɗeʄƍɦijƙlɱƞσpqɾstʋνwxʮz", numbers: "1234567890" },
  { id: 43, name: "Fraktur Editado 2", alphabet: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧ƙ𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴x𝑦𝔷", numbers: "𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶" },
  { id: 44, name: "Clássico Simples", alphabet: "αв¢đefgħıנκłмиøρqяšтυνωxчz", numbers: "1234567890" },
  { id: 45, name: "Quadrado", alphabet: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉", numbers: "1234567890" },
  { id: 46, name: "Etrusco Antigo", alphabet: "𐌀𐌁𐌂𐌃𐌄𐌅Ᏽዞ𐌆𐐈𐌊𐌋ᛖᚢ𐌏𐌓𐌒ᚱ𐌔𐌕ⳘꓦⰞx𐌙Ⴭ", numbers: "1234567890" },
  { id: 47, name: "Fofo Estilizado", alphabet: "ɑҍϲժҽƒցհíᴊƙƖʍղօթqɾsեմѵաxყz", numbers: "1234567890" },
  { id: 48, name: "Messletters 2005", alphabet: "aв¢∂єƒgнιנкℓмησρqяѕтυνωxyуz", numbers: "1234567890" },
  { id: 49, name: "Russo Estilizado", alphabet: "ΛБϾÐΞŦGHłJКŁMЛФPǪЯSTUVШXЏZ", numbers: "1234567890" },
  { id: 50, name: "Cyber Shogun", alphabet: "卂乃匚刀乇下Ꮆ卄工丁长乚从几口尸㔿尺丂丅凵ᐯ山乂丫乙", numbers: "1234567890" },
  { id: 51, name: "Quadrado Preto", alphabet: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉", numbers: "1234567890" },
  { id: 52, name: "Georgiano I", alphabet: "aნcძefᲭჩiაklოიჾpჹჁsႵⴎvⴍxყⴭ", numbers: "1234567890" },
  { id: 53, name: "Fonético Arredondado", alphabet: "ɑɓcɗeʄɠɧijƙlɱɳσpʠɾstʋνwxʮz", numbers: "1234567890" },
  { id: 54, name: "Yi Tribal", alphabet: "ꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꂵꈤꂦꉣꆰꋪꌗ꓄ꀎꃴꅏxꌩꁴ", numbers: "1234567890" },
  { id: 55, name: "Copta Elegante", alphabet: "ⲁⲃⲥ𝖽ⲉ⳨ⳋⲏⳕⳗⲕⳑⲙⲛⲟⳏⲫⲅ⳽ⲧⳙⳳⲱxⲩⲹ", numbers: "1234567890" },
  { id: 56, name: "Jornal Maiúsculo", alphabet: "𝖠𝘉Ⲥ𝖣𝗘𝗙𝗚𝘏𐌉ᒍ𝙆𝗟𝝡𝖭𝝤𝝦𝑸𝙍𝗦ꔋꓴ𝗩𝘞X𝝪𝘡", numbers: "𝟭𝟤𝟯𝟦𝟱𝟨𝟳𝟪𝟵𝟢" },
  { id: 57, name: "Cute Delicado", alphabet: "ąɓƈɗҽƒɠɦíᴊƙƖɱղօƥʠɾʂƭʋⱱωxყz", numbers: "1234567890" },
  { id: 58, name: "Círculo Preto", alphabet: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩", numbers: "①②③④⑤⑥⑦⑧⑨⓪" },
  { id: 59, name: "Bold Fusion", alphabet: "αвcdεƒgнιjкlмиσρqяѕтυνωxчz", numbers: "1234567890" },
  { id: 60, name: "Runas Nórdicas", alphabet: "ᚣᛒᛈᚧᛊᚪᛩᚺᛁⳖⲔᚳᛖᚢᛜᚹᛰᚱᛢᚾⳘꓦⰞxᛉჍ", numbers: "1234567890" },
  { id: 61, name: "Africano 1982", alphabet: "ɑɓƈɗɛƒɠɦɩɟƙlmɲɔƥqɽsʈuʋωxƴz", numbers: "1234567890" },
  { id: 62, name: "Jornal Misto", alphabet: "𝖠𝘣Ⲥ𝖽𝗲𝗙𝗴𝘏𝗂ᒍ𝙠𝗟𝗺𝖭𝗼𝗽𝑸𝙍𝙨ꔋꓴ𝘃𝘞x𝘆𝘻", numbers: "𝟭𝟤𝟯𝟦𝟱𝟨𝟳𝟪𝟵𝟢" },
  { id: 63, name: "Malayalam Exótico", alphabet: "രദഭ໓૯౯൭৸౹ഽƙԼ൹റഠॽવଧട੮ಲ౮൰xഴജ", numbers: "౹੨੩੫ƼϬԴ੪੧੦" },
  { id: 64, name: "Manuscrito", alphabet: "αႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥ", numbers: "1234567890" },
  { id: 65, name: "Carrier Bold", alphabet: "ᗩᙖᙅᗪᙓᖴᘜᕼIᒍKᒪᙏᑎOᑭᑫᖇSTᙀᐯᙎXYᘔ", numbers: "1234567890" },
  { id: 66, name: "Riscado Duplo", alphabet: "₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄVWXɎⱫ", numbers: "1234567890" },
  { id: 67, name: "Estranho Único", alphabet: "ǟɮƈɖɛʄɢɦɨʝӄʟʍռօքզʀֆȶʊʋաxʏʐ", numbers: "1234567890" },
  { id: 68, name: "Grande Impacto", alphabet: "ƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜXƳȤ", numbers: "1234567890" },
  { id: 69, name: "Yi Marcante", alphabet: "ꋬꃳꉔ꒯ꏂꊰꍌꁝ꒐꒻ꀘ꒒ꂵꋊꄲꉣꆰꋪꇙ꓄꒤꒦ꅐxꌦꁴ", numbers: "1234567890" },
  { id: 70, name: "Canadense Enrolado", alphabet: "ᗣᙖᙅᙃᙓᖴᘜᕼꙆᒍКᒐᙏᙁOᕈᕋᖇᔑƮᙀᘎᙎXƳⱿ", numbers: "1234567890" },
  { id: 71, name: "Circulado", alphabet: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ", numbers: "①②③④⑤⑥⑦⑧⑨⓪" },
  { id: 72, name: "Gótico Dark", alphabet: "αβcδεŦĝhιjκlʍπøρφƦ$†uυωxψz", numbers: "1234567890" },
  { id: 73, name: "Etíope Místico", alphabet: "ልጔርᘑቿቻኗዘጎጋҞረጠክዐየዒዪនፕሁሆሠxሃጊ", numbers: "1234567890" },
  { id: 74, name: "Leet Hacker", alphabet: "48cd3f9h1jk1mn0pqr57uvwx2z", numbers: "1234567890" },
  { id: 75, name: "Escrita Artística", alphabet: "ձъƈժεբցհﻨյĸlოռօթզгรէսνաxყ২", numbers: "1234567890" },
  { id: 76, name: "Maníaco", alphabet: "Λɓ¢Ɗ£ƒɢɦĩʝҚŁɱהøṖҨŔŞŦŪƔωX¥Ẑ", numbers: "1234567890" },
  { id: 77, name: "Georgiano II", alphabet: "aზcᲫefᲭჩiაklღიᲒpჹჁsႵuvⴍxყⴭ", numbers: "1234567890" },
  { id: 78, name: "Riscado Leve", alphabet: "Ⱥƀȼđɇfǥħɨɉꝁłmnøᵽ𝚚ɍsŧᵾvwxɏƶ", numbers: "1ƻ34567890" },
  { id: 79, name: "Espelho Inverso", alphabet: "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz", numbers: "0987654321" },
  { id: 80, name: "Listras Diagonais", alphabet: "a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷", numbers: "1̷2̷3̷4̷5̷6̷7̷8̷9̷0̷" },
  { id: 81, name: "Russo Moderno", alphabet: "аъсᴅеfgніᴊкlмйѳрqяѕтuѵшxчz", numbers: "1234567890" },
  { id: 82, name: "Fita Tailandesa", alphabet: "ค๖¢໓ēfງhiວkl๓ຖ໐p๑rŞtนງຟxฯຊ", numbers: "1234567890" },
  { id: 83, name: "Fusão Cripto", alphabet: "αɓ૮∂εƒɠɦเʝҡℓɱɳσρφ૨รƭµѵωxყƶ", numbers: "1234567890" },
  { id: 84, name: "Turco", alphabet: "abçdefğhıjklmnöpqrştüvwxyz", numbers: "1234567890" },
  { id: 85, name: "Redemoinho", alphabet: "คც८ძ૯Բ૭ҺɿʆқՆɱՈ૦ƿҩՐς੮υ౮ωxע২", numbers: "1234567890" },
  { id: 86, name: "Incrível", alphabet: "αвcɔεғɢнıנκʟмпσρǫяƨтυνшxчz", numbers: "1234567890" },
  { id: 87, name: "Ucraniano", alphabet: "дьсdєfgнїjкlмйорqяsтцvшxуz", numbers: "1234567890" },
  { id: 88, name: "Pantera Negra", alphabet: "ΔBCDEҒGĦIJKLMṈOᕈⵕRSΓUVWXɎẔ", numbers: "1234567890" },
  { id: 89, name: "HIT Blocos", alphabet: "▞▖ꔪᑕᑐᕮ▐〓G▐▬▌▌▟▐❰▙▞▮▚▛▟▆▛█▙▛▖▟X▘▜▘", numbers: "1234567890" },
  { id: 90, name: "Grego Puro", alphabet: "λϐςdεғɢнιϳκlϻπσρφгsτυvшxψz", numbers: "1234567890" },
  { id: 91, name: "Fancy Curly", alphabet: "αв¢đefgħıנκłмиøρqяšтυνωxчz", numbers: "1234567890" },
  { id: 92, name: "Russo Clássico", alphabet: "дбсᴅеғɢ̆ніᴊкʟмпорϙгѕтцѵшxчᴢ", numbers: "1234567890" },
  { id: 93, name: "Yi Oito", alphabet: "ꁲꃃꇃꂡꏹꄙꁍꀍꀤꀭꈵ꒒ꂵꋊꁏꉣꆰꋪꌚꋖꌈꃴꅏxꂖꁴ", numbers: "1234567890" },
  { id: 94, name: "Mtavruli", alphabet: "aᲖcᲫefᲭᲩijkႱᲠnᲒpqჁsႵᲡvwxyz", numbers: "1234567890" },
  { id: 95, name: "Mistura Armênia", alphabet: "ԹՅՇԺȝԲԳɧɿʝƙʅʍՌԾρφՐՏԵՄעաxՎՀ", numbers: "1234567890" },
  { id: 96, name: "Listras Diagonais 2", alphabet: "a⃫b⃫c⃫d⃫e⃫f⃫g⃫h⃫i⃫j⃫k⃫l⃫m⃫n⃫o⃫p⃫q⃫r⃫s⃫t⃫u⃫v⃫w⃫x⃫y⃫z⃫", numbers: "1⃫2⃫3⃫4⃫5⃫6⃫7⃫8⃫9⃫0⃫" },
  { id: 97, name: "Átila", alphabet: "ᾄвƈḋἔғʛђἷʝќłмᾗὄῥqʀṩҭὗvᾧxẏẓ", numbers: "1234567890" },
  { id: 98, name: "Varetas", alphabet: "ᗅ𐌇ⵎ߄ⴹᖴ𐦰ᕼ𐌠ᒧᏦᒪᎷΠ☐ᚹ𐊻ᒥⵢꓔⵡ𝖵ⰞxΥꓜ", numbers: "1234567890" },
  { id: 99, name: "Yi Cinco", alphabet: "ꋫꃃꏸꁕꍟꄘꁍꑛꂑꀭꀗ꒒ꁒꁹꆂꉣꁸ꒓ꌚ꓅ꐇꏝꅏxꐟꁴ", numbers: "1234567890" },
  { id: 100, name: "Nuskhuri", alphabet: "aⴆⴀⴋefᲭⴌiაklⴅⴄⴃpჹⴡsⴕⴎvⴍxⴘⴭ", numbers: "1234567890" },
  { id: 101, name: "Pan Nigeriano", alphabet: "aɓcɗẹfghịjƙlmnọpqrṣtụvwxyz", numbers: "1234567890" },
  { id: 102, name: "CJK Oriental", alphabet: "凡乃ㄈ刀モ下G什ﾉﾌに乚州几ロ尸Q尺らイ凵レ山xㄚ乙", numbers: "1ᆯ3456ᆨ890" },
  { id: 103, name: "Deslize Suave", alphabet: "ค๒ς๔єŦɠђเןкl๓ภ๏թợгรtยvฬxץz", numbers: "1234567890" },
  { id: 104, name: "Emoji Fun", alphabet: "🙌🅱️🌜🧲ᦷ🗜️Ɠ♓🕴️🌶️ꡡ🛴Ⓜ️👖⭕🚩🍳®️💲🍄⛎✔️🔱X🏋️‍♂️💤", numbers: "1234567890" },
  { id: 105, name: "Excêntrico", alphabet: "αßςdεƒghïյκlmη⊕pΩrš†u∀ωxψz", numbers: "1234567890" },
  { id: 106, name: "Africano 1978", alphabet: "ɑɓc̱ɗɛƒgẖɪjƙlmŋɔpq̱ɍs̱ʈʊʋwxƴẕ", numbers: "1234567890" },
  { id: 107, name: "Amárico", alphabet: "ልBሮDEቼዖዜነJአረጤቤዕየዎዪኖቶህሆሠXሃሯ", numbers: "1234567890" },
  { id: 108, name: "Yi Seis", alphabet: "ꋬꍗꏳꂟꏂꄟꍌꃬ꒐꒻ꀘ꒒ꂵꂚꉻꉣꋠꋪꑄ꓄ꀎ꒦ꅏxꐞꑓ", numbers: "1234567890" },
  { id: 109, name: "Invertido", alphabet: "ɑpcqԍɻმμᴉๅĸɼwuobdʁƨϝnʌʍxλz", numbers: "1234567890" },
  { id: 110, name: "Scammer Fake", alphabet: "åbcděfghíjklmnøpqrstüvwxÿz", numbers: "1234567890" },
  { id: 111, name: "Yi Quatro", alphabet: "ꁲꋰꀯꂠꈼꄞꁅꍩꂑ꒻ꀗ꒒ꂵꋊꂦꉣꁷꌅꌚꋖꐇꀰꅏxꐞꁴ", numbers: "1234567890" },
  { id: 112, name: "Pontilhado", alphabet: "äḅċḋëḟġḧïjḳḷṁṅöṗqṛṡẗüṿẅẍÿż", numbers: "12ӟ4567890" },
  { id: 113, name: "Hyves Símbolo", alphabet: "ªß¢ð€fgh¡jk|mñ¤Þq®$tµvwxÿz", numbers: "1234567890" },
  { id: 114, name: "Mamãe Grande", alphabet: "| ̶̿ ̶̿ ̶̿ || ̶͇̿ ̶͇̿ ̶͇̿}| ͇̿ ͇̿ ͇̿ |͇̿ ͇̿ ͇̿ )|̶͇̿ ̶͇̿ ͇̿ |̶̿ ̶̿ ̶̿ ̶̿ | ͇̿ ͇̿ ̶͇̿⸥|̶ ̶ ̶ ̶|| ͇ ͇||⟨|͇ ͇ |̿ V ̿||̿ \\͇||͇̿ ͇̿ ͇̿ ͇̿||̶̿ ̶̿ ̶̿ ̶̿⸣|͇̿ ͇̿ ͇̿ ͇̖̿||̿ ̶̿ ᑊ╮ ͇ ͇\\̿ ̿  ̿ ̿|̿ ̿ |͇ ͇ ͇ ͇ ͇|\\ ͇ /|͇ Λ ͇|X╰|╯ ̿ ̿/ ͇ ͇ ", numbers: "1234567890" },
  { id: 115, name: "Rômico", alphabet: "ä̈bçᴅëfɢʜïɟᴋʟʍɴöp𝑞ʀšᴛüvɯxɣz", numbers: "1234567890" },
  { id: 116, name: "Curly Delicado", alphabet: "ąҍçժҽƒցհìʝҟӀʍղօքզɾʂէմѵաxվՀ", numbers: "𝟙ϩӠ५ƼϬ7𝟠९⊘" },
  { id: 117, name: "Parênteses", alphabet: "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵", numbers: "⑴⑵⑶⑷⑸⑹⑺⑻⑼⒪" },
  { id: 118, name: "Fashion Style", alphabet: "ąɓƈđε∱ɠɧïʆҡℓɱŋσþҩŗşŧų√щxγẕ", numbers: "1234567890" },
  { id: 119, name: "Slammer Impact", alphabet: "ǞвटDęբg৸ijκlɱПΦРqЯsƮЦvЩxყƵ", numbers: "1234567890" },
  { id: 120, name: "Yi Dois", alphabet: "ꁲꃳꏳꀷꑀꊯꁅꁝ꒐꒑ꈵ꒒ꂵꃔꊿꉣꋠꌅꈜꋖꌈ꒦ꅏxꑒꁴ", numbers: "1234567890" },
  { id: 121, name: "Celta Místico", alphabet: "მჩƈძεբցհἶʝƙlოղօրգɾʂէմνωxყz", numbers: "1ԶՅՎ56ԴՑԳ0" },
  { id: 122, name: "Cute Acentuado", alphabet: "ábćdéfǵhíjḱĺḿńőṕqŕśtúvẃxӳź", numbers: "1234567890" },
  { id: 123, name: "Cute Original", alphabet: "ʌƅƈɗєƒʛɦɪʝƙʅɱɲơƥƣɾƨƭυvɯxɣȥ", numbers: "1234567890" },
  { id: 124, name: "Estranho Mix", alphabet: "λßȻɖεʃĢħίĵκιɱɴΘρƣરȘτƲνώxϓՀ", numbers: "1234567890" },
  { id: 125, name: "Facebook Style", alphabet: "ᗅᙘᑤᗫᙍᖴᘜᕼᓿᒙᖽᐸᒪᙢᘉᓎᕿᕴᖇSᖶᑗᐻᙎXᖻZ", numbers: "1234567890" },
  { id: 126, name: "Vietnamita", alphabet: "ậbcđệfghịjklmnỗpqrstựvwxýz", numbers: "1234567890" },
  { id: 127, name: "DraKo Místico", alphabet: "ᕱც꒝Ꭰꂅꊰg♅ᎥϳКլოภԾᎵգᏒᏕϮuᏉᎳxᎩᏃ", numbers: "1234567890" },
  { id: 128, name: "Fonótipo Inglês", alphabet: "ɑьçđɛfgнїjкlmŋꝍрᶐrsƗʊvꭐxᶙz", numbers: "1234567890" },
  { id: 129, name: "Yi Sete", alphabet: "ꋫꃲꉓꃸꑾꄘꁅꃄ꒐꒑ꀗ꒒ꂵꁹꄱꉣꋟꋪꇘ꓅ꌇ꒦ꅏxꌥ꒗", numbers: "1234567890" },
  { id: 130, name: "HIT Impacto", alphabet: "▞▚▐▆ᑕ▐◗█☰█〓G█▬██▟█⮜█▄█▀█▀██▀████▀█▀▄▄█▀▀█▀X█▄█▀▄▀█▄█▄", numbers: "1234567890" },
  { id: 131, name: "Love Style", alphabet: "ᗩßƇDƐFƓĤĪĴҠĿᗰᑎ🖤ṖҨŔSƬƱѴѠXYZ", numbers: "1234567890" },
  { id: 132, name: "Facebook Bold", alphabet: "ᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚᖽᐸᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺᘺXᖻZ", numbers: "1234567890" },
  { id: 133, name: "Ondulado", alphabet: "ªb¢ÞÈF૬ɧÎjΚĻмη◊ǷƍrS⊥µ√wxýz", numbers: "1234567890" },
  { id: 134, name: "Nebuloso", alphabet: "ΛϦㄈÐƐFƓнɪﾌҚŁ௱ЛØþҨ尺らŤЦƔƜXϤẔ", numbers: "1234567890" },
  { id: 135, name: "Harmonia Heroica", alphabet: "åß¢Ðê£ghïjklmñðþqr§†µvwx¥z", numbers: "1234567890" },
  { id: 136, name: "Torcido", alphabet: "ÂßĈÐЄŦǤĦĪʖҚĿᗰИØPҨR$ƚЦVЩX￥Ẕ", numbers: "1234567890" },
  { id: 137, name: "Túrquico", alphabet: "äbçdefğhıjklmñöpqrştüvwxyz", numbers: "1234567890" },
  { id: 138, name: "Armênio", alphabet: "ձbՇժeբgիiյkւmղծթզԻՖԷևvաxyz", numbers: "1ՁՅՎ5Ճ7Ց90" },
  { id: 139, name: "Africano Moderno", alphabet: "aɓcɖɛƒghijklmŋɔpqrstuʋwxɣz", numbers: "1234567890" },
];

// Transform text using a specific font style
export function transformText(text: string, style: FontStyle): string {
  const lowerText = text.toLowerCase();
  let result = "";
  
  for (const char of lowerText) {
    const alphabetIndex = baseAlphabet.indexOf(char);
    const numberIndex = baseNumbers.indexOf(char);
    
    if (alphabetIndex !== -1 && alphabetIndex < style.alphabet.length) {
      // Get the character at the correct position
      const chars = [...style.alphabet];
      if (alphabetIndex < chars.length) {
        result += chars[alphabetIndex];
      } else {
        result += char;
      }
    } else if (numberIndex !== -1) {
      const numChars = [...style.numbers];
      if (numberIndex < numChars.length) {
        result += numChars[numberIndex];
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  return result;
}
