// Data and pure booking rules. No DOM here, so test.html can check it directly.

const GENRES = [
  ['action', 'แอ็กชัน'], ['comedy', 'คอมเมดี้'], ['horror', 'สยองขวัญ'], ['romance', 'โรแมนติก'],
  ['drama', 'ดราม่า'], ['scifi', 'ไซไฟ'], ['animation', 'แอนิเมชัน'],
];

// shortcut: sample movies, branches and showtimes, replace with the real API when there is one.
const MOVIES = [
  { id: 'm1', title: 'เงาสุดท้ายแห่งเยาวราช', genres: ['action', 'drama'], mins: 128, rate: 'น18+', c1: '#7a1420' },
  { id: 'm2', title: 'หอพักเลขสิบสาม', genres: ['horror'], mins: 104, rate: 'น18+', c1: '#10231f' },
  { id: 'm3', title: 'รักนะ แต่ขอกลับบ้านก่อน', genres: ['comedy', 'romance'], mins: 112, rate: 'ท', c1: '#b8366b' },
  { id: 'm4', title: 'ดาวดวงที่เก้า', genres: ['scifi', 'drama'], mins: 141, rate: 'น13+', c1: '#16185a' },
  { id: 'm5', title: 'แมวส้มผู้กอบกู้ตลาดน้ำ', genres: ['animation', 'comedy'], mins: 95, rate: 'ท', c1: '#b34a12' },
  { id: 'm6', title: 'ทางกลับริมโขง', genres: ['drama'], mins: 122, rate: 'น13+', c1: '#274b52' },
  { id: 'm7', title: 'ล่าข้ามรางรถไฟ', genres: ['action'], mins: 118, rate: 'น15+', c1: '#26262e' },
  { id: 'm8', title: 'สัญญาณจากใต้ทะเล', genres: ['scifi', 'horror'], mins: 116, rate: 'น15+', c1: '#04283f' },
  { id: 'm9', title: 'ร้านกาแฟตอนตีสอง', genres: ['romance', 'drama'], mins: 109, rate: 'น13+', c1: '#3a2342' },
  { id: 'm10', title: 'แก๊งป้าข้างบ้าน', genres: ['comedy', 'action'], mins: 101, rate: 'น13+', c1: '#6a2c91' },
  { id: 'm11', title: 'มังกรกระดาษ', genres: ['animation'], mins: 92, rate: 'ท', c1: '#0e6b5c' },
  { id: 'm12', title: 'เสียงเรียกจากบ่อน้ำ', genres: ['horror', 'drama'], mins: 99, rate: 'น18+', c1: '#1b1b1b' },
];

const AREAS = [
  ['central', 'กรุงเทพฯ ชั้นใน'], ['north', 'กรุงเทพฯ เหนือ'], ['east', 'กรุงเทพฯ ตะวันออก'],
  ['west', 'กรุงเทพฯ ตะวันตก'], ['metro', 'ปริมณฑล'], ['upcountry', 'ต่างจังหวัด'],
];

const CINEMAS = [
  { id: 'c1', name: 'สาขาสยาม', area: 'central' }, { id: 'c2', name: 'สาขาอโศก', area: 'central' },
  { id: 'c3', name: 'สาขารัชโยธิน', area: 'north' }, { id: 'c4', name: 'สาขาหลักสี่', area: 'north' },
  { id: 'c5', name: 'สาขาบางนา', area: 'east' }, { id: 'c6', name: 'สาขารามอินทรา', area: 'east' },
  { id: 'c7', name: 'สาขาปิ่นเกล้า', area: 'west' }, { id: 'c8', name: 'สาขาบางแค', area: 'west' },
  { id: 'c9', name: 'สาขารังสิต', area: 'metro' }, { id: 'c10', name: 'สาขาเมืองทอง', area: 'metro' },
  { id: 'c11', name: 'สาขาเชียงใหม่', area: 'upcountry' }, { id: 'c12', name: 'สาขาภูเก็ต', area: 'upcountry' },
  { id: 'c13', name: 'สาขาขอนแก่น', area: 'upcountry' },
];

const SIZES = [['S', 'เล็ก'], ['M', 'กลาง'], ['L', 'ใหญ่']];
const FLAVORS = [['salted', 'เค็ม'], ['caramel', 'คาราเมล'], ['cheese', 'ชีส'], ['butter', 'เนย']];
const POPCORN = { flavored: true, food: 'ป๊อปคอร์น', foodSizes: ['32 ออนซ์', '46 ออนซ์', '85 ออนซ์'] };
const DRINK_SIZES = ['16 ออนซ์', '22 ออนซ์', '32 ออนซ์'];
// prices follow SIZES order; movie buckets have one fixed size
const SNACKS = [
  ...MOVIES.map(m => ({ id: `set-${m.id}`, movie: m.id, flavored: true, color: m.c1, image: `images/bucket-${m.genres[0]}.svg`, name: `ถังลาย ${m.title}`, desc: 'ถังป๊อปคอร์นลายหนังเรื่องนี้ ของสะสม พร้อมป๊อปคอร์นเต็มถัง', prices: [299] })),
  { id: 'single', ...POPCORN, image: 'images/set-single.svg', name: 'ชุดเดี่ยว', drinks: 1, prices: [119, 149, 179] },
  { id: 'couple', ...POPCORN, image: 'images/set-couple.svg', name: 'ชุดคู่', drinks: 2, prices: [199, 249, 299] },
  { id: 'family', ...POPCORN, image: 'images/set-family.svg', name: 'ชุดครอบครัว', foods: 2, drinks: 4, prices: [349, 419, 489] },
  { id: 'nachos', food: 'นาโชส์', foodSizes: ['ถาดเล็ก', 'ถาดกลาง', 'ถาดใหญ่'], image: 'images/set-nachos.svg', name: 'ชุดนาโชส์', drinks: 1, prices: [129, 159, 189] },
  { id: 'hotdog', food: 'ฮอตดอก', foodSizes: ['4 นิ้ว', '6 นิ้ว', '8 นิ้ว'], image: 'images/set-hotdog.svg', name: 'ชุดฮอตดอก', drinks: 1, prices: [109, 139, 169] },
  { id: 'cookie', food: 'คุกกี้', foodSizes: ['2 ชิ้น', '3 ชิ้น', '4 ชิ้น'], drink: 'นม', drinkSizes: ['8 ออนซ์', '12 ออนซ์', '16 ออนซ์'], image: 'images/set-cookie.svg', name: 'Cookie and Milk', drinks: 1, prices: [99, 129, 159] },
  { id: 'popcorn', alone: true, flavored: true, image: 'images/item-popcorn.svg', name: 'ป๊อปคอร์น', foodSizes: POPCORN.foodSizes, prices: [70, 90, 120] },
  { id: 'item-nachos', alone: true, image: 'images/item-nachos.svg', name: 'นาโชส์ชีส', foodSizes: ['ถาดเล็ก', 'ถาดกลาง', 'ถาดใหญ่'], prices: [90, 120, 150] },
  { id: 'item-hotdog', alone: true, image: 'images/item-hotdog.svg', name: 'ฮอตดอก', foodSizes: ['4 นิ้ว', '6 นิ้ว', '8 นิ้ว'], prices: [60, 80, 100] },
  { id: 'item-cookie', alone: true, image: 'images/item-cookie.svg', name: 'คุกกี้', foodSizes: ['2 ชิ้น', '3 ชิ้น', '4 ชิ้น'], prices: [50, 70, 90] },
  { id: 'item-milk', alone: true, image: 'images/item-milk.svg', name: 'นม', foodSizes: ['8 ออนซ์', '12 ออนซ์', '16 ออนซ์'], prices: [35, 45, 55] },
  { id: 'soda', alone: true, image: 'images/item-soda.svg', name: 'น้ำอัดลม', foodSizes: DRINK_SIZES, prices: [40, 60, 80] },
  { id: 'water', alone: true, image: 'images/item-water.svg', name: 'น้ำเปล่า', desc: 'ขวด 600 มล.', prices: [30] },
];
const flavorKey = picked => FLAVORS.map(f => f[0]).filter(f => picked.includes(f)).join('+');

// Cart keys are id:size or id:size:salted+cheese.
function snackOption(key) {
  const [id, size, flavorPart, extra] = key.split(':');
  const s = SNACKS.find(x => x.id === id);
  if (!s || extra !== undefined) return null;
  const i = s.prices.length === 1 ? (size === 'ONE' ? 0 : -1) : SIZES.findIndex(x => x[0] === size);
  if (i < 0) return null;
  const picked = flavorPart ? flavorPart.split('+') : [];
  if (s.flavored ? !picked.length || flavorKey(picked) !== flavorPart : picked.length) return null;
  const sizeLabel = s.prices.length === 1 ? '' : SIZES[i][1];
  const flavorText = picked.map(f => FLAVORS.find(x => x[0] === f)[1]).join('+');
  const label = `${s.name}${sizeLabel ? ` (${sizeLabel})` : ''}${flavorText ? ` รส${flavorText}` : ''}`;
  return { ...s, key, size, label, short: [sizeLabel, flavorText].filter(Boolean).join(' · '), price: s.prices[i] };
}
function sizeNote(set, i) {
  const count = n => (n > 1 ? ` ×${n}` : '');
  const food = `${set.food ? `${set.food} ` : ''}${set.foodSizes[i]}${count(set.foods)}`;
  return set.drinks ? `${food} · ${set.drink ?? 'น้ำอัดลม'} ${(set.drinkSizes ?? DRINK_SIZES)[i]}${count(set.drinks)}` : food;
}
const snacksFor = movieId => SNACKS.filter(s => !s.movie || s.movie === movieId);
const MAX_SNACK_QTY = 10;

// shortcut: sample ads for this site's own movies and snacks, plug in real advertisers when there are any.
const ADS = [
  { title: 'ชุดคู่ เริ่ม 199 บาท', text: 'สั่งพร้อมจองตั๋ว รับได้เลยไม่ต้องต่อคิว', cta: 'เลือกหนังรอบรัก', href: '#/movie/m3', c1: '#a3271f' },
  { title: 'ดาวดวงที่เก้า', text: 'ไซไฟเรื่องใหม่ เข้าฉายแล้ววันนี้', cta: 'ดูรอบฉาย', href: '#/movie/m4', c1: '#16185a' },
  { title: 'พาเด็กๆ ไปตลาดน้ำ', text: 'แมวส้มผู้กอบกู้ตลาดน้ำ สนุกทั้งครอบครัว', cta: 'ดูรอบฉาย', href: '#/movie/m5', c1: '#b34a12' },
];

const PERIODS = [['morning', 'เช้า (ก่อน 12:00)'], ['afternoon', 'บ่าย (12:00–16:59)'], ['evening', 'เย็น–ค่ำ (17:00 ขึ้นไป)']];
const ROWS = [...'ABCDEFGHIJ'];
const PREMIUM_ROWS = ['I', 'J'];
const SEATS_PER_ROW = 10;
const ALL_SEATS = ROWS.flatMap(r => Array.from({ length: SEATS_PER_ROW }, (_, i) => r + (i + 1)));
const PRICE = { normal: 220, premium: 280 };
const MAX_SEATS = 8;

function hash(s) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  // FNV's low bits barely mix, and callers use % on them.
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  return (h ^ (h >>> 15)) >>> 0;
}

const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function nextDays(now, count = 7) {
  return Array.from({ length: count }, (_, i) => ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)));
}

function moviesByGenre(genre) {
  return genre === 'all' ? MOVIES : MOVIES.filter(m => m.genres.includes(genre));
}

function showtimes(movieId, cinemaId, date) {
  if (hash(movieId + cinemaId) % 4 === 0) return []; // not every branch plays every movie
  const h = hash(movieId + cinemaId + date);
  const start = 600 + (h % 8) * 15;
  const gap = 150 + ((h >>> 8) % 3) * 15;
  const count = 3 + ((h >>> 4) % 3);
  return Array.from({ length: count }, (_, i) => start + i * gap)
    .filter(m => m <= 23 * 60 + 30)
    .map(m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
}

const isPast = (date, time, now) => new Date(`${date}T${time}`) <= now;

function inPeriod(time, period) {
  const h = Number(time.slice(0, 2));
  if (period === 'morning') return h < 12;
  if (period === 'afternoon') return h >= 12 && h < 17;
  if (period === 'evening') return h >= 17;
  return true;
}

function findShowings({ movieId, date, area = 'all', cinema = 'all', period = 'all', now }) {
  return CINEMAS
    .filter(c => (area === 'all' || c.area === area) && (cinema === 'all' || c.id === cinema))
    .map(c => ({ cinema: c, times: showtimes(movieId, c.id, date).filter(t => !isPast(date, t, now) && inPeriod(t, period)) }))
    .filter(r => r.times.length);
}

// A show key doubles as the URL path: movie/cinema/date/time.
function parseShow(key, now) {
  const [movieId, cinemaId, date, time, extra] = key.split('/');
  const movie = MOVIES.find(m => m.id === movieId);
  const cinema = CINEMAS.find(c => c.id === cinemaId);
  if (!movie || !cinema || extra !== undefined || !nextDays(now).includes(date)) return null;
  if (!showtimes(movieId, cinemaId, date).includes(time) || isPast(date, time, now)) return null;
  return { movie, cinema, date, time };
}

function takenSeats(show, booked = []) {
  const taken = new Set(booked);
  for (const seat of ALL_SEATS) if (hash(show + seat) % 4 === 0) taken.add(seat);
  return taken;
}

const seatPrice = seat => (PREMIUM_ROWS.includes(seat[0]) ? PRICE.premium : PRICE.normal);
const totalPrice = seats => seats.reduce((sum, s) => sum + seatPrice(s), 0);

function changeSnack(snacks, key, delta) {
  if (!snackOption(key)) return snacks;
  const qty = Math.min(MAX_SNACK_QTY, Math.max(0, (snacks[key] ?? 0) + delta));
  const { [key]: _old, ...rest } = snacks;
  return qty ? { ...rest, [key]: qty } : rest;
}

const snackLines = snacks => Object.keys(snacks).map(snackOption).filter(Boolean)
  .map(o => ({ ...o, qty: snacks[o.key] }))
  .sort((a, b) => SNACKS.findIndex(s => s.id === a.id) - SNACKS.findIndex(s => s.id === b.id) || a.key.localeCompare(b.key));
const orderTotal = (seats, snacks) => totalPrice(seats) + snackLines(snacks).reduce((sum, s) => sum + s.price * s.qty, 0);

function toggleSeat(selected, seat, taken) {
  if (taken.has(seat) || !ALL_SEATS.includes(seat)) return selected;
  if (selected.includes(seat)) return selected.filter(s => s !== seat);
  return selected.length >= MAX_SEATS ? selected : [...selected, seat];
}

const validEmail = s => s.length <= 254 && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(s);

function luhn(digits) {
  let sum = 0;
  [...digits].reverse().forEach((ch, i) => {
    const d = Number(ch) * (i % 2 ? 2 : 1);
    sum += d > 9 ? d - 9 : d;
  });
  return sum % 10 === 0;
}

function validateCard({ number, exp, cvc, name }, now) {
  const errors = {};
  const digits = number.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits) || !luhn(digits)) errors.number = 'หมายเลขบัตรไม่ถูกต้อง';
  const m = exp.match(/^(\d\d)\/(\d\d)$/);
  if (!m || +m[1] < 1 || +m[1] > 12) errors.exp = 'กรอกวันหมดอายุเป็น ดด/ปป';
  else if (new Date(2000 + +m[2], +m[1], 1) <= now) errors.exp = 'บัตรนี้หมดอายุแล้ว';
  if (!/^\d{3,4}$/.test(cvc)) errors.cvc = 'CVV ต้องเป็นตัวเลข 3–4 หลัก';
  if (!name.trim()) errors.name = 'กรอกชื่อบนบัตร';
  return errors;
}

const toHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

async function hashPassword(password, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/../g), h => parseInt(h, 16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 210000 }, key, 256);
  return toHex(new Uint8Array(bits));
}
