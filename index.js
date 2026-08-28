function displayLocationTime(elementId, timeZone, locationLabel) {
  const el = document.getElementById(elementId);

  function update() {
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

    el.textContent = `${locationLabel}: ${dateFormatter.format(now)} — ${timeFormatter.format(now)}`;
  }

  update();
  setInterval(update, 1000);
}

displayLocationTime('clock', 'Africa/Johannesburg', 'Johannesburg');

// index.js

const CLOCKS = [
];

const grid = document.getElementById('grid');
const utcLine = document.getElementById('utc-line');
const state = [];

init();
const select = document.getElementById('location-select');
const clockEl = document.getElementById('clock');

let intervalId = null;

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
}

select.addEventListener('change', () => {
  const timeZone = select.value;
  const locationLabel = select.options[select.selectedIndex].textContent;
  startClock(timeZone, locationLabel);
});

const initialOption = select.options[select.selectedIndex];
startClock(select.value, initialOption.textContent);
