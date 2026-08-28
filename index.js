const CLOCKS = [
  { city: 'Johannesburg', tz: 'Africa/Johannesburg', local: true },
  { city: 'London', tz: 'Europe/London' },
  { city: 'New York', tz: 'America/New_York' },
  { city: 'São Paulo', tz: 'America/Sao_Paulo' },
  { city: 'Dubai', tz: 'Asia/Dubai' },
  { city: 'Mumbai', tz: 'Asia/Kolkata' },
  { city: 'Singapore', tz: 'Asia/Singapore' },
  { city: 'Tokyo', tz: 'Asia/Tokyo' },
  { city: 'Sydney', tz: 'Australia/Sydney' },
  { city: 'Los Angeles', tz: 'America/Los_Angeles' },
];

const grid = document.getElementById('grid');
const utcLine = document.getElementById('utc-line');
const state = [];

function createFlap() {
  const flap = document.createElement('span');
  flap.className = 'flap';

  const card = document.createElement('span');
  card.className = 'flap__card';

  const front = document.createElement('span');
  front.className = 'flap__face flap__face--front';
  front.textContent = '0';

  const back = document.createElement('span');
  back.className = 'flap__face flap__face--back';
  back.textContent = '0';

  card.append(front, back);
  flap.append(card);

  return { el: flap, card, front, back, value: '0' };
}

function flipDigit(digit, newValue) {
  if (digit.value === newValue) return;

  digit.back.textContent = newValue;
  digit.card.classList.add('flap__card--flip');

  const onEnd = () => {
    digit.card.removeEventListener('transitionend', onEnd);
    digit.card.style.transition = 'none';
    digit.card.classList.remove('flap__card--flip');
    digit.front.textContent = newValue;
    digit.value = newValue;
    void digit.card.offsetHeight;
    digit.card.style.transition = '';
  };

  digit.card.addEventListener('transitionend', onEnd);
}

function buildCard(config) {
  const card = document.createElement('div');
  card.className = 'clock-card';

  const top = document.createElement('div');
  top.className = 'clock-card__top';

  const cityEl = document.createElement('span');
  cityEl.className = 'clock-card__city';
  cityEl.textContent = config.city;
  top.append(cityEl);

  if (config.local) {
    const badge = document.createElement('span');
    badge.className = 'clock-card__badge';
    badge.textContent = 'Local';
    top.append(badge);
  }

  const timeRow = document.createElement('div');
  timeRow.className = 'clock-card__time';

  const digits = [];
  const layout = ['h', 'h', ':', 'm', 'm', ':', 's', 's'];
  layout.forEach((part) => {
    if (part === ':') {
      const colon = document.createElement('span');
      colon.className = 'flap-colon';
      colon.textContent = ':';
      timeRow.append(colon);
    } else {
      const digit = createFlap();
      digits.push(digit);
      timeRow.append(digit.el);
    }
  });

  const meta = document.createElement('div');
  meta.className = 'clock-card__meta';

  const offsetEl = document.createElement('span');
  offsetEl.className = 'clock-card__offset';

  const periodEl = document.createElement('span');
  periodEl.className = 'clock-card__period';
  const dot = document.createElement('span');
  dot.className = 'dot';
  const periodLabel = document.createElement('span');
  periodLabel.textContent = '—';
  periodEl.append(dot, periodLabel);

  meta.append(offsetEl, periodEl);
  card.append(top, timeRow, meta);
  grid.append(card);

  return { card, digits, offsetEl, periodLabel };
}

function getOffsetLabel(tz, date) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value.replace('GMT', 'UTC') : tz;
  } catch (e) {
    return tz;
  }
}

function getTimeParts(tz, date) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { hh: lookup.hour, mm: lookup.minute, ss: lookup.second, hour24: Number(lookup.hour) };
}

function initGrid() {
  CLOCKS.forEach((config) => {
    state.push({ config, ...buildCard(config) });
  });
  tickGrid();
  setInterval(tickGrid, 1000);
}

function tickGrid() {
  const now = new Date();

  state.forEach(({ config, digits, offsetEl, periodLabel, card }) => {
    const { hh, mm, ss, hour24 } = getTimeParts(config.tz, now);
    const chars = `${hh}${mm}${ss}`.split('');
    chars.forEach((char, i) => flipDigit(digits[i], char));

    offsetEl.textContent = getOffsetLabel(config.tz, now);

    const isDay = hour24 >= 6 && hour24 < 18;
    card.dataset.period = isDay ? 'day' : 'night';
    periodLabel.textContent = isDay ? 'Day' : 'Night';
  });

  const utcFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  utcLine.textContent = `UTC — ${utcFormatter.format(now)}`;
}

initGrid();

const select = document.getElementById('location-select');
const clockEl = document.getElementById('clock');
const homeLink = document.getElementById('home-link');

let intervalId = null;

function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
}

const deviceTz = getDeviceTimeZone();

function addCurrentLocationOption() {
  const readableName = deviceTz.split('/').pop().replace(/_/g, ' ');
  const option = document.createElement('option');
  option.value = deviceTz;
  option.textContent = `Current Location (${readableName})`;
  option.selected = true;
  select.insertBefore(option, select.firstChild);
}

function formatLocationTime(timeZone, locationLabel) {
  const now = new Date();

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  return `${locationLabel}: ${dateFormatter.format(now)} — ${timeFormatter.format(now)}`;
}

function startClock(timeZone, locationLabel) {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }

  function update() {
    clockEl.textContent = formatLocationTime(timeZone, locationLabel);
  }

  update();
  intervalId = setInterval(update, 1000);

  homeLink.style.display = timeZone === deviceTz ? 'none' : 'inline';
}

homeLink.addEventListener('click', (e) => {
  e.preventDefault();
  select.value = deviceTz;
  const label = select.options[select.selectedIndex].textContent;
  startClock(deviceTz, label);
});

addCurrentLocationOption();

select.addEventListener('change', () => {
  const timeZone = select.value;
  const locationLabel = select.options[select.selectedIndex].textContent;
  startClock(timeZone, locationLabel);
});

const initialOption = select.options[select.selectedIndex];
startClock(select.value, initialOption.textContent);
