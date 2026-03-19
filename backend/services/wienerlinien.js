async function getDepartures(stopId) {
  try {
    const url = `https://www.wienerlinien.at/ogd_realtime/monitor?stopId=${stopId}&count=5`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    const monitors = json?.data?.monitors;
    if (!monitors || monitors.length === 0) return null;

    const lines = [];
    for (const monitor of monitors) {
      for (const line of monitor.lines || []) {
        const name = line.name;
        const towards = line.towards;
        const departures = (line.departures?.departure || [])
          .slice(0, 3)
          .map(d => {
            const countdown = d.departureTime?.countdown;
            return countdown === 0 ? 'jetzt' : `${countdown} Min`;
          })
          .join(', ');

        if (departures) {
          lines.push(`${name} Richtung ${towards}: ${departures}`);
        }
      }
    }

    return lines.length > 0 ? lines.join(' | ') : null;
  } catch {
    return null;
  }
}

module.exports = { getDepartures };
