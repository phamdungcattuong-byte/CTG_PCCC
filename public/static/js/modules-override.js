// Overrides for ctg-modules.js mutation points — loaded after ctg-modules.js.
// TODO (next session): replace confirmActivate / openTaskDetail's ack+done
// handlers / ackAllMine / saveIncident / exportLog with real API calls:
//   POST /events/activate
//   POST /events/:id/tasks/:tid/ack
//   POST /events/:id/tasks/:tid/done
//   POST /incidents
// Placeholder no-op for now so the base prototype's in-memory behaviour
// keeps working end-to-end while API wiring is finished.
(function () {})();
