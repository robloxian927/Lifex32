import {
  generateFullName, randomFromArray, randomBetween, clampStat,
  type StatEffects, adultEvents, midlifeEvents, seniorEvents, formatMoney
} from './gameData';

export interface Relationship {
  id: string;
  name: string;
  type: 'parent' | 'sibling' | 'friend' | 'partner' | 'spouse' | 'child' | 'ex' | 'classmate' | 'coworker' | 'schoolmate';
  gender: 'male' | 'female';
  age: number;
  relationship: number;
  alive: boolean;
  personality: PersonalityTraits;
  lastInteraction?: string;
}

export interface PersonalityTraits {
  friendliness: number;
  humor: number;
  loyalty: number;
  intelligence: number;
  ambition: number;
  temperament: 'calm' | 'moody' | 'cheerful' | 'serious' | 'wild';
}

export interface SchoolState {
  enrolled: boolean;
  type: 'elementary' | 'middle' | 'high_school' | null;
  grade: number;
  attendance: number;
  classesAttended: number;
  totalClasses: number;
  subjects: SubjectGrade[];
  popularity: number;
  clubMember: string | null;
  detentions: number;
}

export interface SubjectGrade {
  name: string;
  grade: number;
  emoji: string;
}

export interface JobState {
  title: string | null;
  category: string | null;
  salary: number;
  years: number;
  performance: number;
  tasksCompleted: number;
  totalTasks: number;
  promotionChance: number;
  bossRelation: number;
  satisfaction: number;
}

export interface OwnedAsset {
  id: string;
  name: string;
  category: 'vehicle' | 'property' | 'luxury';
  purchasePrice: number;
  currentValue: number;
  condition: number;
  appreciation: number;
}

export interface LifeEvent {
  age: number;
  text: string;
  emoji?: string;
}

export interface HousingState {
  current: string; // name of housing
  type: 'parents' | 'rent' | 'own';
  monthlyPayment: number;
  quality: number;
}

export interface ExpenseSettings {
  foodLevel: 'basic' | 'average' | 'fancy';
  electricityLevel: 'basic' | 'average' | 'fancy';
  insuranceLevel: 'basic' | 'average' | 'fancy';
}

export interface BusinessState {
  name: string | null;
  type: string | null;
  icon: string;
  monthlyRevenue: number;
  monthlyCost: number;
  reputation: number; // 0-100
  monthsOwned: number;
  totalProfit: number;
  isCompany: boolean;
  companyType: 'none' | 'sole_prop' | 'ltd';
  workers: number;
  workerSalary: number;
  maxWorkers: number;
}

export interface PhoneState {
  tier: number; // 0-3
  brandChoice: 1 | 2; // which brand name variant
  brand: 'noki' | 'moto'; // brand for features
  name: string;
  chatLatency: number;
  hasCall: boolean;
}

export interface InvestmentState {
  id: string;
  name: string;
  icon: string;
  amount: number;
  returnRange: [number, number];
  currentReturn: number;
  yearsHeld: number;
}

export interface GameState {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  country: string;
  age: number;
  alive: boolean;
  deathReason?: string;

  // Stats (0-100)
  happiness: number;
  health: number;
  smarts: number;
  looks: number;
  karma: number;
  discipline: number;
  popularity: number;
  fitness: number;
  creativity: number;

  // Financial
  money: number;
  salary: number;
  bankBalance: number;
  totalEarned: number;
  totalSpent: number;

  // Housing & Expenses
  housing: HousingState;
  expenses: ExpenseSettings;
  annualExpenses: number; // calculated

  // School
  school: SchoolState;

  // Career
  job: JobState;
  education: string[];
  currentEducation: string | null;
  educationYearsLeft: number;
  isInSchool: boolean;

  // Business
  business: BusinessState;

  // Phone
  phone: PhoneState;

  // Investments
  investments: InvestmentState[];

  // Relationships
  relationships: Relationship[];

  // Assets
  assets: OwnedAsset[];

  // Criminal
  criminalRecord: number;
  isInJail: boolean;
  jailYearsLeft: number;

  // Life log
  lifeEvents: LifeEvent[];

  // Game meta
  screen: 'title' | 'create' | 'game' | 'death';
  activeTab: string;
  currentEvent: null | {
    text: string;
    emoji?: string;
    choices: { text: string; effects: Partial<StatEffects> }[];
  };
  notifications: string[];
  
  activeMiniGame: null | {
    type: 'math' | 'typing' | 'memory' | 'scramble' | 'reaction' | 'clickspeed' | 'pattern';
    context: 'school' | 'job' | 'activity';
    subject?: string;
    jobTask?: string;
  };

  hasGraduatedHS: boolean;
  yearBorn: number;
  retirementAge: number | null;
  isRetired: boolean;
}

let idCounter = 0;
function genId(): string {
  return 'id_' + (++idCounter) + '_' + Math.random().toString(36).substr(2, 5);
}

export function generatePersonality(): PersonalityTraits {
  const temperaments: PersonalityTraits['temperament'][] = ['calm', 'moody', 'cheerful', 'serious', 'wild'];
  return {
    friendliness: randomBetween(20, 90),
    humor: randomBetween(10, 90),
    loyalty: randomBetween(30, 95),
    intelligence: randomBetween(20, 90),
    ambition: randomBetween(20, 80),
    temperament: randomFromArray(temperaments),
  };
}

export function createCharacter(firstName: string, lastName: string, gender: 'male' | 'female', country: string): GameState {
  const fatherName = generateFullName('male');
  const motherName = generateFullName('female');
  const currentYear = new Date().getFullYear();
  
  const relationships: Relationship[] = [
    {
      id: genId(), name: `${fatherName.first} ${lastName}`, type: 'parent', gender: 'male',
      age: randomBetween(25, 40), relationship: randomBetween(50, 90), alive: true, personality: generatePersonality(),
    },
    {
      id: genId(), name: `${motherName.first} ${lastName}`, type: 'parent', gender: 'female',
      age: randomBetween(23, 38), relationship: randomBetween(50, 90), alive: true, personality: generatePersonality(),
    },
  ];

  if (Math.random() > 0.4) {
    const sibGender = Math.random() > 0.5 ? 'male' : 'female' as const;
    const sibName = generateFullName(sibGender);
    relationships.push({
      id: genId(), name: `${sibName.first} ${lastName}`, type: 'sibling', gender: sibGender,
      age: randomBetween(0, 5), relationship: randomBetween(40, 80), alive: true, personality: generatePersonality(),
    });
  }

  return {
    firstName, lastName, gender, country, age: 0, alive: true,
    happiness: randomBetween(50, 80), health: randomBetween(60, 95), smarts: randomBetween(20, 70),
    looks: randomBetween(20, 80), karma: randomBetween(40, 70), discipline: randomBetween(30, 60),
    popularity: randomBetween(20, 50), fitness: randomBetween(30, 60), creativity: randomBetween(20, 70),
    money: 0, salary: 0, bankBalance: 0, totalEarned: 0, totalSpent: 0,
    housing: { current: "Parents' House", type: 'parents', monthlyPayment: 0, quality: 3 },
    expenses: { foodLevel: 'basic', electricityLevel: 'basic', insuranceLevel: 'basic' },
    annualExpenses: 0,
    school: {
      enrolled: false, type: null, grade: 70, attendance: 100, classesAttended: 0, totalClasses: 0,
      subjects: [], popularity: randomBetween(20, 50), clubMember: null, detentions: 0,
    },
    job: {
      title: null, category: null, salary: 0, years: 0, performance: 50, tasksCompleted: 0,
      totalTasks: 0, promotionChance: 0, bossRelation: 50, satisfaction: 50,
    },
    education: [], currentEducation: null, educationYearsLeft: 0, isInSchool: false,
    business: { name: null, type: null, icon: '💼', monthlyRevenue: 0, monthlyCost: 0, reputation: 50, monthsOwned: 0, totalProfit: 0, isCompany: false, companyType: 'none', workers: 0, workerSalary: 800, maxWorkers: 0 },
    phone: { tier: 0, brandChoice: 1, brand: 'noki', name: 'NokiBrick', chatLatency: 1500, hasCall: false },
    investments: [],
    relationships, assets: [],
    criminalRecord: 0, isInJail: false, jailYearsLeft: 0,
    lifeEvents: [{ age: 0, text: `${firstName} ${lastName} was born in ${country}. 👶`, emoji: '👶' }],
    screen: 'game', activeTab: 'life', currentEvent: null, notifications: [],
    activeMiniGame: null, hasGraduatedHS: false, yearBorn: currentYear,
    retirementAge: null, isRetired: false,
  };
}

export function applyEffects(state: GameState, effects: Partial<StatEffects>): GameState {
  const newState = { ...state };
  if (effects.happiness !== undefined) newState.happiness = clampStat(newState.happiness + effects.happiness);
  if (effects.health !== undefined) newState.health = clampStat(newState.health + effects.health);
  if (effects.smarts !== undefined) newState.smarts = clampStat(newState.smarts + effects.smarts);
  if (effects.looks !== undefined) newState.looks = clampStat(newState.looks + effects.looks);
  if (effects.karma !== undefined) newState.karma = clampStat(newState.karma + effects.karma);
  if (effects.discipline !== undefined) newState.discipline = clampStat(newState.discipline + effects.discipline);
  if (effects.popularity !== undefined) newState.popularity = clampStat(newState.popularity + effects.popularity);
  if (effects.money !== undefined) newState.money += effects.money;
  if (effects.criminal !== undefined) newState.criminalRecord += effects.criminal;
  return newState;
}

export function generateSchoolFriends(state: GameState, count: number, type: Relationship['type'] = 'classmate'): Relationship[] {
  const friends: Relationship[] = [];
  for (let i = 0; i < count; i++) {
    const friendGender = Math.random() > 0.5 ? 'male' : 'female' as const;
    const friendName = generateFullName(friendGender);
    friends.push({
      id: genId(), name: `${friendName.first} ${friendName.last}`, type,
      gender: friendGender, age: state.age + randomBetween(-1, 1),
      relationship: randomBetween(20, 60), alive: true, personality: generatePersonality(),
    });
  }
  return friends;
}

export function getAIResponse(person: Relationship, action: string): { text: string; relationChange: number; happinessChange: number } {
  const p = person.personality;
  
  if (action === 'talk') {
    if (p.friendliness > 70) {
      const responses = [
        `${person.name} was super friendly and told you a great story!`,
        `${person.name} listened carefully and shared their experiences.`,
        `${person.name} was warm and welcoming!`,
      ];
      return { text: randomFromArray(responses), relationChange: randomBetween(3, 8), happinessChange: randomBetween(2, 6) };
    } else if (p.friendliness < 30) {
      const responses = [
        `${person.name} seemed distracted and gave short answers.`,
        `${person.name} was kind of rude.`,
      ];
      return { text: randomFromArray(responses), relationChange: randomBetween(-3, 2), happinessChange: randomBetween(-3, 0) };
    }
    return { text: `${person.name} had a nice conversation with you.`, relationChange: randomBetween(1, 5), happinessChange: randomBetween(0, 3) };
  }

  if (action === 'joke') {
    if (p.humor > 60) {
      return { text: `${person.name} laughed hard and told an even funnier joke! 😂`, relationChange: randomBetween(4, 10), happinessChange: randomBetween(3, 8) };
    } else if (p.temperament === 'serious') {
      return { text: `${person.name} didn't find it funny. 😐`, relationChange: randomBetween(-5, -1), happinessChange: randomBetween(-2, 0) };
    }
    return { text: `${person.name} chuckled politely.`, relationChange: randomBetween(1, 4), happinessChange: randomBetween(1, 3) };
  }

  if (action === 'hangout') {
    if (p.friendliness > 50 && person.relationship > 30) {
      const acts = ['went to the mall', 'played video games', 'watched a movie', 'went for a walk', 'grabbed food'];
      return { text: `You and ${person.name} ${randomFromArray(acts)}! Great time!`, relationChange: randomBetween(5, 12), happinessChange: randomBetween(4, 10) };
    } else if (person.relationship < 20) {
      return { text: `${person.name} said they were busy. 😕`, relationChange: randomBetween(-2, 1), happinessChange: randomBetween(-3, -1) };
    }
    return { text: `You hung out with ${person.name}. It was okay.`, relationChange: randomBetween(2, 6), happinessChange: randomBetween(1, 4) };
  }

  if (action === 'help') {
    if (p.loyalty > 60) {
      return { text: `${person.name} really appreciated your help!`, relationChange: randomBetween(8, 15), happinessChange: randomBetween(3, 7) };
    }
    return { text: `${person.name} thanked you.`, relationChange: randomBetween(4, 8), happinessChange: randomBetween(2, 5) };
  }

  if (action === 'gossip') {
    if (p.temperament === 'wild' || p.friendliness > 60) {
      return { text: `${person.name} spilled all the tea! 🍵`, relationChange: randomBetween(3, 8), happinessChange: randomBetween(2, 5) };
    } else if (p.loyalty > 70) {
      return { text: `${person.name} didn't want to gossip.`, relationChange: randomBetween(-5, -1), happinessChange: randomBetween(-2, 0) };
    }
    return { text: `${person.name} shared some mild gossip.`, relationChange: randomBetween(1, 4), happinessChange: randomBetween(0, 3) };
  }

  if (action === 'study') {
    if (p.intelligence > 60) {
      return { text: `${person.name} helped you study really well! 📚`, relationChange: randomBetween(3, 7), happinessChange: randomBetween(1, 4) };
    }
    return { text: `You studied with ${person.name}, but they weren't much help.`, relationChange: randomBetween(1, 4), happinessChange: randomBetween(-1, 2) };
  }

  if (action === 'coffee') {
    return { text: `You got coffee with ${person.name}. Nice catching up! ☕`, relationChange: randomBetween(3, 8), happinessChange: randomBetween(3, 7) };
  }

  if (action === 'dinner') {
    return { text: `You had dinner with ${person.name}. Great food and conversation! 🍽️`, relationChange: randomBetween(5, 12), happinessChange: randomBetween(5, 10) };
  }

  if (action === 'party') {
    if (p.temperament === 'wild' || p.temperament === 'cheerful') {
      return { text: `You partied with ${person.name}! What a night! 🎉`, relationChange: randomBetween(5, 12), happinessChange: randomBetween(5, 12) };
    }
    return { text: `${person.name} came but left early.`, relationChange: randomBetween(1, 5), happinessChange: randomBetween(1, 5) };
  }

  return { text: `You interacted with ${person.name}.`, relationChange: randomBetween(0, 3), happinessChange: randomBetween(0, 2) };
}

function calculateAnnualExpenses(s: GameState): number {
  const food = s.expenses.foodLevel === 'basic' ? 200 : s.expenses.foodLevel === 'average' ? 400 : 800;
  const electric = s.expenses.electricityLevel === 'basic' ? 80 : s.expenses.electricityLevel === 'average' ? 150 : 300;
  const insurance = s.expenses.insuranceLevel === 'basic' ? 100 : s.expenses.insuranceLevel === 'average' ? 200 : 400;
  const monthly = s.housing.monthlyPayment + food + electric + insurance + 80 + 60 + 150; // phone, internet, transport
  return monthly * 12;
}

export function ageUp(state: GameState): GameState {
  let s = { ...state, school: { ...state.school }, job: { ...state.job }, business: { ...state.business }, housing: { ...state.housing } };
  s.age += 1;
  s.notifications = [];

  // ====== LIVING EXPENSES (age 18+) ======
  // Parents start hinting at age 20-24
  if (s.age >= 20 && s.age < 25 && s.housing.type === 'parents' && Math.random() < 0.4) {
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: 'Your parents suggest it\'s time to find your own place. 🏠' }];
    s.notifications = [...s.notifications, 'Your parents want you to move out soon!'];
  }
  // Parents FORCE kick out between 25-30
  // Increasing chance each year: 25=30%, 26=45%, 27=60%, 28=75%, 29=90%, 30=100%
  if (s.housing.type === 'parents' && s.age >= 25) {
    const kickChance = 0.3 + (s.age - 25) * 0.15;
    if (s.age >= 30 || Math.random() < kickChance) {
      s.housing = { current: 'Shared Room', type: 'rent', monthlyPayment: 400, quality: 2 };
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: '🚪 Your parents kicked you out! "You\'re too old to live here anymore!" You moved into a shared room.' }];
      s.notifications = [...s.notifications, 'Your parents kicked you out! You now pay rent.'];
      s.happiness = clampStat(s.happiness - 10);
    }
  }

  if (s.age >= 18) {
    s.annualExpenses = calculateAnnualExpenses(s);
    if (s.housing.type !== 'parents') {
      s.money -= s.annualExpenses;
      s.totalSpent += s.annualExpenses;
      s.lifeEvents = [...s.lifeEvents, { 
        age: s.age, 
        text: `💸 Annual expenses: ${formatMoney(s.annualExpenses)} (Rent: ${formatMoney(s.housing.monthlyPayment * 12)}, Food, Bills, etc.)` 
      }];
      
      // Quality of life affects happiness
      if (s.housing.quality >= 7) {
        s.happiness = clampStat(s.happiness + 3);
      } else if (s.housing.quality <= 3) {
        s.happiness = clampStat(s.happiness - 3);
      }

      // Better food = better health
      if (s.expenses.foodLevel === 'fancy') s.health = clampStat(s.health + 2);
      if (s.expenses.foodLevel === 'basic') s.health = clampStat(s.health - 1);
    }

    // Can't pay bills = problems
    if (s.money < -10000) {
      s.happiness = clampStat(s.happiness - 15);
      s.health = clampStat(s.health - 5);
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: '⚠️ You\'re drowning in debt! Stress is taking a toll.' }];
      s.notifications = [...s.notifications, 'You\'re deeply in debt!'];
    } else if (s.money < 0) {
      s.happiness = clampStat(s.happiness - 5);
      s.notifications = [...s.notifications, 'You\'re in debt! Find more income.'];
    }
  }

  // ====== RELATIONSHIP AGING ======
  s.relationships = s.relationships.map(r => {
    const newR = { ...r, age: r.age + 1 };
    if (newR.type === 'parent' && newR.age > 65 && Math.random() < (newR.age - 65) * 0.03) {
      newR.alive = false;
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `${newR.name} passed away at age ${newR.age}. 💀`, emoji: '💀' }];
      s.happiness = clampStat(s.happiness - 20);
      s.notifications = [...s.notifications, `${newR.name} has passed away.`];
      // If living with parents and both passed
      if (s.housing.type === 'parents') {
        const aliveParents = s.relationships.filter(rr => rr.type === 'parent' && rr.alive && rr.id !== newR.id);
        if (aliveParents.length === 0) {
          s.housing = { current: 'Shared Room', type: 'rent', monthlyPayment: 400, quality: 2 };
          s.notifications = [...s.notifications, 'You need to find your own place now.'];
        }
      }
    }
    if (newR.alive) {
      newR.relationship = clampStat(newR.relationship + randomBetween(-5, 3));
    }
    return newR;
  });

  // ====== SCHOOL PROGRESSION ======
  if (s.age === 5) {
    s.school.enrolled = true;
    s.school.type = 'elementary';
    s.school.subjects = [
      { name: 'Reading', grade: 70 + randomBetween(-10, 10), emoji: '📖' },
      { name: 'Math', grade: 70 + randomBetween(-10, 10), emoji: '🔢' },
      { name: 'Art', grade: 70 + randomBetween(-10, 10), emoji: '🎨' },
      { name: 'Science', grade: 70 + randomBetween(-10, 10), emoji: '🔬' },
    ];
    const classmates = generateSchoolFriends(s, 4);
    s.relationships = [...s.relationships, ...classmates];
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: 'Started elementary school! 🏫', emoji: '🏫' }];
  }

  if (s.age === 11) {
    s.school.type = 'middle';
    s.school.subjects = [
      { name: 'English', grade: s.school.subjects[0]?.grade || 70, emoji: '📝' },
      { name: 'Math', grade: s.school.subjects[1]?.grade || 70, emoji: '📐' },
      { name: 'Science', grade: 70 + randomBetween(-10, 10), emoji: '🧪' },
      { name: 'History', grade: 70 + randomBetween(-10, 10), emoji: '📜' },
      { name: 'PE', grade: 70 + randomBetween(-10, 10), emoji: '⚽' },
    ];
    const newClassmates = generateSchoolFriends(s, 3);
    s.relationships = [...s.relationships, ...newClassmates];
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: 'Started middle school! 🏫', emoji: '🏫' }];
  }

  if (s.age === 14) {
    s.school.type = 'high_school';
    s.isInSchool = true;
    s.currentEducation = 'high_school';
    s.educationYearsLeft = 4;
    s.school.subjects = [
      { name: 'English', grade: s.school.subjects[0]?.grade || 70, emoji: '📝' },
      { name: 'Algebra', grade: s.school.subjects[1]?.grade || 70, emoji: '📐' },
      { name: 'Chemistry', grade: 70 + randomBetween(-10, 10), emoji: '⚗️' },
      { name: 'History', grade: s.school.subjects[3]?.grade || 70, emoji: '🏛️' },
      { name: 'PE', grade: s.school.subjects[4]?.grade || 70, emoji: '🏋️' },
      { name: 'Elective', grade: 70 + randomBetween(-10, 10), emoji: '🎭' },
    ];
    const newClassmates = generateSchoolFriends(s, 4);
    s.relationships = [...s.relationships, ...newClassmates];
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: 'Started High School! 🏫', emoji: '🏫' }];
  }

  // School grade updates
  if (s.school.enrolled && s.age >= 5 && s.age < 18) {
    s.school.subjects = s.school.subjects.map(sub => ({
      ...sub,
      grade: clampStat(sub.grade + randomBetween(-3, 3) + (s.smarts > 60 ? 2 : s.smarts < 30 ? -2 : 0)),
    }));
    s.school.grade = Math.round(s.school.subjects.reduce((sum, sub) => sum + sub.grade, 0) / s.school.subjects.length);
    s.school.totalClasses += 1;

    // Classmate AI interactions
    const classmates = s.relationships.filter(r => r.type === 'classmate' && r.alive);
    classmates.forEach(cm => {
      if (Math.random() < 0.15 && cm.personality.friendliness > 50) {
        const actions = ['talked to you', 'waved at you', 'sat with you at lunch', 'invited you to hang out'];
        s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `${cm.name} ${randomFromArray(actions)}. 😊` }];
        cm.relationship = clampStat(cm.relationship + randomBetween(1, 4));
      }
    });
  }

  // ====== EDUCATION PROGRESSION ======
  if (s.isInSchool && s.currentEducation) {
    s.educationYearsLeft -= 1;
    s.smarts = clampStat(s.smarts + randomBetween(1, 4));
    
    // College/grad school: generate social events, classmates
    if (s.currentEducation !== 'high_school' && s.educationYearsLeft > 0) {
      // Random college social interactions
      const schoolmates = s.relationships.filter(r => r.type === 'schoolmate' && r.alive);
      if (schoolmates.length > 0 && Math.random() < 0.3) {
        const sm = randomFromArray(schoolmates);
        const actions = ['studied with you at the library', 'invited you for coffee', 'asked for notes', 'joined you for lunch', 'wanted to form a study group'];
        s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `${sm.name} ${randomFromArray(actions)}. 📚` }];
        sm.relationship = clampStat(sm.relationship + randomBetween(2, 6));
        s.happiness = clampStat(s.happiness + randomBetween(1, 5));
      }
    }
    
    if (s.educationYearsLeft <= 0) {
      s.education = [...s.education, s.currentEducation];
      s.isInSchool = false;
      
      const eduName = s.currentEducation === 'high_school' ? 'High School' :
        s.currentEducation === 'community_college' ? 'Community College' :
        s.currentEducation === 'college' ? 'University' :
        s.currentEducation === 'grad_school' ? 'Graduate School' :
        s.currentEducation === 'med_school' ? 'Medical School' :
        s.currentEducation === 'law_school' ? 'Law School' : s.currentEducation;
      
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `Graduated from ${eduName}! 🎓`, emoji: '🎓' }];
      s.notifications = [...s.notifications, `You graduated from ${eduName}!`];
      s.happiness = clampStat(s.happiness + 10);
      
      if (s.currentEducation === 'high_school') {
        s.hasGraduatedHS = true;
        s.school.enrolled = false;
        s.school.type = null;
      }
      
      s.currentEducation = null;
    }
  }

  // ====== JAIL ======
  if (s.isInJail) {
    s.jailYearsLeft -= 1;
    s.happiness = clampStat(s.happiness - 10);
    s.health = clampStat(s.health - 3);
    if (s.jailYearsLeft <= 0) {
      s.isInJail = false;
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: 'Released from prison! 🔓', emoji: '🔓' }];
      s.notifications = [...s.notifications, 'You have been released from prison!'];
      s.happiness = clampStat(s.happiness + 15);
    }
  }

  // ====== JOB INCOME ======
  if (s.job.title && !s.isInJail) {
    s.money += s.job.salary;
    s.totalEarned += s.job.salary;
    s.job.years += 1;
    
    const perfBonus = s.job.performance > 80 ? 0.05 : s.job.performance > 60 ? 0.02 : s.job.performance < 30 ? -0.03 : 0;
    if (perfBonus > 0 && Math.random() < 0.3) {
      const change = Math.floor(s.job.salary * perfBonus);
      s.job.salary += change;
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `Performance raise! +${formatMoney(change)}/yr 💰` }];
    }

    s.job.promotionChance = Math.min(100, s.job.years * 5 + s.job.performance / 5 + s.smarts / 10);
    
    if (Math.random() < 0.1 && s.job.years > 1) {
      const raiseAmount = Math.floor(s.job.salary * randomBetween(3, 10) / 100);
      s.job.salary += raiseAmount;
      s.salary = s.job.salary;
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `Got a raise! +${formatMoney(raiseAmount)}/yr 💰` }];
    }

    s.job.bossRelation = clampStat(s.job.bossRelation + randomBetween(-3, 3) + (s.job.performance > 70 ? 2 : -1));
    s.job.satisfaction = Math.round(s.job.performance * 0.3 + s.job.bossRelation * 0.2 + s.happiness * 0.2 + (100 - (s.job.salary < 30000 ? 50 : 0)) * 0.3);
    
    if (s.job.performance < 15 && Math.random() < 0.3) {
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `Got fired from ${s.job.title}! 😤` }];
      s.notifications = [...s.notifications, 'You were fired from your job!'];
      s.job = { title: null, category: null, salary: 0, years: 0, performance: 50, tasksCompleted: 0, totalTasks: 0, promotionChance: 0, bossRelation: 50, satisfaction: 50 };
      s.salary = 0;
      s.happiness = clampStat(s.happiness - 15);
    }
  }

  // ====== BUSINESS INCOME ======
  if (s.business.name) {
    s.business.monthsOwned += 12;
    const repFactor = s.business.reputation / 100;
    const smartsFactor = s.smarts / 100;
    const workerRevenueBoost = 1 + (s.business.workers * 0.15); // Each worker adds +15% revenue
    const workerFlatBonus = s.business.workers * 500 * 12; // Each worker adds $500/month flat bonus ($6k/year)
    const annualRev = (s.business.monthlyRevenue * 12 * repFactor * (0.5 + smartsFactor * 0.5) * workerRevenueBoost) + workerFlatBonus;
    const annualCost = s.business.monthlyCost * 12;
    const profit = Math.floor(annualRev - annualCost);
    s.money += profit;
    s.business.totalProfit += profit;
    s.totalEarned += Math.max(0, profit);

    // Reputation changes - workers boost reputation growth AND cap!
    // Each worker increases rep cap by 5% (max 150% with 10 workers)
    const workerRepCap = 100 + (s.business.workers * 5);
    const workerRepBonus = s.business.workers * 3; // Each worker adds +3 max reputation growth
    const workerRepProtection = Math.min(s.business.workers, 5); // Workers reduce reputation loss (max 5)
    
    // Clamp reputation to worker-extended cap
    const clampRep = (val: number) => Math.max(0, Math.min(workerRepCap, val));
    
    if (s.discipline > 60 && s.smarts > 50) {
      const repGain = randomBetween(2, 8 + workerRepBonus);
      s.business.reputation = clampRep(s.business.reputation + repGain);
      if (s.business.workers > 0 && repGain > 5) {
        s.notifications = [...s.notifications, `Your ${s.business.workers} worker(s) helped grow your business reputation! 📈`];
      }
    } else if (s.discipline < 30) {
      const repLoss = Math.max(0, randomBetween(1, 4) - workerRepProtection);
      s.business.reputation = clampRep(s.business.reputation - repLoss);
    } else {
      // Neutral discipline: workers still help grow reputation
      const passiveGrowth = randomBetween(1, 2 + s.business.workers);
      s.business.reputation = clampRep(s.business.reputation + passiveGrowth);
    }
    
    // Clamp to cap without workers (prevents going over 100 if you fire workers)
    if (s.business.workers === 0 && s.business.reputation > 100) {
      s.business.reputation = 100;
    }

    // Worker salary deduction
    const workerCosts = s.business.workers * s.business.workerSalary * 12;
    s.money -= workerCosts;
    
    // Boss fires you if business is too well-known (75%+ reputation)
    if (s.business.reputation >= 75 && s.job.title && Math.random() < 0.4) {
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `😤 Your boss found out about your successful ${s.business.name}! They think you're mocking them and FIRED you!` }];
      s.notifications = [...s.notifications, 'Your boss fired you for having a successful business!'];
      s.job = { title: null, category: null, salary: 0, years: 0, performance: 50, tasksCompleted: 0, totalTasks: 0, promotionChance: 0, bossRelation: 50, satisfaction: 50 };
      s.salary = 0;
      s.happiness = clampStat(s.happiness - 10);
    }

    const workerBoostText = s.business.workers > 0 ? ` [+${(s.business.workers * 15)}% +$${(s.business.workers * 6)}k from ${s.business.workers} worker${s.business.workers > 1 ? 's' : ''}]` : '';
    s.lifeEvents = [...s.lifeEvents, {
      age: s.age,
      text: `${s.business.icon} ${s.business.name}: ${profit >= 0 ? '+' : ''}${formatMoney(profit)} profit (Rep: ${s.business.reputation}%)${workerBoostText}`
    }];

    // Business failure chance
    if (s.business.reputation < 15 && Math.random() < 0.3) {
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `💥 ${s.business.name} went bankrupt!` }];
      s.notifications = [...s.notifications, 'Your business went bankrupt!'];
      s.business = { name: null, type: null, icon: '💼', monthlyRevenue: 0, monthlyCost: 0, reputation: 50, monthsOwned: 0, totalProfit: 0, isCompany: false, companyType: 'none', workers: 0, workerSalary: 800, maxWorkers: 0 };
      s.happiness = clampStat(s.happiness - 20);
    }
  }

  // ====== INVESTMENTS ======
  s.investments = s.investments.map(inv => {
    const yearReturn = randomBetween(inv.returnRange[0] * 10, inv.returnRange[1] * 10) / 10;
    const profit = Math.floor(inv.amount * yearReturn / 100);
    inv.amount += profit;
    inv.currentReturn = yearReturn;
    inv.yearsHeld += 1;
    if (profit !== 0) {
      s.lifeEvents = [...s.lifeEvents, {
        age: s.age,
        text: `${inv.icon} ${inv.name}: ${yearReturn >= 0 ? '+' : ''}${yearReturn.toFixed(1)}% (${profit >= 0 ? '+' : ''}${formatMoney(profit)})`
      }];
    }
    return { ...inv };
  });
  // Remove wiped out investments
  s.investments = s.investments.filter(inv => {
    if (inv.amount <= 0) {
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `📉 ${inv.name} investment was wiped out!` }];
      return false;
    }
    return true;
  });

  // ====== ASSET VALUE CHANGES ======
  s.assets = s.assets.map(a => ({
    ...a,
    currentValue: Math.max(0, Math.floor(a.currentValue * (1 + a.appreciation / 100))),
    condition: Math.max(0, a.condition - randomBetween(1, 5)),
  }));

  // ====== AGE-BASED EVENTS ======
  if (s.age >= 25 && s.age < 45 && Math.random() < 0.3) {
    const event = randomFromArray(adultEvents);
    s = applyEffects(s, event.effects);
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: event.text }];
  }
  
  if (s.age >= 40 && s.age < 60 && Math.random() < 0.25) {
    const event = randomFromArray(midlifeEvents);
    s = applyEffects(s, event.effects);
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: event.text }];
  }

  if (s.age >= 60 && Math.random() < 0.3) {
    const event = randomFromArray(seniorEvents);
    s = applyEffects(s, event.effects);
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: event.text }];
  }

  // ====== RETIREMENT ======
  if (s.age >= 65 && s.job.title && !s.isRetired && Math.random() < 0.2) {
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `Considering retirement from ${s.job.title}...` }];
  }

  // Partner/spouse interactions
  const alivePartner = s.relationships.find(r => (r.type === 'partner' || r.type === 'spouse') && r.alive);
  if (alivePartner && Math.random() < 0.2) {
    const events = [
      `${alivePartner.name} surprised you with a romantic dinner! 💕`,
      `You had a wonderful day with ${alivePartner.name}. 💑`,
      `${alivePartner.name} gave you a thoughtful gift. 🎁`,
    ];
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: randomFromArray(events) }];
    s.happiness = clampStat(s.happiness + randomBetween(3, 10));
  }

  // Children growing up events
  const children = s.relationships.filter(r => r.type === 'child' && r.alive);
  children.forEach(child => {
    if (child.age === 5) {
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `${child.name} started school! 🏫` }];
    }
    if (child.age === 18) {
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `${child.name} turned 18 and is heading to college! 🎓` }];
    }
    if (child.age === 25 && Math.random() < 0.3) {
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `${child.name} got married! 💒` }];
      s.happiness = clampStat(s.happiness + 10);
    }
    if (child.age >= 28 && Math.random() < 0.15) {
      s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `${child.name} had a baby! You're a grandparent! 👶` }];
      s.happiness = clampStat(s.happiness + 15);
    }
  });

  // ====== NATURAL STAT CHANGES ======
  if (s.age > 40) {
    s.health = clampStat(s.health - randomBetween(1, 3));
    s.looks = clampStat(s.looks - randomBetween(0, 2));
    s.fitness = clampStat(s.fitness - randomBetween(1, 2));
  }
  if (s.age > 60) {
    s.health = clampStat(s.health - randomBetween(2, 5));
    s.looks = clampStat(s.looks - randomBetween(1, 3));
  }
  if (s.age > 80) {
    s.health = clampStat(s.health - randomBetween(3, 8));
  }

  // ====== DEATH CHECK ======
  if (s.health <= 0 || (s.age > 70 && Math.random() < (s.age - 70) * 0.02)) {
    s.alive = false;
    s.screen = 'death';
    const deathReasons = ['natural causes', 'heart failure', 'old age', 'a sudden illness', 'peacefully in their sleep'];
    s.deathReason = randomFromArray(deathReasons);
    s.lifeEvents = [...s.lifeEvents, { age: s.age, text: `${s.firstName} ${s.lastName} died of ${s.deathReason} at age ${s.age}. ⚰️`, emoji: '⚰️' }];
  }

  s.happiness = clampStat(s.happiness + randomBetween(-3, 3));
  s.health = clampStat(s.health + randomBetween(-2, 2));

  return s;
}
