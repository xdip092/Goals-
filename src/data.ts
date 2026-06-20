import { LifeTransformationState, SubjectTrack, RoadmapItem, GovExamSection, Badge, DailyTask, GroomingRoutine, Flashcard } from './types';

export const initialBcaSubjects: SubjectTrack[] = [
  {
    id: 'testing',
    name: 'Software Testing & Quality Assurance',
    completedUnits: 0,
    totalUnits: 5,
    notes: [
      'Unit 1: Fundamentals of Testing - Definition, objectives, static/dynamic testing, QA vs QC',
      'Unit 2: White Box Testing - Path coverage, branch coverage, loop testing, cyclomatic complexity',
      'Unit 3: Black Box Testing - Equivalence partitioning, boundary value analysis, decision tables',
      'Unit 4: Quality Standards - ISO 9000, CMMI models, software metrics, quality audits',
      'Unit 5: Automated Testing - Regression tests, Selenium architecture, test suite composition'
    ],
    importantQuestions: [
      'Explain the difference between Verification and Validation with clean examples.',
      'How do you compute McCabe’s Cyclomatic Complexity? Show with a control flow graph.',
      'Explain Equivalence Partitioning (EP) and Boundary Value Analysis (BVA). Write mock test cases.',
      'Detail the CMMI Maturity Levels from Level 1 (Initial) to Level 5 (Optimizing).'
    ],
    mockMarksExpected: 80,
    mockMarksScore: 0,
    weakAreas: ['Integration Testing strategies', 'CMMI Level compliance checklists'],
    unitProgress: [0, 0, 0, 0, 0]
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    completedUnits: 0,
    totalUnits: 5,
    notes: [
      'Unit 1: Introduction to ML - Supervised, unsupervised, semi-supervised, reinforcement learning',
      'Unit 2: Regression & Classification - Linear regression, Cost functions, Gradient Descent, Logistic Regression, SVM',
      'Unit 3: Decision Trees & Random Forests - Entropy, Information Gain, Gini Index, ensemble learning',
      'Unit 4: Clustering & PCA - K-Means algorithm, hierarchical clustering, dimensionality reduction, eigenvalues',
      'Unit 5: Neural Networks - Multi-layer perceptron, activation functions, backpropagation algorithm'
    ],
    importantQuestions: [
      'Explain the mathematical formulation of Gradient Descent and how learning rate alpha impacts convergence.',
      'Contrast K-Means and Hierarchical Clustering with runtime complexities.',
      'Walk through the Backpropagation algorithm steps with mathematical weights updates formulas.',
      'What is Underfitting or Overfitting? How do L1/L2 Regularization prevent overfitting?'
    ],
    mockMarksExpected: 85,
    mockMarksScore: 0,
    weakAreas: ['Backpropagation calculus derivation', 'Support Vector Machine Kernel hyperplanes'],
    unitProgress: [0, 0, 0, 0, 0]
  },
  {
    id: 'flutter',
    name: 'Mobile Application Development (Flutter)',
    completedUnits: 0,
    totalUnits: 5,
    notes: [
      'Unit 1: Introduction to Dart - Variables, classes, asynchronous programming (Futures, Streams)',
      'Unit 2: Widget Architecture - Stateless vs Stateful widgets, elements tree, render tree, basic layouts',
      'Unit 3: State Management - Provider, Riverpod, Bloc, InheritedWidget mechanics',
      'Unit 4: Database & API integration - SQLite, Firestore integration, REST API requests, JSON parsing',
      'Unit 5: Custom Painters & Native bridge - Animations controllers, MethodChannels, publishing checklist'
    ],
    importantQuestions: [
      'Describe the Flutter Widget Lifecycle (createState, initState, didChangeDependencies, build, dispose).',
      'Compare BLoC and Provider state management architectures with clean diagrams.',
      'What are MethodChannels and how do they allow communication with native Android (Kotlin) / iOS (Swift)?',
      'Explain asynchronous concepts in Dart: Future, async/await, and Yield generators in Streams.'
    ],
    mockMarksExpected: 90,
    mockMarksScore: 0,
    weakAreas: ['MethodChannels for Native bridge integrations', 'Custom Painter custom bezier curves'],
    unitProgress: [0, 0, 0, 0, 0]
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    completedUnits: 0,
    totalUnits: 5,
    notes: [
      'Unit 1: Statistical Foundations - Mean, median, standard deviation, normal distributions, Z-score, central limit theorem',
      'Unit 2: Exploratory Data Analysis (EDA) - Handling missing rows, out-of-bounds metrics, pandas/numpy fundamentals',
      'Unit 3: Data Visualization - Matplotlib, Seaborn, plotting scatter, bar, heatmaps, boxplots',
      'Unit 4: Hypothesis Testing - Null and alternative hypothesis, P-values, T-tests, ANOVA, Chi-square trials',
      'Unit 5: Prescriptive Analytics - Basic time-series analysis, forecasting, linear optimization techniques'
    ],
    importantQuestions: [
      'What is the Central Limit Theorem and why is it vital for inferential statistics?',
      'How do you identify outliers using the Interquartile Range (IQR)? Provide sample range thresholds.',
      'Explain Hypothesis Testing. Detail Type I Error vs Type II Error with an practical example.',
      'How does ANOVA differ from a T-test? When do you choose which statistical model?'
    ],
    mockMarksExpected: 88,
    mockMarksScore: 0,
    weakAreas: ['ANOVA mathematical computation', 'Chi-Square independence calculations'],
    unitProgress: [0, 0, 0, 0, 0]
  },
  {
    id: 'dip',
    name: 'Digital Image Processing',
    completedUnits: 0,
    totalUnits: 5,
    notes: [
      'Unit 1: Digital Image Fundamentals - Human eye model, digitization, sampling, quantization, pixel neighborhoods',
      'Unit 2: Image Enhancements - Spatial filtering, histogram equalization, Laplacian filters, Sobel filters',
      'Unit 3: Image Transforms - Fourier transform, DFT, FFT, discrete cosine transform (DCT) for compression',
      'Unit 4: Image Restoration - Degradation models, noise filters, Wiener filters, inverse filtering methods',
      'Unit 5: Mathematical Morphology - Erosion, dilation, opening, closing, boundary extraction algorithms'
    ],
    importantQuestions: [
      'Derive the mathematical operation of Histogram Equalization. Discuss how it affects density.',
      'Explain the difference between Spatial Domain Filtering and Frequency Domain Filtering.',
      'Describe basic Morphological operations: Erosion, Dilation, Opening, and Closing on binary shapes.',
      'Discuss Sobel, Prewitt, and Laplacian edge detectors, outlining respective sensitivities.'
    ],
    mockMarksExpected: 85,
    mockMarksScore: 0,
    weakAreas: ['Frequency domain 2D DFT filtering paths', 'Wiener restoration transfer functions'],
    unitProgress: [0, 0, 0, 0, 0]
  },
  {
    id: 'wireless',
    name: 'Wireless Technology',
    completedUnits: 0,
    totalUnits: 5,
    notes: [
      'Unit 1: Electromagnetic Basics - Frequency spectrum, path loss, free space model, multipath fading',
      'Unit 2: Wireless LANs - IEEE 802.11 physical standards, CSMA/CA protocol, infrastructure vs adhoc',
      'Unit 3: Cellular Networks - Frequency reuse, cell splitting, handoff (hard, soft), GSM vs CDMA',
      'Unit 4: Modern Protocols - Bluetooth, ZigBee, WiMAX, LTE, and 5G network slices configurations',
      'Unit 5: Wireless Security - WEP, WPA2, WPA3 encryption, rogue access point shields, MITM avoidance'
    ],
    importantQuestions: [
      'How does CSMA/CA protocol prevent frame collisions on wireless channels compared to CSMA/CD?',
      'Explain Frequency Reuse Factor. If a cluster size is 7, show how cells are organized.',
      'Contrast Hard Handoff vs Soft Handoff Cell transfers with active signal towers.',
      'Explain WPA3 enhancements over WPA2, particularly regarding Dragonfly Key Exchange handshake.'
    ],
    mockMarksExpected: 82,
    mockMarksScore: 0,
    weakAreas: ['Multipath fading Rayleigh distributions', 'OFDMA spectrum sub-carrier layout'],
    unitProgress: [0, 0, 0, 0, 0]
  }
];

export const initialFullStackRoadmap: RoadmapItem[] = [
  // Foundation
  { id: 'fs-linux', name: 'Linux Command Line, File Permissions & Cron Jobs', category: 'Foundation', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-networking', name: 'Networking Basics (IPs, Ports, DNS, TLS Handshake)', category: 'Foundation', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-git', name: 'Git & GitHub Collaboration, PR review, Submodules', category: 'Foundation', status: 'pending', hoursSpent: 0, progress: 0 },
  // Frontend
  { id: 'fs-html-css', name: 'Semantic HTML, CSS variables, Flexbox & CSS Grid', category: 'Frontend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-tailwind', name: 'Tailwind CSS Custom themes & Responsive frameworks', category: 'Frontend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-js', name: 'Asynchronous JavaScript, closures, Event Loop & DOM API', category: 'Frontend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-ts', name: 'TypeScript generics, utility types, and structural safety', category: 'Frontend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-react', name: 'React Hooks, Virtual DOM, Fiber engine, and State optimization', category: 'Frontend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-next', name: 'Next.js App router, SSR, SSG, Server Actions & caching routing', category: 'Frontend', status: 'pending', hoursSpent: 0, progress: 0 },
  // Backend
  { id: 'fs-node', name: 'Node.js event emitter module, Buffer streams, File Systems', category: 'Backend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-express', name: 'Express middleware, routing, CORS mechanisms, custom error handlers', category: 'Backend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-rest', name: 'REST API Design, query params, HTTP codes standards compliance', category: 'Backend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-auth', name: 'JWT Sessions, Cookies (httpOnly, secure), Refresh tokens, OAuth', category: 'Backend', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-security', name: 'Helmet security headers, Rate limiting, CORS, salt-hashing algorithms', category: 'Backend', status: 'pending', hoursSpent: 0, progress: 0 },
  // Database
  { id: 'fs-postgres', name: 'PostgreSQL Relational DB, Indexing, Joins & foreign key constraints', category: 'Database', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-mongodb', name: 'MongoDB collections, custom Aggregations, indexing strategies', category: 'Database', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-redis', name: 'Redis Key-Value caching, Session storage, rate limits storage', category: 'Database', status: 'pending', hoursSpent: 0, progress: 0 },
  // DevOps & Cloud
  { id: 'fs-docker', name: 'Docker containerization, multi-stage builds, clean layer caching', category: 'DevOps & Cloud', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-nginx', name: 'Nginx Reverse Proxy routing, virtual hosts, gzip, and load balancing', category: 'DevOps & Cloud', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-cicd', name: 'GitHub Actions testing & building pipelines triggers workflows', category: 'DevOps & Cloud', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-cloud-deploy', name: 'AWS EC2, S3 asset buckets, Vercel SPA deployments', category: 'DevOps & Cloud', status: 'pending', hoursSpent: 0, progress: 0 },
  // System Design
  { id: 'fs-scaling', name: 'Horizontal vs Vertical scaling, High Availability, Database replication', category: 'System Design', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'fs-architecture', name: 'Monoliths vs Microservices, Event-driven architecture, PubSub models', category: 'System Design', status: 'pending', hoursSpent: 0, progress: 0 }
];

export const initialAiRoadmap: RoadmapItem[] = [
  // AI Foundation
  { id: 'ai-python', name: 'Python for AI: list comprehensions, decorators, OOP', category: 'AI Foundation', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'ai-data-processing', name: 'Data Processing: Numpy vectors, Pandas dataframes series', category: 'AI Foundation', status: 'pending', hoursSpent: 0, progress: 0 },
  // Generative AI
  { id: 'ai-prompt-engineering', name: 'Prompt Engineering: few-shot, Chain-of-Thought, ReAct pattern', category: 'Generative AI', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'ai-inference-apis', name: 'Inference APIs: Gemini API, OpenAI SDK, Claude Anthropic calls', category: 'Generative AI', status: 'pending', hoursSpent: 0, progress: 0 },
  // AI Development & RAG
  { id: 'ai-langchain', name: 'LangChain & LlamaIndex orchestrations: prompts, memory buffers', category: 'AI Development & RAG', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'ai-rag', name: 'RAG Pipeline: document chunking, embedding, retrieval, generation', category: 'AI Development & RAG', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'ai-vectors', name: 'Vector Databases: Pinecone, PgVector, Chroma distance metrics', category: 'AI Development & RAG', status: 'pending', hoursSpent: 0, progress: 0 },
  // AI Agents
  { id: 'ai-agents', name: 'AI Agent Architectures: Tool Calling loop, custom function declarations', category: 'AI Agents', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'ai-mcp', name: 'Model Context Protocol (MCP) integration server systems', category: 'AI Agents', status: 'pending', hoursSpent: 0, progress: 0 },
  // Automation
  { id: 'ai-n8n', name: 'n8n & Zapier webhook automation workflow loops', category: 'Automation Flow', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'ai-python-scripting', name: 'Automated scraping with BeautifulSoup & Playwright scripting', category: 'Automation Flow', status: 'pending', hoursSpent: 0, progress: 0 },
  // AI Products
  { id: 'ai-chatbots', name: 'End-to-end Chatbots deployment, conversation logs storage, analytics', category: 'AI Products', status: 'pending', hoursSpent: 0, progress: 0 },
  { id: 'ai-saas', name: 'AI-Powered SaaS: Stripe subscriptions, auth shields, rate limit enforcement', category: 'AI Products', status: 'pending', hoursSpent: 0, progress: 0 }
];

export const initialRrbPrep: GovExamSection[] = [
  {
    id: 'rrb-math',
    name: 'Mathematics',
    progress: 0,
    dailyTarget: 'Solve 30 questions on Ratio & Proportion, Profit/Loss, and Time & Work',
    weeklyTarget: 'Complete 2 full practice sets (70 questions total) & analyze errors',
    mockTestsAttempted: 0,
    averageScorePercentage: 0,
    weakTopics: ['Simple & Compound Interest compound cycles', 'Advanced Trigonometry identities']
  },
  {
    id: 'rrb-reasoning',
    name: 'General Intelligence & Reasoning',
    progress: 0,
    dailyTarget: 'Solve 15 puzzles on Syllogism and Blood Relations, Coding-Decoding',
    weeklyTarget: 'Review complex analytical reasoning diagrams and seat arrangement forms',
    mockTestsAttempted: 0,
    averageScorePercentage: 0,
    weakTopics: ['Seating Arrangement puzzles with multi-directional inputs', 'Input-Output processes steps tracing']
  },
  {
    id: 'rrb-awareness',
    name: 'General Awareness',
    progress: 0,
    dailyTarget: 'Read History notes on Indian Freedom Struggle and Freedom Fighter events',
    weeklyTarget: 'Revise 6 months of Biology & Physics general science summaries',
    mockTestsAttempted: 0,
    averageScorePercentage: 0,
    weakTopics: ['General Science Physics equations', 'Medieval Indian history administrative terms']
  },
  {
    id: 'rrb-current',
    name: 'Current Affairs',
    progress: 0,
    dailyTarget: 'Summarize current national schemes and global summits notes',
    weeklyTarget: 'Take a comprehensive 50-question monthly affairs quiz and review stats',
    mockTestsAttempted: 0,
    averageScorePercentage: 0,
    weakTopics: ['Military exercises and bilateral defense agreements names', 'Recent regulatory appointments']
  }
];

export const initialBankingPrep: GovExamSection[] = [
  {
    id: 'bank-quant',
    name: 'Quantitative Aptitude',
    progress: 0,
    dailyTarget: 'Solve 5 Data Interpretation sets plus 10 Simplification exercises daily',
    weeklyTarget: 'Focus on speed drills (Quadratic Equations, Number Series, mental math)',
    mockTestsAttempted: 0,
    averageScorePercentage: 0,
    weakTopics: ['Data Interpretation radar charts', 'Probability & Permutations combinatorics']
  },
  {
    id: 'bank-reasoning',
    name: 'Reasoning Ability',
    progress: 0,
    dailyTarget: 'Complete 4 complex floor puzzles, circular arrangements & logical grids',
    weeklyTarget: 'Review complex puzzle categories & target 2:30 min solve time per set',
    mockTestsAttempted: 0,
    averageScorePercentage: 0,
    weakTopics: ['Floor Puzzles with dual variable dependencies', 'Machine Input-Output systems coding']
  },
  {
    id: 'bank-english',
    name: 'English Language',
    progress: 0,
    dailyTarget: 'Read 2 editorial notes (The Hindu/Express) + 15 error spotting rows',
    weeklyTarget: 'Track 10 Reading Comprehension paragraphs with complete core deduction tests',
    mockTestsAttempted: 0,
    averageScorePercentage: 0,
    weakTopics: ['Parajumbles connection patterns', 'Column Matching syntax tests']
  },
  {
    id: 'bank-awareness',
    name: 'General & Banking Awareness',
    progress: 0,
    dailyTarget: 'Review reverse repo rate, SLR, monetary policy tools updates',
    weeklyTarget: 'Summarize nationalized banking history, Basel guidelines, digital wallets',
    mockTestsAttempted: 0,
    averageScorePercentage: 0,
    weakTopics: ['Basel III Accord Capital Adequacy compliance structures', 'NPA (Non-Performing Assets) classifications']
  }
];

export const initialGroomingRoutines: GroomingRoutine[] = [
  // Skin routine
  { id: 'g-skin-am', category: 'skin', name: 'Gentle Cleansing + Hydrating Moisturizer + SPF 50 Sunscreen protect', frequency: 'daily', completed: false },
  { id: 'g-skin-pm', category: 'skin', name: 'Face wash cleansing + Salicylic acid/Niacinamide + Under-eye repair cream', frequency: 'daily', completed: false },
  { id: 'g-skin-clay', category: 'skin', name: 'Exfoliate + Clay face mask to clear oils and shrink pores', frequency: 'weekly', completed: false },
  // Hair Routine
  { id: 'g-hair-wash', category: 'hair', name: 'Sulfate-free scalp cleansing wash & deep hair nutrition conditioner', frequency: 'weekly', completed: false },
  { id: 'g-hair-oil', category: 'hair', name: 'Scalp oiling (Rosemary/Argan oil extract) combined with massage', frequency: 'weekly', completed: false },
  // Grooming & Hygiene
  { id: 'g-groom-trim', category: 'grooming', name: 'Beard neckline trim + clean shave stray hair + clean ear canals and nails', frequency: 'weekly', completed: false },
  { id: 'g-groom-scent', category: 'grooming', name: 'Apply high-quality subtle deodorant / fresh musk scent spray', frequency: 'daily', completed: false },
  // Posture & Confidence
  { id: 'g-posture-chin', category: 'posture', name: 'Chin tuck stretches + shoulder wall rolls to fix forward head', frequency: 'daily', completed: false },
  { id: 'g-posture-back', category: 'posture', name: 'Dead hangs (3 sets) to decompress spine and stand straight', frequency: 'daily', completed: false },
  { id: 'g-social-eye', category: 'posture', name: 'Practice keeping warm eye contact and upright solid seating positions', frequency: 'daily', completed: false }
];

export const initialDailyTasks: DailyTask[] = [
  // Morning Routine
  { id: 't-m-wake', text: 'Wake up early (5:30 AM) & hydrate with 500ml water', category: 'Morning', completed: false },
  { id: 't-m-med', text: '10-minute mindfulness focus breathing', category: 'Morning', completed: false },
  { id: 't-m-ex', text: 'Morning body activation stretches or light workout jogs', category: 'Morning', completed: false },
  { id: 't-m-plan', text: 'Review today’s target schedules & check roadmap completion', category: 'Morning', completed: false },
  // Study Blocks (Smart distribution based on BCA prep priority)
  { id: 't-s-bca', text: 'BCA Exams study block (ML Neural network formulas, testing metrics)', category: 'BCA Study', completed: false },
  { id: 't-s-gov', text: 'RRB/Banking speed quant and logical analytical puzzles', category: 'Gov Prep', completed: false },
  { id: 't-s-fs', text: 'Coding block: Build Full Stack project React interfaces or server paths', category: 'Full Stack Study', completed: false },
  { id: 't-s-ai', text: 'AI learning node: Test tool calling loops in LangChain/Gemini SDK', category: 'AI Study', completed: false },
  { id: 't-s-eng', text: 'English check: 15-min conversational review / read editorial', category: 'English', completed: false },
  // Fitness
  { id: 't-s-fit', text: 'Complete planned strength training block or home split circuit', category: 'Fitness', completed: false },
  // Evening review
  { id: 't-e-audit', text: 'Cross-check finished items in planner, log calories & weight logs', category: 'Evening', completed: false },
  { id: 't-e-journal', text: 'Log accountability details: What was missed today and why?', category: 'Evening', completed: false }
];

export const initialBadges: Badge[] = [
  { id: 'b-streak-30', title: '30-Day Transformed', description: 'Maintain consistent checklist updates for 30 consecutive days.', unlocked: false, icon: '🔥' },
  { id: 'b-study-100', title: '100-Hour Sage', description: 'Log accumulative 100 deep-study hours in the progress trackers.', unlocked: false, icon: '📚' },
  { id: 'b-first-proj', title: 'Code Vanguard', description: 'Kickstart your first functional portfolio project.', unlocked: false, icon: '💻' },
  { id: 'b-first-ai', title: 'Prompt Mastermind', description: 'Deploy your first AI Agent automation sequence successfully.', unlocked: false, icon: '🤖' },
  { id: 'b-resume', title: 'Placement Ready', description: 'Generate a polished ATS-friendly CV (score over 80).', unlocked: false, icon: '📄' },
  { id: 'b-english', title: 'Syllable Sovereign', description: 'Maintain conversational english audio triggers for 7 consecutive days.', unlocked: false, icon: '🗣️' },
  { id: 'b-all-completed-custom', title: 'Commitment Crusader', description: 'Unlock your first customized goals batch by completing them fully.', unlocked: false, icon: '🎯' }
];

export const initialAtsResume = {
  fullName: 'Your BCA Graduate Name',
  email: 'bca.graduate@example.com',
  phone: '+91 98765 43210',
  linkedin: 'linkedin.com/in/bcagraduate',
  github: 'github.com/bcagraduate',
  education: 'Bachelor of Computer Applications (BCA) - Final Semester\nExpected Graduation: 2026\nSubjects: Software Testing, Machine Learning, Flutter, Data Analysis, Digital Image Processing',
  experience: [
    {
      company: 'Self-Directed Tech Portfolio',
      role: 'Full Stack & AI Developer (Personal Track)',
      duration: '12-Month Transformation Plan',
      bulletPoints: [
        'Built full stack modular client systems using React, TypeScript, Tailwind CSS, Express, and Node.js.',
        'Engineered AI retrieval pipelines utilizing Gemini SDK integrations, prompt frameworks, and vector databases.',
        'Structured automated task flows and trigger bots to optimize complex daily productivity statistics.'
      ]
    }
  ],
  skills: ['Linux/Ubuntu Terminal', 'React', 'TypeScript', 'Node.js', 'Express', 'Generative AI APIs', 'PostgreSQL', 'Flutter/Dart', 'Software Testing (QA)'],
  certifications: ['Oracle Cloud Database Associate', 'Google Advanced Machine Learning Specialization'],
  atsScore: 78,
  missingKeywords: ['RESTful Web Services', 'Agile Methodologies', 'Database Indexing', 'Continuous Integration / Continuous Deployment (CI/CD)'],
  improvementSuggestions: [
    'Add your finalized full stack URLs and active portfolio deployment links to the top of the header.',
    'Incorporate technical keywords like CI/CD, Containerization (Docker), or RESTful APIs explicitly under the Skills list.',
    'Detail specific quantitatives under projects (e.g., "boosted prompt response speed by 35% with caching").'
  ]
};

export const initialFlashcards: Flashcard[] = [
  {
    id: 'f-1',
    category: 'BCA',
    question: "What is McCabe’s Cyclomatic Complexity, and what is the formula?",
    answer: "It is a software metric used to indicate the complexity of a program. It measures the number of linearly independent paths through a program's source code. Formula: M = E - V + 2P, where E = number of edges, V = number of vertices, and P = number of connected components (P = 1 for a single program/method).",
    difficulty: 'medium',
    reviewCount: 0
  },
  {
    id: 'f-2',
    category: 'Fullstack',
    question: "Explain the rules of React Hooks and why they are required.",
    answer: "1. Only Call Hooks at the Top Level: Don't call Hooks inside loops, conditions, or nested functions. This ensures Hooks are always called in the exact same order each render so React can correctly preserve state reference across renders.\n2. Only Call Hooks from React Functions: Don't call Hooks from regular JavaScript functions. Instead, call them from React function components or custom Hooks.",
    difficulty: 'easy',
    reviewCount: 0
  },
  {
    id: 'f-3',
    category: 'Generative AI',
    question: "What is Temperature in LLM sampling, and how does it affect outputs?",
    answer: "Temperature is a hyperparameter that controls the randomness of predicted tokens. A low temperature (e.g., 0.2) makes the model's outputs highly deterministic and focused on the highest-probability tokens. A high temperature (e.g., 0.8+) increases diversity, leading to more creative, varied, but potentially less coherent or 'hallucinated' outputs.",
    difficulty: 'medium',
    reviewCount: 0
  },
  {
    id: 'f-4',
    category: 'Government Exams',
    question: "How do you calculate compound interest vs simple interest?",
    answer: "Simple Interest (SI) = (Principal * RateOfPercent * Time_in_Years) / 100.\nCompound Interest (CI) = Principal * (1 + RateOfPercent / 100)^Time_in_Years - Principal. Compound interest computes interest on both the principal and previously earned interest, compounding over each period.",
    difficulty: 'easy',
    reviewCount: 0
  },
  {
    id: 'f-5',
    category: 'Spoken English',
    question: "Explain the STAR technique for HR behavior interviews.",
    answer: "STAR is a structured pattern to answer behavioral or situational interview questions:\n- S (Situation): Set the scene and provide details of your challenge or situation.\n- T (Task): Describe the responsibility or objective you needed to hit.\n- A (Action): State exactly what steps you took personally to solve the problem.\n- R (Result): Explain the positive outcome, ideally with measurable statistics or learnings.",
    difficulty: 'medium',
    reviewCount: 0
  },
  {
    id: 'f-6',
    category: 'Fullstack',
    question: "What are database indexes, and how do they speed up lookups?",
    answer: "A database index is a data structure (typically a B-Tree or Hash index) that stores a sorted copy of selected columns. Instead of performing a slow linear 'Full Table Scan' (O(N)), the database engine traverses the sorted balance tree in logarithmic time (O(log N)) to instantly reference the precise row pointer.",
    difficulty: 'hard',
    reviewCount: 0
  },
  {
    id: 'f-7',
    category: 'BCA',
    question: "What are the 5 maturity levels of CMMI (Capability Maturity Model Integration)?",
    answer: "1. Initial: Processes are disorganized, ad-hoc, and reactive.\n2. Managed: Processes are planned, documented, and monitored at the project level.\n3. Defined: Processes are thoroughly defined and standardized organization-wide.\n4. Quantitatively Managed: Processes are measured using statistical control limits.\n5. Optimizing: Focus on continuous improvement and process revision via innovation.",
    difficulty: 'hard',
    reviewCount: 0
  }
];

// Initial state creator
export function getInitialState(): LifeTransformationState {
  const dates = [];
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - 30);
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push({
      date: dateStr,
      count: 0 // start heatmap with no initial completed milestones, fully zeroed
    });
  }

  return {
    userStats: {
      xp: 0,
      level: 0,
      overallScore: 0,
      goalCompletion: 0,
      consistencyScore: 0,
      disciplineScore: 0,
      streakDays: {
        study: 0,
        coding: 0,
        fitness: 0,
        english: 0
      },
      heatmapData: dates
    },
    bcaSubjects: initialBcaSubjects,
    fullStackRoadmap: initialFullStackRoadmap,
    aiRoadmap: initialAiRoadmap,
    rrbPrep: initialRrbPrep,
    bankingPrep: initialBankingPrep,
    englishState: {
      wordsLearned: [],
      wordRetentionScore: 0,
      grammarCompletedTopics: [],
      speakingPracticeDaysCount: 0,
      confidenceScore: 0,
      listeningMinutes: 0,
      readingWordsCount: 0
    },
    fitnessLog: {
      weight: 72.5,
      bodyFatPercentage: 18.2,
      bmi: 22.8,
      steps: 0,
      waterIntakeLiters: 0,
      sleepHours: 0,
      caloriesConsumed: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0
    },
    activeWorkoutPlan: [
      {
        id: 'w-1',
        day: 'Monday: Push Focus (Chest, Shoulders & Triceps)',
        exercises: [
          { name: 'Push-ups (WarmUp)', sets: 3, reps: 15, weightUsed: 0 },
          { name: 'Dolphin Push-ups (Shoulders)', sets: 3, reps: 10, weightUsed: 0 },
          { name: 'Dips on Bench (Triceps focus)', sets: 3, reps: 12, weightUsed: 0 },
          { name: 'Pike Push-ups (Upward press)', sets: 3, reps: 8, weightUsed: 0 }
        ],
        completed: false
      },
      {
        id: 'w-2',
        day: 'Wednesday: Pull Focus (Back & Biceps)',
        exercises: [
          { name: 'Doorframe Pulls or Towel Rows', sets: 4, reps: 12, weightUsed: 0 },
          { name: 'Bicep Water Bottle Curls', sets: 3, reps: 15, weightUsed: 5 },
          { name: 'Reverse Snow Angels', sets: 3, reps: 12, weightUsed: 0 },
          { name: 'Superman Back Extensions', sets: 3, reps: 10, weightUsed: 0 }
        ],
        completed: false
      },
      {
        id: 'w-3',
        day: 'Friday: Leg & Core Activation (Quads & abs)',
        exercises: [
          { name: 'Bodyweight Squats (High chest)', sets: 4, reps: 20, weightUsed: 0 },
          { name: 'Forward Alternating Lunges', sets: 3, reps: 12, weightUsed: 0 },
          { name: 'Glute Bridges (Hold 2s)', sets: 3, reps: 15, weightUsed: 0 },
          { name: 'Bicycle Crunches (Core rotation)', sets: 3, reps: 20, weightUsed: 0 }
        ],
        completed: false
      }
    ],
    groomingRoutines: initialGroomingRoutines,
    dailyTasks: initialDailyTasks,
    timeAllocation: {
      bcaPercent: 50,
      fullStackPercent: 20,
      govPercent: 5,
      aiPercent: 5,
      englishPercent: 10,
      fitnessPercent: 10
    },
    jobApplications: [
      { id: 'ja-1', company: 'TCS', role: 'System Engineer', status: 'Applied', dateApplied: '2026-06-10', notes: 'Walk-in referral via mutual alumni. Software Testing concepts are major focus.' },
      { id: 'ja-2', company: 'TechSolutions India', role: 'Full Stack Fresher', status: 'Screening', dateApplied: '2026-06-15', notes: 'Completed custom programming assignment. Interview expected focused on React.' }
    ],
    badges: initialBadges,
    atsResume: initialAtsResume,
    portfolioDeployed: false,
    customGoals: [
      {
        id: 'cg-1',
        title: 'Master React & Deploy Portfolio Web-App',
        category: 'Career',
        targetDate: '2026-07-15',
        status: 'pending',
        notes: [
          {
            id: 'n-1',
            name: 'React Fiber & Reconciliation Engine.txt',
            content: 'The Virtual DOM works by maintaining a tree structure. During a state change, React creates a new virtual tree, performs a diff against the previous tree using a heuristic O(n) rendering algorithm, and batch-updates the browser DOM. Key strategies: stabilize callback functions using useCallback, and memoize expensive layouts using useMemo.',
            uploadedAt: '2026-06-18'
          }
        ]
      },
      {
        id: 'cg-2',
        title: 'Crack Semester 5 BCA Examinations with 85%+',
        category: 'BCA Study',
        targetDate: '2026-08-01',
        status: 'pending',
        notes: [
          {
            id: 'n-2',
            name: 'Software Engineering CMMI Levels.txt',
            content: 'CMMI (Capability Maturity Model Integration) levels define maturity levels of software processes:\nLevel 1: Initial (unpredictable & reactive)\nLevel 2: Managed (project level execution)\nLevel 3: Defined (proactive, organization-wide standardization)\nLevel 4: Quantitatively Managed (measured & controlled)\nLevel 5: Optimizing (focus on continuous innovation and improvement)',
            uploadedAt: '2026-06-19'
          }
        ]
      }
    ],
    mockInterviews: [
      {
        id: 'mi-1',
        title: 'React & Frontend Core mock-run',
        type: 'Technical',
        datetime: '2026-06-25T14:30',
        interviewer: 'Saurabh Kumar (Senior SDE @ TCS)',
        status: 'scheduled',
        remindersEnabled: true,
        feedbackNotes: 'Focus on memorizing how useEffect cleanups trigger, custom hook encapsulation states, and performance tuning rules.',
        performanceScore: 0,
        keyQuestionsAsked: ['Explain Virtual DOM reconciliation', 'How do you handle closure issues in useEffect?', 'Describe state batching in React 18']
      },
      {
        id: 'mi-2',
        title: 'HR Behavioral Rounds and Background',
        type: 'HR',
        datetime: '2026-06-18T11:00',
        interviewer: 'Ananya Sen (HR Lead)',
        status: 'completed',
        remindersEnabled: false,
        feedbackNotes: 'Performed well on standard questions. Need to polish situational descriptions using the STAR method (Situation, Task, Action, Result). Expressed eagerness to work in continuous integration pipelines.',
        performanceScore: 8,
        keyQuestionsAsked: ['Tell me about a time you handled a tight project deadline', 'Why do you want to join TCS?', 'How do you handle group conflicts during coursework?']
      }
    ],
    flashcards: initialFlashcards
  };
}

// Complete guides for Ubuntu
export interface UbuntuGuide {
  id: string;
  name: string;
  install: string[];
  verify: string[];
  troubleshoot: string[];
  projectSetup: string[];
  bestPractices: string[];
}

export const ubuntuGuides: UbuntuGuide[] = [
  {
    id: 'g-ubuntu',
    name: 'Ubuntu Linux Terminal & Shell basics',
    install: [
      '# Ubuntu is already installed as your OS, open terminal with Ctrl+Alt+T',
      'sudo apt update && sudo apt upgrade -y'
    ],
    verify: [
      'uname -a # Confirms kernel version and architecture',
      'lsb_release -a # Displays Ubuntu release versions details'
    ],
    troubleshoot: [
      'Issue: "dpkg structure is locked or blocked out".',
      'Fix: Run "sudo rm /var/lib/dpkg/lock-frontend" and run updations again.'
    ],
    projectSetup: [
      'mkdir -p ~/projects/workspace # Creates custom directories structure',
      'cd ~/projects/workspace && pwd # Enters workspace and prints exact location'
    ],
    bestPractices: [
      'Always structure aliases for fast keys inside ~/.bashrc or ~/.zshrc',
      'Organize standard file structures clean with user folders instead of root root.'
    ]
  },
  {
    id: 'g-vscode',
    name: 'Visual Studio Code',
    install: [
      '# Install using snap for automatic security updates',
      'sudo snap install --classic code',
      '# Or download official .deb package and install:',
      'sudo apt install ./code_amd64.deb'
    ],
    verify: [
      'code --version # Confirms command line executable launch CLI'
    ],
    troubleshoot: [
      'Issue: "Fails to open due to snap configuration or sandbox blocks."',
      'Fix: Ensure snapd service is active: sudo systemctl start snapd.service'
    ],
    projectSetup: [
      'cd ~/projects/workspace && code . # Opens current workspace inside VS Code editor'
    ],
    bestPractices: [
      'Install core developer extensions: ESLint, Prettier, GitLens, Python, Flutter, Tailwind CSS IntelliSense.',
      'Enable Auto-Save setting to avoid losing dynamic scripts code structures.'
    ]
  },
  {
    id: 'g-git',
    name: 'Git & GitHub Collaboration',
    install: [
      'sudo apt update',
      'sudo apt install git -y'
    ],
    verify: [
      'git --version # Confirms correct CLI package is linked'
    ],
    troubleshoot: [
      'Issue: "Permission denied (publickey) on SSH verification".',
      'Fix: Ensure ssh-agent is initialized: eval "$(ssh-agent -s)" and add key: ssh-add ~/.ssh/id_ed25519'
    ],
    projectSetup: [
      '# Setup global identity properties:',
      'git config --global user.name "Your Name"',
      'git config --global user.email "your.email@example.com"',
      '# Create SSH key file for secure authentication limits:',
      'ssh-keygen -t ed25519 -C "your.email@example.com"'
    ],
    bestPractices: [
      'Always write detailed commit messages (e.g. "feat: add user tracking controller structures")',
      'Create feature branches (git checkout -b feature/name) instead of working directly on main.'
    ]
  },
  {
    id: 'g-flutter',
    name: 'Flutter & Android Studio',
    install: [
      '# Install java dependencies:',
      'sudo apt install default-jdk -y',
      '# Install flutter through snap package:',
      'sudo snap install flutter --classic',
      '# Install Android Studio:',
      'sudo snap install android-studio --classic'
    ],
    verify: [
      'flutter --version # Displays flutter system sdk parameters',
      'flutter doctor # Checks all required components and tools linked'
    ],
    troubleshoot: [
      'Issue: Android license agreement failure.',
      'Fix: Execute "flutter doctor --android-licenses" and accept all prompts toggles.'
    ],
    projectSetup: [
      'flutter create my_first_app',
      'cd my_first_app && flutter run # Select local chrome or linux desktop mode'
    ],
    bestPractices: [
      'Structure custom Dart code into separated layouts under /lib/src/screens/',
      'Ensure stateless vs stateful parameters are structured perfectly to prevent rebuild cycles.'
    ]
  },
  {
    id: 'g-node',
    name: 'Node.js & Express API backend',
    install: [
      '# Best option is installing via NVM (Node Version Manager):',
      'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
      'source ~/.bashrc # reload shell parameters',
      'nvm install 20 # Install stable modern Node Engine'
    ],
    verify: [
      'node -v # Confirms runtime is active',
      'npm -v # Confirms package tool structure'
    ],
    troubleshoot: [
      'Issue: "EACCES run errors when global packages are executed".',
      'Fix: We strongly recommend using NVM, which manages environments locally within home directory paths, resolving permission locks.'
    ],
    projectSetup: [
      'mkdir my_api && cd my_api && npm init -y',
      'npm install express dotenv',
      'npm install -D typescript @types/node @types/express tsx # For full typescript Express server setup'
    ],
    bestPractices: [
      'Define process and database configurations explicitly inside isolated .env templates.',
      'Avoid global packages; load dependencies within package.json directly to keep setups modular.'
    ]
  },
  {
    id: 'g-docker',
    name: 'Docker containerization systems',
    install: [
      '# Setup Docker official repo keys security:',
      'sudo apt-get update',
      'sudo apt-get install ca-certificates curl gnupg -y',
      'sudo install -m 0755 -d /etc/apt/keyrings',
      'curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg',
      'sudo chmod a+r /etc/apt/keyrings/docker.gpg',
      '# Install complete engine details:',
      'sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y'
    ],
    verify: [
      'sudo docker run hello-world # Performs basic container launch test verification'
    ],
    troubleshoot: [
      'Issue: "Permission denied trying to link to docker daemon socket".',
      'Fix: Add your local user account directly to Docker security group: sudo usermod -aG docker $USER (then reboot/re-login).'
    ],
    projectSetup: [
      '# Create standard Dockerfile:',
      'FROM node:20-alpine',
      'WORKDIR /app',
      'COPY package*.json ./',
      'RUN npm install',
      'COPY . .',
      'CMD ["npm", "start"]'
    ],
    bestPractices: [
      'Utilize multi-stage builds to shrink deployable container output sizes.',
      'Construct strict .dockerignore lists to keep secrets and node_modules folders out of building caches.'
    ]
  },
  {
    id: 'g-db',
    name: 'PostgreSQL, MongoDB & Redis',
    install: [
      '# Install PostgreSQL:',
      'sudo apt install postgresql postgresql-contrib -y',
      '# Install Redis caching:',
      'sudo apt install redis-server -y',
      '# Install MongoDB Community Edition:',
      'sudo apt install gnupg curl -y',
      'curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor',
      'sudo apt-get update && sudo apt-get install -y mongodb-org'
    ],
    verify: [
      'sudo systemctl status postgresql # Confirms relational server execution',
      'redis-cli ping # Should return "PONG" response verification check',
      'sudo systemctl status mongod # Check document database process status'
    ],
    troubleshoot: [
      'Issue: "PostgreSQL password login fails for user postgres locally".',
      'Fix: Login directly via local unix socket first matching OS roles: sudo -u postgres psql'
    ],
    projectSetup: [
      '# Set up relational db connection via Prisma or Drizzle ORM config structure.'
    ],
    bestPractices: [
      'Implement strict database connection pooling pools to manage scalable request threads.',
      'Build database migration setups to guarantee that structure changes sync across machines.'
    ]
  }
];
