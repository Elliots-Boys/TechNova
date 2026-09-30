'use strict';

function ticketClient(){
  if(window.supabaseClient) return window.supabaseClient;
  if(!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY){
    throw new Error('TechNova Supabase configuration is unavailable.');
  }
  window.supabaseClient=window.supabase.createClient(window.TECHNOVA_SUPABASE_URL,window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
  return window.supabaseClient;
}

function ticketText(value,fallback='—'){
  return value===null || value===undefined || value==='' ? fallback : String(value);
}

function createTicketQr(ticketId){
  const wrapper=document.createElement('div');
  wrapper.style.cssText='background:white;padding:8px;border-radius:12px;width:130px;height:130px;box-sizing:border-box;display:grid;place-items:center;overflow:hidden';

  const img=document.createElement('img');
  img.alt=`QR code for ticket ${ticketId}`;
  img.width=114;
  img.height=114;
  img.loading='lazy';
  img.referrerPolicy='no-referrer';

  // Keep the QR payload minimal: only the ticket ID is encoded.
  // This avoids exposing the user's UUID to a QR image service.
  const payload=encodeURIComponent(`TechNova ticket:${ticketId}`);
  img.src=`https://quickchart.io/qr?text=${payload}&size=130&margin=1`;

  img.onerror=()=>{
    wrapper.innerHTML='';
    const fallback=document.createElement('div');
    fallback.style.cssText='background:#07101c;color:#dbe7f5;border:1px solid #29415e;border-radius:10px;padding:10px;text-align:center;font-size:12px;width:100%;box-sizing:border-box';
    fallback.innerHTML='<strong>QR unavailable</strong><br><span style="color:#91a0b7">Ticket ID:</span>';
    const code=document.createElement('code');
    code.textContent=String(ticketId);
    code.style.wordBreak='break-all';
    fallback.appendChild(code);
    wrapper.appendChild(fallback);
  };

  wrapper.appendChild(img);
  return wrapper;
}

document.addEventListener('DOMContentLoaded',async()=>{
  const container=document.getElementById('tickets');
  if(!container) return;

  try{
    const client=ticketClient();
    const {data:{user},error:authError}=await client.auth.getUser();

    if(authError || !user){
      container.innerHTML='<p class="muted">Please sign in to view your tickets.</p>';
      return;
    }

    const {data:registrations,error:registrationError}=await client
      .from('event_registrations')
      .select('id,event_id,created_at')
      .eq('user_id',user.id)
      .order('created_at',{ascending:false});

    if(registrationError) throw registrationError;

    if(!registrations?.length){
      container.innerHTML='<p class="muted">You do not have any event tickets yet.</p><p style="margin-top:12px"><a class="btn primary" href="events.html">Browse events →</a></p>';
      return;
    }

    const eventIds=[...new Set(registrations.map(row=>row.event_id).filter(Boolean))];
    const {data:events,error:eventError}=await client
      .from('events')
      .select('id,title,event_date,event_time,location,event_type')
      .in('id',eventIds);

    if(eventError) throw eventError;

    const eventMap=new Map((events||[]).map(event=>[String(event.id),event]));

    container.replaceChildren(...registrations.map(registration=>{
      const event=eventMap.get(String(registration.event_id));
      const ticket=document.createElement('article');
      ticket.className='ticket';

      const info=document.createElement('div');
      const eyebrow=document.createElement('p');
      eyebrow.className='eyebrow';
      eyebrow.textContent='TECHNOVA EVENT TICKET';

      const title=document.createElement('h2');
      title.textContent=ticketText(event?.title,'Event');

      const date=document.createElement('p');
      date.textContent=`${ticketText(event?.event_date,'Date')} · ${ticketText(event?.event_time,'Time')}`;

      const location=document.createElement('p');
      location.textContent=ticketText(event?.location,'Location');

      const type=document.createElement('p');
      type.textContent=ticketText(event?.event_type,'Event');

      const id=document.createElement('p');
      id.textContent=`Ticket #${registration.id}`;

      info.append(eyebrow,title,date,location,type,id);
      ticket.append(info,createTicketQr(registration.id));
      return ticket;
    }));
  }catch(error){
    console.error('Ticket loading failed:',error);
    container.innerHTML=`<p class="muted">Could not load tickets: ${error.message||'Unknown error'}</p>`;
  }
});
