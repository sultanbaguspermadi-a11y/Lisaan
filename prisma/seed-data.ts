/**
 * Data contoh untuk Lisaan. Konten Arab di sini WAJIB divalidasi guru bahasa Arab
 * sebelum dipakai di produksi.
 *
 * Format baris: kategori[,kategori]|arab|transliterasi|jenis|gender|akar|arti-id;arti-id|arti-en[|status]
 * jenis: n=isim, v=fi'il, a=sifat, p=ibarat/frasa. gender: m / f / kosong.
 */

export interface MajorSeed {
  slug: string
  nameId: string
  nameAr: string
  nameEn: string
  accent: string
}

export interface CategorySeed extends MajorSeed {
  /** slug jurusan; null = kategori umum */
  major: string | null
}

export const MAJORS: MajorSeed[] = [
  {
    slug: 'rpl',
    nameId: 'Rekayasa Perangkat Lunak',
    nameAr: 'هندسة البرمجيات',
    nameEn: 'Software Engineering',
    accent: '#0369A1',
  },
  { slug: 'akt', nameId: 'Akuntansi', nameAr: 'المحاسبة', nameEn: 'Accounting', accent: '#B45309' },
  {
    slug: 'tbkr',
    nameId: 'Teknik Bodi Kendaraan Ringan',
    nameAr: 'إصلاح هياكل السيارات',
    nameEn: 'Light Vehicle Body Repair',
    accent: '#BE123C',
  },
  {
    slug: 'tsm',
    nameId: 'Teknik Sepeda Motor',
    nameAr: 'هندسة الدراجات النارية',
    nameEn: 'Motorcycle Engineering',
    accent: '#15803D',
  },
]

export const CATEGORIES: CategorySeed[] = [
  {
    slug: 'umum',
    nameId: 'Umum',
    nameAr: 'عام',
    nameEn: 'General',
    accent: '#4F46E5',
    major: null,
  },
  {
    slug: 'islami',
    nameId: 'Islami dan sekolah',
    nameAr: 'إسلامي ومدرسي',
    nameEn: 'Islamic and school',
    accent: '#0F766E',
    major: null,
  },
  ...MAJORS.map((m) => ({ ...m, major: m.slug })),
]

const LINES = `
umum|كِتَابٌ|kitābun|n|m|ك ت ب|buku;kitab|book
umum|قَلَمٌ|qalamun|n|m||pena|pen
umum|مَدْرَسَةٌ|madrasatun|n|f|د ر س|sekolah|school
umum|مُعَلِّمٌ|mu‘allimun|n|m|ع ل م|guru|teacher
umum|طَالِبٌ|ṭālibun|n|m|ط ل ب|siswa;pelajar|student
umum|بَيْتٌ|baitun|n|m||rumah|house
umum|مَاءٌ|mā’un|n|m||air|water
umum|طَعَامٌ|ṭa‘āmun|n|m|ط ع م|makanan|food
umum|صَدِيقٌ|ṣadīqun|n|m|ص د ق|teman;sahabat|friend
umum|وَقْتٌ|waqtun|n|m||waktu|time
umum|يَوْمٌ|yaumun|n|m||hari|day
umum|بَابٌ|bābun|n|m||pintu|door
umum|نَافِذَةٌ|nāfidhatun|n|f||jendela|window
umum|كُرْسِيٌّ|kursiyyun|n|m||kursi|chair
umum|سَيَّارَةٌ|sayyāratun|n|f||mobil|car
umum|مَدِينَةٌ|madīnatun|n|f||kota|city
umum|شَارِعٌ|shāri‘un|n|m||jalan|street
umum|سُوقٌ|sūqun|n|m||pasar|market
umum|كَبِيرٌ|kabīrun|a|m||besar|big
umum|صَغِيرٌ|ṣaghīrun|a|m||kecil|small
umum|جَدِيدٌ|jadīdun|a|m||baru|new
umum|جَمِيلٌ|jamīlun|a|m||indah;cantik|beautiful
umum|كَتَبَ|kataba|v||ك ت ب|menulis|to write
umum|قَرَأَ|qara’a|v||ق ر أ|membaca|to read
umum|ذَهَبَ|dhahaba|v||ذ ه ب|pergi|to go
umum|أَكَلَ|akala|v||أ ك ل|makan|to eat
umum|شَرِبَ|shariba|v||ش ر ب|minum|to drink
umum|دَرَسَ|darasa|v||د ر س|belajar|to study
islami|صَلَاةٌ|ṣalātun|n|f|ص ل و|salat;shalat|prayer
islami|صَوْمٌ|ṣaumun|n|m|ص و م|puasa|fasting
islami|زَكَاةٌ|zakātun|n|f||zakat|zakat
islami|حَجٌّ|ḥajjun|n|m||haji|pilgrimage
islami|قُرْآنٌ|qur’ānun|n|m|ق ر أ|Al-Qur’an|the Quran
islami|مَسْجِدٌ|masjidun|n|m|س ج د|masjid|mosque
islami|دُعَاءٌ|du‘ā’un|n|m|د ع و|doa|supplication
islami|وُضُوءٌ|wuḍū’un|n|m||wudu|ablution
islami|إِيمَانٌ|īmānun|n|m|أ م ن|iman|faith
islami|سُورَةٌ|sūratun|n|f||surah|chapter of the Quran
islami|آيَةٌ|āyatun|n|f||ayat|verse
islami|نَبِيٌّ|nabiyyun|n|m||nabi|prophet
islami|صَبْرٌ|ṣabrun|n|m|ص ب ر|sabar|patience
islami,umum|شُكْرٌ|shukrun|n|m|ش ك ر|syukur;terima kasih|gratitude
islami|عِلْمٌ|‘ilmun|n|m|ع ل م|ilmu;pengetahuan|knowledge
islami|فَصْلٌ|faṣlun|n|m||kelas|classroom
islami|امْتِحَانٌ|imtiḥānun|n|m|م ح ن|ujian|exam
islami,umum|دَرْسٌ|darsun|n|m|د ر س|pelajaran|lesson
islami|مُدِيرٌ|mudīrun|n|m|د و ر|kepala sekolah;direktur|principal
islami|مَكْتَبَةٌ|maktabatun|n|f|ك ت ب|perpustakaan|library
rpl|بَرْنَامِجٌ|barnāmajun|n|m||program|program
rpl|حَاسُوبٌ|ḥāsūbun|n|m|ح س ب|komputer|computer
rpl|شَبَكَةٌ|shabakatun|n|f||jaringan|network
rpl|بَيَانَاتٌ|bayānātun|n|f|ب ي ن|data|data
rpl|قَاعِدَةُ بَيَانَاتٍ|qā‘idatu bayānātin|p||ق ع د|basis data|database
rpl|مَوْقِعٌ|mauqi‘un|n|m|و ق ع|situs web;lokasi|website
rpl|تَطْبِيقٌ|taṭbīqun|n|m|ط ب ق|aplikasi|application
rpl|لُغَةُ الْبَرْمَجَةِ|lughatu l-barmajati|p||ل غ و|bahasa pemrograman|programming language
rpl|رَمْزٌ|ramzun|n|m|ر م ز|kode;simbol|code
rpl,umum|خَطَأٌ|khaṭa’un|n|m|خ ط أ|kesalahan;bug|error
rpl|كَلِمَةُ الْمُرُورِ|kalimatu l-murūri|p||ك ل م|kata sandi|password
rpl|لَوْحَةُ الْمَفَاتِيحِ|lauḥatu l-mafātīḥi|p||ل و ح|papan ketik|keyboard
rpl|شَاشَةٌ|shāshatun|n|f||layar|screen
rpl|طَابِعَةٌ|ṭābi‘atun|n|f|ط ب ع|printer|printer
rpl|مِلَفٌّ|milaffun|n|m|ل ف ف|berkas;file|file
rpl|نِظَامُ التَّشْغِيلِ|niẓāmu t-tashghīli|p||ن ظ م|sistem operasi|operating system
rpl|خَادِمٌ|khādimun|n|m|خ د م|server;pelayan|server
rpl|تَحْمِيلٌ|taḥmīlun|n|m|ح م ل|unduhan;pemuatan|download
rpl|تَصْمِيمٌ|taṣmīmun|n|m|ص م م|desain|design
rpl|أَمْنٌ|amnun|n|m|أ م ن|keamanan|security
rpl|اِخْتِبَارٌ|ikhtibārun|n|m|خ ب ر|pengujian;tes|testing
rpl|بَرْمَجَ|barmaja|v||ب ر م ج|memprogram|to program
akt|مُحَاسَبَةٌ|muḥāsabatun|n|f|ح س ب|akuntansi|accounting
akt|مِيزَانِيَّةٌ|mīzāniyyatun|n|f|و ز ن|anggaran;neraca|budget; balance sheet
akt|فَاتُورَةٌ|fātūratun|n|f||faktur|invoice
akt|دَفْتَرٌ|daftarun|n|m||buku catatan;buku besar|ledger
akt|إِيرَادٌ|īrādun|n|m|و ر د|pendapatan|revenue
akt|مَصْرُوفٌ|maṣrūfun|n|m|ص ر ف|beban;pengeluaran|expense
akt|رِبْحٌ|ribḥun|n|m|ر ب ح|laba;untung|profit
akt|خَسَارَةٌ|khasāratun|n|f|خ س ر|rugi;kerugian|loss
akt|دَيْنٌ|dainun|n|m|د ي ن|utang|debt
akt|رَأْسُ الْمَالِ|ra’su l-māli|p||ر أ س|modal|capital
akt|ضَرِيبَةٌ|ḍarībatun|n|f|ض ر ب|pajak|tax
akt|سِعْرٌ|si‘run|n|m|س ع ر|harga|price
akt|نَقْدٌ|naqdun|n|m|ن ق د|tunai;uang tunai|cash
akt|حِسَابٌ|ḥisābun|n|m|ح س ب|akun;rekening;hitungan|account
akt|بَنْكٌ|bankun|n|m||bank|bank
akt|إِيصَالٌ|īṣālun|n|m|و ص ل|kuitansi;tanda terima|receipt
akt|مُرَاجَعَةٌ|murāja‘atun|n|f|ر ج ع|audit;peninjauan|audit
akt|تَقْرِيرٌ|taqrīrun|n|m|ق ر ر|laporan|report
akt,umum|دَفَعَ|dafa‘a|v||د ف ع|membayar;mendorong|to pay
akt|مُوَظَّفٌ|muwaẓẓafun|n|m|و ظ ف|karyawan;pegawai|employee
akt|رَاتِبٌ|rātibun|n|m|ر ت ب|gaji|salary
akt|مَخْزُونٌ|makhzūnun|n|m|خ ز ن|persediaan;stok|inventory
tbkr|هَيْكَلٌ|haikalun|n|m||rangka;bodi|body frame
tbkr|طِلَاءٌ|ṭilā’un|n|m|ط ل ي|cat;lapisan cat|paint
tbkr|دَهَانٌ|dahānun|n|m|د ه ن|pengecatan|painting
tbkr|لَحَامٌ|laḥāmun|n|m|ل ح م|pengelasan;las|welding
tbkr|مِطْرَقَةٌ|miṭraqatun|n|f|ط ر ق|palu|hammer
tbkr|مِفَكٌّ|mifakkun|n|m|ف ك ك|obeng|screwdriver
tbkr|مِفْتَاحُ رَبْطٍ|miftāḥu rabṭin|p||ف ت ح|kunci pas|wrench
tbkr|مِصْبَاحٌ|miṣbāḥun|n|m|ص ب ح|lampu|lamp
tbkr|زُجَاجٌ|zujājun|n|m||kaca|glass
tbkr|صَدَأٌ|ṣada’un|n|m||karat|rust
tbkr|صَنْفَرَةٌ|ṣanfaratun|n|f||pengamplasan|sanding
tbkr|مِبْرَدٌ|mibradun|n|m|ب ر د|kikir|file (tool)
tbkr|إِطَارٌ|iṭārun|n|m||ban;bingkai|tire
tbkr|غِطَاءُ الْمُحَرِّكِ|ghiṭā’u l-muḥarriki|p||غ ط ي|kap mesin|hood
tbkr|مِرْآةٌ|mir’ātun|n|f|ر أ ي|kaca spion;cermin|mirror
tbkr|خَدْشٌ|khadshun|n|m|خ د ش|goresan|scratch
tbkr|صَدْمَةٌ|ṣadmatun|n|f|ص د م|benturan;penyok|dent
tbkr,tsm|إِصْلَاحٌ|iṣlāḥun|n|m|ص ل ح|perbaikan|repair
tbkr|فَكَّ|fakka|v||ف ك ك|melepas;membuka|to detach
tbkr|رَكَّبَ|rakkaba|v||ر ك ب|memasang;merakit|to install
tbkr|قِيَاسٌ|qiyāsun|n|m|ق ي س|pengukuran|measurement
tbkr|قُفَّازَاتٌ|quffāzātun|n|f||sarung tangan|gloves
tbkr|مُعَدَّاتُ السَّلَامَةِ|mu‘addātu s-salāmati|p||ع د د|perlengkapan keselamatan|safety equipment
tsm|دَرَّاجَةٌ نَارِيَّةٌ|darrājatun nāriyyatun|p||د ر ج|sepeda motor|motorcycle
tsm|مُحَرِّكٌ|muḥarrikun|n|m|ح ر ك|mesin;motor|engine
tsm,umum|زَيْتٌ|zaitun|n|m||oli;minyak|oil
tsm|بَنْزِينٌ|banzīnun|n|m||bensin|gasoline
tsm|مَكْبَحٌ|makbaḥun|n|m|ك ب ح|rem|brake
tsm|سِلْسِلَةٌ|silsilatun|n|f|س ل س ل|rantai|chain
tsm|شَمْعَةُ الإِشْعَالِ|sham‘atu l-ish‘āli|p||ش م ع|busi|spark plug
tsm|بَطَّارِيَّةٌ|baṭṭāriyyatun|n|f||aki;baterai|battery
tsm|مِكْبَسٌ|mikbasun|n|m|ك ب س|piston|piston
tsm|صِمَامٌ|ṣimāmun|n|m|ص م م|katup;klep|valve
tsm|مِرْشَحُ الْهَوَاءِ|mirshaḥu l-hawā’i|p||ر ش ح|filter udara|air filter
tsm|عَادِمٌ|‘ādimun|n|m|ع د م|knalpot;gas buang|exhaust
tsm|قَابِضٌ|qābiḍun|n|m|ق ب ض|kopling|clutch
tsm|عُلْبَةُ السُّرْعَةِ|‘ulbatu s-sur‘ati|p||ع ل ب|transmisi;gigi|gearbox
tsm|وَقُودٌ|waqūdun|n|m|و ق د|bahan bakar|fuel
tsm|تَبْرِيدٌ|tabrīdun|n|m|ب ر د|pendinginan|cooling
tsm|صِيَانَةٌ|ṣiyānatun|n|f|ص و ن|perawatan|maintenance
tsm|فَحْصٌ|faḥṣun|n|m|ف ح ص|pemeriksaan|inspection
tsm|مِقْوَدٌ|miqwadun|n|m|ق و د|setang;kemudi|handlebar
tsm|كَهْرَبَاءُ|kahrabā’u|n|f||kelistrikan;listrik|electricity
tsm|شَدَّ|shadda|v||ش د د|mengencangkan;menarik|to tighten
tsm|تَشْحِيمٌ|tashḥīmun|n|m|ش ح م|pelumasan;pemberian gemuk|greasing
tsm|ضَغْطٌ|ḍaghṭun|n|m|ض غ ط|tekanan|pressure
tsm|دَوَّاسَةٌ|dawwāsatun|n|f|د و س|pedal|pedal
tsm|أَدَارَ|adāra|v||د و ر|menghidupkan;memutar|to start; to turn
islami|رَسُولٌ|rasūlun|n|m|ر س ل|rasul;utusan|messenger|REVIEW
rpl|ذَاكِرَةٌ|dhākiratun|n|f|ذ ك ر|memori|memory|DRAFT
`

export interface EntrySeed {
  categories: string[]
  headword: string
  translit: string
  pos: 'NOUN' | 'VERB' | 'ADJECTIVE' | 'PHRASE'
  gender: 'MASCULINE' | 'FEMININE' | null
  root: string | null
  meaningsId: string[]
  meaningsEn: string[]
  status: 'PUBLISHED' | 'REVIEW' | 'DRAFT'
}

const POS = { n: 'NOUN', v: 'VERB', a: 'ADJECTIVE', p: 'PHRASE' } as const
const GENDER = { m: 'MASCULINE', f: 'FEMININE' } as const

export const ENTRIES: EntrySeed[] = LINES.trim()
  .split('\n')
  .map((line) => {
    const [cats, headword, translit, pos, gender, root, id, en, status] = line.split('|')
    return {
      categories: cats!.split(','),
      headword: headword!,
      translit: translit!,
      pos: POS[pos as keyof typeof POS],
      gender: gender ? GENDER[gender as keyof typeof GENDER] : null,
      root: root || null,
      meaningsId: id!.split(';'),
      meaningsEn: en!.split(';'),
      status: (status as EntrySeed['status'] | undefined) ?? 'PUBLISHED',
    }
  })

/** Bentuk jamak, per slug. */
export const PLURALS: Record<string, string> = {
  kitabun: 'كُتُبٌ',
  qalamun: 'أَقْلَامٌ',
  madrasatun: 'مَدَارِسُ',
  baitun: 'بُيُوتٌ',
  babun: 'أَبْوَابٌ',
  sayyaratun: 'سَيَّارَاتٌ',
  madinatun: 'مُدُنٌ',
  suqun: 'أَسْوَاقٌ',
  sadiqun: 'أَصْدِقَاءُ',
  muallimun: 'مُعَلِّمُونَ',
  talibun: 'طُلَّابٌ',
  masjidun: 'مَسَاجِدُ',
  nabiyyun: 'أَنْبِيَاءُ',
  ayatun: 'آيَاتٌ',
  mitraqatun: 'مَطَارِقُ',
  shabakatun: 'شَبَكَاتٌ',
  milaffun: 'مِلَفَّاتٌ',
  shashatun: 'شَاشَاتٌ',
  daftarun: 'دَفَاتِرُ',
  faturatun: 'فَوَاتِيرُ',
  muwazzafun: 'مُوَظَّفُونَ',
  daribatun: 'ضَرَائِبُ',
  muharrikun: 'مُحَرِّكَاتٌ',
  simamun: 'صَمَّامَاتٌ',
  makbahun: 'مَكَابِحُ',
  battariyyatun: 'بَطَّارِيَّاتٌ',
  itarun: 'إِطَارَاتٌ',
  miratun: 'مَرَايَا',
}

/** Bentuk kata kerja, per slug: madhi, mudhari', amr, masdar. */
export const VERB_FORMS: Record<
  string,
  { madhi: string; mudhari: string; amr: string; masdar: string }
> = {
  kataba: { madhi: 'كَتَبَ', mudhari: 'يَكْتُبُ', amr: 'اُكْتُبْ', masdar: 'كِتَابَةٌ' },
  qaraa: { madhi: 'قَرَأَ', mudhari: 'يَقْرَأُ', amr: 'اِقْرَأْ', masdar: 'قِرَاءَةٌ' },
  dhahaba: { madhi: 'ذَهَبَ', mudhari: 'يَذْهَبُ', amr: 'اِذْهَبْ', masdar: 'ذَهَابٌ' },
  akala: { madhi: 'أَكَلَ', mudhari: 'يَأْكُلُ', amr: 'كُلْ', masdar: 'أَكْلٌ' },
  shariba: { madhi: 'شَرِبَ', mudhari: 'يَشْرَبُ', amr: 'اِشْرَبْ', masdar: 'شُرْبٌ' },
  darasa: { madhi: 'دَرَسَ', mudhari: 'يَدْرُسُ', amr: 'اُدْرُسْ', masdar: 'دِرَاسَةٌ' },
}

/** Contoh kalimat, per slug: [Arab, Indonesia]. */
export const EXAMPLES: Record<string, [string, string]> = {
  kitabun: ['هَذَا كِتَابٌ جَدِيدٌ.', 'Ini buku baru.'],
  qalamun: ['أَيْنَ الْقَلَمُ؟', 'Di mana pena itu?'],
  madrasatun: ['أَذْهَبُ إِلَى الْمَدْرَسَةِ كُلَّ يَوْمٍ.', 'Saya pergi ke sekolah setiap hari.'],
  muallimun: ['الْمُعَلِّمُ فِي الْفَصْلِ.', 'Guru ada di kelas.'],
  baitun: ['الْبَيْتُ كَبِيرٌ.', 'Rumah itu besar.'],
  kataba: ['كَتَبَ الطَّالِبُ الدَّرْسَ.', 'Siswa itu menulis pelajaran.'],
  qaraa: ['قَرَأْتُ الْكِتَابَ.', 'Saya membaca buku itu.'],
  salatun: ['أُصَلِّي فِي الْمَسْجِدِ.', 'Saya salat di masjid.'],
  sabrun: ['الصَّبْرُ جَمِيلٌ.', 'Sabar itu indah.'],
  barnamajun: ['هَذَا بَرْنَامِجٌ جَدِيدٌ.', 'Ini program baru.'],
  khataun: ['فِي الْبَرْنَامِجِ خَطَأٌ.', 'Ada kesalahan di program.'],
  muhasabatun: ['أَدْرُسُ الْمُحَاسَبَةَ فِي الْمَدْرَسَةِ.', 'Saya belajar akuntansi di sekolah.'],
  faturatun: ['أَيْنَ الْفَاتُورَةُ؟', 'Di mana fakturnya?'],
  mitraqatun: ['الْمِطْرَقَةُ فِي الْوَرْشَةِ.', 'Palu itu ada di bengkel.'],
  muharrikun: ['الْمُحَرِّكُ جَدِيدٌ.', 'Mesinnya baru.'],
  zaitun: ['أُغَيِّرُ الزَّيْتَ.', 'Saya mengganti oli.'],
}
