window.TECHNOVA_SUPABASE_URL = 'https://maxlbgiomkdfynnjoghs.supabase.co';
window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3amRIAMooV9mO3sMzFTk4w_abOAuGX4';

/*
 * One shared Supabase client for the whole TechNova site.
 * A number of pages use the global name `supabaseClient`, so create it
 * once here after the Supabase CDN script has loaded.
 */
if (window.supabase && !window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(
    window.TECHNOVA_SUPABASE_URL,
    window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
  );
}

/* Load the Admin Tools launcher only on the admin dashboard. */
if (window.location.pathname.endsWith('/admin.html')) {
  const adminToolsScript = document.createElement('script');
  adminToolsScript.src = '../js/admin-tools.js?v=22';
  adminToolsScript.defer = true;
  document.head.appendChild(adminToolsScript);
}

/* Add Reports to the normal site navigation on every page that loads this config. */
const reportsNavScript = document.createElement('script');
reportsNavScript.src = window.location.pathname.includes('/pages/')
  ? '../js/reports-nav.js?v=22'
  : 'js/reports-nav.js?v=22';
reportsNavScript.defer = true;
document.head.appendChild(reportsNavScript);

/* Add the TechNova community/AI navigation without replacing existing page markup. */
const featureNavScript = document.createElement('script');
featureNavScript.src = window.location.pathname.includes('/pages/')
  ? '../js/site-features.js?v=22'
  : 'js/site-features.js?v=22';
featureNavScript.defer = true;
document.head.appendChild(featureNavScript);
