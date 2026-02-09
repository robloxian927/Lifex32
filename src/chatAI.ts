import type { Relationship, PersonalityTraits } from './gameState';

export interface ChatMessage {
  id: string;
  sender: 'player' | 'npc';
  text: string;
  timestamp: number;
}

export interface ChatThread {
  contactId: string;
  messages: ChatMessage[];
  topics: string[];
  mood: number;
}

// ====== TOPIC EXTRACTION ======
const TOPIC_KEYWORDS: Record<string, string[]> = {
  work: ['work', 'job', 'boss', 'office', 'career', 'salary', 'fired', 'hired', 'coworker', 'promotion', 'meeting', 'resume', 'overtime', 'deadline', 'shift'],
  school: ['school', 'class', 'teacher', 'homework', 'exam', 'test', 'grade', 'study', 'college', 'university', 'professor', 'lecture', 'assignment', 'quiz', 'tutor'],
  love: ['love', 'date', 'dating', 'boyfriend', 'girlfriend', 'crush', 'relationship', 'married', 'wedding', 'kiss', 'romantic', 'partner', 'flirt', 'breakup', 'ex'],
  family: ['family', 'mom', 'dad', 'parent', 'brother', 'sister', 'kid', 'child', 'baby', 'son', 'daughter', 'grandma', 'grandpa', 'uncle', 'aunt', 'cousin'],
  money: ['money', 'cash', 'rich', 'poor', 'broke', 'bank', 'buy', 'expensive', 'cheap', 'afford', 'debt', 'invest', 'savings', 'wallet', 'loan', 'payment'],
  food: ['food', 'eat', 'hungry', 'lunch', 'dinner', 'breakfast', 'restaurant', 'cook', 'pizza', 'burger', 'coffee', 'snack', 'meal', 'recipe', 'bake'],
  fun: ['fun', 'party', 'game', 'movie', 'music', 'concert', 'trip', 'vacation', 'travel', 'beach', 'hangout', 'chill', 'festival', 'hobby', 'adventure'],
  health: ['health', 'sick', 'doctor', 'hospital', 'gym', 'exercise', 'tired', 'sleep', 'headache', 'medicine', 'fit', 'pain', 'workout', 'diet', 'injury'],
  feelings: ['happy', 'sad', 'angry', 'upset', 'worried', 'scared', 'excited', 'bored', 'lonely', 'stressed', 'anxious', 'depressed', 'frustrated', 'grateful', 'jealous'],
  greeting: ['hi', 'hey', 'hello', 'sup', 'yo', "what's up", 'how are you', 'how r u', 'wassup', 'hows it going', 'howdy', 'greetings', 'morning'],
  goodbye: ['bye', 'goodbye', 'later', 'gotta go', 'see you', 'cya', 'ttyl', 'goodnight', 'gn', 'night', 'peace', 'farewell', 'brb'],
  question: ['why', 'how', 'what', 'where', 'when', 'who', 'which', 'do you', 'are you', 'can you', 'would you', 'should', 'shall', 'is it'],
  compliment: ['nice', 'awesome', 'cool', 'great', 'amazing', 'beautiful', 'smart', 'funny', 'best', 'love you', 'miss you', 'talented', 'gorgeous', 'incredible'],
  insult: ['hate', 'stupid', 'ugly', 'dumb', 'idiot', 'loser', 'worst', 'suck', 'terrible', 'annoying', 'shut up', 'pathetic', 'lame', 'trash'],
};

// ====== SPELL CORRECTION ENGINE ======
const SPELL_MAP: Record<string, string> = {
  // work
  wrk: 'work', wrok: 'work', worl: 'work', wirk: 'work', wokr: 'work', owrk: 'work',
  jbo: 'job', jab: 'job', jop: 'job', joob: 'job',
  bos: 'boss', boos: 'boss', bross: 'boss', bss: 'boss',
  ofice: 'office', offce: 'office', offfice: 'office', offica: 'office',
  carreer: 'career', carier: 'career', carer: 'career', carear: 'career',
  salry: 'salary', sallary: 'salary', salaray: 'salary', salery: 'salary',
  fird: 'fired', fierd: 'fired', firedd: 'fired',
  hird: 'hired', hierd: 'hired', hirred: 'hired',
  promtion: 'promotion', promosion: 'promotion', promoton: 'promotion', prmotion: 'promotion',
  meating: 'meeting', metting: 'meeting', meetign: 'meeting',
  coworker: 'coworker', cowrker: 'coworker', cowoker: 'coworker',
  // school
  scool: 'school', shool: 'school', schol: 'school', schoool: 'school', shcool: 'school', skool: 'school', skewl: 'school',
  clas: 'class', calss: 'class', classs: 'class', clss: 'class',
  techer: 'teacher', teachr: 'teacher', teecher: 'teacher', techr: 'teacher', teacer: 'teacher',
  homwork: 'homework', homewrok: 'homework', hmework: 'homework', homewerk: 'homework',
  exma: 'exam', eaxm: 'exam', exaam: 'exam', ecam: 'exam',
  tets: 'test', tset: 'test', testt: 'test',
  gade: 'grade', graed: 'grade', grde: 'grade', garde: 'grade',
  stuyd: 'study', sutdy: 'study', stdy: 'study', studdy: 'study',
  colege: 'college', collge: 'college', colledge: 'college', collage: 'college', colleg: 'college',
  univrsity: 'university', univeristy: 'university', unversity: 'university', univercity: 'university',
  profeser: 'professor', proffessor: 'professor', professer: 'professor', proffesor: 'professor',
  // love
  lov: 'love', luv: 'love', loev: 'love', lovee: 'love', lve: 'love',
  dat: 'date', daet: 'date', dtae: 'date',
  datign: 'dating', dateing: 'dating', datin: 'dating',
  boyfrend: 'boyfriend', boyfreind: 'boyfriend', boifriend: 'boyfriend', boyfirend: 'boyfriend',
  girlfrend: 'girlfriend', girlfreind: 'girlfriend', girlfirend: 'girlfriend', grilfriend: 'girlfriend',
  cruch: 'crush', crussh: 'crush', cursh: 'crush', chrush: 'crush',
  realtionship: 'relationship', relasionship: 'relationship', relatonship: 'relationship', realationship: 'relationship',
  marred: 'married', maried: 'married', marride: 'married', marriad: 'married',
  weding: 'wedding', weddin: 'wedding', weddign: 'wedding',
  romatic: 'romantic', romantc: 'romantic', romanitc: 'romantic',
  parner: 'partner', partnar: 'partner', parter: 'partner', partnre: 'partner',
  // family
  famly: 'family', famliy: 'family', faimly: 'family', familiy: 'family', familly: 'family',
  moem: 'mom', momm: 'mom', mum: 'mom', maam: 'mom',
  dda: 'dad', dadd: 'dad', dahd: 'dad',
  parnet: 'parent', parant: 'parent', parrent: 'parent',
  brothr: 'brother', broter: 'brother', brotehr: 'brother', bruther: 'brother',
  siter: 'sister', sistr: 'sister', siser: 'sister', sistre: 'sister',
  chidl: 'child', chlid: 'child', childd: 'child',
  daugther: 'daughter', dauhgter: 'daughter', daugher: 'daughter', daugter: 'daughter',
  // money
  mony: 'money', moeny: 'money', muney: 'money', monye: 'money', monney: 'money',
  csh: 'cash', cassh: 'cash', cahs: 'cash',
  rch: 'rich', rihc: 'rich', riich: 'rich',
  por: 'poor', pooor: 'poor', poorr: 'poor',
  brok: 'broke', broek: 'broke', brokee: 'broke',
  bnk: 'bank', baank: 'bank', bakn: 'bank',
  expensve: 'expensive', expenisve: 'expensive', expensiv: 'expensive',
  dept: 'debt', dbet: 'debt', deabt: 'debt',
  invst: 'invest', invets: 'invest', invsest: 'invest',
  savigns: 'savings', savins: 'savings', saivngs: 'savings',
  // food
  fod: 'food', foood: 'food', foof: 'food', foud: 'food',
  aet: 'eat', eet: 'eat', eatt: 'eat',
  hungyr: 'hungry', hunrgy: 'hungry', hungray: 'hungry', hungy: 'hungry',
  lnch: 'lunch', lucnh: 'lunch', lunhc: 'lunch',
  dinr: 'dinner', dinnr: 'dinner', diner: 'dinner', dinenr: 'dinner',
  brekfast: 'breakfast', breakfest: 'breakfast', brakfast: 'breakfast', breafast: 'breakfast',
  restraunt: 'restaurant', restarant: 'restaurant', resturant: 'restaurant', resteraunt: 'restaurant',
  coffe: 'coffee', cofee: 'coffee', coffie: 'coffee', cofeee: 'coffee',
  piza: 'pizza', piazza: 'pizza', pizzza: 'pizza',
  // fun
  funn: 'fun', fnu: 'fun',
  prty: 'party', partty: 'party', pary: 'party', parti: 'party',
  gme: 'game', gaem: 'game', gmae: 'game',
  moive: 'movie', movei: 'movie', moovie: 'movie', mvie: 'movie',
  muisc: 'music', muscic: 'music', musc: 'music', muisic: 'music',
  cocnert: 'concert', conert: 'concert', concet: 'concert',
  trp: 'trip', tirp: 'trip', triip: 'trip',
  vacaton: 'vacation', vacaion: 'vacation', vacasion: 'vacation', vacashion: 'vacation',
  travl: 'travel', traevl: 'travel', travle: 'travel',
  // health
  helth: 'health', heatlh: 'health', haelth: 'health', healht: 'health',
  sck: 'sick', scik: 'sick', siick: 'sick',
  doctr: 'doctor', docter: 'doctor', doctro: 'doctor', docotr: 'doctor',
  hosptal: 'hospital', hosptial: 'hospital', hospitl: 'hospital', hopsital: 'hospital',
  exrcise: 'exercise', exercse: 'exercise', excercise: 'exercise', exersise: 'exercise',
  tird: 'tired', tierd: 'tired', tiread: 'tired',
  slep: 'sleep', slepe: 'sleep', slepp: 'sleep', sleeep: 'sleep',
  headach: 'headache', hedache: 'headache', headace: 'headache',
  medicne: 'medicine', medecine: 'medicine', medicin: 'medicine',
  // feelings
  hapy: 'happy', hapyp: 'happy', happpy: 'happy', hppy: 'happy',
  sda: 'sad', sadd: 'sad',
  anrgy: 'angry', angyr: 'angry', angy: 'angry', agry: 'angry',
  upst: 'upset', uspet: 'upset', uppset: 'upset',
  woried: 'worried', worred: 'worried', worreid: 'worried', worrid: 'worried',
  scred: 'scared', scaerd: 'scared', scarred: 'scared',
  exicted: 'excited', excied: 'excited', exited: 'excited', ecxited: 'excited',
  bord: 'bored', boerd: 'bored', borred: 'bored',
  lonley: 'lonely', lonly: 'lonely', loneyl: 'lonely',
  stresed: 'stressed', streesed: 'stressed', stressd: 'stressed',
  anxous: 'anxious', anixous: 'anxious', anxius: 'anxious', ancsious: 'anxious',
  depresed: 'depressed', depressd: 'depressed', deppressed: 'depressed',
  // greeting
  helo: 'hello', helllo: 'hello', hllo: 'hello',
  heey: 'hey', hye: 'hey',
  hii: 'hi', hiii: 'hi',
  wasup: 'wassup', whatsup: "what's up", watsup: "what's up", whasup: "what's up",
  // goodbye
  byee: 'bye', bey: 'bye', byye: 'bye',
  godbye: 'goodbye', goodby: 'goodbye', gooodbye: 'goodbye',
  latr: 'later', lter: 'later', laterr: 'later',
  goodnite: 'goodnight', gdnight: 'goodnight', goodngiht: 'goodnight',
  // common general misspellings
  teh: 'the', taht: 'that', waht: 'what', whta: 'what', wehn: 'when',
  becuase: 'because', becasue: 'because', becuz: 'because', cuz: 'because', bcuz: 'because',
  poeple: 'people', pepole: 'people', peple: 'people', ppl: 'people',
  freind: 'friend', frend: 'friend', frined: 'friend', freand: 'friend', firend: 'friend',
  dont: "don't", doesnt: "doesn't", didnt: "didn't", cant: "can't", wont: "won't",
  im: "i'm", ive: "i've", youre: "you're", theyre: "they're", thier: 'their',
  realy: 'really', relly: 'really', relaly: 'really', rlly: 'really', rly: 'really',
  thnk: 'think', thnik: 'think', thiink: 'think',
  abuot: 'about', abut: 'about', abotu: 'about',
  somthing: 'something', somethign: 'something', smething: 'something',
  evrything: 'everything', everthing: 'everything', evreything: 'everything',
  defintely: 'definitely', definately: 'definitely', defiantly: 'definitely', definetly: 'definitely',
  beautful: 'beautiful', beutiful: 'beautiful', beatiful: 'beautiful', beautifull: 'beautiful',
  intresting: 'interesting', intersting: 'interesting', intresing: 'interesting',
  tommorow: 'tomorrow', tomorow: 'tomorrow', tomorrw: 'tomorrow', tmrw: 'tomorrow',
  tongiht: 'tonight', tonite: 'tonight', tnoight: 'tonight',
  proably: 'probably', probaly: 'probably', prolly: 'probably', prbably: 'probably',
};

// Simple Levenshtein distance for fuzzy matching unknown misspellings
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

// Build a flat list of all known keywords for fuzzy matching
const ALL_KEYWORDS: string[] = Object.values(TOPIC_KEYWORDS).flat();

function correctWord(word: string): string {
  // Direct dictionary lookup first
  if (SPELL_MAP[word]) return SPELL_MAP[word];
  // If word is already a known keyword, return as-is
  if (ALL_KEYWORDS.includes(word)) return word;
  // Fuzzy match: only for words 4+ chars, find closest keyword within distance 2
  if (word.length >= 4) {
    let bestMatch = '';
    let bestDist = 3; // threshold: max distance of 2
    for (const kw of ALL_KEYWORDS) {
      // Skip if length difference is too large
      if (Math.abs(kw.length - word.length) > 2) continue;
      const dist = levenshtein(word, kw);
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = kw;
      }
    }
    if (bestMatch) return bestMatch;
  }
  return word;
}

function correctText(text: string): string {
  const words = text.toLowerCase().split(/\s+/);
  return words.map(w => {
    // Strip punctuation for lookup, reattach after
    const match = w.match(/^([^a-z]*)([a-z]+)([^a-z]*)$/);
    if (!match) return w;
    const [, pre, core, post] = match;
    const corrected = correctWord(core);
    return pre + corrected + post;
  }).join(' ');
}

function extractTopics(text: string): string[] {
  const corrected = correctText(text);
  const found: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => corrected.includes(kw))) found.push(topic);
  }
  return found.length > 0 ? found : ['general'];
}

// Extract the actual subject words from user's message for reflection
function extractSubjectWords(text: string): string[] {
  const corrected = correctText(text);
  const stopWords = new Set(['i', 'me', 'my', 'you', 'your', 'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'it', 'its', 'this', 'that', 'but', 'and',
    'or', 'so', 'if', 'just', 'not', 'no', 'yes', 'yeah', 'ok', 'lol', 'like', 'really', 'very', 'about',
    'im', "i'm", 'dont', "don't", 'got', 'get', 'going', 'go', 'been', 'being', 'think', 'know', 'want',
    'some', 'all', 'them', 'they', 'there', 'here', 'what', 'when', 'where', 'how', 'why', 'who']);
  const words = corrected.replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  return words.slice(0, 3);
}

// ====== RANDOM HELPERS ======
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const chance = (pct: number) => Math.random() < pct;

// ====== VOCABULARY POOLS ======
// These are word/phrase fragments the AI assembles into sentences

const OPENERS: Record<string, string[]> = {
  cheerful: ['omg', 'haha', 'ooh', 'aww', 'yay', 'ooo', 'wow', 'lol', 'honestly', 'ngl', 'yayyy', 'eee', 'ahhh'],
  calm: ['hmm', 'well', 'honestly', 'yeah', 'i think', 'you know', 'true', 'fair enough', 'alright', 'sure', 'so'],
  moody: ['ugh', 'idk', 'meh', 'whatever', 'i mean', 'honestly', 'look', 'sigh', 'hmph', 'great', 'bleh'],
  serious: ['indeed', 'well', 'i believe', 'frankly', 'to be honest', 'in my view', 'consider this', 'notably', 'essentially', 'objectively'],
  wild: ['YOOO', 'BRO', 'LMAO', 'dude', 'okay but', 'listen', 'no cap', 'deadass', 'lowkey', 'SHEESH', 'HOLD UP', 'OMG'],
};

const CONNECTORS: Record<string, string[]> = {
  cheerful: ['and like', 'but also', 'plus', 'and honestly', 'which is why', 'but hey', 'anyway', 'regardless tho'],
  calm: ['and', 'but', 'although', 'still', 'that said', 'however', 'meanwhile', 'on top of that'],
  moody: ['but like', 'idk tho', 'not that it matters but', 'i guess', 'whatever tho', 'as if', 'even though'],
  serious: ['furthermore', 'however', 'that being said', 'in addition', 'nevertheless', 'moreover', 'consequently', 'as a result'],
  wild: ['AND', 'but like', 'also tho', 'NO BUT WAIT', 'and then', 'plus', 'BUT ALSO', 'on another note tho'],
};

const CLOSERS: Record<string, string[]> = {
  cheerful: ['😄', '💕', '🥰', '✨', '😂', '💪', '🌟', '!! hehe', '! love it', '😊', '🎉', '!! yay'],
  calm: ['.', '...', '. just saying.', '. that\'s how i see it.', '. take it easy.', '. thats just me.', '. if that makes sense.'],
  moody: ['...', '. whatever.', '. idk.', '. not like it matters.', '. ugh.', '. i guess.', '. figures.', '. shocker.'],
  serious: ['.', '. think about it.', '. consider that carefully.', '. that\'s my take.', '. reflect on that.', '. mark my words.'],
  wild: ['!! 🔥', '!! 💀', ' LMAO', '!! no cap', '!!! 😈', '!! lets gooo 🚀', ' hahaha 😂', '!! SHEESH 🔥', '!! IM DEAD 💀'],
};

// Topic-specific verb phrases the AI uses to construct opinions/statements
const TOPIC_VERBS: Record<string, string[]> = {
  work: ['can be so draining', 'keeps us busy', 'pays the bills at least', 'is important for growth', 'takes up so much time', 'builds character', 'can be rewarding', 'stresses me out sometimes', 'requires so much patience', 'defines our adult life'],
  school: ['teaches us a lot', 'can be overwhelming', 'is worth the effort', 'opens doors', 'takes dedication', 'challenges us', 'shapes who we become', 'tests our patience', 'prepares us for the future', 'can be surprisingly fun'],
  love: ['makes everything better', 'is complicated', 'takes real effort', 'is worth fighting for', 'changes people', 'means being vulnerable', 'brings out the best in us', 'can be scary', 'teaches us about ourselves', 'requires trust and honesty'],
  family: ['means everything', 'can be complicated', 'keeps us grounded', 'shapes who we are', 'is always there', 'drives us crazy sometimes', 'teaches us patience', 'gives us strength', 'creates lasting memories', 'can be both a blessing and a challenge'],
  money: ['comes and goes', 'causes so much stress', 'opens up options', 'isn\'t everything', 'takes discipline', 'grows when invested wisely', 'changes relationships', 'is just a tool', 'requires careful planning', 'can make or break things'],
  food: ['brings people together', 'is my comfort', 'hits different when you\'re hungry', 'is basically therapy', 'is an art form', 'fuels everything we do', 'makes any day better', 'nourishes the soul', 'is always a good topic'],
  fun: ['keeps us sane', 'is so necessary', 'creates the best memories', 'is what life\'s about', 'recharges our energy', 'brings people closer', 'makes time fly', 'helps us decompress', 'should never be underestimated'],
  health: ['should always come first', 'affects everything else', 'requires consistency', 'is easy to neglect', 'is our greatest asset', 'needs daily attention', 'impacts our mood', 'determines our quality of life', 'is worth investing in'],
  feelings: ['are totally valid', 'come in waves', 'deserve to be expressed', 'can be overwhelming', 'teach us about ourselves', 'need processing time', 'shape our decisions', 'are part of being human', 'shouldnt be bottled up'],
  general: ['is interesting to think about', 'depends on perspective', 'matters more than we realize', 'is worth discussing', 'has many angles', 'comes down to priorities', 'reveals a lot about a person', 'keeps things interesting'],
};

// Topic-specific nouns/subjects for building sentences
const TOPIC_NOUNS: Record<string, string[]> = {
  work: ['your career', 'the workload', 'that job situation', 'office life', 'work-life balance', 'your boss', 'the whole work thing', 'the daily grind', 'professional growth'],
  school: ['your studies', 'the coursework', 'education', 'classes', 'that school stuff', 'the whole academic thing', 'learning', 'the curriculum', 'student life'],
  love: ['your relationship', 'love stuff', 'that connection', 'romance', 'being with someone', 'the heart', 'dating life', 'the spark', 'emotional intimacy'],
  family: ['your fam', 'family life', 'home stuff', 'the family dynamic', 'those bonds', 'family ties', 'the household', 'our roots'],
  money: ['finances', 'the budget', 'savings', 'the money situation', 'financial stability', 'your wallet', 'the bank account', 'the paycheck', 'financial freedom'],
  food: ['a good meal', 'that food', 'something tasty', 'comfort food', 'a nice dinner', 'some good eats', 'a home cooked meal', 'trying new dishes'],
  fun: ['having a good time', 'the vibes', 'a fun night', 'adventures', 'good times', 'making memories', 'weekend plans', 'a spontaneous outing'],
  health: ['your wellbeing', 'taking care of yourself', 'staying healthy', 'your body', 'mental health', 'self-care', 'a healthy lifestyle', 'recovery time'],
  feelings: ['how you feel', 'your emotions', 'that feeling', 'your mental state', 'the mood', 'inner peace', 'our headspace', 'emotional wellbeing'],
  general: ['that', 'this whole thing', 'what you said', 'this topic', 'that point', 'the situation', 'the bigger picture', 'our perspective'],
};

// Adjective pools per personality for modifying nouns
const ADJECTIVES: Record<string, string[]> = {
  cheerful: ['amazing', 'wonderful', 'super', 'exciting', 'beautiful', 'lovely', 'fantastic', 'cute', 'awesome', 'delightful', 'precious', 'magical'],
  calm: ['decent', 'reasonable', 'fair', 'okay', 'fine', 'normal', 'steady', 'solid', 'good', 'adequate', 'moderate', 'stable'],
  moody: ['exhausting', 'annoying', 'whatever', 'boring', 'lame', 'tiring', 'basic', 'draining', 'mediocre', 'forgettable', 'pointless'],
  serious: ['important', 'significant', 'crucial', 'notable', 'substantial', 'critical', 'valuable', 'fundamental', 'paramount', 'essential'],
  wild: ['insane', 'crazy', 'epic', 'wild', 'legendary', 'nuts', 'unreal', 'fire', 'lit', 'bonkers', 'absurd', 'godly'],
};

// Opinion starters
const OPINION_STARTERS: Record<string, string[]> = {
  cheerful: ['i love that', 'i totally think', 'i feel like', 'you know what i think', 'honestly i believe', 'omg i just realized', 'you know what i love'],
  calm: ['i think', 'in my opinion', 'i\'d say', 'it seems like', 'from what i can tell', 'if i had to guess', 'generally speaking'],
  moody: ['i guess', 'i suppose', 'like', 'not gonna lie', 'idk but maybe', 'cant say i care but', 'eh i mean'],
  serious: ['i firmly believe', 'it\'s clear that', 'logically speaking', 'i\'ve concluded that', 'evidence suggests', 'upon reflection', 'from an analytical perspective'],
  wild: ['okay but hear me out', 'i SWEAR', 'im telling you', 'trust me on this', 'real talk', 'NO BUT SERIOUSLY', 'this might sound crazy but'],
};

// Reaction phrases for responding to what user said
const REACTIONS: Record<string, string[]> = {
  cheerful: ['thats so true', 'i totally agree', 'i feel the same way', 'right?!', 'exactly what i was thinking', 'youre so right', 'omg yes', 'couldnt agree more'],
  calm: ['i see what you mean', 'that makes sense', 'i can understand that', 'fair point', 'i get that', 'you have a point', 'thats reasonable', 'i hear you'],
  moody: ['i mean sure', 'if you say so', 'i guess thats true', 'whatever you think', 'sure why not', 'hmm ok', 'ok fine maybe', 'thats one way to see it'],
  serious: ['that\'s a valid perspective', 'i can see the merit in that', 'you raise a good point', 'that\'s worth considering', 'an astute observation', 'precisely my thinking'],
  wild: ['FACTS', 'no literally', 'say it louder', 'ON GOD', 'youre spitting rn', 'thats real', 'big facts', 'LITERALLY', 'im screaming'],
};

// Question generators
const FOLLOW_UP_TEMPLATES: Record<string, string[]> = {
  cheerful: ['what do you think about [noun]?', 'how does [noun] make you feel?', 'whats the best part about [noun]?', 'do you enjoy [noun]?', 'ooh but tell me more about [noun]!', 'wait what happened with [noun]??'],
  calm: ['how do you feel about [noun]?', 'what are your thoughts on [noun]?', 'how is [noun] going for you?', 'any updates on [noun]?', 'curious about your take on [noun]', 'is [noun] still an issue?'],
  moody: ['do you even care about [noun]?', 'what about [noun] tho?', 'and [noun]... how\'s that?', 'you worried about [noun]?', 'so what now with [noun]', 'does [noun] even matter to you'],
  serious: ['what\'s your stance on [noun]?', 'have you considered [noun] carefully?', 'how do you plan to handle [noun]?', 'what outcome do you expect with [noun]?', 'how would you evaluate [noun]?', 'what data supports your view on [noun]?'],
  wild: ['but what about [noun] tho??', 'you ever go crazy thinking about [noun]?', 'imagine if [noun] just went totally sideways', 'whats the wildest thing about [noun]?', 'SPILL about [noun] right now', 'okay but rate [noun] out of ten'],
};

// Personal anecdotes / "i" statements
const ANECDOTE_TEMPLATES: Record<string, string[]> = {
  cheerful: ['i had the best experience with [noun] recently', 'i was just thinking about [noun] the other day', 'i always get so excited about [noun]', '[noun] always puts me in a good mood', '[noun] reminded me of the best day ever', 'i get butterflies thinking about [noun]'],
  calm: ['i\'ve been dealing with [noun] myself lately', 'i had a similar experience with [noun]', 'i\'ve thought about [noun] quite a bit', '[noun] has been on my mind too', 'ive been reflecting on [noun] more than usual', '[noun] crossed my mind earlier today'],
  moody: ['i had a terrible time with [noun] honestly', 'i don\'t even wanna think about [noun]', '[noun] has been a disaster for me', 'don\'t get me started on [noun]', '[noun] has been nothing but a headache', 'every time [noun] comes up i cringe'],
  serious: ['i\'ve done extensive research on [noun]', 'my experience with [noun] taught me a lot', 'i\'ve given [noun] considerable thought', '[noun] is something i take very seriously', '[noun] warrants further examination in my opinion', 'my analysis of [noun] suggests its complex'],
  wild: ['dude my story about [noun] is INSANE', 'you won\'t believe what happened with [noun]', 'i literally went ALL IN on [noun]', '[noun] almost got me in so much trouble lol', 'i literally LOST IT over [noun] last week', '[noun] had me going absolutely feral'],
};

// Advice fragments
const ADVICE_VERBS: Record<string, string[]> = {
  cheerful: ['you should totally', 'maybe try to', 'i\'d love for you to', 'it might help if you', 'you could always', 'it would be so great if you'],
  calm: ['you might want to', 'consider trying to', 'it could help to', 'perhaps you should', 'i\'d suggest you', 'one approach would be to'],
  moody: ['you could try to', 'maybe just', 'idk you might wanna', 'it wouldn\'t hurt to', 'at least try to', 'you do you but maybe'],
  serious: ['i recommend you', 'you must', 'it\'s essential that you', 'you should prioritize', 'i strongly advise you to', 'the optimal course is to'],
  wild: ['just GO and', 'PLEASE for the love of everything', 'you GOTTA', 'literally just', 'do yourself a favor and', 'straight up just'],
};

const ADVICE_ACTIONS: Record<string, string[]> = {
  work: ['take a break sometimes', 'set boundaries', 'negotiate your worth', 'focus on what matters', 'build good relationships with coworkers', 'update your resume', 'find a mentor at your workplace', 'celebrate small wins'],
  school: ['study a little every day', 'ask questions in class', 'form study groups', 'stay organized', 'take good notes', 'get enough sleep before exams', 'review material right after class', 'dont compare yourself to others'],
  love: ['communicate openly', 'be honest about your feelings', 'make time for each other', 'listen more', 'show appreciation', 'be patient', 'surprise them once in a while', 'respect their boundaries'],
  family: ['call them more often', 'be patient with them', 'show up when it counts', 'forgive old grudges', 'make new memories together', 'create family traditions', 'listen without judging'],
  money: ['start a budget', 'save before spending', 'avoid impulse buying', 'invest early', 'live below your means', 'track your expenses', 'set up an emergency fund', 'automate your savings'],
  food: ['try cooking at home', 'explore new cuisines', 'eat more veggies', 'meal prep on sundays', 'drink more water', 'learn one signature dish', 'dont skip breakfast'],
  fun: ['make time for yourself', 'try something new', 'plan a trip', 'reconnect with old friends', 'pick up a hobby', 'say yes more often', 'create a bucket list'],
  health: ['get a checkup', 'exercise regularly', 'sleep 8 hours', 'drink water', 'take mental health days', 'stretch every morning', 'practice mindfulness daily', 'limit screen time before bed'],
  feelings: ['talk to someone you trust', 'journal your thoughts', 'take it one day at a time', 'be kind to yourself', 'take deep breaths', 'name your emotions out loud', 'practice gratitude daily'],
  general: ['think it through', 'take your time', 'trust your gut', 'keep going', 'stay positive', 'embrace change', 'set clear boundaries', 'celebrate progress'],
};

// ====== SENTENCE STRUCTURE PATTERNS ======
// Each pattern is a function that assembles a sentence from vocabulary pools
type SentenceBuilder = (topic: string, temp: string, subjectWords: string[]) => string;

const sentencePatterns: SentenceBuilder[] = [
  // Pattern 1: Reaction + connector + opinion about topic
  (topic, temp, _sw) => {
    const reaction = pick(REACTIONS[temp]);
    const connector = pick(CONNECTORS[temp]);
    const noun = pick(TOPIC_NOUNS[topic] || TOPIC_NOUNS.general);
    const verb = pick(TOPIC_VERBS[topic] || TOPIC_VERBS.general);
    return `${reaction} ${connector} ${noun} ${verb}`;
  },
  // Pattern 2: Opinion starter + noun + verb
  (topic, temp, _sw) => {
    const opinion = pick(OPINION_STARTERS[temp]);
    const noun = pick(TOPIC_NOUNS[topic] || TOPIC_NOUNS.general);
    const verb = pick(TOPIC_VERBS[topic] || TOPIC_VERBS.general);
    return `${opinion} ${noun} ${verb}`;
  },
  // Pattern 3: Personal anecdote using topic noun
  (topic, temp, _sw) => {
    const template = pick(ANECDOTE_TEMPLATES[temp]);
    const noun = pick(TOPIC_NOUNS[topic] || TOPIC_NOUNS.general);
    return template.replace('[noun]', noun);
  },
  // Pattern 4: Advice sentence
  (topic, temp, _sw) => {
    const adviceVerb = pick(ADVICE_VERBS[temp]);
    const action = pick(ADVICE_ACTIONS[topic] || ADVICE_ACTIONS.general);
    return `${adviceVerb} ${action}`;
  },
  // Pattern 5: Adjective + noun + verb
  (topic, temp, _sw) => {
    const adj = pick(ADJECTIVES[temp]);
    const noun = pick(TOPIC_NOUNS[topic] || TOPIC_NOUNS.general);
    const verb = pick(TOPIC_VERBS[topic] || TOPIC_VERBS.general);
    return `${noun} is ${adj} because it ${verb}`;
  },
  // Pattern 6: Follow-up question using topic noun
  (topic, temp, _sw) => {
    const template = pick(FOLLOW_UP_TEMPLATES[temp]);
    const noun = pick(TOPIC_NOUNS[topic] || TOPIC_NOUNS.general);
    return template.replace('[noun]', noun);
  },
  // Pattern 7: Reaction + reflect user's subject words back
  (_topic, temp, sw) => {
    if (sw.length === 0) {
      return pick(REACTIONS[temp]);
    }
    const reaction = pick(REACTIONS[temp]);
    const userSubject = sw.join(' and ');
    const opinions = [
      `when you mention ${userSubject} it makes me think`,
      `the ${userSubject} thing is interesting`,
      `${userSubject} is something i think about too`,
      `i have thoughts about ${userSubject} too`,
      `the whole ${userSubject} situation is something`,
    ];
    return `${reaction} ${pick(opinions)}`;
  },
  // Pattern 8: Two-clause compound sentence
  (topic, temp, _sw) => {
    const noun1 = pick(TOPIC_NOUNS[topic] || TOPIC_NOUNS.general);
    const verb1 = pick(TOPIC_VERBS[topic] || TOPIC_VERBS.general);
    const connector = pick(CONNECTORS[temp]);
    const opinion = pick(OPINION_STARTERS[temp]);
    const adj = pick(ADJECTIVES[temp]);
    return `${noun1} ${verb1} ${connector} ${opinion} thats ${adj}`;
  },
];

// ====== GREETING & GOODBYE GENERATORS ======
function generateGreeting(temp: string): string {
  const greetWords: Record<string, string[]> = {
    cheerful: ['heyyy', 'hiii', 'omg hey', 'hiiii', 'ayy hello'],
    calm: ['hey', 'hi there', 'hello', 'hey how are you'],
    moody: ['oh hey', 'hi i guess', 'hey...', 'sup'],
    serious: ['hello', 'greetings', 'hi there', 'good to hear from you'],
    wild: ['YOOO', 'AYYY', 'WHATS GOOD', 'yooo whats poppin'],
  };
  const how: Record<string, string[]> = {
    cheerful: ['how have you been?? i missed talking to you', 'so happy to hear from you', 'whats going on tell me everything'],
    calm: ['how\'s everything going', 'what\'s new with you', 'how have you been'],
    moody: ['what do you want', 'everything ok or', 'haven\'t heard from you in a while'],
    serious: ['i hope all is well', 'what can i do for you', 'how are things on your end'],
    wild: ['its been TOO LONG', 'where have you BEEN', 'okay okay lets catch up right now'],
  };
  return `${pick(greetWords[temp] || greetWords.calm)} ${pick(how[temp] || how.calm)}`;
}

function generateGoodbye(temp: string): string {
  const byes: Record<string, string[]> = {
    cheerful: ['byeee talk soon', 'okay see you later', 'ttyl love chatting with you', 'byeee take care'],
    calm: ['alright take care', 'see you later', 'bye for now', 'talk soon'],
    moody: ['k bye', 'later i guess', 'yeah okay bye', 'sure bye'],
    serious: ['farewell take care', 'goodbye until next time', 'stay well', 'take care of yourself'],
    wild: ['PEACE OUT', 'laterrr dont miss me too much', 'BYE dont do anything i wouldnt do', 'TTYL LEGEND'],
  };
  return pick(byes[temp] || byes.calm);
}

function generateInsultResponse(temp: string): string {
  const shock: Record<string, string[]> = {
    cheerful: ['that really hurt', 'ouch i wasnt expecting that', 'wow okay that stings'],
    calm: ['that was unnecessary', 'i dont appreciate that', 'lets keep things civil please'],
    moody: ['wow nice real nice', 'cool thanks for that', 'ok and i care because'],
    serious: ['that is completely unacceptable', 'i wont tolerate that kind of language', 'that crossed a line'],
    wild: ['OH SO THATS HOW WE DOING THIS', 'LMAO okay keep that same energy', 'hahaha you really went there'],
  };
  const follow: Record<string, string[]> = {
    cheerful: ['i thought we were friends', 'did i do something wrong', 'can we not do this'],
    calm: ['i\'d prefer we talk respectfully', 'there\'s no need for that', 'let\'s move past this'],
    moody: ['see if i care', 'not like your opinion matters anyway', 'whatever'],
    serious: ['words have consequences remember that', 'i expect better from you', 'reflect on what you just said'],
    wild: ['you think that bothers me', 'try harder next time', 'thats actually funny ngl'],
  };
  return `${pick(shock[temp] || shock.calm)} ${pick(follow[temp] || follow.calm)}`;
}

function generateComplimentResponse(temp: string): string {
  const thanks: Record<string, string[]> = {
    cheerful: ['awww thats so sweet of you', 'omg you just made my day', 'stoppp youre too kind'],
    calm: ['thats really kind thank you', 'i appreciate that', 'thanks that means a lot'],
    moody: ['heh thanks i needed that', 'you really think so', 'thats actually nice to hear'],
    serious: ['i genuinely appreciate that', 'thank you for saying that', 'those words mean a lot'],
    wild: ['YOURE THE GOAT', 'NO YOU', 'okay okay i see you being all nice'],
  };
  const reflect: Record<string, string[]> = {
    cheerful: ['right back at you honestly', 'youre pretty amazing yourself', 'we both rock lets be real'],
    calm: ['you\'re a good person too', 'likewise honestly', 'the feeling is mutual'],
    moody: ['dont make me blush or whatever', 'ok maybe youre not so bad either', 'fine youre cool too'],
    serious: ['i value our connection as well', 'the respect is mutual', 'i hold you in high regard too'],
    wild: ['we are literally the greatest duo ever', 'best compliment ive gotten all WEEK', 'i love this energy keep it coming'],
  };
  return `${pick(thanks[temp] || thanks.calm)} ${pick(reflect[temp] || reflect.calm)}`;
}

// ====== SENTENCE ASSEMBLY ENGINE ======
function generateSentence(topic: string, personality: PersonalityTraits, subjectWords: string[], mood: number, pastTopics: string[]): string {
  const temp = personality.temperament;

  // Special case topics
  if (topic === 'greeting') return generateGreeting(temp);
  if (topic === 'goodbye') return generateGoodbye(temp);
  if (topic === 'insult') return generateInsultResponse(temp);
  if (topic === 'compliment') return generateComplimentResponse(temp);

  // Check if we've been talking about the same topic repeatedly
  const recentSame = pastTopics.slice(-3).filter(t => t === topic).length;
  if (recentSame >= 2 && chance(0.5)) {
    const meta: Record<string, string[]> = {
      cheerful: [`haha we keep coming back to ${topic}`, `lol ${topic} again i love how we always talk about this`],
      calm: [`we\'ve been talking about ${topic} a lot`, `seems like ${topic} is really on your mind lately`],
      moody: [`${topic} again huh`, `why do we always end up on ${topic}`],
      serious: [`this is the third time ${topic} has come up and i think thats significant`, `you clearly have a lot to process about ${topic}`],
      wild: [`BRO ${topic} AGAIN we are OBSESSED`, `okay at this point ${topic} is our whole personality lmao`],
    };
    return pick(meta[temp] || meta.calm);
  }

  // Build sentence using a random pattern
  const patternIndex = Math.floor(Math.random() * sentencePatterns.length);
  let sentence = sentencePatterns[patternIndex](topic, temp, subjectWords);

  // Add opener sometimes
  if (chance(0.4)) {
    sentence = `${pick(OPENERS[temp])} ${sentence}`;
  }

  // Add closer sometimes
  if (chance(0.5)) {
    sentence = `${sentence} ${pick(CLOSERS[temp])}`;
  }

  // Mood affects sentence: very negative mood → prefix sadness
  if (mood < -5 && chance(0.3)) {
    const sadPrefixes = ['im not in a great mood but ', 'sorry if im being weird but ', 'having a rough day but '];
    sentence = pick(sadPrefixes) + sentence;
  }

  // High friendliness → add friendly tag
  if (personality.friendliness > 75 && chance(0.25)) {
    const friendlyTags = [' btw i love our convos', ' youre always fun to talk to', ' glad you texted me'];
    sentence += pick(friendlyTags);
  }

  // High humor → add joke attempt
  if (personality.humor > 70 && chance(0.2)) {
    const jokes = [' lol', ' haha', ' 😂', ' im half joking but not really'];
    sentence += pick(jokes);
  }

  // High intelligence → add smart-sounding addition
  if (personality.intelligence > 75 && chance(0.2)) {
    const smartAdds = [' from a logical standpoint at least', ' statistically speaking', ' based on what ive read', ' if you think about it critically'];
    sentence += pick(smartAdds);
  }

  return sentence;
}

// ====== COLD RESPONSE FOR LOW RELATIONSHIP ======
function generateColdResponse(temp: string): string {
  const cold: Record<string, string[]> = {
    cheerful: ['um we dont really talk that much', 'oh hey... didnt expect to hear from you', 'haha yeah anyway'],
    calm: ['we\'re not that close', 'i\'m a bit busy right now', 'hmm okay'],
    moody: ['why are you texting me', 'k', 'do i know you that well', 'mhm sure'],
    serious: ['i don\'t believe we\'re close enough for this conversation', 'let\'s keep things professional'],
    wild: ['lol random but ok', 'uhhh ok sure i guess', 'do we even talk like that'],
  };
  return pick(cold[temp] || cold.calm);
}

// ====== MAIN API ======
export function generateChatResponse(
  message: string,
  contact: Relationship,
  thread: ChatThread,
): { response: string; topicFound: string; relationChange: number; moodChange: number } {
  const topics = extractTopics(message);
  const mainTopic = topics[0];
  const subjectWords = extractSubjectWords(message);
  const p = contact.personality;
  const updatedTopics = [...thread.topics, mainTopic];

  let response: string;

  // Low relationship → cold response
  if (contact.relationship < 25 && chance(0.4) && mainTopic !== 'greeting') {
    response = generateColdResponse(p.temperament);
  } else {
    response = generateSentence(mainTopic, p, subjectWords, thread.mood, updatedTopics);
  }

  // Relationship changes
  let relationChange = 0;
  if (mainTopic === 'compliment') relationChange = Math.floor(Math.random() * 4) + 1;
  else if (mainTopic === 'insult') relationChange = -(Math.floor(Math.random() * 8) + 3);
  else if (mainTopic === 'greeting' || mainTopic === 'fun') relationChange = Math.floor(Math.random() * 3);
  else relationChange = Math.floor(Math.random() * 3) - 1;

  let moodChange = 0;
  if (mainTopic === 'insult') moodChange = -3;
  else if (mainTopic === 'compliment') moodChange = 2;
  else if (mainTopic === 'fun' || mainTopic === 'food') moodChange = 1;

  return { response, topicFound: mainTopic, relationChange, moodChange };
}

export function createThread(contactId: string): ChatThread {
  return { contactId, messages: [], topics: [], mood: 0 };
}
