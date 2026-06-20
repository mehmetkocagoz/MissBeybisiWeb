// Admin panel — shared utilities loaded on every admin page.
// Handles: Supabase auth guard, active nav link, toast notifications.

import { supabase } from '../../js/supabase.js';

// ── Auth guard ────────────────────────────────────────────────────────────────
// Redirect to login if no active session.
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session && !location.pathname.endsWith('login.html')) {
    location.href = 'login.html';
  }
})();

// ── Active nav link ───────────────────────────────────────────────────────────
document.querySelectorAll('.sidebar-nav a').forEach(a => {
  if (a.href === location.href) a.classList.add('active');
});

// ── Toast ─────────────────────────────────────────────────────────────────────
export function showToast(msg, duration = 3000) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Format helpers ────────────────────────────────────────────────────────────
export function fmtMoney(n) {
  return '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR');
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
export function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
}
export function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}

// Wire all .modal__close buttons
document.querySelectorAll('.modal__close').forEach(btn => {
  const modal = btn.closest('.modal-backdrop');
  if (modal) btn.addEventListener('click', () => modal.classList.add('hidden'));
});

// Close modal on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) backdrop.classList.add('hidden');
  });
});

// ── Sign out ──────────────────────────────────────────────────────────────────
document.getElementById('signout-btn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.href = 'login.html';
});

export { supabase };
