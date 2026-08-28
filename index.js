const select = document.getElementById('location-select');
const clockEl = document.getElementById('clock');
const homeLink = document.getElementById('home-link');

let intervalId = null;
const deviceTz = getDeviceTimeZone();

function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
}

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
