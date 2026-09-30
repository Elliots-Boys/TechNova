window.TECHNOVA_SUPABASE_URL = 'https://maxlbgiomkdfynnjoghs.supabase.co';
window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3amRIAMooV9mO3sMzFTk4w_abOAuGX4';

/* Load the Admin Tools launcher only on the admin dashboard. */
if (window.location.pathname.endsWith('/admin.html')) {
  const adminToolsScript = document.createElement('script');
  adminToolsScript.src = '../js/admin-tools.js';
  adminToolsScript.defer = true;
  document.head.appendChild(adminToolsScript);
}

/* Add Reports to the normal site navigation on every page that loads this config. */
const reportsNavScript = document.createElement('script');
reportsNavScript.src = window.location.pathname.includes('/pages/')
  ? '../js/reports-nav.js'
  : 'js/reports-nav.js';
reportsNavScript.defer = true;
document.head.appendChild(reportsNavScript);
