"use strict";

const sessions = [
  { id: "2026-09-21-afternoon-mph", date: "2026-09-21", label: "Afternoon", room: "MPH", papers: [
    ["12:20", "Biology HL — Paper 1 (1A + 1B)", 120],
    ["12:20", "Biology SL — Paper 1 (1A + 1B)", 90],
    ["12:20", "Environmental Systems and Societies SL — Paper 1", 60],
    ["12:20", "Physics HL — Paper 1 (1A + 1B)", 120],
    ["12:20", "Physics SL — Paper 1 (1A + 1B)", 90]
  ]},
  { id: "2026-09-22-morning-mph", date: "2026-09-22", label: "Morning", room: "MPH", papers: [
    ["08:00", "Biology HL — Paper 2", 150], ["08:00", "Biology SL — Paper 2", 90],
    ["08:00", "Environmental Systems and Societies SL — Paper 2", 120], ["08:00", "Physics HL — Paper 2", 150],
    ["08:00", "Physics SL — Paper 2", 90]
  ]},
  { id: "2026-09-22-afternoon-mph", date: "2026-09-22", label: "Afternoon", room: "MPH", papers: [
    ["12:20", "Business Management HL — Paper 1", 90], ["12:20", "Business Management SL — Paper 1", 90],
    ["12:20", "Psychology HL — Paper 1", 120], ["12:20", "Psychology SL — Paper 1", 120],
    ["14:05", "Business Management HL — Paper 3", 75]
  ]},
  { id: "2026-09-23-morning-bf", date: "2026-09-23", label: "Morning", room: "BF-04 & BF-02", papers: [
    ["08:00", "Business Management HL — Paper 2", 105], ["08:00", "Business Management SL — Paper 2", 90],
    ["08:00", "Psychology HL — Paper 2", 120], ["08:00", "Psychology SL — Paper 2", 60],
    ["10:15", "Psychology HL — Paper 3", 60]
  ]},
  { id: "2026-09-23-afternoon-mph", date: "2026-09-23", label: "Afternoon", room: "MPH", papers: [
    ["12:30", "English A HL — Paper 1", 135], ["12:30", "English A SL — Paper 1", 75],
    ["12:30", "English B HL — Paper 1 (Writing)", 90], ["12:30", "English B SL — Paper 1 (Writing)", 75],
    ["14:15", "English B HL — Paper 2 (Reading)", 60], ["14:15", "English B SL — Paper 2 (Reading)", 60]
  ]},
  { id: "2026-09-24-morning-bf02", date: "2026-09-24", label: "Morning", room: "BF-02", papers: [
    ["08:00", "English B SL — Paper 2 (Listening)", 45]
  ]},
  { id: "2026-09-24-morning-bf04", date: "2026-09-24", label: "Morning", room: "BF-04", papers: [
    ["08:00", "English B HL — Paper 2 (Listening)", 60]
  ]},
  { id: "2026-09-24-morning-mph", date: "2026-09-24", label: "Morning", room: "MPH", papers: [
    ["08:00", "English A HL — Paper 2", 105], ["08:00", "English A SL — Paper 2", 105]
  ]},
  { id: "2026-09-24-afternoon-mph", date: "2026-09-24", label: "Afternoon", room: "MPH", papers: [
    ["12:20", "Chinese A: Language and Literature SL — Paper 1", 75],
    ["12:20", "Chinese B - Mandarin SL — Paper 1 (Writing)", 75],
    ["12:20", "French ab initio SL — Paper 1 (Writing)", 60],
    ["12:20", "Japanese A: Literature SL — Paper 1", 75],
    ["12:20", "Mandarin ab initio SL — Paper 1 (Writing)", 60],
    ["13:35", "French ab initio SL — Paper 2 (Reading)", 60],
    ["13:35", "Mandarin ab initio SL — Paper 2 (Reading)", 60],
    ["13:50", "Chinese B - Mandarin SL — Paper 2 (Reading)", 60]
  ]},
  { id: "2026-09-25-morning-bf01", date: "2026-09-25", label: "Morning", room: "BF-01", papers: [
    ["08:00", "Chinese A: Language and Literature SL — Paper 2", 105],
    ["08:00", "Japanese A: Literature SL — Paper 2", 105]
  ]},
  { id: "2026-09-25-morning-bf02", date: "2026-09-25", label: "Morning", room: "BF-02", papers: [
    ["08:00", "Chinese B - Mandarin SL — Paper 2 (Listening)", 45]
  ]},
  { id: "2026-09-25-morning-bf03", date: "2026-09-25", label: "Morning", room: "BF-03", papers: [
    ["08:00", "Mandarin ab initio SL — Paper 2 (Listening)", 45]
  ]},
  { id: "2026-09-25-morning-bf04", date: "2026-09-25", label: "Morning", room: "BF-04", papers: [
    ["08:00", "French ab initio SL — Paper 2 (Listening)", 45]
  ]},
  { id: "2026-09-28-afternoon-mph", date: "2026-09-28", label: "Afternoon", room: "MPH", papers: [
    ["12:20", "Mathematics: Analysis and Approaches HL — Paper 1", 120],
    ["12:20", "Mathematics: Analysis and Approaches SL — Paper 1", 90],
    ["12:20", "Mathematics: Applications and Interpretation HL — Paper 1", 120],
    ["12:20", "Mathematics: Applications and Interpretation SL — Paper 1", 90]
  ]},
  { id: "2026-09-29-morning-mph", date: "2026-09-29", label: "Morning", room: "MPH", papers: [
    ["08:00", "Mathematics: Analysis and Approaches HL — Paper 2", 120],
    ["08:00", "Mathematics: Analysis and Approaches SL — Paper 2", 90],
    ["08:00", "Mathematics: Applications and Interpretation HL — Paper 2", 120],
    ["08:00", "Mathematics: Applications and Interpretation SL — Paper 2", 90]
  ]},
  { id: "2026-09-29-afternoon-mph", date: "2026-09-29", label: "Afternoon", room: "MPH", papers: [
    ["12:20", "Chemistry HL — Paper 1 (1A + 1B)", 120], ["12:20", "Chemistry SL — Paper 1 (1A + 1B)", 90],
    ["12:20", "Economics HL — Paper 2", 105], ["12:20", "Economics SL — Paper 2", 105]
  ]},
  { id: "2026-09-30-morning-mph", date: "2026-09-30", label: "Morning", room: "MPH", papers: [
    ["08:00", "Chemistry HL — Paper 2", 150], ["08:00", "Chemistry SL — Paper 2", 90],
    ["08:00", "Economics HL — Paper 1", 75], ["08:00", "Economics SL — Paper 1", 75],
    ["09:30", "Economics HL — Paper 3", 105]
  ]},
  { id: "2026-09-30-afternoon-mph", date: "2026-09-30", label: "Afternoon", room: "MPH", papers: [
    ["12:20", "Mathematics: Analysis and Approaches HL — Paper 3", 75],
    ["12:20", "Mathematics: Applications and Interpretation HL — Paper 3", 75]
  ]}
];

const app = document.querySelector("#app");
const STORAGE_KEY = "mock-exam-clock-v1";
let view = "selection";
let selectedSessionId = getDefaultSessionId();
const selectedPaperIndices = new Set();
let ticker;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function firstScheduledMinute(session) {
  const earliest = [...session.papers].sort((a, b) => a[0].localeCompare(b[0]))[0][0];
  return new Date(`${session.date}T${earliest}:00`).getTime();
}

function getDefaultSessionId(now = new Date()) {
  const today = getLocalDateKey(now);
  const todaySessions = sessions.filter((session) => session.date === today);
  const upcomingToday = todaySessions.find((session) => firstScheduledMinute(session) >= now.getTime() - 60 * 60 * 1000);
  if (upcomingToday) return upcomingToday.id;
  if (todaySessions.length) return todaySessions[todaySessions.length - 1].id;
  const future = sessions.find((session) => session.date > today);
  return (future || sessions[sessions.length - 1]).id;
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function writeState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function paperKey(session, index) { return `${session.id}:${index}`; }

function getPaperState(session, index) { return readState()[paperKey(session, index)] || {}; }

function setPaperState(session, index, patch) {
  const state = readState();
  state[paperKey(session, index)] = { ...(state[paperKey(session, index)] || {}), ...patch };
  writeState(state);
}

function selectAllUnstarted(session) {
  selectedPaperIndices.clear();
  session.papers.forEach((_, index) => {
    const state = getPaperState(session, index);
    if (!getActualSessionStart(state) && !state.finishedAt) selectedPaperIndices.add(index);
  });
}

function clearSessionState(session) {
  const state = readState();
  const prefix = `${session.id}:`;
  Object.keys(state).forEach((key) => {
    if (key.startsWith(prefix)) delete state[key];
  });
  writeState(state);
}

function parseStartTime(session, time, now = Date.now()) {
  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)) {
    throw new Error("Enter the actual start time.");
  }
  const start = new Date(`${session.date}T${time.length === 5 ? `${time}:00` : time}`).getTime();
  if (!Number.isFinite(start) || start > now) {
    throw new Error("The start time must not be in the future. Check the selected examination date and time.");
  }
  return start;
}

function timeInputValue(timestamp) {
  const date = new Date(timestamp);
  return [date.getHours(), date.getMinutes(), date.getSeconds()].map((value) => String(value).padStart(2, "0")).join(":");
}

function applyStartTime(session, time, target, correct = false, now = Date.now()) {
  const actualSessionStart = parseStartTime(session, time, now);
  if (correct && (!Number.isInteger(target) || !session.papers[target])) throw new Error("Choose one paper to correct.");
  if (!correct && (!Array.isArray(target) || !target.length || target.some((index) => !Number.isInteger(index) || !session.papers[index]))) {
    throw new Error("Select at least one paper to start.");
  }
  const state = readState();
  const indices = correct ? [target] : target;
  indices.forEach((i) => {
    const key = paperKey(session, i);
    const existing = state[key] || {};
    if (correct) {
      if (!getActualSessionStart(existing)) throw new Error("This paper has not started. Select it before starting papers.");
      state[key] = { ...existing, actualSessionStart, actualStart: null };
    } else if (!getActualSessionStart(existing) && !existing.finishedAt) {
      state[key] = { ...existing, actualSessionStart, actualStart: null, finishedAt: null };
    }
  });
  writeState(state);
}

function openTimeEntry(session, target, correct = false) {
  const dialog = document.querySelector("#time-entry");
  const existing = correct ? getPaperState(session, target) : null;
  const oldStart = existing && getActualSessionStart(existing);
  const targetLabel = correct
    ? session.papers[target][1]
    : `${target.length} selected paper${target.length === 1 ? "" : "s"}`;
  dialog.innerHTML = `
    <form id="time-entry-form">
      <h2 id="time-entry-title">${correct ? "Correct start time" : "What time did these papers start?"}</h2>
      <p id="time-entry-context">${formatSessionDate(session.date)} · ${session.label} · ${session.room}<br><strong>${targetLabel}</strong></p>
      <p id="time-entry-help">Enter the start of reading for written papers, or the actual start for listening papers. Times use this device’s local time.</p>
      <label for="actual-start-time" class="field-label">Actual start time</label>
      <input id="actual-start-time" type="time" step="1" required value="${timeInputValue(correct ? oldStart : Date.now())}" />
      <p class="time-entry-note">Include seconds if known; otherwise use :00. ${correct ? "Any Finished mark will be kept." : "Already-started and finished papers are kept unchanged."}</p>
      <p id="time-entry-error" role="alert"></p>
      <p id="time-entry-confirmation" role="status" hidden></p>
      <div class="time-entry-actions">
        <button type="submit" class="primary-button" id="apply-start-time">${correct ? "Review correction" : "Apply start time"}</button>
        <button type="button" class="back-button" id="cancel-start-time">Cancel</button>
      </div>
    </form>`;
  const input = document.querySelector("#actual-start-time");
  const confirmation = document.querySelector("#time-entry-confirmation");
  const error = document.querySelector("#time-entry-error");
  const apply = document.querySelector("#apply-start-time");
  let reviewedTime = null;
  input.addEventListener("input", () => {
    reviewedTime = null;
    confirmation.hidden = true;
    error.textContent = "";
    if (correct) apply.textContent = "Review correction";
  });
  document.querySelector("#cancel-start-time").addEventListener("click", () => dialog.close());
  document.querySelector("#time-entry-form").addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    try {
      const start = parseStartTime(session, input.value);
      if (correct && reviewedTime !== input.value) {
        const duration = (getReadingMinutes(session.papers[target][1]) + session.papers[target][2]) * 60_000;
        confirmation.textContent = `Change the start from ${formatClock(new Date(oldStart))} to ${formatClock(new Date(start))}? The end time changes from ${formatTime(oldStart + duration)} to ${formatTime(start + duration)}. Confirm only if this is the actual start time.`;
        confirmation.hidden = false;
        reviewedTime = input.value;
        apply.textContent = "Confirm correction";
        return;
      }
      applyStartTime(session, input.value, target, correct);
      if (!correct) selectedPaperIndices.clear();
      dialog.close();
      renderClock();
    } catch (problem) {
      error.textContent = problem.message;
    }
  });
  dialog.showModal();
  input.focus();
}

function getReadingMinutes(examination) {
  return examination.includes("(Listening)") ? 0 : 5;
}

function getActualSessionStart(state) {
  return state.actualSessionStart || state.actualStart || null;
}

function formatSessionDate(dateKey) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(`${dateKey}T12:00:00`));
}

function formatClock(date) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(timestamp));
}

function durationLabel(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return [hours ? `${hours} hr${hours === 1 ? "" : "s"}` : "", mins ? `${mins} min` : ""].filter(Boolean).join(" ");
}

function brandLockupMarkup() {
  return `
    <div class="institution-lockup" aria-label="Sunway International School and IB World School branding">
      <div class="logo-pair">
        <div class="logo-slot logo-slot-sunway logo-loaded">
          <img src="assets/sunway-international-school.svg" alt="Sunway International School" />
        </div>
        <span class="logo-divider" aria-hidden="true"></span>
        <div class="logo-slot logo-slot-ib logo-loaded">
          <img src="assets/ib-world-school-logo-2-colour.png" alt="IB World School" />
        </div>
      </div>
      <div class="exam-identity">
        <span>Sunway International School</span>
        <strong>DP/CP Mock Examinations</strong>
      </div>
    </div>`;
}

function renderSelection() {
  clearInterval(ticker);
  const selected = sessions.find((session) => session.id === selectedSessionId) || sessions[0];
  const sessionChoices = sessions.filter((session, index, all) =>
    all.findIndex((item) => item.date === session.date && item.label === session.label) === index
  );
  const selectedChoice = `${selected.date}|${selected.label}`;
  app.innerHTML = `
    <section class="selection-shell" aria-labelledby="page-title">
      ${brandLockupMarkup()}
      <h1 id="page-title">Choose the room clock.</h1>
      <p class="intro">Select the examination date and session, then choose the room being projected.</p>
      <div class="picker-card">
        <div class="picker-grid">
          <label>
            <span class="field-label">Date and session</span>
            <select id="session-select" aria-label="Examination date and session">
              ${sessionChoices.map((session) => {
                const value = `${session.date}|${session.label}`;
                return `<option value="${value}" ${value === selectedChoice ? "selected" : ""}>${formatSessionDate(session.date)} · ${session.label}</option>`;
              }).join("")}
            </select>
          </label>
          <label>
            <span class="field-label">Room</span>
            <select id="room-select" aria-label="Examination room"></select>
          </label>
          <button class="primary-button" id="open-clock">Open Room Clock</button>
        </div>
        <div class="selection-summary">
          <span id="selection-detail"><strong>${selected.papers.length} papers</strong> scheduled in ${selected.room}</span>
          <span class="source-note">Enter the actual start time when ready. On a replacement laptop, select the same room and enter the original start time.</span>
        </div>
      </div>
    </section>`;

  const sessionSelect = document.querySelector("#session-select");
  const roomSelect = document.querySelector("#room-select");

  function updateRooms() {
    const [date, label] = sessionSelect.value.split("|");
    const sameDateAndLabel = sessions.filter((session) => session.date === date && session.label === label);
    roomSelect.innerHTML = sameDateAndLabel.map((session) => `<option value="${session.id}">${session.room}</option>`).join("");
    roomSelect.value = sameDateAndLabel.some((session) => session.id === selectedSessionId) ? selectedSessionId : sameDateAndLabel[0].id;
    updateSummary();
  }

  function updateSummary() {
    const chosen = sessions.find((session) => session.id === roomSelect.value);
    document.querySelector("#selection-detail").innerHTML = `<strong>${chosen.papers.length} paper${chosen.papers.length === 1 ? "" : "s"}</strong> scheduled in ${chosen.room}`;
  }

  sessionSelect.addEventListener("change", updateRooms);
  roomSelect.addEventListener("change", updateSummary);
  document.querySelector("#open-clock").addEventListener("click", () => {
    selectedSessionId = roomSelect.value;
    view = "clock";
    renderClock();
  });
  updateRooms();
}

function getDisplayStatus(state, durationMinutes, readingMinutes, now) {
  if (state.finishedAt) return { label: "Finished", className: "finished" };
  const actualSessionStart = getActualSessionStart(state);
  if (!actualSessionStart) return { label: "Not started", className: "scheduled" };
  const writingStart = actualSessionStart + readingMinutes * 60_000;
  const end = writingStart + durationMinutes * 60_000;
  const five = end - 5 * 60_000;
  const thirty = end - 30 * 60_000;
  if (now < writingStart) return { label: "Reading", className: "reading" };
  if (now >= end) return { label: "Time elapsed", className: "elapsed" };
  if (now >= five) return { label: "5 min remaining", className: "warning" };
  if (now >= thirty) return { label: "30 min remaining", className: "warning" };
  return { label: "Active", className: "active" };
}

function renderPaper(session, paper, index, now) {
  const [scheduledStart, name, durationMinutes] = paper;
  const readingMinutes = getReadingMinutes(name);
  const state = getPaperState(session, index);
  const display = getDisplayStatus(state, durationMinutes, readingMinutes, now);
  const actualSessionStart = getActualSessionStart(state);
  const writingStart = actualSessionStart ? actualSessionStart + readingMinutes * 60_000 : null;
  const end = writingStart ? writingStart + durationMinutes * 60_000 : null;
  const milestones = writingStart ? [writingStart, end - 30 * 60_000, end - 5 * 60_000, end] : [null, null, null, null];
  const labels = ["Start", "30 min", "5 min", "End"];
  const emphasisTimes = readingMinutes ? [actualSessionStart, ...milestones] : milestones;
  const justReached = emphasisTimes.some((time) => time && now >= time && now < time + 60_000);
  const selectable = !actualSessionStart && !state.finishedAt;
  const action = actualSessionStart && !state.finishedAt
      ? `<button class="finish-button" data-action="finish" data-index="${index}">Mark finished</button>`
      : "";

  return `
    <article class="paper-card${readingMinutes ? " has-reading" : ""} is-${display.className}${justReached ? " is-warning" : ""}">
      <div class="paper-title${selectable ? " is-selectable" : ""}">
        ${selectable ? `<input class="paper-select" type="checkbox" data-select-index="${index}" aria-labelledby="paper-title-${index}" ${selectedPaperIndices.has(index) ? "checked" : ""}>` : ""}
        <div class="paper-title-copy">
          <h2 id="paper-title-${index}">${name}</h2>
          <span class="paper-meta">Scheduled ${scheduledStart} · ${durationLabel(durationMinutes)}${readingMinutes ? " + 5 min reading" : " · Listening"}</span>
          ${actualSessionStart ? `<button class="correct-time" data-action="correct" data-index="${index}" aria-label="Correct start time for ${name}">Correct start time…</button>` : ""}
        </div>
      </div>
      ${readingMinutes ? `<div class="milestone${actualSessionStart && now >= actualSessionStart && now < actualSessionStart + 60_000 ? " is-reached" : ""}"><span class="milestone-label">Reading</span><span class="milestone-time milestone-range">${actualSessionStart ? `${formatTime(actualSessionStart)}–${formatTime(writingStart)}` : "—"}</span></div>` : ""}
      ${labels.map((label, milestoneIndex) => {
        const time = milestones[milestoneIndex];
        const reached = time && now >= time && now < time + 60_000;
        return `<div class="milestone${reached ? " is-reached" : ""}"><span class="milestone-label">${label}</span><span class="milestone-time">${time ? formatTime(time) : "—"}</span></div>`;
      }).join("")}
      <div class="paper-state">
        <span class="status-pill ${display.className}">${display.label}</span>
        ${action}
      </div>
    </article>`;
}

function renderClock() {
  const session = sessions.find((item) => item.id === selectedSessionId);
  const now = new Date();
  const states = session.papers.map((_, index) => getPaperState(session, index));
  const unstartedCount = states.filter((state) => !getActualSessionStart(state) && !state.finishedAt).length;
  [...selectedPaperIndices].forEach((index) => {
    const state = states[index];
    if (!state || getActualSessionStart(state) || state.finishedAt) selectedPaperIndices.delete(index);
  });
  const hasSessionState = states.some((state) => getActualSessionStart(state) || state.finishedAt);
  app.innerHTML = `
    <section class="clock-view" aria-label="Room Clock for ${session.room}">
      <header class="clock-header">
        <div class="brand-row">
          ${brandLockupMarkup()}
          <button class="back-button" id="back-to-selection" aria-label="Return to date, session and room selection">← Change session or room</button>
        </div>
        <div class="clock-focus">
          <div class="current-time" aria-live="off">
            <span class="time-kicker">Current local time</span>
            <time class="time-value" id="current-time">${formatClock(now)}</time>
            <span class="date-value">${new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(now)}</span>
          </div>
          <div class="room-identity">
            <span class="room-label">Room</span>
            <strong class="room-name">${session.room}</strong>
            <span class="session-name">${formatSessionDate(session.date)} · ${session.label}</span>
          </div>
        </div>
      </header>
      <div class="clock-main">
        <div class="clock-toolbar">
          <span class="paper-count">${session.papers.length} paper${session.papers.length === 1 ? "" : "s"} in this room</span>
          <div class="toolbar-actions">
            ${unstartedCount ? `<button class="select-all" id="select-all">Select all</button><button class="start-all" id="start-selected" ${selectedPaperIndices.size ? "" : "disabled"}>Start selected papers…</button>` : ""}
            <button class="reset-session" id="reset-session" ${hasSessionState ? "" : "disabled"}>Reset session</button>
          </div>
        </div>
        <div class="paper-list" id="paper-list">
          ${session.papers.map((paper, index) => renderPaper(session, paper, index, now.getTime())).join("")}
        </div>
        <p class="footnote">DP/CP Mock Examinations · September 2026</p>
      </div>
    </section>
    <dialog class="time-entry" id="time-entry" aria-labelledby="time-entry-title" aria-describedby="time-entry-context time-entry-help"></dialog>`;

  document.querySelector("#back-to-selection").addEventListener("click", () => { selectedPaperIndices.clear(); view = "selection"; renderSelection(); });
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", handlePaperAction));
  document.querySelectorAll("[data-select-index]").forEach((checkbox) => checkbox.addEventListener("change", handlePaperSelection));
  document.querySelector("#select-all")?.addEventListener("click", () => {
    selectAllUnstarted(session);
    renderClock();
  });
  document.querySelector("#start-selected")?.addEventListener("click", () => {
    const selected = [...selectedPaperIndices];
    if (selected.length) openTimeEntry(session, selected);
  });
  document.querySelector("#reset-session").addEventListener("click", () => {
    if (!hasSessionState) return;
    if (window.confirm(`Reset all timing and finish state for ${session.room}, ${session.label}?`)) {
      selectedPaperIndices.clear();
      clearSessionState(session);
      renderClock();
    }
  });

  clearInterval(ticker);
  ticker = setInterval(() => {
    if (view !== "clock") return;
    const timeNode = document.querySelector("#current-time");
    if (timeNode) timeNode.textContent = formatClock(new Date());
    const currentNow = Date.now();
    document.querySelector("#paper-list").innerHTML = session.papers.map((paper, index) => renderPaper(session, paper, index, currentNow)).join("");
    document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", handlePaperAction));
    document.querySelectorAll("[data-select-index]").forEach((checkbox) => checkbox.addEventListener("change", handlePaperSelection));
  }, 1000);
}

function handlePaperSelection(event) {
  const index = Number(event.currentTarget.dataset.selectIndex);
  if (event.currentTarget.checked) selectedPaperIndices.add(index);
  else selectedPaperIndices.delete(index);
  const startSelected = document.querySelector("#start-selected");
  if (startSelected) startSelected.disabled = selectedPaperIndices.size === 0;
}

function handlePaperAction(event) {
  const session = sessions.find((item) => item.id === selectedSessionId);
  const index = Number(event.currentTarget.dataset.index);
  if (event.currentTarget.dataset.action === "correct") {
    openTimeEntry(session, index, true);
    return;
  }
  if (event.currentTarget.dataset.action === "finish") setPaperState(session, index, { finishedAt: Date.now() });
  renderClock();
}

renderSelection();
