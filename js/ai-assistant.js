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
  },
  {
    "keywords": [
      "generative ai",
      "gen ai",
      "ai generated",
      "ai content"
    ],
    "answer": "Generative AI creates new content such as text, images, audio or code from patterns learned during training. It can be useful for brainstorming and explanations, but its output should be checked because it can make mistakes."
  },
  {
    "keywords": [
      "large language model",
      "llm",
      "chatbot",
      "language model"
    ],
    "answer": "A large language model (LLM) is an AI model trained on large amounts of text so it can interpret prompts and generate language. Chatbots often use LLMs, but they can still misunderstand questions or invent details."
  },
  {
    "keywords": [
      "prompt engineering",
      "prompt",
      "prompting"
    ],
    "answer": "A prompt is the instruction or context given to an AI system. Clear prompts usually state the goal, relevant background, constraints and the format you want. You can refine a prompt after reviewing the first answer."
  },
  {
    "keywords": [
      "neural network",
      "deep learning"
    ],
    "answer": "A neural network is a machine-learning model made from connected computational units arranged in layers. Deep learning uses neural networks with many layers to learn complex patterns."
  },
  {
    "keywords": [
      "data science",
      "data analysis",
      "analytics"
    ],
    "answer": "Data science combines statistics, programming and subject knowledge to find useful patterns in data. A typical workflow is to collect, clean, explore, analyse and communicate the data."
  },
  {
    "keywords": [
      "algorithm",
      "algorithms"
    ],
    "answer": "An algorithm is a defined sequence of steps for solving a problem or completing a task. Examples include sorting a list, searching for a record and finding the shortest route."
  },
  {
    "keywords": [
      "binary",
      "bits and bytes",
      "bit",
      "byte"
    ],
    "answer": "Computers represent information using bits, each of which is either 0 or 1. A byte contains 8 bits. Storage and file sizes are commonly measured in bytes and larger units such as KB, MB, GB and TB."
  },
  {
    "keywords": [
      "python",
      "python programming"
    ],
    "answer": "Python is a general-purpose programming language known for readable syntax. It is used in automation, data analysis, AI, web backends, education and scripting."
  },
  {
    "keywords": [
      "java programming",
      "java language"
    ],
    "answer": "Java is a general-purpose, object-oriented programming language commonly used for backend services, enterprise software and Android-related development. It is different from JavaScript."
  },
  {
    "keywords": [
      "c sharp",
      "c#",
      "dotnet"
    ],
    "answer": "C# is a modern programming language often used with the .NET platform for desktop, web, cloud and game development, including projects made with Unity."
  },
  {
    "keywords": [
      "typescript",
      "ts language"
    ],
    "answer": "TypeScript extends JavaScript with a type system. Types help developers catch certain mistakes earlier and make larger codebases easier to maintain."
  },
  {
    "keywords": [
      "react",
      "reactjs"
    ],
    "answer": "React is a JavaScript library for building user interfaces from reusable components. It is commonly used for interactive single-page applications."
  },
  {
    "keywords": [
      "node js",
      "nodejs"
    ],
    "answer": "Node.js lets JavaScript run outside a web browser, often on servers and in development tools. It is commonly used to build APIs and backend services."
  },
  {
    "keywords": [
      "frontend",
      "front end",
      "client side"
    ],
    "answer": "Frontend development builds the parts of an application people see and interact with. It commonly uses HTML for structure, CSS for presentation and JavaScript for behaviour."
  },
  {
    "keywords": [
      "backend",
      "back end",
      "server side"
    ],
    "answer": "Backend development handles server-side logic, data storage, authentication and APIs. A frontend usually communicates with a backend to load or save information."
  },
  {
    "keywords": [
      "full stack",
      "fullstack"
    ],
    "answer": "Full-stack development involves both frontend and backend work, such as building a user interface, connecting APIs and designing database interactions."
  },
  {
    "keywords": [
      "api",
      "apis",
      "application programming interface"
    ],
    "answer": "An API is a defined way for software systems to communicate. A web API commonly receives an HTTP request and returns data, often as JSON."
  },
  {
    "keywords": [
      "json",
      "javascript object notation"
    ],
    "answer": "JSON is a text format for representing structured data using objects, arrays, strings, numbers, booleans and null. It is widely used by web APIs and configuration files."
  },
  {
    "keywords": [
      "git",
      "version control",
      "commit",
      "branch"
    ],
    "answer": "Git is a version-control system that records changes to files over time. Commits save snapshots, branches let you work separately, and merges bring completed changes together."
  },
  {
    "keywords": [
      "pull request",
      "pull requests",
      "pr on github"
    ],
    "answer": "A pull request proposes changes from one Git branch into another. It gives people a place to review the difference, discuss it and run checks before merging."
  },
  {
    "keywords": [
      "debugging",
      "debug",
      "bug",
      "software error"
    ],
    "answer": "Debugging is the process of finding and fixing the cause of a problem. Reproduce the issue, read the exact error, narrow down the responsible code, make one change at a time and retest."
  },
  {
    "keywords": [
      "html tag",
      "semantic html",
      "html elements"
    ],
    "answer": "HTML elements describe the meaning and structure of page content. Semantic elements such as header, nav, main, article and footer make page structure clearer to browsers and assistive technology."
  },
  {
    "keywords": [
      "responsive design",
      "mobile friendly",
      "mobile first"
    ],
    "answer": "Responsive design makes a website adapt to different screen sizes. Flexible layouts, relative sizing, media queries and testing on narrow screens help content remain usable."
  },
  {
    "keywords": [
      "accessibility",
      "web accessibility",
      "wcag",
      "screen reader"
    ],
    "answer": "Web accessibility means designing websites so people with different abilities can use them. Helpful practices include keyboard support, visible focus, meaningful headings, labels, text alternatives and sufficient contrast."
  },
  {
    "keywords": [
      "seo",
      "search engine optimisation",
      "search engine optimization"
    ],
    "answer": "SEO helps search engines understand and present useful pages. Clear titles, descriptive headings, useful original content, crawlable links, good performance and accurate metadata all help."
  },
  {
    "keywords": [
      "website performance",
      "page speed",
      "core web vitals"
    ],
    "answer": "Website performance is how quickly and smoothly a page loads and responds. Optimised images, smaller scripts, caching, efficient code and reduced layout shifts can improve the experience."
  },
  {
    "keywords": [
      "http",
      "https",
      "ssl",
      "tls"
    ],
    "answer": "HTTP is the protocol used to transfer web requests and responses. HTTPS protects that connection using TLS encryption, helping prevent people on the network from reading or altering traffic in transit."
  },
  {
    "keywords": [
      "domain name",
      "domain",
      "dns record"
    ],
    "answer": "A domain name is a human-readable address for an internet service. DNS translates domain names into information such as the IP addresses or service records needed to reach it."
  },
  {
    "keywords": [
      "hosting",
      "web hosting",
      "cloudflare pages",
      "pages.dev"
    ],
    "answer": "Web hosting makes a website's files available over the internet. Static hosting serves files such as HTML, CSS and JavaScript, while dynamic applications may also need backend services and databases."
  },
  {
    "keywords": [
      "cdn",
      "content delivery network"
    ],
    "answer": "A content delivery network (CDN) serves cached content from locations closer to visitors. This can reduce loading times and help a site handle traffic more efficiently."
  },
  {
    "keywords": [
      "web browser",
      "browser cache",
      "cache"
    ],
    "answer": "A web browser requests and displays websites. Its cache stores some resources locally so repeat visits can load faster; sometimes clearing a stale cache helps when an old version of a page is appearing."
  },
  {
    "keywords": [
      "postgresql",
      "postgres",
      "relational database"
    ],
    "answer": "PostgreSQL is an open-source relational database. It stores data in tables and supports SQL, transactions, constraints, indexes, views and advanced data types."
  },
  {
    "keywords": [
      "row level security",
      "rls",
      "database policy"
    ],
    "answer": "Row Level Security (RLS) is a database feature that controls which rows a database session may read or change. Policies should be designed around the authenticated user and the intended access rules."
  },
  {
    "keywords": [
      "authentication",
      "auth",
      "sign in",
      "login system"
    ],
    "answer": "Authentication verifies who a user is, commonly through a password, one-time code or identity provider. Authorisation is separate: it decides what that authenticated user is allowed to do."
  },
  {
    "keywords": [
      "authorisation",
      "authorization",
      "permissions",
      "access control"
    ],
    "answer": "Authorisation determines which actions or data a user may access. Good systems check permissions on the server or database, not only by hiding buttons in the browser."
  },
  {
    "keywords": [
      "supabase auth",
      "supabase authentication"
    ],
    "answer": "Supabase Auth provides user authentication, including email and password sign-in and supported identity providers. Applications should still enforce data permissions with database policies and server-side checks."
  },
  {
    "keywords": [
      "firewall",
      "network firewall"
    ],
    "answer": "A firewall applies rules to network traffic, allowing or blocking connections according to a security policy. It is one layer of defence, not a replacement for updates, account security and backups."
  },
  {
    "keywords": [
      "phishing",
      "fake email",
      "scam link"
    ],
    "answer": "Phishing is an attempt to trick someone into revealing information or taking an unsafe action, often through a convincing message or fake website. Check the sender and destination carefully, avoid unexpected attachments and use a trusted route to sign in."
  },
  {
    "keywords": [
      "malware",
      "virus",
      "trojan",
      "spyware"
    ],
    "answer": "Malware is software designed to harm a device, disrupt activity or access information without permission. Keep software updated, use reputable security tools, back up important files and avoid untrusted downloads."
  },
  {
    "keywords": [
      "ransomware"
    ],
    "answer": "Ransomware is malware that can block access to files or systems and demand payment. Organisations reduce risk through patching, strong access controls, network separation, monitoring and tested offline or protected backups."
  },
  {
    "keywords": [
      "multi factor authentication",
      "mfa",
      "two factor authentication",
      "2fa"
    ],
    "answer": "Multi-factor authentication (MFA) asks for more than one kind of proof when signing in. An authenticator app or security key can add protection if a password is exposed."
  },
  {
    "keywords": [
      "encryption",
      "encrypt",
      "decryption"
    ],
    "answer": "Encryption transforms readable information into protected data using a cryptographic key. It helps protect confidentiality when data is stored or sent, but correct key management is essential."
  },
  {
    "keywords": [
      "backup",
      "backups",
      "restore files"
    ],
    "answer": "A backup is a separate copy of important data that can be restored after accidental deletion, device failure or an incident. Keep more than one copy and periodically test that restoration works."
  },
  {
    "keywords": [
      "vpn",
      "virtual private network"
    ],
    "answer": "A VPN creates an encrypted connection between a device and a VPN service or network. It can protect traffic on some networks and provide remote access, but it does not make someone completely anonymous or automatically safe."
  },
  {
    "keywords": [
      "ip address",
      "ip",
      "ipv4",
      "ipv6"
    ],
    "answer": "An IP address identifies a device or network interface for communication over an IP network. IPv4 uses 32-bit addresses, while IPv6 uses 128-bit addresses and provides a much larger address space."
  },
  {
    "keywords": [
      "router",
      "switch",
      "network switch"
    ],
    "answer": "A router connects different networks and forwards traffic between them. A network switch connects devices within a local network and forwards data to the appropriate port."
  },
  {
    "keywords": [
      "lan",
      "wan",
      "local area network",
      "wide area network"
    ],
    "answer": "A LAN connects devices across a limited area such as a home, school or office. A WAN connects networks across larger geographic areas; the internet is the best-known example of a global network."
  },
  {
    "keywords": [
      "wifi",
      "wi fi",
      "wireless network"
    ],
    "answer": "Wi-Fi is a family of wireless networking technologies that lets devices connect to a local network. Signal strength, interference, distance, router capability and internet service can all affect performance."
  },
  {
    "keywords": [
      "bandwidth",
      "latency",
      "ping"
    ],
    "answer": "Bandwidth describes how much data a connection can carry over time. Latency is the delay before data reaches its destination. A connection can have high bandwidth but still feel slow if latency is high."
  },
  {
    "keywords": [
      "motherboard",
      "mainboard"
    ],
    "answer": "The motherboard is the main circuit board in a computer. It connects the processor, memory, storage, expansion cards and other components and provides the interfaces they use."
  },
  {
    "keywords": [
      "psu",
      "power supply",
      "power supply unit"
    ],
    "answer": "A power supply unit converts electricity from the wall into the voltages computer components need. A suitable unit should provide enough power and the correct connectors for the system."
  },
  {
    "keywords": [
      "computer cooling",
      "cpu temperature",
      "heatsink",
      "cooling fan"
    ],
    "answer": "Computer cooling moves heat away from components using heatsinks, fans or liquid-cooling systems. Clear airflow and dust-free vents help a computer manage temperatures."
  },
  {
    "keywords": [
      "hdd",
      "hard drive",
      "hard disk"
    ],
    "answer": "A hard disk drive (HDD) stores data on spinning magnetic disks. It often offers more storage for the price than an SSD, but is generally slower and has moving parts."
  },
  {
    "keywords": [
      "operating system",
      "windows",
      "linux",
      "macos"
    ],
    "answer": "An operating system manages a device's hardware and provides services for applications. Windows, macOS and Linux are examples used on personal computers."
  },
  {
    "keywords": [
      "driver",
      "device driver"
    ],
    "answer": "A device driver is software that lets an operating system communicate with a hardware device. Updates can fix bugs or improve compatibility, but drivers should come from trusted sources."
  },
  {
    "keywords": [
      "virtual reality",
      "vr",
      "augmented reality",
      "ar"
    ],
    "answer": "Virtual reality (VR) creates an immersive digital environment, usually viewed through a headset. Augmented reality (AR) adds digital information or objects to a view of the real world."
  },
  {
    "keywords": [
      "internet of things",
      "iot",
      "smart devices"
    ],
    "answer": "The Internet of Things (IoT) describes physical devices with sensors or software that connect and exchange data. Smart-home devices and industrial sensors are common examples."
  },
  {
    "keywords": [
      "blockchain",
      "cryptocurrency",
      "crypto"
    ],
    "answer": "A blockchain is a type of shared digital ledger where records are grouped into linked blocks. Some cryptocurrencies use blockchains, but the technology also has other proposed uses and trade-offs."
  },
  {
    "keywords": [
      "computer science",
      "what is computing"
    ],
    "answer": "Computer science studies computation, algorithms, data, software and the design of computer systems. It includes programming, theory, networks, databases, AI and human-computer interaction."
  },
  {
    "keywords": [
      "how to learn coding",
      "learn programming",
      "beginner coding"
    ],
    "answer": "Start with one language and small projects. Learn variables, conditions, loops, functions and data structures; practise by changing working examples, reading errors and building something you care about."
  },
  {
    "keywords": [
      "choose a programming language",
      "best programming language"
    ],
    "answer": "The best language depends on your goal. JavaScript is useful for websites, Python is approachable for automation and data work, Java and C# are used in many application areas, and SQL is essential for querying relational databases."
  },
  {
    "keywords": [
      "website not loading",
      "site not working",
      "website error"
    ],
    "answer": "If a website will not load, check the address, internet connection and whether the issue happens in another browser. Try a refresh, check for a service-status notice and note any exact error message before changing settings."
  },
  {
    "keywords": [
      "404 error",
      "http 404"
    ],
    "answer": "HTTP 404 means the server could not find the requested resource. Check the URL, file path, route configuration and whether the page was moved or renamed."
  },
  {
    "keywords": [
      "500 error",
      "http 500",
      "internal server error"
    ],
    "answer": "HTTP 500 indicates that the server encountered an unexpected problem. Check server logs and recent changes, and avoid displaying private error details to visitors."
  },
  {
    "keywords": [
      "what is technova ai",
      "how does technova ai work"
    ],
    "answer": "TechNova AI is the technology assistant built into the TechNova website. Its current browser version uses a curated local question-and-answer wordbank and can retrieve upcoming event information from TechNova. It may not know every topic yet."
  },
  {
    "keywords": [
      "technova dashboard",
      "my dashboard"
    ],
    "answer": "The TechNova dashboard is the signed-in area for personal activity and useful account features. Open it from your account navigation to see the features currently available to your account."
  },
  {
    "keywords": [
      "technova profile",
      "edit my profile",
      "profile picture"
    ],
    "answer": "TechNova profiles let users manage profile information such as their display name and bio. Use the account or profile settings available on the site to update your own details."
  },
  {
    "keywords": [
      "technova learning path",
      "learning path",
      "learning paths"
    ],
    "answer": "TechNova learning paths organise learning into a sequence of topics or activities. Follow the steps in order, practise each topic and revisit areas you want to strengthen."
  },
  {
    "keywords": [
      "technova tools",
      "tools directory",
      "where are the tools"
    ],
    "answer": "The TechNova Tools directory is the place to discover the site's browser-based utilities. Open Tools from the website navigation and choose a tool from the directory."
  },
  {
    "keywords": [
      "technova quiz",
      "quizzes",
      "quiz"
    ],
    "answer": "TechNova quizzes let users test their knowledge and track learning progress. Choose an available quiz, read each question carefully and review your result afterwards."
  },
  {
    "keywords": [
      "technova xp",
      "experience points",
      "achievements",
      "badges"
    ],
    "answer": "TechNova uses XP and achievements to recognise activity on the platform. Available rewards depend on the features and achievement rules currently configured on the site."
  },
  {
    "keywords": [
      "technova events",
      "register for an event",
      "event registration"
    ],
    "answer": "You can browse upcoming TechNova events from the Events page. Open an event to view its details and registration options; availability depends on the event."
  },
  {
    "keywords": [
      "technova community",
      "community page",
      "community forum"
    ],
    "answer": "TechNova currently has a Community information page with topic areas and guidelines, but it does not yet provide a full member discussion forum with user-created posts and replies."
  },
  {
    "keywords": [
      "project ideas",
      "what should i build",
      "beginner project"
    ],
    "answer": "Try a project that solves a small real problem: a personal dashboard, revision quiz, notes app, weather display, colour palette generator, PC parts planner or a simple API-powered tool. Start small and add features gradually."
  },
  {
    "keywords": [
      "how to ask a good question",
      "help me with a problem",
      "technical support"
    ],
    "answer": "A useful technical question includes what you were trying to do, what you expected, what actually happened, the exact error message and the steps that reproduce it. Remove passwords, API keys and personal data before sharing logs or screenshots."
  },
  {
    "keywords": [
      "what is open source",
      "open source software"
    ],
    "answer": "Open-source software makes its source code available under a licence that grants specific rights to use, study, modify and share it. The licence terms still matter."
  }

];

let techNovaCurrentDocument = null;
function answerEverydayQuestion(message) {
 const q=String(message||'').toLowerCase(); const now=new Date();
 const fmt={weekday:'long',year:'numeric',month:'long',day:'numeric'};
 if(/\b(what time is it|current time|local time|time is it)\b/.test(q)) return 'The current local time is '+new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short'}).format(now)+'.';
 if(/\b(what day is it|what date is it|today'?s date|current date|what is today)\b/.test(q)) return 'Today is '+new Intl.DateTimeFormat(undefined,fmt).format(now)+'.';
 if(/\b(tomorrow'?s date|what day is tomorrow|what is tomorrow)\b/.test(q)){const d=new Date(now);d.setDate(d.getDate()+1);return 'Tomorrow is '+new Intl.DateTimeFormat(undefined,fmt).format(d)+'.';}
 if(/\b(yesterday'?s date|what day was yesterday)\b/.test(q)){const d=new Date(now);d.setDate(d.getDate()-1);return 'Yesterday was '+new Intl.DateTimeFormat(undefined,fmt).format(d)+'.';}
 if(/\b(what year is it|current year)\b/.test(q)) return 'The current year is '+now.getFullYear()+'.';
 if(/\b(what month is it|current month)\b/.test(q)) return 'It is '+new Intl.DateTimeFormat(undefined,{month:'long',year:'numeric'}).format(now)+'.';
 if(/\b(how are you|hru)\b/.test(q)) return 'I’m doing well, thanks for asking! What would you like help with?';
 if(/^(hi|hello|hey|hiya|good morning|good afternoon|good evening)\b/.test(q)) return 'Hello! I can answer date and time questions, search uploaded documents and answer from my built-in knowledge bank.';
 if(/\b(thank you|thanks|ty)\b/.test(q)) return 'You’re welcome!';
 return null;
}
function summaryFromText(text){const sentences=String(text||'').replace(/\s+/g,' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];const useful=sentences.map(s=>s.trim()).filter(s=>s.length>35);return useful.slice(0,7).join(' ');}
function findDocPassages(question,text){const terms=(String(question).toLowerCase().match(/[a-z0-9]{3,}/g)||[]).filter(w=>!['what','when','where','which','with','from','that','this','does','about','explain','tell','summarise','summary'].includes(w));const parts=String(text||'').split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>35);return parts.map((s,i)=>({s,i,score:terms.reduce((n,t)=>n+(s.toLowerCase().includes(t)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,4).sort((a,b)=>a.i-b.i).map(x=>x.s);}
async function readTechNovaFile(file){if(!file)throw Error('Choose a file first.');if(file.size>10*1024*1024)throw Error('Files must be 10 MB or smaller.');const n=file.name.toLowerCase();if(n.endsWith('.txt')||n.endsWith('.md')||n.endsWith('.csv'))return (await file.text()).slice(0,1000000);if(n.endsWith('.json'))return JSON.stringify(JSON.parse(await file.text()),null,2).slice(0,1000000);if(n.endsWith('.docx')){if(!window.mammoth)throw Error('Word reader unavailable. Refresh and try again.');return (await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value.slice(0,1000000);}if(n.endsWith('.pdf')){const pdfjsVersion='6.5.438';const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@'+pdfjsVersion+'/build/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@'+pdfjsVersion+'/build/pdf.worker.mjs';const pdf=await pdfjs.getDocument({data:await file.arrayBuffer(),isEvalSupported:false,enableScripting:false}).promise;let out='';for(let p=1;p<=Math.min(pdf.numPages,100);p++){const page=await pdf.getPage(p);const c=await page.getTextContent();out+=c.items.map(x=>x.str||'').join(' ')+'\n';if(out.length>1000000)break;}if(!out.trim())throw Error('No selectable text found. Scanned PDFs need OCR, which is not included.');return out.slice(0,1000000);}throw Error('Supported files: PDF, DOCX, TXT, MD, CSV and JSON.');}
function answerFromDocument(message){if(!techNovaCurrentDocument)return null;const q=String(message).toLowerCase();if(/\b(summarise|summarize|summary|overview)\b/.test(q))return 'Extractive summary of '+techNovaCurrentDocument.name+':\n\n'+summaryFromText(techNovaCurrentDocument.text)+'\n\nThis selects existing sentences; it does not generate new analysis.';if(/\b(make|create|generate)\b/.test(q)&&/\b(questions|quiz|revision)\b/.test(q)){const p=findDocPassages('key facts main ideas important points',techNovaCurrentDocument.text);return p.length?'Revision prompts based on '+techNovaCurrentDocument.name+':\n\n'+p.map((s,i)=>(i+1)+'. Explain this point in your own words: '+s.slice(0,180)).join('\n\n'):'I could not find enough readable text to create prompts.';}const p=findDocPassages(message,techNovaCurrentDocument.text);return p.length?'Relevant passages from '+techNovaCurrentDocument.name+':\n\n'+p.map(s=>'• '+s).join('\n\n')+'\n\nThese are keyword matches, so I may miss implied meaning.':'I could not find a close text match. Try using words that appear in the document.';}
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

async function answerFromWordbank(message) { const everyday=answerEverydayQuestion(message); if(everyday)return everyday; const doc=answerFromDocument(message); if(doc)return doc; const lower=normaliseWordbankText(message); if(lower.includes(' event ')||lower.includes(' events ')||lower.includes(' coming up ')||lower.includes(' upcoming '))return liveEventsAnswer(); return findWordbankAnswer(message)||'I do not have a reliable answer for that yet. I can answer date and time questions, search uploaded documents and answer topics covered by my curated knowledge bank. I do not use a paid AI model, so I will say when I cannot find a reliable answer.'; }

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('aiForm');
  const input = document.getElementById('aiInput');
  const chat = document.getElementById('aiChat');
  const status = document.getElementById('aiStatus');
  const fileInput=document.getElementById('aiFile'); const fileStatus=document.getElementById('aiFileStatus'); const removeFile=document.getElementById('aiRemoveFile');

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

  if(fileInput) fileInput.addEventListener('change',async()=>{const f=fileInput.files&&fileInput.files[0];if(!f)return;fileStatus.textContent='Reading '+f.name+' locally…';try{const text=await readTechNovaFile(f);if(!text.trim())throw Error('No readable text found.');techNovaCurrentDocument={name:f.name,text};fileStatus.textContent='Ready: '+f.name+'. Text stays in this browser tab.';}catch(err){techNovaCurrentDocument=null;fileStatus.textContent=err.message;fileInput.value='';}});
  if(removeFile)removeFile.addEventListener('click',()=>{techNovaCurrentDocument=null;if(fileInput)fileInput.value='';if(fileStatus)fileStatus.textContent='Document removed from this chat.';});

  const ask = async message => {
    addMessage(message, 'user');
    status.textContent = 'Searching the TechNova knowledge bank…';
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
