// Overrides for ctg-core.js mutation points — loaded after ctg-core.js.
// Placeholder: activation/task-level API integration still TODO.
// Currently a no-op pass-through so the base prototype behaviour (in-memory
// simulation) keeps working while the real API wiring is completed.
(function () {
  // TODO: wrap window.applyLevel / window.setScenario to call
  // POST /events/activate and /events/:id/deactivate for non-demo flows.
})();
