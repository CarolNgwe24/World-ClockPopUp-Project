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

// Usage: element with id="clock" will show the live date/time for Johannesburg
displayLocationTime('clock', 'Africa/Johannesburg', 'Johannesburg');
