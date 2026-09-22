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

// Existing correction and reset semantics remain intact.
run(`setPaperState(sessions[3], 0, { finishedAt: ${start + 1000} })`);
run(`applyStartTime(sessions[3], "08:00", 0, true, ${start})`);
assert.equal(run("getPaperState(sessions[3], 0).actualSessionStart"), earlier);
assert.equal(run("getPaperState(sessions[3], 0).finishedAt"), start + 1000);
run(`setPaperState(sessions[4], 0, { actualSessionStart: ${earlier} })`);
run("clearSessionState(sessions[3])");
assert.equal(run("getPaperState(sessions[3], 0).actualSessionStart"), undefined);
assert.equal(run("getPaperState(sessions[4], 0).actualSessionStart"), earlier);

console.log("PASS: selected starts, unselected isolation, eligible-only selection UI, started/finished preservation, calculations, and persistence.");
