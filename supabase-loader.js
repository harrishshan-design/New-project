(function () {
  if (window.supabase && window.supabase.createClient) return;
  document.write('<script src="https://unpkg.com/@supabase/supabase-js@2"><\\/script>');
})();
