// Overrides for admin.js — loaded after admin.js.
// Replaces window.PEOPLE (mutated locally in the prototype) with real data
// fetched from /api/v1/users on every render, and wires saveUser/deleteUser/
// openUserForm/renderAdmin's audit tab to the real API instead of mutating
// in-memory-only arrays. assignMockRoles() is neutralised since real users
// already carry role_id from D1 (merged in bootstrap.js).
(function () {
  const $ = (id) => document.getElementById(id);

  // Prevent admin.js#renderAdmin from overwriting real role_id with the
  // hardcoded person-id -> role map (assignMockRoles only touches people
  // missing p.roleId, so once real data is merged this is already a no-op,
  // but we neutralise it explicitly for clarity/robustness).
  window.assignMockRoles = function () {};

  // ---------------------------------------------------------------------
  // Keep window.PEOPLE in sync with the real /users table. Called before
  // every admin render so the Users/Roles tabs always show live data.
  // ---------------------------------------------------------------------
  window.refreshPeopleFromApi = async function () {
    try {
      const rows = await window.API.get('/users?limit=100');
      const list = Array.isArray(rows) ? rows : rows.data || [];
      window.PEOPLE = list.map(window.API.mapUser);
    } catch (e) {
      console.warn('refreshPeopleFromApi failed', e);
    }
  };

  const origRenderAdmin = window.renderAdmin;
  window.renderAdmin = async function () {
    await window.refreshPeopleFromApi();
    try {
      const auditRows = await window.API.get('/audit?limit=200');
      window.ADMIN_STATE.auditLog = auditRows.map(window.API.mapAuditRow);
    } catch (e) {
      console.warn('audit fetch failed', e);
    }
    origRenderAdmin();
  };
  if (window.MODULE_HOOKS) window.MODULE_HOOKS.admin = window.renderAdmin;

  // ---------------------------------------------------------------------
  // openUserForm — same modal markup as the original, but roleId select
  // options should reflect the fixed 8 D1 roles (window.ROLES already
  // matches, since admin.js's ROLES const mirrors the seeded roles table).
  // No override needed for the modal HTML itself — only the save/delete
  // handlers below need to hit the real API.
  // ---------------------------------------------------------------------
  window.saveUser = async function (id) {
    const name = $('uf_name').value.trim();
    if (!name) { window.toast('Nhập họ tên', 'warn'); return; }
    const payload = {
      name: name,
      businessTitle: $('uf_role').value.trim(),
      unitCode: $('uf_unit').value,
      roleId: $('uf_roleId').value,
      phone: $('uf_phone').value.trim(),
      active: $('uf_online').value === 'true' ? 1 : 0, // dropdown maps to the DB 'active' (account enabled) flag; live 'online' presence is session-derived and not admin-settable here
    };
    try {
      if (id) {
        await window.API.patch('/users/' + id, payload);
        window.toast('✓ Đã cập nhật <b>' + name + '</b>', 'good');
      } else {
        const username = 'u' + Date.now();
        await window.API.post('/users', Object.assign({ username: username }, payload));
        window.toast('✓ Đã tạo <b>' + name + '</b> (tài khoản: ' + username + ')', 'good');
      }
      window.closeModal('admin-generic');
      await window.refreshPeopleFromApi();
      window.renderAdmin ? null : null;
      const tabEl = $('adminTabContent');
      if (tabEl && window.ADMIN_STATE.activeTab === 'users' && window.adminTab) window.adminTab('users');
    } catch (e) {
      window.toast('Lỗi lưu người dùng: ' + (e.message || ''), 'crit');
      console.error(e);
    }
  };

  window.deleteUser = async function (id) {
    const p = window.PEOPLE.find((x) => x.id === id);
    if (!p) return;
    if (!confirm('Xoá "' + p.name + '"? Thao tác sẽ được ghi vào Audit Log.')) return;
    try {
      await window.API.del('/users/' + id);
      window.toast('🗑 Đã xoá <b>' + p.name + '</b>', 'warn');
      await window.refreshPeopleFromApi();
      if (window.ADMIN_STATE.activeTab === 'users' && window.adminTab) window.adminTab('users');
    } catch (e) {
      window.toast('Lỗi xoá người dùng: ' + (e.message || ''), 'crit');
      console.error(e);
    }
  };
})();
