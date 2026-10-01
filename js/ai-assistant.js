'use strict';

/*
 * TechNova built-in assistant.
 *
 * This version does not call an external AI provider and does not require
 * an OpenAI/API key. It uses a built-in technology wordbank plus a small
 * answer generator for questions that a user chooses to add.
 *
 * User-added answers are saved in localStorage on the device/browser.
 */

const TECHNOVA_WORDBANK_STORAGE = 'technova_ai_wordbank_v1';

const TECHNOVA_WORDBANK = {
  'what is ai':'AI (artificial intelligence) is technology that allows computers to perform tasks that normally require human-like reasoning, such as recognising patterns, understanding language and making predictions.',
  'what is artificial intelligence':'Artificial intelligence is technology that allows computers to perform tasks that normally require human-like reasoning, such as recognising patterns, understanding language and making predictions.',
  'what is machine learning':'Machine learning is a branch of AI where computers learn patterns from data and use those patterns to make predictions or decisions.',
  'what is deep learning':'Deep learning is a type of machine learning that uses multi-layer neural networks to learn complex patterns from data.',
  'what is a neural network':'A neural network is a machine-learning model made from connected computational units. It learns patterns by adjusting numerical weights during training.',
  'what is generative ai':'Generative AI creates new content such as text, images, audio, video or code by learning patterns from existing data.',
  'what is an llm':'An LLM, or large language model, is an AI model trained on large amounts of text so it can predict and generate language.',
  'what is a chatbot':'A chatbot is software designed to communicate with people through text or speech. It can use rules, databases or AI models to produce responses.',
  'what is coding':'Coding is the process of writing instructions that a computer can execute. Common programming languages include JavaScript, Python, Java, C# and C++.',
  'what is programming':'Programming is the process of designing and writing computer instructions to solve problems or create software.',
  'what is javascript':'JavaScript is a programming language commonly used to make websites interactive. It can also run outside browsers using environments such as Node.js.',
  'what is html':'HTML, or HyperText Markup Language, defines the structure and content of web pages using elements such as headings, paragraphs, links, images and forms.',
  'what is css':'CSS, or Cascading Style Sheets, controls the appearance and layout of web pages, including colours, spacing, typography, grids and responsive design.',
  'what is python':'Python is a general-purpose programming language known for readable syntax. It is widely used for web development, automation, data analysis, AI and scripting.',
  'what is an api':'An API, or application programming interface, is a defined way for software systems to communicate and exchange data or request actions.',
  'what is json':'JSON is a lightweight text format commonly used to represent structured data, especially between web applications and APIs.',
  'what is a database':'A database is an organised system for storing, managing and retrieving data efficiently.',
  'what is sql':'SQL is a language used to query and manage data in relational databases.',
  'what is postgres':'PostgreSQL is an open-source relational database system known for strong SQL support, reliability and advanced features.',
  'what is supabase':'Supabase is a development platform built around PostgreSQL that provides database, authentication, storage, realtime and backend services.',
  'what is cloud computing':'Cloud computing provides computing resources such as servers, storage and databases over the internet instead of requiring everything to run locally.',
  'what is cloudflare':'Cloudflare provides internet infrastructure and security services including CDN, DNS, DDoS protection and serverless application platforms.',
  'what is a cdn':'A CDN, or content delivery network, serves content from locations around the world so users can often receive it from a nearby server.',
  'what is dns':'DNS, or Domain Name System, translates domain names such as example.com into IP addresses used to connect to servers.',
  'what is an ip address':'An IP address identifies a device or network interface on a network. IPv4 uses 32 bits and IPv6 uses 128 bits.',
  'what is http':'HTTP is the protocol commonly used for communication between web browsers and web servers.',
  'what is https':'HTTPS is HTTP protected by encryption using TLS. It helps protect data travelling between a browser and a website.',
  'what is tls':'TLS is a cryptographic protocol used to protect data sent across networks. HTTPS commonly uses TLS to secure web traffic.',
  'what is a firewall':'A firewall controls network traffic according to security rules, helping block unwanted or unauthorised connections.',
  'what is phishing':'Phishing is a social-engineering attack where someone pretends to be a trustworthy person or service to trick users into revealing information or taking an unsafe action.',
  'what is malware':'Malware is malicious software designed to disrupt systems, steal information, gain unauthorised access or perform other harmful actions.',
  'what is ransomware':'Ransomware is malware that typically prevents access to data or systems and demands payment from its victims.',
  'what is two factor authentication':'Two-factor authentication, or 2FA, requires two different types of evidence when signing in, such as a password plus an authenticator code.',
  'what is encryption':'Encryption transforms readable data into protected ciphertext that can only be turned back into readable data using the appropriate key.',
  'what is a password manager':'A password manager securely stores passwords and can generate strong, unique passwords for different accounts.',
  'what is github':'GitHub is a platform for hosting Git repositories and collaborating on software through commits, branches, issues and pull requests.',
  'what is git':'Git is a distributed version-control system used to track changes to files and collaborate on software projects.',
  'what is a repository':'A repository is a project storage location that contains files and their version history. Git repositories track changes through commits.',
  'what is a git branch':'A Git branch is a separate line of development that lets you make changes without directly changing another branch.',
  'what is a pull request':'A pull request is a proposal to merge changes from one branch into another so the changes can be reviewed before merging.',
  'what is responsive design':'Responsive design makes a website adapt to different screen sizes and devices using flexible layouts, CSS media queries and scalable content.',
  'what is accessibility':'Web accessibility means designing websites so people with different abilities can use them, including people using keyboards or screen readers.',
  'what is seo':'SEO, or search engine optimisation, is the practice of improving a website so search engines can understand and potentially rank its content more effectively.',
  'what is a pwa':'A progressive web app, or PWA, is a website enhanced with app-like capabilities such as installation, caching and offline support.',
  'what is a service worker':'A service worker is a browser background script that can intercept network requests and enable caching, offline support and some background tasks.',
  'what is the dom':'The DOM, or Document Object Model, represents a web page as objects that JavaScript can read and modify.',
  'what is localstorage':'localStorage is browser storage that lets a website save small amounts of string data on a device so it can persist between page loads.',
  'what is an edge function':'An Edge Function is server-side code designed to run close to users at edge locations, often reducing latency for supported workloads.',
  'what is a gpu':'A GPU, or graphics processing unit, is a processor designed for highly parallel calculations. GPUs are used for graphics, games and many AI workloads.',
  'what is a cpu':'A CPU, or central processing unit, executes general-purpose computer instructions and coordinates many operations performed by a computer.',
  'what is ram':'RAM is fast temporary memory used by a computer to hold data and programs that are currently being used.',
  'what is an ssd':'An SSD is solid-state storage that uses flash memory rather than spinning magnetic disks. It is generally fast and resistant to physical shock.',
  'what is a motherboard':'A motherboard is the main circuit board that connects major computer components such as the CPU, RAM, storage and expansion devices.',
  'what is an operating system':'An operating system manages computer hardware and provides services and interfaces used by applications. Examples include Windows, Linux, macOS, Android and iOS.',
  'what is virtual reality':'Virtual reality, or VR, uses technology to create an immersive computer-generated environment that users can interact with using specialised hardware.',
  'what is augmented reality':'Augmented reality, or AR, overlays digital information or objects onto a view of the real world.',
  'what is blockchain':'A blockchain is a distributed digital ledger where records are grouped into blocks and linked using cryptographic techniques.',
  'what is cryptocurrency':'Cryptocurrency is a type of digital asset that typically uses cryptography and a distributed ledger to record transactions.',
  'what is quantum computing':'Quantum computing uses quantum-mechanical properties to process information in ways that differ from conventional computers.',
  'what is iot':'The Internet of Things, or IoT, describes physical devices containing sensors, software and network connectivity so they can exchange data.',
  'what is robotics':'Robotics combines mechanical engineering, electronics and software to design machines that can sense, calculate and perform physical actions.',
  'what is cybersecurity':'Cybersecurity is the practice of protecting computers, networks, applications and data from unauthorised access, attacks and disruption.',
  'what is a vpn':'A VPN, or virtual private network, creates an encrypted connection between a device and a VPN server, helping protect network traffic from local network observers.',
  'what is an algorithm':'An algorithm is a step-by-step procedure for solving a problem or completing a task.',
  'what is debugging':'Debugging is the process of finding, understanding and fixing problems in software.',
  'what is a bug':'A bug is an error or unexpected behaviour in software that causes it to behave differently from what was intended.',
  'what is open source':'Open-source software has source code made available under a licence that permits specified forms of inspection, modification and redistribution.',
  'what is technova':'TechNova is this technology-focused website, providing technology information, events, community features, achievements and other tools.',
  'what is tech nova':'TechNova is this technology-focused website, providing technology information, events, community features, achievements and other tools.',
  'what events are coming up':'Check the TechNova Events page for the latest events, including their dates, times, locations and types.',
  'suggest a technology project':'Try building a task manager, weather dashboard, quiz app, personal portfolio, event booking system or browser-based game.',
  'explain ai simply':'AI is software that can perform tasks that normally need some form of human intelligence, such as recognising patterns, understanding language or making predictions.',
  'how do i learn coding':'Start with one language, practise small programs regularly, learn variables, conditions, loops and functions, and then build small projects.',
  'how do i make a website':'Start with HTML for structure, CSS for appearance and JavaScript for interactivity. Build one small page first, then add navigation and reusable components.',
  'how do i make a game':'Choose a platform such as JavaScript in the browser or a game engine, define a small gameplay loop, build a prototype and then add graphics, sound and progression.',
  'what is a website':'A website is a collection of web pages and resources that can be accessed through a web browser, usually using HTTP or HTTPS.',
  'what is frontend development':'Frontend development creates the parts of a website or web app that users see and interact with, commonly using HTML, CSS and JavaScript.',
  'what is backend development':'Backend development creates the server-side systems that handle data, authentication, business logic, APIs and other operations behind a website.',
  'what is full stack development':'Full-stack development involves working on both frontend and backend parts of an application, often including databases and deployment.',
  'what is an npm package':'An npm package is reusable JavaScript or Node.js software distributed through the npm package ecosystem.',
  'what is node js':'Node.js is a JavaScript runtime that lets JavaScript run outside a web browser, commonly for servers, APIs and developer tools.',
  'what is typescript':'TypeScript is a programming language based on JavaScript that adds static typing and other development features before compiling to JavaScript.',
  'what is react':'React is a JavaScript library for building user interfaces from reusable components.',
  'what is a component':'A component is a reusable piece of software or UI that combines structure, behaviour and sometimes styling into a manageable unit.'
};

function normaliseQuestion(value){
  return String(value||'')
    .toLowerCase()
    .replace(/[’']/g,"'")
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

function loadUserWordbank(){
  try{
    const saved=JSON.parse(localStorage.getItem(TECHNOVA_WORDBANK_STORAGE)||'{}');
    return saved && typeof saved==='object' ? saved : {};
  }catch(error){
    console.warn('Could not read saved TechNova wordbank:',error);
    return {};
  }
}

function saveUserWordbank(wordbank){
  try{
    localStorage.setItem(TECHNOVA_WORDBANK_STORAGE,JSON.stringify(wordbank));
  }catch(error){
    console.warn('Could not save TechNova wordbank:',error);
  }
}

function findAnswer(question){
  const key=normaliseQuestion(question);
  const custom=loadUserWordbank();
  if(custom[key]) return custom[key];
  if(TECHNOVA_WORDBANK[key]) return TECHNOVA_WORDBANK[key];

  // Allow natural variations such as "what's AI" or questions with extra words.
  const candidates=Object.keys({...TECHNOVA_WORDBANK,...custom});
  const match=candidates.find(candidate=>key.includes(candidate)||candidate.includes(key));
  return match ? ({...TECHNOVA_WORDBANK,...custom})[match] : null;
}

function buildReasonableAnswer(question){
  const q=normaliseQuestion(question);
  if(/event|technova/.test(q)) return 'A useful starting answer is that TechNova is built around technology information, events and community features. For exact event details, check the Events page because dates and availability can change.';
  if(/html|css|javascript|website|web|frontend|backend|code|program/.test(q)) return 'A reasonable starting answer is that this is a software-development topic. Start with the basic concept, make a small working example, test it, and then add complexity one step at a time.';
  if(/ai|machine learning|neural|model|robot/.test(q)) return 'A reasonable starting answer is that this is an artificial-intelligence topic. The key idea is to use data, rules or learned patterns to make software perform a task that would otherwise require more manual reasoning.';
  if(/security|password|phish|malware|virus|hack|vpn|encrypt/.test(q)) return 'A reasonable starting answer is to focus on protecting systems, accounts and data. Use strong unique passwords, keep software updated, enable multi-factor authentication and avoid untrusted links or downloads.';
  if(/database|sql|supabase|api|server|cloud/.test(q)) return 'A reasonable starting answer is that this involves storing, moving or processing application data. The important pieces are the data model, access rules, validation and the code that reads or changes the data.';
  if(/cpu|gpu|ram|ssd|computer|pc|hardware/.test(q)) return 'A reasonable starting answer is that this is a computer-hardware topic. The best explanation depends on what component or task you are asking about, such as processing, memory, storage or graphics.';
  return `I don't have a specific answer for “${question}” yet. A reasonable starting point is to break the question into its main technology concept, define the important terms, and then explain how they work together.`;
}

function addMessage(chat,text,role){
  const el=document.createElement('div');
  el.className=`ai-msg ${role}`;
  el.textContent=text;
  chat.appendChild(el);
  chat.scrollTop=chat.scrollHeight;
  return el;
}

function addUnknownQuestion(chat,question,onAdded){
  const wrapper=document.createElement('div');
  wrapper.className='ai-msg assistant';

  const text=document.createElement('div');
  text.textContent=`I don't have that question in the TechNova wordbank yet. Would you like me to add it?`;

  const actions=document.createElement('div');
  actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:12px';

  const add=document.createElement('button');
  add.type='button';
  add.className='ai-prompt';
  add.textContent='Yes, add it';

  const cancel=document.createElement('button');
  cancel.type='button';
  cancel.className='ai-prompt';
  cancel.textContent='No thanks';

  add.addEventListener('click',()=>{
    const answer=buildReasonableAnswer(question);
    const custom=loadUserWordbank();
    custom[normaliseQuestion(question)]=answer;
    saveUserWordbank(custom);
    add.disabled=true;
    cancel.disabled=true;
    addMessage(chat,`Added to your TechNova wordbank.\n\n${answer}`,'assistant');
    if(typeof onAdded==='function') onAdded();
  });

  cancel.addEventListener('click',()=>{
    add.disabled=true;
    cancel.disabled=true;
    addMessage(chat,'No problem — I left the wordbank unchanged.','assistant');
  });

  actions.append(add,cancel);
  wrapper.append(text,actions);
  chat.appendChild(wrapper);
  chat.scrollTop=chat.scrollHeight;
}

async function awardAIAchievement(){
  try{
    if(window.TechNovaAchievements?.awardXP){
      await window.TechNovaAchievements.awardXP(0,'ai-chat');
      return;
    }
    if(!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) return;
    const client=window.supabase.createClient(window.TECHNOVA_SUPABASE_URL,window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    const {data:{user}}=await client.auth.getUser();
    if(!user) return;
    await client.rpc('award_xp',{p_amount:0,p_achievement_key:'ai-chat'});
  }catch(error){
    console.debug('AI achievement was not awarded:',error);
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('aiForm');
  const input=document.getElementById('aiInput');
  const chat=document.getElementById('aiChat');
  const status=document.getElementById('aiStatus');
  if(!form||!input||!chat) return;

  async function ask(message){
    addMessage(chat,message,'user');
    status.textContent='Checking the TechNova wordbank…';
    input.disabled=true;

    try{
      const answer=findAnswer(message);
      if(answer){
        addMessage(chat,answer,'assistant');
        await awardAIAchievement();
        status.textContent='';
        return;
      }

      status.textContent='';
      addUnknownQuestion(chat,message,async()=>{
        await awardAIAchievement();
      });
    }finally{
      input.disabled=false;
      input.focus();
    }
  }

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const message=input.value.trim();
    if(!message) return;
    input.value='';
    await ask(message);
  });

  document.querySelectorAll('.ai-prompt').forEach(button=>{
    button.addEventListener('click',()=>{
      input.value=button.textContent.trim();
      input.focus();
    });
  });
});
