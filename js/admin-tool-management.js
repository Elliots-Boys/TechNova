'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  const $ = id => document.getElementById(id);
  const client = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
  let tools = [];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function message(text, good=false) { $('managerMessage').className='manager-message '+(good?'manager-good':'manager-error'); $('managerMessage').textContent=text; }
  async function log(action, slug) {
    const {data}=await client.auth.getUser();
    if(!data?.user)return;
    await client.from('admin_activity_log').insert({admin_user_id:data.user.id,action,target_type:'tool',target_id:slug,details:{}});
  }
  async function load() {
    const [list,stats]=await Promise.all([client.rpc('admin_list_tools'),client.rpc('admin_tool_usage_stats')]);
    if(list.error)throw list.error;if(stats.error)throw stats.error;
    tools=list.data||[];
    $('toolsTable').innerHTML=tools.length?tools.map(t=>'<tr><td><strong>'+escape(t.icon)+' '+escape(t.name)+'</strong><div class="manager-note">'+escape(t.slug)+'</div></td><td>'+escape(t.category)+'</td><td>'+(t.featured?'Yes':'No')+'</td><td>'+(t.enabled?'Enabled':'Disabled')+'</td><td><div class="manager-actions"><button class="btn" type="button" data-edit="'+escape(t.slug)+'">Edit</button><button class="btn" type="button" data-toggle="'+escape(t.slug)+'" data-enabled="'+(!t.enabled)+'">'+(t.enabled?'Disable':'Enable')+'</button></div></td></tr>').join(''):'<tr><td colspan="5">No tools found.</td></tr>';
    const usage=stats.data||[];
    $('usageTable').innerHTML=usage.length?usage.map(t=>'<tr><td>'+escape(t.name)+'</td><td>'+Number(t.total_uses||0).toLocaleString()+'</td><td>'+Number(t.uses_last_30_days||0).toLocaleString()+'</td></tr>').join(''):'<tr><td colspan="3">No usage recorded yet.</td></tr>';
  }
  function reset() {
    $('toolForm').reset();$('toolSlug').readOnly=false;$('toolIcon').value='🛠️';$('toolSortOrder').value='100';$('formHeading').textContent='Add a tool';
  }
  $('resetToolForm').addEventListener('click',reset);
  $('toolsTable').addEventListener('click',async event=>{
    const edit=event.target.closest('[data-edit]')?.dataset.edit;
    const toggle=event.target.closest('[data-toggle]');
    if(edit){const t=tools.find(item=>item.slug===edit);if(!t)return;$('toolSlug').value=t.slug;$('toolSlug').readOnly=true;$('toolName').value=t.name;$('toolDescription').value=t.description;$('toolCategory').value=t.category;$('toolPagePath').value=t.page_path;$('toolIcon').value=t.icon;$('toolSortOrder').value=t.sort_order;$('toolFeatured').checked=t.featured;$('formHeading').textContent='Edit '+t.name;$('toolForm').scrollIntoView({behavior:'smooth',block:'start'});}
    if(toggle){try{const slug=toggle.dataset.toggle,enabled=toggle.dataset.enabled==='true';const {error}=await client.rpc('admin_toggle_tool',{p_slug:slug,p_enabled:enabled});if(error)throw error;await log(enabled?'Admin enabled tool':'Admin disabled tool',slug);await load();message('Tool status updated.',true);}catch(error){message(error.message||'Could not update tool.');}}
  });
  $('toolForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const payload={p_slug:$('toolSlug').value.trim(),p_name:$('toolName').value.trim(),p_description:$('toolDescription').value.trim(),p_category:$('toolCategory').value.trim(),p_page_path:$('toolPagePath').value.trim(),p_icon:$('toolIcon').value.trim(),p_featured:$('toolFeatured').checked,p_sort_order:Number($('toolSortOrder').value)};
    try{const {error}=await client.rpc('admin_save_tool',payload);if(error)throw error;await log(payload.p_slug?'Admin saved tool metadata':'Admin created tool',payload.p_slug);reset();await load();message('Tool saved.',true);}catch(error){message(error.message||'Could not save tool.');}
  });
  try {
    const {data,error}=await client.auth.getUser();if(error||!data?.user){$('managerStatus').textContent='Please sign in as an administrator.';return;}
    const {data:role,error:roleError}=await client.from('user_roles').select('role').eq('user_id',data.user.id).maybeSingle();
    if(roleError||role?.role!=='admin'){$('managerStatus').textContent='Administrator access is required.';return;}
    $('managerStatus').textContent='Administrator access verified.';
    $('managerContent').hidden=false;
    await load();
  } catch(error) { $('managerStatus').textContent=error.message||'Tool management could not load. Apply the Phase 3 migration after review.'; }
});
