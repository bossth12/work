const {
  Alert, AppBar, Box, Button, ButtonBase, Card, CardActionArea, CardContent, Chip, Container, CssBaseline,
  Dialog, DialogContent, DialogTitle, Divider, IconButton, Paper, Snackbar, Stack, TextField, ThemeProvider,
  Tab, Tabs, ToggleButton, ToggleButtonGroup, Toolbar, Typography, createTheme,
} = MaterialUI;
const h = React.createElement;

const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#ffc045' }, secondary: { main: '#ff8a6b' } },
  typography: { fontFamily: "'IBM Plex Sans Thai', 'Noto Sans Thai', system-ui, sans-serif", button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 8 },
});

const baht = n => `${n.toLocaleString('th-TH')} บาท`;
const thaiDate = (date, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Date(`${date}T00:00`).toLocaleDateString('th-TH', opts);
const genreNames = m => m.genres.map(g => GENRES.find(x => x[0] === g)[1]).join(' · ');

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
};

// shortcut: accounts and tickets live in this browser only, move them to a server before real use.
const users = () => load('cs.users', {});
const tickets = () => load('cs.tickets', []);

const COOKIE_DAYS = 180;
function cookies() {
  try {
    return Object.fromEntries(document.cookie.split('; ').filter(Boolean).map(c => {
      const i = c.indexOf('=');
      return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
    }));
  } catch { return {}; }
}
const setCookie = (name, value) => { document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${COOKIE_DAYS * 86400}; path=/; SameSite=Lax`; };
const clearCookie = name => { document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`; };
const consent = () => cookies().cs_consent ?? null;
const remember = (name, value) => { if (consent() === 'yes') setCookie(name, value); };

// These two used to be saved without asking.
try { localStorage.removeItem('cs.session'); localStorage.removeItem('cs.area'); } catch {}

function currentEmail() {
  let email = cookies().cs_user ?? null;
  try { email = sessionStorage.getItem('cs.session') ?? email; } catch {}
  return email && users()[email] ? email : null;
}

// Without consent the login lasts only as long as this tab.
function setSession(email) {
  try {
    if (email) sessionStorage.setItem('cs.session', email);
    else sessionStorage.removeItem('cs.session');
  } catch {}
  if (email) remember('cs_user', email);
  else clearCookie('cs_user');
}

const currentUser = () => (currentEmail() ? { email: currentEmail(), ...users()[currentEmail()] } : null);

const state = {
  genre: 'all', date: null, period: 'all', area: AREAS.some(a => a[0] === cookies().cs_area) ? cookies().cs_area : 'all', cinema: 'all',
  cart: null, method: 'card', newTicket: null, snackSize: {}, snackFlavors: {}, snackTab: 'sets', toast: '', authOpen: false,
};
let rerender = () => {};
const update = change => { change(); rerender(); };
const toast = message => update(() => { state.toast = message; });

function setConsent(choice) {
  update(() => {
    if (choice) setCookie('cs_consent', choice);
    else clearCookie('cs_consent');
    if (choice === 'yes') {
      if (currentEmail()) setCookie('cs_user', currentEmail());
      setCookie('cs_area', state.area);
    } else {
      ['cs_user', 'cs_area', 'cs_contact'].forEach(clearCookie);
    }
  });
}

function chip(act, val, label, on, onClick) {
  return h(Chip, {
    key: val, label, clickable: true, onClick, color: on ? 'primary' : 'default', variant: on ? 'filled' : 'outlined',
    'aria-pressed': on, 'data-act': act, 'data-val': val, 'data-key': `${act}-${val}`,
  });
}
const Chips = ({ label, children }) => h(Box, { role: 'group', 'aria-label': label, sx: { display: 'flex', flexWrap: 'wrap', gap: 1 } }, children);

function Poster({ movie }) {
  return h(Box, { sx: { position: 'relative', aspectRatio: '2 / 3', display: 'flex', alignItems: 'flex-end', p: 1.5, bgcolor: movie.c1, color: '#fff' } },
    h('img', { className: 'art', src: `images/poster-${movie.genres[0]}.svg`, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }),
    h(Chip, { label: movie.rate, size: 'small', sx: { position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,.6)', color: '#fff' } }),
    h(Typography, { variant: 'h6', component: 'strong', sx: { position: 'relative', lineHeight: 1.3, textShadow: '0 1px 6px rgba(0,0,0,.8)' } }, movie.title));
}

function fakeQr(seed, label) {
  // shortcut: decorative pattern, not scannable; a payment gateway must issue the real QR payload.
  const size = 25;
  const finder = (x, y) => x >= 0 && y >= 0 && x < 7 && y < 7
    && (x === 0 || y === 0 || x === 6 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
  const nearCorner = (x, y) => (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);
  const cells = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const on = nearCorner(x, y)
        ? finder(x, y) || finder(x - (size - 7), y) || finder(x, y - (size - 7))
        : hash(`${seed}${x},${y}`) % 2 === 0;
      if (on) cells.push(h('rect', { key: `${x},${y}`, x, y, width: 1, height: 1 }));
    }
  }
  return h('svg', { className: 'qr', viewBox: `-2 -2 ${size + 4} ${size + 4}`, role: 'img', 'aria-label': label, width: 180, style: { background: '#fff', borderRadius: 6, flex: 'none' } }, cells);
}

const Empty = ({ text, children }) => h(Paper, { sx: { p: 5, mt: 2, textAlign: 'center' } }, h(Typography, { sx: { mb: 2 } }, text), children);
const Missing = ({ text }) => h(Empty, { text }, h(Button, { variant: 'contained', href: '#/' }, 'กลับหน้าแรก'));
const Back = ({ href, children }) => h(Button, { href, sx: { mb: 1, ml: -1 } }, `← ${children}`);

function Redirect() {
  // After paying, the hash has already moved to tickets when checkout redraws with an empty cart.
  React.useEffect(() => { if (/^#\/(snacks|checkout)/.test(location.hash)) location.hash = '#/'; }, []);
  return null;
}

function HomeView() {
  const list = moviesByGenre(state.genre);
  const pick = id => () => update(() => { state.genre = id; });
  return h(Box, null,
    h(Box, { component: 'section', 'aria-label': 'โฆษณา', sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 } },
      // One ad on phones, so the movies stay near the top.
      ADS.map((ad, i) => h(Card, { key: ad.href, className: 'ad', sx: { bgcolor: ad.c1, backgroundImage: 'none', color: '#fff', display: { xs: i ? 'none' : 'block', md: 'block' } } },
        h(CardActionArea, { href: ad.href, sx: { p: 2 } },
          h(Chip, { label: 'โฆษณา', size: 'small', sx: { bgcolor: 'rgba(0,0,0,.45)', color: '#fff', mb: 1 } }),
          h(Typography, { variant: 'h6' }, ad.title),
          h(Typography, { variant: 'body2' }, ad.text),
          h(Typography, { variant: 'body2', sx: { mt: 1, fontWeight: 600, textDecoration: 'underline' } }, ad.cta))))),
    h(Typography, { variant: 'h4', component: 'h1', sx: { mb: 2 } }, 'เลือกหนังตามหมวดที่ชอบ'),
    h(Chips, { label: 'หมวดหมู่หนัง' },
      chip('genre', 'all', 'ทั้งหมด', state.genre === 'all', pick('all')),
      GENRES.map(([id, label]) => chip('genre', id, label, state.genre === id, pick(id)))),
    h(Typography, { variant: 'body2', color: 'text.secondary', 'aria-live': 'polite', sx: { mt: 2 } }, `${list.length} เรื่องกำลังฉาย`),
    h(Box, { component: 'ul', className: 'movies', sx: { listStyle: 'none', p: 0, m: 0, mt: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(auto-fill, minmax(170px, 1fr))' } } },
      list.map(m => h('li', { key: m.id },
        h(Card, null, h(CardActionArea, { href: `#/movie/${m.id}` },
          h(Poster, { movie: m }),
          h(CardContent, { sx: { p: 1.5 } }, h(Typography, { variant: 'caption', color: 'text.secondary' }, `${genreNames(m)} · ${m.mins} นาที`))))))));
}

function MovieView({ id }) {
  const movie = MOVIES.find(m => m.id === id);
  if (!movie) return h(Missing, { text: 'ไม่พบหนังเรื่องนี้' });
  const now = new Date();
  const days = nextDays(now);
  if (!days.includes(state.date)) state.date = days[0];
  const inArea = findShowings({ movieId: id, date: state.date, area: state.area, period: state.period, now });
  // Only offer branches with rounds left, so the dropdown can't lead to an empty list.
  const branches = inArea.map(r => r.cinema);
  if (!branches.some(c => c.id === state.cinema)) state.cinema = 'all';
  const results = inArea.filter(r => state.cinema === 'all' || r.cinema.id === state.cinema);
  const setArea = area => update(() => { state.area = area; state.cinema = 'all'; remember('cs_area', area); });
  const heading = text => h(Typography, { variant: 'subtitle1', component: 'h2', sx: { fontWeight: 600 } }, text);

  return h(Box, null,
    h(Box, { sx: { display: 'flex', gap: 2, alignItems: 'flex-end', mb: 3 } },
      h(Card, { sx: { flex: '0 0 auto', width: { xs: 96, sm: 130 } } }, h(Poster, { movie })),
      h(Box, null,
        h(Typography, { variant: 'h4', component: 'h1' }, movie.title),
        h(Typography, { variant: 'body2', color: 'text.secondary' }, `${genreNames(movie)} · ${movie.mins} นาที · เรต ${movie.rate}`))),
    h(Paper, { className: 'filters', component: 'section', 'aria-label': 'เลือกวัน เวลา และสถานที่', sx: { p: 2.5, display: 'grid', gap: 1.5 } },
      heading('1. วันไหน'),
      h(Chips, { label: 'วันที่' }, days.map(d => chip('date', d, thaiDate(d), state.date === d, () => update(() => { state.date = d; })))),
      heading('2. ช่วงเวลา'),
      h(Chips, { label: 'ช่วงเวลา' },
        chip('period', 'all', 'ทุกช่วง', state.period === 'all', () => update(() => { state.period = 'all'; })),
        PERIODS.map(([p, l]) => chip('period', p, l, state.period === p, () => update(() => { state.period = p; })))),
      heading('3. พื้นที่ใกล้คุณ'),
      h(Chips, { label: 'พื้นที่' },
        chip('area', 'all', 'ทุกพื้นที่', state.area === 'all', () => setArea('all')),
        AREAS.map(([a, l]) => chip('area', a, l, state.area === a, () => setArea(a)))),
      h(TextField, {
        select: true, label: 'สาขา', size: 'small', value: state.cinema, sx: { maxWidth: 340, mt: 1 },
        SelectProps: { native: true }, inputProps: { 'data-act': 'cinema', id: 'cinema-select' },
        onChange: e => update(() => { state.cinema = e.target.value; }),
      },
      h('option', { value: 'all' }, 'ทุกสาขาในพื้นที่นี้'),
      branches.map(c => h('option', { key: c.id, value: c.id }, c.name)))),
    h(Typography, { variant: 'h6', component: 'h2', 'aria-live': 'polite', sx: { mt: 3, mb: 1 } }, `พบ ${results.length} สาขา`),
    results.length
      ? h(Stack, { divider: h(Divider) }, results.map(r => h(Box, { key: r.cinema.id, className: 'showing', sx: { display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between', alignItems: 'center', py: 2 } },
        h(Box, null,
          h(Typography, { variant: 'subtitle1', component: 'h3', sx: { fontWeight: 600 } }, r.cinema.name),
          h(Typography, { variant: 'body2', color: 'text.secondary' }, AREAS.find(a => a[0] === r.cinema.area)[1])),
        h(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1 } },
          r.times.map(t => h(Button, { key: t, className: 'time', variant: 'outlined', href: `#/seats/${id}/${r.cinema.id}/${state.date}/${t}` }, t))))))
      : h(Empty, { text: 'ไม่มีรอบที่ตรงกับตัวเลือกนี้' },
        h(Button, { variant: 'outlined', 'data-act': 'clear-filters', onClick: () => update(() => { state.period = 'all'; state.area = 'all'; state.cinema = 'all'; remember('cs_area', 'all'); }) }, 'ล้างตัวกรอง')));
}

const showLabel = s => `${s.cinema.name} · ${thaiDate(s.date)} · ${s.time} น.`;
const bookedSeats = key => tickets().filter(t => t.show === key).flatMap(t => t.seats);

const seatSx = ({ prem, on, taken }) => ({
  aspectRatio: '1', width: '100%', minWidth: 0, fontSize: 13, borderRadius: 1, border: '1.5px solid',
  borderColor: taken ? 'transparent' : on ? 'primary.main' : prem ? 'secondary.main' : 'grey.600',
  bgcolor: on ? 'primary.main' : taken ? 'action.disabledBackground' : 'transparent',
  color: on ? 'primary.contrastText' : taken ? 'text.disabled' : prem ? 'secondary.main' : 'text.primary',
  fontWeight: on ? 700 : 400,
});

function Bar({ children }) {
  return h(Paper, {
    className: 'bar', square: true, elevation: 8, 'aria-live': 'polite',
    sx: { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10, p: 1.5, px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 },
  }, children);
}

function BarTotal({ note, total }) {
  return h(Box, { sx: { minWidth: 0 } },
    h(Typography, { variant: 'body2', color: 'text.secondary', noWrap: true }, note),
    h(Typography, { variant: 'h6', component: 'strong' }, baht(total)));
}

function SeatsView({ show: key }) {
  const show = parseShow(key, new Date());
  if (!show) return h(Missing, { text: 'รอบฉายนี้ไม่เปิดจองแล้ว' });
  const taken = takenSeats(key, bookedSeats(key));
  if (state.cart?.show !== key) state.cart = { show: key, seats: [], snacks: {} };
  state.cart.seats = state.cart.seats.filter(s => !taken.has(s));
  const { seats } = state.cart;

  const toggle = seat => {
    const next = toggleSeat(seats, seat, taken);
    if (next === seats) return toast(`เลือกได้สูงสุด ${MAX_SEATS} ที่นั่ง`);
    update(() => { state.cart.seats = next; });
  };
  const seatButton = seat => {
    const isTaken = taken.has(seat);
    const on = seats.includes(seat);
    const prem = PREMIUM_ROWS.includes(seat[0]);
    return h(ButtonBase, {
      key: seat, className: 'seat', disabled: isTaken, onClick: () => toggle(seat), sx: seatSx({ prem, on, taken: isTaken }),
      'data-act': 'seat', 'data-val': seat, 'data-key': `seat-${seat}`, 'aria-pressed': on,
      'aria-label': `ที่นั่ง ${seat} ${isTaken ? 'ไม่ว่าง' : baht(seatPrice(seat))}`,
    }, isTaken ? '×' : on ? '✓' : seat.slice(1));
  };
  const legend = (flags, mark, text) => h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.75 } },
    h(Box, { 'aria-hidden': true, sx: { ...seatSx(flags), width: 20, display: 'grid', placeItems: 'center' } }, mark), text);

  return h(Box, null,
    h(Back, { href: `#/movie/${show.movie.id}` }, 'เปลี่ยนรอบหรือสาขา'),
    h(Typography, { variant: 'h4', component: 'h1' }, show.movie.title),
    h(Typography, { variant: 'body2', color: 'text.secondary' }, showLabel(show)),
    h(Box, { sx: { maxWidth: 520, mx: 'auto', mt: 3 } },
      h(Paper, { sx: { py: 0.5, mx: '8%', mb: 3, textAlign: 'center', bgcolor: 'grey.300', backgroundImage: 'none', color: 'grey.900', fontSize: 13 } }, 'จอภาพ'),
      h(Box, { className: 'seat-grid', sx: { display: 'grid', gridTemplateColumns: '18px repeat(10, minmax(0, 1fr))', gap: '5px', alignItems: 'center' } },
        ROWS.flatMap(r => [
          h(Typography, { key: r, variant: 'caption', color: 'text.secondary', align: 'center' }, r),
          ...Array.from({ length: SEATS_PER_ROW }, (_, i) => seatButton(r + (i + 1))),
        ])),
      h(Box, { sx: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 18px', mt: 2.5, fontSize: 14, color: 'text.secondary' } },
        legend({}, '', `ปกติ ${PRICE.normal}`),
        legend({ prem: true }, '', `พรีเมียม ${PRICE.premium}`),
        legend({ on: true }, '✓', 'ที่คุณเลือก'),
        legend({ taken: true }, '×', 'ไม่ว่าง'))),
    h(Bar, null,
      h(BarTotal, { note: seats.length ? `ที่นั่ง ${seats.join(', ')}` : `เลือกได้สูงสุด ${MAX_SEATS} ที่นั่ง`, total: totalPrice(seats) }),
      h(Button, { variant: 'contained', size: 'large', disabled: !seats.length, href: seats.length ? '#/snacks' : undefined, 'data-act': 'checkout', sx: { flex: 'none' } }, 'ถัดไป: ของกิน')));
}

function bookingShow() {
  const show = state.cart && parseShow(state.cart.show, new Date());
  return show && state.cart.seats.length ? show : null;
}

function SnackCard({ set }) {
  const { snacks } = state.cart;
  const oneSize = set.prices.length === 1;
  const size = oneSize ? 'ONE' : state.snackSize[set.id] ?? 'M';
  const sizeIndex = SIZES.findIndex(x => x[0] === size);
  const sizeLabel = oneSize ? '' : `ขนาด${SIZES[sizeIndex][1]}`;
  const flavors = state.snackFlavors[set.id] ?? [FLAVORS[0][0]];
  const cartKey = `${set.id}:${size}${set.flavored ? `:${flavorKey(flavors)}` : ''}`;
  const lines = snackLines(snacks).filter(l => l.id === set.id);
  const change = delta => update(() => { state.cart.snacks = changeSnack(snacks, cartKey, delta); });
  const step = (sign, delta, verb, key) => h(IconButton, {
    onClick: () => change(delta), 'aria-label': `${verb} ${set.name} ${sizeLabel}`, 'data-key': `${key}-${set.id}`, sx: { border: 1, borderColor: 'divider', width: 40, height: 40, borderRadius: 1, fontSize: 20 },
  }, sign);

  return h(Card, { component: 'li', variant: 'outlined', sx: { p: 2, display: 'grid', gap: 1.5 } },
    h(Box, { sx: { display: 'flex', gap: 1.5, alignItems: 'center' } },
      h('img', { className: 'art', src: set.image, alt: '', width: 76, height: 76, style: { flex: 'none', borderRadius: 8, background: set.color } }),
      h(Box, { sx: { minWidth: 0 } },
        h(Typography, { variant: 'subtitle1', component: 'h3', sx: { fontWeight: 600 } }, set.name),
        set.desc && h(Typography, { variant: 'body2', color: 'text.secondary' }, set.desc),
        !oneSize && h(Typography, { className: 'size-note', variant: 'body2', color: 'text.secondary' }, sizeNote(set, sizeIndex)))),
    set.flavored && h(Box, null,
      h(Typography, { variant: 'caption', color: 'text.secondary', component: 'p', sx: { mb: 0.5 } }, 'เลือกรส (ได้หลายรส)'),
      h(ToggleButtonGroup, {
        size: 'small', color: 'primary', value: flavors, 'aria-label': `รส ${set.name}`,
        onChange: (_, next) => next.length && update(() => { state.snackFlavors[set.id] = next; }),
      }, FLAVORS.map(([id, label]) => h(ToggleButton, { key: id, value: id, 'data-key': `flavor-${set.id}:${id}`, sx: { px: 1.25 } }, label)))),
    h(Box, { sx: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1 } },
      oneSize ? h(Typography, { variant: 'h6', component: 'span' }, baht(set.prices[0])) : h(ToggleButtonGroup, {
        exclusive: true, size: 'small', color: 'primary', value: size, 'aria-label': `ขนาด ${set.name}`,
        onChange: (_, next) => next && update(() => { state.snackSize[set.id] = next; }),
      }, SIZES.map(([id, label], i) => {
        const qty = lines.filter(l => l.size === id).reduce((sum, l) => sum + l.qty, 0);
        return h(ToggleButton, { key: id, value: id, 'data-key': `size-${set.id}:${id}`, sx: { px: 1.25 } }, `${label} ${set.prices[i]}฿${qty ? ` ×${qty}` : ''}`);
      })),
      h(Box, { className: 'stepper', sx: { display: 'flex', alignItems: 'center', gap: 0.5 } },
        step('−', -1, 'ลด', 'minus'),
        h(Typography, { component: 'output', 'aria-label': `จำนวน ${set.name} ${sizeLabel}`, sx: { minWidth: 26, textAlign: 'center', fontWeight: 600 } }, snacks[cartKey] ?? 0),
        step('+', 1, 'เพิ่ม', 'plus'))),
    set.flavored && lines.length > 0 && h(Typography, { className: 'in-cart', variant: 'body2', color: 'primary' }, `ในออเดอร์: ${lines.map(l => `${l.short} ×${l.qty}`).join(', ')}`));
}

function SnacksView() {
  const show = bookingShow();
  if (!show) return h(Redirect);
  const { seats, snacks, show: key } = state.cart;
  const menu = snacksFor(show.movie.id);
  const sets = menu.filter(s => !s.alone);
  const alone = menu.filter(s => s.alone);
  return h(Box, null,
    h(Back, { href: `#/seats/${key}` }, 'กลับไปแก้ที่นั่ง'),
    h(Typography, { variant: 'h4', component: 'h1' }, 'เพิ่มของกินไหม?'),
    h(Typography, { variant: 'body2', color: 'text.secondary' }, 'เลือกขนาดแล้วกด + สั่งพร้อมตั๋ว แล้วแสดงรหัสตั๋วรับที่เคาน์เตอร์ได้เลย'),
    h(Tabs, { value: state.snackTab, onChange: (_, next) => update(() => { state.snackTab = next; }), variant: 'fullWidth', 'aria-label': 'ประเภทของกิน', sx: { mt: 2, borderBottom: 1, borderColor: 'divider' } },
      h(Tab, { value: 'sets', label: `เซ็ต (${sets.length})`, 'data-key': 'tab-sets' }),
      h(Tab, { value: 'alone', label: `แยกชิ้น (${alone.length})`, 'data-key': 'tab-alone' })),
    h(Box, { component: 'ul', className: 'snacks', sx: { listStyle: 'none', p: 0, m: 0, mt: 2, display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' } },
      (state.snackTab === 'sets' ? sets : alone).map(set => h(SnackCard, { key: set.id, set }))),
    h(Bar, null,
      h(BarTotal, { note: `ที่นั่ง ${seats.join(', ')}`, total: orderTotal(seats, snacks) }),
      h(Button, { variant: 'contained', size: 'large', href: '#/checkout', sx: { flex: 'none' } }, snackLines(snacks).length ? 'ไปชำระเงิน' : 'ข้าม ไปชำระเงิน')));
}

function finishPayment(contact) {
  const { show, seats, snacks } = state.cart;
  const taken = takenSeats(show, bookedSeats(show));
  if (seats.some(s => taken.has(s))) {
    toast('มีที่นั่งถูกจองไปแล้ว กรุณาเลือกใหม่');
    location.hash = `#/seats/${show}`;
    return;
  }
  const code = 'CS-' + toHex(crypto.getRandomValues(new Uint8Array(4))).toUpperCase();
  // shortcut: email is only simulated, a real send needs a server and a mail account.
  const ticket = { code, email: currentEmail(), contact, show, seats, snacks, total: orderTotal(seats, snacks), method: state.method, paidAt: new Date().toISOString() };
  if (!save('cs.tickets', [...tickets(), ticket])) {
    toast('บันทึกตั๋วไม่สำเร็จ ยังไม่มีการจอง');
    return;
  }
  state.cart = null;
  state.newTicket = code;
  remember('cs_contact', contact);
  location.hash = '#/tickets';
  toast(`จองสำเร็จ! ส่งตั๋วไปที่ ${contact} แล้ว (จำลอง)`);
}

const METHODS = [['card', 'บัตรเครดิต/เดบิต'], ['promptpay', 'พร้อมเพย์ QR'], ['truemoney', 'TrueMoney Wallet QR']];
const QR_INFO = { promptpay: ['พร้อมเพย์', 'เปิดแอปธนาคาร แล้วสแกน QR เพื่อจ่าย'], truemoney: ['TrueMoney Wallet', 'เปิดแอป TrueMoney แล้วสแกน QR เพื่อจ่าย'] };

function CheckoutForm({ show }) {
  const [form, setForm] = React.useState({ email: currentEmail() ?? cookies().cs_contact ?? '', number: '', exp: '', cvc: '', name: '' });
  const [errors, setErrors] = React.useState({});
  const { seats, snacks, show: key } = state.cart;
  const total = orderTotal(seats, snacks);
  const isCard = state.method === 'card';
  const format = {
    number: v => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})(?=.)/g, '$1 '),
    exp: v => v.replace(/\D/g, '').slice(0, 4).replace(/^(\d\d)(?=\d)/, '$1/'),
    cvc: v => v.replace(/\D/g, '').slice(0, 4),
  };
  const field = (name, label, props = {}) => h(TextField, {
    name, label, value: form[name], error: Boolean(errors[name]), helperText: errors[name], fullWidth: true,
    onChange: e => setForm({ ...form, [name]: (format[name] ?? (v => v))(e.target.value) }),
    ...props,
  });

  const submit = event => {
    event.preventDefault();
    const found = isCard ? validateCard(form, new Date()) : {};
    const to = form.email.trim();
    if (!validEmail(to)) found.email = 'กรอกอีเมลให้ถูกต้องเพื่อรับตั๋ว';
    setErrors(found);
    const firstBad = ['email', 'number', 'exp', 'cvc', 'name'].find(name => found[name]);
    if (firstBad) { event.target.elements[firstBad].focus(); return; }
    finishPayment(to);
  };

  const line = (left, right, key2) => h(Box, { key: key2, component: 'li', sx: { display: 'flex', justifyContent: 'space-between', gap: 1.5, py: 0.25 } }, h('span', null, left), h('span', null, right));

  return h(Box, null,
    h(Back, { href: '#/snacks' }, 'กลับไปแก้ของกิน'),
    h(Typography, { variant: 'h4', component: 'h1', sx: { mb: 2 } }, 'ชำระเงิน'),
    h(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px' }, gap: 3, alignItems: 'start' } },
      h(Paper, { className: 'summary', sx: { p: 2.5, order: { md: 2 } } },
        h(Typography, { variant: 'h6', component: 'h2' }, show.movie.title),
        h(Typography, { variant: 'body2', color: 'text.secondary' }, showLabel(show)),
        h(Divider, { sx: { my: 1.5 } }),
        h(Box, { component: 'ul', sx: { listStyle: 'none', p: 0, m: 0 } },
          seats.map(s => line(`ที่นั่ง ${s}`, baht(seatPrice(s)), s)),
          snackLines(snacks).map(s => line(`${s.label} ×${s.qty}`, baht(s.price * s.qty), s.key))),
        h(Divider, { sx: { my: 1.5 } }),
        h(Box, { sx: { display: 'flex', justifyContent: 'space-between' } }, h('span', null, 'รวม'), h(Typography, { variant: 'h6', component: 'strong' }, baht(total)))),
      h(Box, { component: 'form', id: 'pay-form', noValidate: true, onSubmit: submit, sx: { display: 'grid', gap: 2.5, order: { md: 1 } } },
        field('email', 'ส่งตั๋วไปที่อีเมล', { type: 'email', autoComplete: 'email' }),
        h(ToggleButtonGroup, {
          exclusive: true, fullWidth: true, color: 'primary', value: state.method, 'aria-label': 'วิธีชำระเงิน',
          onChange: (_, next) => next && update(() => { state.method = next; }),
        }, METHODS.map(([id, label]) => h(ToggleButton, { key: id, value: id, 'data-key': `method-${id}`, sx: { lineHeight: 1.35 } }, label))),
        isCard
          ? h(Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 } },
            h(Box, { sx: { gridColumn: '1 / -1' } }, field('number', 'หมายเลขบัตร', { autoComplete: 'cc-number', inputProps: { inputMode: 'numeric' } })),
            field('exp', 'วันหมดอายุ ดด/ปป', { autoComplete: 'cc-exp', inputProps: { inputMode: 'numeric' } }),
            field('cvc', 'CVV', { type: 'password', autoComplete: 'off', inputProps: { inputMode: 'numeric' } }),
            h(Box, { sx: { gridColumn: '1 / -1' } }, field('name', 'ชื่อบนบัตร', { autoComplete: 'cc-name' })))
          : h(Paper, { variant: 'outlined', sx: { p: 2.5, display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'center' } },
            fakeQr(key + state.method, `QR ตัวอย่างสำหรับ ${QR_INFO[state.method][0]}`),
            h(Box, null,
              h(Typography, { variant: 'h6', component: 'h3' }, QR_INFO[state.method][0]),
              h(Typography, { variant: 'h4', color: 'primary' }, baht(total)),
              h(Typography, { variant: 'body2', color: 'text.secondary' }, QR_INFO[state.method][1]))),
        h(Alert, { severity: 'info', variant: 'outlined' }, 'เว็บตัวอย่าง: ไม่มีการตัดเงินจริง ห้ามกรอกบัตรจริง ใช้เลขทดสอบ 4242 4242 4242 4242'),
        h(Button, { id: 'pay-button', type: 'submit', variant: 'contained', size: 'large', fullWidth: true }, isCard ? `จ่าย ${baht(total)}` : 'ฉันสแกนจ่ายแล้ว (จำลอง)'))));
}

function CheckoutView() {
  const show = bookingShow();
  return show ? h(CheckoutForm, { show }) : h(Redirect);
}

function TicketsView() {
  const email = currentEmail();
  // Guest tickets (email null) stay visible after logging in on the same browser.
  const mine = tickets().filter(t => t.email === null || t.email === email).reverse();
  const title = h(Typography, { variant: 'h4', component: 'h1', sx: { mb: 2 } }, 'ตั๋วของฉัน');
  if (!mine.length) return h(Box, null, title, h(Empty, { text: 'ยังไม่มีตั๋ว' }, h(Button, { variant: 'contained', href: '#/' }, 'เลือกหนัง')));
  const methodName = { card: 'บัตร', promptpay: 'พร้อมเพย์', truemoney: 'TrueMoney' };

  return h(Box, null, title, h(Stack, { spacing: 2, sx: { maxWidth: 680 } }, mine.map(t => {
    const [movieId, cinemaId, date, time] = t.show.split('/');
    const movie = MOVIES.find(m => m.id === movieId);
    const cinema = CINEMAS.find(c => c.id === cinemaId);
    const items = snackLines(t.snacks ?? {});
    return h(Card, { key: t.code, className: 'ticket', variant: t.code === state.newTicket ? 'outlined' : 'elevation', sx: t.code === state.newTicket ? { borderColor: 'primary.main' } : undefined },
      h(CardContent, null,
        h(Typography, { variant: 'h6', component: 'h2' }, movie.title),
        h(Typography, null, cinema.name),
        h(Typography, { variant: 'subtitle1', sx: { fontWeight: 600 } }, `${thaiDate(date)} · ${time} น.`),
        h(Typography, null, `ที่นั่ง ${t.seats.join(', ')}`),
        items.length > 0 && h(Typography, null, `ของกิน: ${items.map(s => `${s.label} ×${s.qty}`).join(', ')}`),
        h(Typography, { variant: 'body2', color: 'text.secondary' }, `${baht(t.total)} · จ่ายด้วย${methodName[t.method]}`),
        t.contact && h(Typography, { variant: 'body2', color: 'text.secondary', sx: { overflowWrap: 'anywhere' } }, `ส่งตั๋วไปที่ ${t.contact} แล้ว (จำลอง)`),
        h(Divider, { sx: { my: 1.5 } }),
        h(Typography, { variant: 'body2', color: 'text.secondary', component: 'span' }, 'รหัสตั๋ว '),
        h(Typography, { component: 'code', sx: { fontFamily: 'monospace', fontWeight: 700 } }, t.code)));
  })));
}

function AuthDialog() {
  const [mode, setMode] = React.useState('login');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const isRegister = mode === 'register';
  const close = () => update(() => { state.authOpen = false; });

  const submit = async event => {
    event.preventDefault();
    const { name, email, password } = event.target.elements;
    const key = email.value.trim().toLowerCase();
    const all = users();
    setError('');
    if (!crypto.subtle) { setError('ต้องเปิดเว็บผ่าน localhost หรือ https จึงจะเข้าสู่ระบบได้'); return; }
    setBusy(true);
    try {
      if (isRegister) {
        if (all[key]) { setError('อีเมลนี้สมัครแล้ว กรุณาเข้าสู่ระบบ'); return; }
        const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
        all[key] = { name: name.value.trim(), salt, hash: await hashPassword(password.value, salt) };
        if (!save('cs.users', all)) { setError('บันทึกบัญชีไม่สำเร็จ'); return; }
      } else if (!all[key] || await hashPassword(password.value, all[key].salt) !== all[key].hash) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return;
      }
      setSession(key);
      close();
    } finally {
      setBusy(false);
    }
  };

  return h(Dialog, { id: 'auth', open: true, onClose: close, fullWidth: true, maxWidth: 'xs', 'aria-labelledby': 'auth-title' },
    h(DialogTitle, { id: 'auth-title' }, isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'),
    h(DialogContent, null,
      h(Box, { component: 'form', id: 'auth-form', onSubmit: submit, sx: { display: 'grid', gap: 2, pt: 1 } },
        isRegister && h(TextField, { name: 'name', label: 'ชื่อ', required: true, autoComplete: 'name', inputProps: { maxLength: 40 } }),
        h(TextField, { name: 'email', label: 'อีเมล', type: 'email', required: true, autoComplete: 'email', autoFocus: true }),
        h(TextField, { name: 'password', label: 'รหัสผ่าน (อย่างน้อย 8 ตัว)', type: 'password', required: true, autoComplete: isRegister ? 'new-password' : 'current-password', inputProps: { minLength: 8 } }),
        error && h(Alert, { id: 'auth-error', severity: 'error' }, error),
        h(Button, { id: 'auth-submit', type: 'submit', variant: 'contained', size: 'large', disabled: busy }, isRegister ? 'สมัครและเข้าสู่ระบบ' : 'เข้าสู่ระบบ'),
        h(Button, { id: 'auth-switch', onClick: () => { setMode(isRegister ? 'login' : 'register'); setError(''); } }, isRegister ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'))));
}

function page(hashValue) {
  const [name, ...rest] = hashValue.replace(/^#\/?/, '').split('/');
  switch (name) {
    case '': return h(HomeView);
    case 'movie': return h(MovieView, { id: rest[0] });
    case 'seats': return h(SeatsView, { show: rest.join('/') });
    case 'snacks': return h(SnacksView);
    case 'checkout': return h(CheckoutView);
    case 'tickets': return h(TicketsView);
    default: return h(Missing, { text: 'ไม่พบหน้านี้' });
  }
}

function App() {
  const [, tick] = React.useReducer(n => n + 1, 0);
  const [route, setRoute] = React.useState(location.hash);
  const main = React.useRef(null);
  rerender = tick;

  React.useEffect(() => {
    const onHash = () => {
      setRoute(location.hash);
      scrollTo(0, 0);
      main.current.focus({ preventScroll: true });
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  const user = currentUser();
  return h(ThemeProvider, { theme },
    h(CssBaseline),
    h(AppBar, { position: 'static', color: 'default', elevation: 1 },
      h(Toolbar, { sx: { flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', py: 1 } },
        h(Button, { href: '#/', color: 'inherit', sx: { fontSize: 22, fontWeight: 700 } }, 'CineSeat'),
        h(Box, { id: 'account', component: 'nav', 'aria-label': 'บัญชี', sx: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 } },
          h(Button, { href: '#/tickets', color: 'inherit' }, 'ตั๋วของฉัน'),
          user && h(Typography, { variant: 'body2', color: 'text.secondary', noWrap: true, sx: { maxWidth: '16ch' } }, `สวัสดี ${user.name}`),
          user
            ? h(Button, { variant: 'outlined', color: 'inherit', 'data-act': 'logout', onClick: () => { setSession(null); toast('ออกจากระบบแล้ว'); } }, 'ออกจากระบบ')
            : h(Button, { variant: 'contained', 'data-act': 'login', onClick: () => update(() => { state.authOpen = true; }) }, 'เข้าสู่ระบบ')))),
    // No onClose: Escape and clicking outside can't dismiss it, the visitor has to choose.
    !consent() && h(Dialog, { open: true, className: 'consent', fullWidth: true, maxWidth: 'xs', 'aria-labelledby': 'consent-title' },
      h(DialogTitle, { id: 'consent-title' }, 'ขออนุญาตใช้คุกกี้'),
      h(DialogContent, null,
        h(Typography, { variant: 'body2', sx: { mb: 2.5 } }, 'เพื่อจำคุณไว้ในครั้งถัดไป: การเข้าสู่ระบบ พื้นที่ที่เลือก และอีเมลรับตั๋ว ถ้าไม่อนุญาตก็ยังใช้เว็บได้ตามปกติ'),
        h(Stack, { direction: 'row', spacing: 1 },
          h(Button, { variant: 'outlined', fullWidth: true, 'data-key': 'consent-no', onClick: () => setConsent('no') }, 'ไม่อนุญาต'),
          h(Button, { variant: 'contained', fullWidth: true, 'data-key': 'consent-yes', onClick: () => setConsent('yes') }, 'อนุญาต')))),
    h(Container, { component: 'main', maxWidth: 'lg', ref: main, tabIndex: -1, sx: { pt: 3, pb: 2, outline: 'none' } },
      h(React.Fragment, { key: route }, page(route))),
    // Seats and snacks have a fixed bottom bar that would otherwise cover the footer.
    h(Box, { component: 'footer', sx: { mt: 4, pt: 2, pb: /^#\/(seats|snacks)/.test(route) ? 12 : 3, borderTop: 1, borderColor: 'divider' } },
      h(Container, { maxWidth: 'lg', sx: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 } },
        h(Typography, { variant: 'body2', color: 'text.secondary' }, 'CineSeat · เว็บตัวอย่าง ไม่มีการตัดเงินจริง'),
        h(Stack, { direction: 'row', spacing: 1, useFlexGap: true, flexWrap: 'wrap' },
          h(Button, { size: 'small', color: 'inherit', href: '#/' }, 'หน้าแรก'),
          h(Button, { size: 'small', color: 'inherit', href: '#/tickets' }, 'ตั๋วของฉัน'),
          h(Button, { size: 'small', variant: 'outlined', color: 'inherit', 'data-key': 'consent-reset', onClick: () => setConsent(null) }, 'ลบคุกกี้')))),
    state.authOpen && h(AuthDialog),
    h(Snackbar, {
      key: state.toast, open: Boolean(state.toast), message: state.toast, autoHideDuration: 3500,
      anchorOrigin: { vertical: 'top', horizontal: 'center' }, ContentProps: { id: 'toast' },
      onClose: (_, reason) => { if (reason !== 'clickaway') update(() => { state.toast = ''; }); },
    }));
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
