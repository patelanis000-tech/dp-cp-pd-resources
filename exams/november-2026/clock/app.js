"use strict";

const sessions = window.NOVEMBER_SESSIONS.filter((session) => getActivePapers(session).length);

const app = document.querySelector("#app");
const STORAGE_KEY = "november-exam-clock-2026-teacher-pd-v1";
let view = "selection";
let selectedSessionId = getDefaultSessionId();
const selectedPaperIndices = new Set();
let ticker;

function getLocalDateKey(date = new Date()) {
 const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kuala_Lumpur",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
 const v=Object.fromEntries(p.map(x=>[x.type,x.value])); return v.year+"-"+v.month+"-"+v.day;
}

function firstScheduledMinute(session) {
  const earliest = getActivePapers(session).map(({ paper }) => paper).sort((a, b) => a[0].localeCompare(b[0]))[0][0];
  return new Date(`${session.date}T${earliest}:00+08:00`).getTime();
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

// Keep original positions and stored keys. Cancellation only filters operations and display.
function isPaperActive(session, index) {
  const policy = window.NOVEMBER_OPERATIONAL_CANCELLATIONS;
  return Boolean(session?.papers[index]) && !(policy?.enabled && policy.papers?.[paperKey(session, index)]?.cancelled);
}

function getActivePapers(session) {
  return session.papers.map((paper, index) => ({ paper, index })).filter(({ index }) => isPaperActive(session, index));
}

function getPaperState(session, index) { return readState()[paperKey(session, index)] || {}; }

function setPaperState(session, index, patch) {
  const state = readState();
  state[paperKey(session, index)] = { ...(state[paperKey(session, index)] || {}), ...patch };
  writeState(state);
}

function selectAllUnstarted(session) {
 selectedPaperIndices.clear();
 const available=session.papers.map((p,i)=>({p,i,s:getPaperState(session,i)})).filter(x=>isPaperActive(session,x.i)&&!getActualSessionStart(x.s)&&!x.s.finishedAt);
 const first=available.map(x=>x.p[0]).sort()[0];
 available.filter(x=>x.p[0]===first).forEach(x=>selectedPaperIndices.add(x.i));
}

function clearSessionState(session) {
  const state = readState();
  // Reset active papers only; archived cancelled timing remains available for restoration.
  getActivePapers(session).forEach(({ index }) => delete state[paperKey(session, index)]);
  writeState(state);
}

function parseStartTime(session, time, now = Date.now()) {
  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)) {
    throw new Error("Enter the actual start time.");
  }
  const start = new Date(`${session.date}T${time.length === 5 ? `${time}:00` : time}+08:00`).getTime();
  if (!Number.isFinite(start) || start > now) {
    throw new Error("The selected date and start time are in the future. For rehearsal, open Practice mode and use the current Malaysia time.");
  }
  return start;
}

function timeInputValue(timestamp) {
 return new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kuala_Lumpur",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date(timestamp));
}

function applyStartTime(session, time, target, correct = false, now = Date.now()) {
  const actualSessionStart = parseStartTime(session, time, now);
  if (correct && (!Number.isInteger(target) || !session.papers[target])) throw new Error("Choose one paper to correct.");
  if (!correct && (!Array.isArray(target) || !target.length || target.some((index) => !Number.isInteger(index) || !session.papers[index]))) {
    throw new Error("Select at least one paper to start.");
  }
  const state = readState();
  const indices = correct ? [target] : target;
  if (indices.some((index) => !isPaperActive(session, index))) {
    throw new Error("This paper is operationally cancelled. Restore it through the coordinator before starting or correcting it.");
  }
  if (new Set(indices.map(i=>session.papers[i][0])).size>1) throw new Error("Consecutive papers: select only one start wave at a time.");
  for (const i of indices) {
    const prev=session.papers[i][4];
    if (prev!==null && prev!==undefined) {
      const ps=state[paperKey(session,prev)]||{}, actual=getActualSessionStart(ps);
      if (!actual) throw new Error("Record the preceding paper using its original reading start.");
      const earliest=actual+(getReadingMinutes(session.papers[prev][1])+session.papers[prev][2])*60000;
      if (actualSessionStart<earliest) throw new Error("This paper overlaps the preceding paper.");
    }
    for(let j=0;j<session.papers.length;j++) if(isPaperActive(session,j)&&session.papers[j][4]===i) {
      const ns=state[paperKey(session,j)]||{}, next=getActualSessionStart(ns);
      if(next && actualSessionStart+(getReadingMinutes(session.papers[i][1])+session.papers[i][2])*60000>next)
        throw new Error("This correction overlaps the following paper.");
    }
  }
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
      <p id="time-entry-help">DP: enter actual reading start, including listening. MYP: enter actual WRITING start after approved reading. All times are Malaysia time (UTC+8).</p>
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
  return examination.startsWith("MYP: ") ? 0 : 5;
}

function openResetConfirmation(session) {
  const dialog = document.querySelector("#time-entry");
  dialog.innerHTML = `
    <form id="reset-entry-form">
      <h2 id="time-entry-title">Reset this room's timing?</h2>
      <p id="time-entry-context">${formatSessionDate(session.date)} · ${session.label} · <strong>${session.room}</strong></p>
      <p id="time-entry-help">This clears actual starts and Finished marks for active papers in this room and session. Archived cancelled-paper timing is retained. Other rooms and sessions keep their timing. Keep the current timing unless you intend to clear this room.</p>
      <div class="time-entry-actions">
        <button type="button" class="back-button" id="cancel-reset">Keep timing</button>
        <button type="submit" class="back-button confirm-reset" id="confirm-reset">Reset this room</button>
      </div>
    </form>`;
  const cancel = document.querySelector("#cancel-reset");
  cancel.addEventListener("click", () => dialog.close());
  document.querySelector("#reset-entry-form").addEventListener("submit", (event) => {
    event.preventDefault();
    selectedPaperIndices.clear();
    clearSessionState(session);
    dialog.close();
    renderClock();
  });
  dialog.showModal();
  cancel.focus();
}

function getActualSessionStart(state) {
  return state.actualSessionStart || state.actualStart || null;
}

function formatSessionDate(dateKey) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(`${dateKey}T12:00:00+08:00`));
}

function formatClock(date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(timestamp));
}

function durationLabel(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return [hours ? `${hours} hr${hours === 1 ? "" : "s"}` : "", mins ? `${mins} min` : ""].filter(Boolean).join(" ");
}

function brandLockupMarkup() {
 return '<div class="institution-lockup"><div class="exam-identity"><span>Sunway International School</span><strong>November 2026 examinations</strong></div></div>';
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
      <nav class="clock-nav" aria-label="Clock links"><a href="/">PD Resources</a><a href="practice.html">Practice mode</a></nav>
      <h1 id="page-title">Choose the room clock.</h1>
      <p class="intro"><strong>Exam clock.</strong> DP reading includes listening. MYP records writing start; reading needs confirmation. Select the examination date and session, then choose the room being projected.</p>
      ${window.NOVEMBER_OPERATIONAL_CANCELLATIONS?.enabled ? '<p class="source-note">French ab initio sittings are currently cancelled. Original records are retained for restoration.</p>' : ""}
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
          <span id="selection-detail"><strong>${getActivePapers(selected).length} papers</strong> scheduled in ${selected.room}</span>
          <span class="source-note">Timings stay in this browser. On another computer, enter each paper's original actual start.</span>
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
    document.querySelector("#selection-detail").innerHTML = `<strong>${getActivePapers(chosen).length} paper${getActivePapers(chosen).length === 1 ? "" : "s"}</strong> scheduled in ${chosen.room}`;
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
  if (!isPaperActive(session, index)) return "";
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
          <span class="paper-meta">Source/planned ${scheduledStart} · ${durationLabel(durationMinutes)}${readingMinutes ? " + 5 min reading" : " · MYP writing only; confirm reading separately"}</span>
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
  const session = sessions.find((item) => item.id === selectedSessionId) || sessions[0];
  selectedSessionId = session.id;
  const now = new Date();
  const states = session.papers.map((_, index) => getPaperState(session, index));
  const unstartedCount = getActivePapers(session).filter(({ index }) => !getActualSessionStart(states[index]) && !states[index].finishedAt).length;
  [...selectedPaperIndices].forEach((index) => {
    const state = states[index];
    if (!isPaperActive(session, index) || !state || getActualSessionStart(state) || state.finishedAt) selectedPaperIndices.delete(index);
  });
  const hasSessionState = getActivePapers(session).some(({ index }) => getActualSessionStart(states[index]) || states[index].finishedAt);
  app.innerHTML = `
    <section class="clock-view${getActivePapers(session).length >= 5 ? " clock-view-many" : ""}" aria-label="Room Clock for ${session.room}">
      <header class="clock-header">
        <div class="brand-row">
          ${brandLockupMarkup()}
          <button class="back-button" id="back-to-selection" aria-label="Return to date, session and room selection">← Change session or room</button>
        </div>
        <div class="clock-focus">
          <div class="current-time" aria-live="off">
            <span class="time-kicker">Malaysia time (UTC+8)</span>
            <time class="time-value" id="current-time">${formatClock(now)}</time>
            <span class="date-value">${new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", weekday: "long", day: "numeric", month: "long" }).format(now)}</span>
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
          <span class="paper-count">${getActivePapers(session).length} paper${getActivePapers(session).length === 1 ? "" : "s"} in this room</span>
          <div class="toolbar-actions">
            ${unstartedCount ? `<button class="select-all" id="select-all">Select next start wave</button><button class="start-all" id="start-selected" ${selectedPaperIndices.size ? "" : "disabled"}>Start selected papers…</button>` : ""}
            <button class="reset-session" id="reset-session" ${hasSessionState ? "" : "disabled"}>Reset session</button>
          </div>
        </div>
        <div class="paper-list" id="paper-list">
          ${getActivePapers(session).map(({ paper, index }) => renderPaper(session, paper, index, now.getTime())).join("")}
        </div>
        <p class="footnote">Writing finish does not authorise release. Keep continuous supervision and follow coordinator release instructions.<br>November 2026 Examinations · Teacher PD clock</p>
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
    openResetConfirmation(session);
  });

  clearInterval(ticker);
  ticker = setInterval(() => {
    if (view !== "clock") return;
    const timeNode = document.querySelector("#current-time");
    if (timeNode) timeNode.textContent = formatClock(new Date());
    const currentNow = Date.now();
    document.querySelector("#paper-list").innerHTML = getActivePapers(session).map(({ paper, index }) => renderPaper(session, paper, index, currentNow)).join("");
    document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", handlePaperAction));
    document.querySelectorAll("[data-select-index]").forEach((checkbox) => checkbox.addEventListener("change", handlePaperSelection));
  }, 1000);
}

function handlePaperSelection(event) {
  const index = Number(event.currentTarget.dataset.selectIndex);
  const session = sessions.find((item) => item.id === selectedSessionId);
  if (!session || !isPaperActive(session, index)) return;
  if (event.currentTarget.checked) selectedPaperIndices.add(index);
  else selectedPaperIndices.delete(index);
  const startSelected = document.querySelector("#start-selected");
  if (startSelected) startSelected.disabled = selectedPaperIndices.size === 0;
}

function handlePaperAction(event) {
  const session = sessions.find((item) => item.id === selectedSessionId);
  const index = Number(event.currentTarget.dataset.index);
  if (!session || !isPaperActive(session, index)) return;
  if (event.currentTarget.dataset.action === "correct") {
    openTimeEntry(session, index, true);
    return;
  }
  if (event.currentTarget.dataset.action === "finish") setPaperState(session, index, { finishedAt: Date.now() });
  renderClock();
}

renderSelection();

