// Overrides for relief.js — loaded after relief.js.
// Replaces the static window.RELIEF_PROJECTS array with data fetched live
// from /api/v1/relief-projects, refreshed every time the relief list or a
// project detail is opened. Render functions in relief.js themselves are
// untouched — they already read from window.RELIEF_PROJECTS.
(function () {
  window.refreshReliefProjects = async function () {
    try {
      const rows = await window.API.get('/relief-projects');
      window.RELIEF_PROJECTS = rows.map(window.API.mapReliefProject);
    } catch (e) {
      console.warn('refreshReliefProjects failed', e);
    }
  };

  const origRenderReliefList = window.renderReliefList;
  window.renderReliefList = async function () {
    await window.refreshReliefProjects();
    origRenderReliefList();
  };
  if (window.MODULE_HOOKS) window.MODULE_HOOKS.relief = window.renderReliefList;

  const origOpenReliefProject = window.openReliefProject;
  window.openReliefProject = async function (id) {
    try {
      const full = await window.API.get('/relief-projects/' + id);
      const mapped = window.API.mapReliefProject(full);
      const idx = window.RELIEF_PROJECTS.findIndex((p) => p.id === id);
      if (idx >= 0) window.RELIEF_PROJECTS[idx] = mapped;
      else window.RELIEF_PROJECTS.push(mapped);
    } catch (e) {
      console.warn('openReliefProject refresh failed', e);
    }
    origOpenReliefProject(id);
  };
})();
