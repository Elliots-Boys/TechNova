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

  // Prefer the QRCode library already loaded by tickets.html.
  // This avoids depending on an external QR-image service.
  if(window.QRCode && typeof window.QRCode.toCanvas==='function'){
    const canvas=document.createElement('canvas');
    canvas.width=114;
    canvas.height=114;
    canvas.setAttribute('aria-label',`QR code for ticket ${ticketId}`);
    wrapper.appendChild(canvas);

    window.QRCode.toCanvas(
      canvas,
      `TechNova ticket:${ticketId}`,
      {width:114,margin:1},
      error=>{
        if(error){
          console.warn('QR generation failed:',error);
          showTicketIdFallback(wrapper,ticketId);
        }
      }
    );

    return wrapper;
  }

  // Fallback if the QR library failed to load.
  showTicketIdFallback(wrapper,ticketId);
  return wrapper;
}

function showTicketIdFallback(wrapper,ticketId){
  wrapper.innerHTML='';
  const fallback=document.createElement('div');
  fallback.style.cssText='background:#07101c;color:#dbe7f5;border:1px solid #29415e;border-radius:10px;padding:10px;text-align:center;font-size:12px;width:100%;box-sizing:border-box';
  const strong=document.createElement('strong');
  strong.textContent='Ticket ID';
  const code=document.createElement('code');
  code.textContent=String(ticketId);
  code.style.wordBreak='break-all';
  fallback.append(strong,document.createElement('br'),code);
  wrapper.appendChild(fallback);
}

function renderTicket(registration,event){
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
}

document.addEventListener('DOMContentLoaded',async()=>{
  const container=document.getElementById('tickets');
  if(!container) return;

  try{
    const client=ticketClient();
    const {data:{user},error:authError}=await client.auth.getUser();

    if(authError || !user){
      container.innerHTML='<p class="muted">Please sign in to view your tickets.</p><p style="margin-top:12px"><a class="btn primary" href="login.html">Sign in →</a></p>';
      return;
    }

    // A ticket is created from an event registration. Only the signed-in
    // user's registrations are requested, so the page never exposes another
    // user's event registrations.
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

    const eventIds=[...new Set(registrations.map(row=>row.event_id).filter(id=>id!==null && id!==undefined))];
    let events=[];

    if(eventIds.length){
      const {data,eventError}=await client
        .from('events')
        .select('id,title,event_date,event_time,location,event_type')
        .in('id',eventIds);

      if(eventError) throw eventError;
      events=data||[];
    }

    const eventMap=new Map(events.map(event=>[String(event.id),event]));
    container.replaceChildren(...registrations.map(registration=>renderTicket(registration,eventMap.get(String(registration.event_id)))));
  }catch(error){
    console.error('Ticket loading failed:',error);
    container.innerHTML=`<p class="muted">Could not load tickets: ${error.message||'Unknown error'}</p><p style="margin-top:12px"><a class="btn" href="events.html">Back to events</a></p>`;
  }
});
