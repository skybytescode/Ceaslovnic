(function () {
  "use strict";

  const SCHEDULE = window.CEASLOVNIC_SCHEDULE;
  const TZ = window.CEASLOVNIC_TZ;
  const frame = document.getElementById("player-frame");
  const nowEl = document.getElementById("status-now");
  const slotEl = document.getElementById("status-slot");
  const nextEl = document.getElementById("status-next");

  // Returns {h, m, hhmm, label} for the current moment in Europe/Chisinau.
  function nowInZone() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
      day: "2-digit",
      month: "short"
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value || "";
    const h = parseInt(get("hour"), 10);
    const m = parseInt(get("minute"), 10);
    const s = parseInt(get("second"), 10);
    const hhmm = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
    const label =
      get("weekday") + " " + get("day") + " " + get("month") + " · " +
      hhmm + ":" + String(s).padStart(2, "0");
    return { h, m, s, hhmm, label, minutes: h * 60 + m };
  }

  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  // Find the slot that should be on screen right now.
  // Rule: most recent slot whose start time is <= now. If now < first slot, wrap to the last slot of the previous day.
  function activeSlot(nowMin) {
    let chosen = null;
    for (const slot of SCHEDULE) {
      if (toMinutes(slot.time) <= nowMin) chosen = slot;
      else break;
    }
    return chosen || SCHEDULE[SCHEDULE.length - 1]; // before first slot ⇒ previous day's last
  }

  function nextSlot(nowMin) {
    for (const slot of SCHEDULE) {
      if (toMinutes(slot.time) > nowMin) return slot;
    }
    return SCHEDULE[0]; // wraps to tomorrow
  }

  let currentSlug = null;

  function tick() {
    const t = nowInZone();
    const active = activeSlot(t.minutes);
    const next = nextSlot(t.minutes);

    nowEl.textContent = t.label;
    slotEl.textContent = active.time + " · " + active.title;
    nextEl.textContent = "Următor: " + next.time + " · " + next.title;

    if (active.slug !== currentSlug) {
      currentSlug = active.slug;
      frame.src = "content/" + active.slug + ".html";
      document.title = "Ceaslovnic · " + active.title;
    }
  }

  // Fullscreen toggle on click of the small badge.
  const fsBtn = document.getElementById("fs-btn");
  fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  // First render, then align to the next wall-clock second so the seconds in the status bar tick cleanly.
  tick();
  const msToNextSecond = 1000 - (new Date().getMilliseconds());
  setTimeout(function alignedLoop() {
    tick();
    setInterval(tick, 1000);
  }, msToNextSecond);
})();
