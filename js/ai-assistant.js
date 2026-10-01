'use strict';

const techNovaWordbankClient = window.supabase.createClient(
  window.TECHNOVA_SUPABASE_URL,
  window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
);

const TECHNOVA_WORDBANK = [
  {
    keywords: ['hello','hi','hey'],
    answer: 'Hi! I’m the TechNova wordbank assistant. Ask me about AI, computers, programming, cybersecurity, robotics, cloud computing, web development, hardware or TechNova events.'
  },
  {
    keywords: ['what is technova','technova'],
    answer: 'TechNova is your technology community site for events, articles, learning resources, achievements, tickets, quizzes and other tech features.'
  },
  {
    keywords: ['artificial intelligence',' ai ','ai'],
    answer: 'Artificial intelligence is software designed to perform tasks that normally require human-like abilities such as recognising patterns, understanding language, making predictions or generating content.'
  },
  {
    keywords: ['machine learning','ml'],
    answer: 'Machine learning is a branch of AI where a system learns patterns from data instead of having every rule written by hand.'
  },
  {
    keywords: ['cybersecurity','cyber security','security'],
    answer: 'Cybersecurity is the protection of computers, accounts, networks and data from unauthorised access, damage or disruption. Strong passwords, MFA, updates and careful handling of links are good basics.'
  },
  {
    keywords: ['cloud computing','cloud'],
    answer: 'Cloud computing means using computing resources such as storage, databases or servers over the internet instead of relying only on one local device.'
  },
  {
    keywords: ['robotics','robot'],
    answer: 'Robotics combines programming, electronics and mechanical systems to build machines that can sense, decide and act.'
  },
  {
    keywords: ['html'],
    answer: 'HTML gives a webpage its structure: headings, paragraphs, links, forms, images and other content.'
  },
  {
    keywords: ['css'],
    answer: 'CSS controls the appearance and layout of a webpage, including spacing, fonts, responsive layouts, borders and visual effects.'
  },
  {
    keywords: ['javascript',' js ','javascript'],
    answer: 'JavaScript adds behaviour to webpages. It can respond to clicks, validate forms, call APIs, update content and work with services such as Supabase.'
  },
  {
    keywords: ['supabase'],
    answer: 'Supabase is a backend platform built around PostgreSQL. TechNova uses it for things such as accounts, database records, Row Level Security and server-side functions.'
  },
  {
    keywords: ['github'],
    answer: 'GitHub stores your project code using Git. TechNova uses the repository as the source for your HTML, CSS, JavaScript and Supabase project files.'
  },
  {
    keywords: ['cpu','processor'],
    answer: 'The CPU is the computer’s general-purpose processor. It handles instructions for the operating system, apps, games and background tasks.'
  },
  {
    keywords: ['gpu','graphics card'],
    answer: 'A GPU is designed for highly parallel calculations and is especially important for graphics, gaming, video work and many AI workloads.'
  },
  {
    keywords: ['ram','memory'],
    answer: 'RAM is fast temporary memory used by programs while your computer is running. More RAM helps when many programs or large workloads are open at once.'
  },
  {
    keywords: ['ssd','storage'],
    answer: 'An SSD stores files permanently and is much faster than an old mechanical hard drive for booting, loading apps and moving files.'
  },
  {
    keywords: ['database','sql'],
    answer: 'A database stores structured information. SQL is the language commonly used to create, read, update and organise data in relational databases such as PostgreSQL.'
  },
  {
    keywords: ['programming','coding','code'],
    answer: 'Programming is the process of giving computers instructions. A good way to improve is to build small projects, test them, read errors carefully and gradually add features.'
  },
  {
    keywords: ['project idea','technology project','tech project'],
    answer: 'Project ideas: a technology news dashboard, event booking site, quiz app, PC-part compatibility checker, study tracker, weather dashboard or a small community site with accounts and saved content.'
  }
];

function normaliseWordbankText(value) {
  return ` ${String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function wordbankScore(message, entry) {
  const text = normaliseWordbankText(message);
  let score = 0;

  for (const keyword of entry.keywords) {
    const key = normaliseWordbankText(keyword).trim();
    if (!key) continue;

    if (text.includes(` ${key} `)) score += 4;
    else if (text.includes(key)) score += 2;
  }

  return score;
}

function findWordbankAnswer(message) {
  let best = null;
  let bestScore = 0;

  for (const entry of TECHNOVA_WORDBANK) {
    const score = wordbankScore(message, entry);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  return bestScore > 0 ? best.answer : null;
}

async function liveEventsAnswer() {
  try {
    const { data, error } = await techNovaWordbankClient
      .from('events')
      .select('title,event_date,event_time,location,event_type')
      .gte('event_date', new Date().toISOString().slice(0, 10))
      .order('event_date', { ascending: true })
      .limit(6);

    if (error) throw error;

    if (!data?.length) {
      return 'There are no upcoming TechNova events listed right now.';
    }

    return 'Upcoming TechNova events:\n' + data.map(event =>
      `• ${event.title} — ${event.event_date}${event.event_time ? ' at ' + String(event.event_time).slice(0,5) : ''} — ${event.location}`
    ).join('\n');
  } catch (error) {
    console.warn('Could not load live TechNova events:', error);
    return 'I could not load the live event list right now. You can still check the Events page.';
  }
}

async function answerFromWordbank(message) {
  const lower = normaliseWordbankText(message);

  if (
    lower.includes(' event ') ||
    lower.includes(' events ') ||
    lower.includes(' coming up ') ||
    lower.includes(' upcoming ')
  ) {
    return liveEventsAnswer();
  }

  return findWordbankAnswer(message) ||
    'I do not have that answer in my TechNova wordbank yet. Try asking about AI, programming, cybersecurity, cloud computing, robotics, HTML, CSS, JavaScript, Supabase, GitHub, computer hardware, databases, project ideas or upcoming events.';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('aiForm');
  const input = document.getElementById('aiInput');
  const chat = document.getElementById('aiChat');
  const status = document.getElementById('aiStatus');

  if (!form || !input || !chat) return;

  const addMessage = (text, role) => {
    const el = document.createElement('div');
    el.className = `ai-msg ${role}`;
    el.textContent = text;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  };

  const awardAchievement = async () => {
    try {
      const { data: { user } } =
        await techNovaWordbankClient.auth.getUser();

      if (!user) return;

      await techNovaWordbankClient.rpc('award_xp', {
        p_amount: 0,
        p_achievement_slug: 'ai-chat'
      });
    } catch (_) {}
  };

  const ask = async message => {
    addMessage(message, 'user');
    status.textContent = 'Searching the TechNova wordbank…';
    input.disabled = true;

    try {
      const answer = await answerFromWordbank(message);
      addMessage(answer, 'assistant');
      await awardAchievement();
      status.textContent = '';
    } catch (error) {
      console.error('TechNova wordbank assistant:', error);
      addMessage(
        'Sorry, the TechNova wordbank could not answer that right now.',
        'assistant'
      );
      status.textContent = '';
    } finally {
      input.disabled = false;
      input.focus();
    }
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    input.value = '';
    await ask(message);
  });

  document.querySelectorAll('.ai-prompt').forEach(button => {
    button.addEventListener('click', () => {
      input.value = button.textContent.trim();
      input.focus();
    });
  });
});
