const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const source = fs.readFileSync(`${__dirname}/app.js`, "utf8");
const storage = new Map();

function boot(document = { querySelector: () => ({}) }, clock = Date) {
  const context = vm.createContext({
    document,
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
    Intl,
    Date: clock,
    console,
    clearInterval() {},
    setInterval() {},
    window: { confirm: () => true },
  });
  vm.runInContext(source.replace(/renderSelection\(\);\s*$/, ""), context);
  return (expression) => vm.runInContext(expression, context);
}

function makeUi() {
  const elements = new Map();
  const makeElement = () => ({
    innerHTML: "", value: "", textContent: "", hidden: false, listeners: {},
    addEventListener(type, handler) { this.listeners[type] = handler; },
    dispatch(type, event = {}) { this.listeners[type]?.(event); },
    close() { this.open = false; },
    showModal() { this.open = true; },
    focus() {},
  });
  return {
    elements,
    document: {
      querySelector(selector) {
        if (!elements.has(selector)) elements.set(selector, makeElement());
        return elements.get(selector);
      },
      querySelectorAll() { return []; },
    },
  };
}

let run = boot();
const session = "sessions[3]";
const start = new Date("2026-09-23T08:07:00").getTime();

assert.equal(run("sessions.reduce((count, item) => count + item.papers.length, 0)"), 62);
assert.equal(run('sessions.filter((item) => item.date === "2026-09-24" && item.label === "Morning").map((item) => item.room).join(",")'), "BF-02,BF-04,MPH");
assert.equal(run('sessions.filter((item) => item.date === "2026-09-25").map((item) => item.room).join(",")'), "BF-01,BF-02,BF-03,BF-04");
assert.equal(run('sessions.find((item) => item.date === "2026-09-23" && item.label === "Morning").room'), "BF-04 & BF-02");

// Existing start-time validation rejects malformed and future values without writing state.
assert.equal(run(`parseStartTime(${session}, "08:07", ${start})`), start);
assert.equal(run(`parseStartTime(${session}, "08:00:30", ${start})`), new Date("2026-09-23T08:00:30").getTime());
for (const value of ["", "08:7", "24:00", "08:60", "08:08"]) {
  const before = storage.get("mock-exam-clock-v1");
  assert.throws(() => run(`applyStartTime(${session}, ${JSON.stringify(value)}, [0], false, ${start})`));
  assert.equal(storage.get("mock-exam-clock-v1"), before);
}

// One entered time starts only the selected papers, while each keeps its own calculations.
run(`applyStartTime(${session}, "08:07", [0, 2, 3], false, ${start})`);
for (const index of [0, 2, 3]) {
  assert.equal(run(`getPaperState(${session}, ${index}).actualSessionStart`), start);
}
for (const index of [1, 4]) {
  assert.equal(run(`getPaperState(${session}, ${index}).actualSessionStart`), undefined);
}
assert.equal(run(`getPaperState(${session}, 2).actualSessionStart + (getReadingMinutes(${session}.papers[2][1]) + ${session}.papers[2][2]) * 60000`), start + 125 * 60000);
assert.equal(run(`getPaperState(${session}, 3).actualSessionStart + (getReadingMinutes(${session}.papers[3][1]) + ${session}.papers[3][2]) * 60000`), start + 65 * 60000);

// Reading, warning, end, and listening boundaries retain the existing timing engine.
const writingStart = start + 5 * 60000;
const psychologyHlEnd = writingStart + 120 * 60000;
assert.equal(run(`getDisplayStatus(getPaperState(${session}, 2), 120, 5, ${writingStart - 1}).label`), "Reading");
assert.equal(run(`getDisplayStatus(getPaperState(${session}, 2), 120, 5, ${writingStart}).label`), "Active");
assert.equal(run(`getDisplayStatus(getPaperState(${session}, 2), 120, 5, ${psychologyHlEnd - 30 * 60000}).label`), "30 min remaining");
assert.equal(run(`getDisplayStatus(getPaperState(${session}, 2), 120, 5, ${psychologyHlEnd - 5 * 60000}).label`), "5 min remaining");
assert.equal(run(`getDisplayStatus(getPaperState(${session}, 2), 120, 5, ${psychologyHlEnd}).label`), "Time elapsed");
assert.equal(run('getReadingMinutes(sessions[5].papers[0][1])'), 0);
assert.equal(run(`getDisplayStatus({ actualSessionStart: ${start} }, 45, 0, ${start}).label`), "Active");
assert.equal(run(`getDisplayStatus({ actualSessionStart: ${start} }, 45, 0, ${start + 45 * 60000}).label`), "Time elapsed");

// A finished paper and an already-started paper cannot be overwritten.
const earlier = new Date("2026-09-23T08:00:00").getTime();
run(`setPaperState(${session}, 0, { actualSessionStart: ${earlier}, finishedAt: ${start + 1000} })`);
run(`setPaperState(${session}, 1, { actualSessionStart: ${earlier}, finishedAt: null })`);
run(`applyStartTime(${session}, "08:07", [0, 1, 4], false, ${start})`);
assert.equal(run(`getPaperState(${session}, 0).actualSessionStart`), earlier);
assert.equal(run(`getPaperState(${session}, 0).finishedAt`), start + 1000);
assert.equal(run(`getPaperState(${session}, 1).actualSessionStart`), earlier);
assert.equal(run(`getPaperState(${session}, 4).actualSessionStart`), start);

// Select all includes only papers that remain not started.
run(`setPaperState(${session}, 4, { actualSessionStart: null, actualStart: null, finishedAt: null })`);
run(`selectAllUnstarted(${session})`);
assert.equal(run("JSON.stringify([...selectedPaperIndices])"), "[4]");

// Rendering exposes checkboxes only for papers that have not started or finished.
const html = run(`renderPaper(${session}, ${session}.papers[0], 0, ${start}) + renderPaper(${session}, ${session}.papers[1], 1, ${start}) + renderPaper(${session}, ${session}.papers[2], 2, ${start})`);
assert.equal((html.match(/data-select-index/g) || []).length, 0);
run(`setPaperState(${session}, 2, { actualSessionStart: null, actualStart: null, finishedAt: null })`);
assert.match(run(`renderPaper(${session}, ${session}.papers[2], 2, ${start})`), /data-select-index="2"/);
assert.doesNotMatch(source, /Start paper…/);
assert.match(source, />Select all</);
assert.match(source, />Start selected papers…</);

// Browser-local persistence still reconstructs the same selected-paper timestamps after reload.
const persisted = storage.get("mock-exam-clock-v1");
run = boot();
assert.equal(storage.get("mock-exam-clock-v1"), persisted);
assert.equal(run(`getPaperState(${session}, 0).actualSessionStart`), earlier);
assert.equal(run(`getPaperState(${session}, 3).actualSessionStart`), start);

// The existing time-entry dialog is opened once for the selection and clears it after applying.
storage.clear();
const ui = makeUi();
class TestDate extends Date { static now() { return start; } }
run = boot(ui.document, TestDate);
run("selectedPaperIndices.add(0); selectedPaperIndices.add(2); openTimeEntry(sessions[3], [0, 2])");
assert.equal(ui.elements.get("#time-entry").open, true);
assert.match(ui.elements.get("#time-entry").innerHTML, /2 selected papers/);
ui.elements.get("#actual-start-time").value = "08:07:00";
ui.elements.get("#time-entry-form").dispatch("submit", { preventDefault() {} });
assert.equal(run("getPaperState(sessions[3], 0).actualSessionStart"), start);
assert.equal(run("getPaperState(sessions[3], 2).actualSessionStart"), start);
assert.equal(run("getPaperState(sessions[3], 1).actualSessionStart"), undefined);
assert.equal(run("selectedPaperIndices.size"), 0);

// Cancelling a selected start is inert.
storage.clear();
run("selectedPaperIndices.add(1); openTimeEntry(sessions[3], [1])");
ui.elements.get("#cancel-start-time").dispatch("click");
assert.equal(run("Object.keys(readState()).length"), 0);

// Existing correction and reset semantics remain intact.
run(`setPaperState(sessions[3], 0, { actualSessionStart: ${start}, finishedAt: ${start + 1000} })`);
run("openTimeEntry(sessions[3], 0, true)");
ui.elements.get("#actual-start-time").value = "08:00:00";
ui.elements.get("#time-entry-form").dispatch("submit", { preventDefault() {} });
assert.equal(run("getPaperState(sessions[3], 0).actualSessionStart"), start);
assert.equal(ui.elements.get("#time-entry-confirmation").hidden, false);
ui.elements.get("#actual-start-time").value = "08:01:00";
ui.elements.get("#actual-start-time").dispatch("input");
assert.equal(ui.elements.get("#time-entry-confirmation").hidden, true);
ui.elements.get("#actual-start-time").value = "08:00:00";
ui.elements.get("#actual-start-time").dispatch("input");
ui.elements.get("#time-entry-form").dispatch("submit", { preventDefault() {} });
assert.equal(run("getPaperState(sessions[3], 0).actualSessionStart"), start);
ui.elements.get("#time-entry-form").dispatch("submit", { preventDefault() {} });
assert.equal(run("getPaperState(sessions[3], 0).actualSessionStart"), earlier);
assert.equal(run("getPaperState(sessions[3], 0).finishedAt"), start + 1000);
run(`setPaperState(sessions[4], 0, { actualSessionStart: ${earlier} })`);
run("clearSessionState(sessions[3])");
assert.equal(run("getPaperState(sessions[3], 0).actualSessionStart"), undefined);
assert.equal(run("getPaperState(sessions[4], 0).actualSessionStart"), earlier);

console.log("PASS: selected starts, unselected isolation, eligible-only selection UI, started/finished preservation, calculations, and persistence.");
