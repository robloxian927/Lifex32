import { useState, useRef, useEffect } from 'react';
import { StatBar } from './StatBar';
import { type GameState, ageUp, applyEffects, createCharacter, getAIResponse, generateSchoolFriends, generatePersonality } from '../gameState';
import type { OwnedAsset, Relationship, InvestmentState } from '../gameState';
import {
  formatMoney, randomFromArray, randomBetween, clampStat,
  schoolEvents, collegeEvents, childhoodEvents, teenEvents, randomEvents,
  jobs, vehicles, properties, activities, crimes, educationPaths,
  generateFullName, type Job, schoolClubs, jobTasks,
  rentalOptions, businessTypes, investmentTypes, phoneTiers,
} from '../gameData';
import { MathQuiz, TypingTest, MemoryGame, WordScramble, ReactionTest, ClickSpeed, PatternMatch } from './MiniGames';
import { ChatScreen } from './ChatScreen';
import { getAllSlots, saveGame, loadGame, deleteSlot, formatSaveDate } from '../saveSystem';

interface GameScreenProps {
  initialState: GameState;
}

export function GameScreen({ initialState }: GameScreenProps) {
  const [state, setState] = useState<GameState>(initialState);
  const [selectedRel, setSelectedRel] = useState<string | null>(null);
  const [showExpensePanel, setShowExpensePanel] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [saveSlots, setSaveSlots] = useState(() => getAllSlots());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.lifeEvents]);

  const s = state;

  // ====== MINIGAME CALLBACKS ======
  const handleMiniGameComplete = (score: number) => {
    const mg = s.activeMiniGame;
    if (!mg) return;
    let newState = { ...s, activeMiniGame: null as GameState['activeMiniGame'], school: { ...s.school }, job: { ...s.job } };

    if (mg.context === 'school') {
      const smartsBonus = Math.round((score - 50) / 10);
      newState.smarts = clampStat(newState.smarts + smartsBonus);
      newState.school.classesAttended += 1;
      if (mg.subject) {
        newState.school.subjects = newState.school.subjects.map(sub =>
          sub.name === mg.subject ? { ...sub, grade: clampStat(sub.grade + Math.round((score - 50) / 5)) } : sub
        );
      }
      newState.school.grade = Math.round(newState.school.subjects.reduce((sum, sub) => sum + sub.grade, 0) / Math.max(1, newState.school.subjects.length));
      const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F';
      newState.lifeEvents = [...newState.lifeEvents, { age: s.age, text: `📚 ${mg.subject || 'class'} - Got ${grade} (${score}%)` }];
      if (score >= 80) {
        newState.happiness = clampStat(newState.happiness + 3);
        newState.discipline = clampStat(newState.discipline + 2);
      } else if (score < 40) {
        newState.happiness = clampStat(newState.happiness - 2);
      }
      newState.notifications = [`${mg.subject}: ${grade} grade! (${score}%)`];
    }

    if (mg.context === 'job') {
      const statBonus = (newState.smarts + newState.discipline + newState.fitness) / 300 * 20;
      const adjustedScore = Math.min(100, score + statBonus);
      newState.job.performance = clampStat(newState.job.performance + Math.round((adjustedScore - 50) / 5));
      newState.job.tasksCompleted += 1;
      newState.job.totalTasks += 1;
      const rating = adjustedScore >= 80 ? 'Excellent' : adjustedScore >= 60 ? 'Good' : adjustedScore >= 40 ? 'Average' : 'Poor';
      newState.lifeEvents = [...newState.lifeEvents, { age: s.age, text: `💼 ${mg.jobTask || 'Work'} - ${rating} (${Math.round(adjustedScore)}%)` }];
      if (adjustedScore >= 70) {
        newState.job.bossRelation = clampStat(newState.job.bossRelation + 3);
        newState.money += Math.floor(newState.job.salary * 0.01);
      } else if (adjustedScore < 40) {
        newState.job.bossRelation = clampStat(newState.job.bossRelation - 3);
      }
      newState.notifications = [`Work: ${rating}! Performance: ${newState.job.performance}%`];
    }

    if (mg.context === 'activity') {
      newState.smarts = clampStat(newState.smarts + Math.round(score / 20));
      newState.notifications = [`Activity complete! Score: ${score}%`];
    }
    setState(newState);
  };

  const handleMiniGameCancel = () => {
    let newState = { ...s, activeMiniGame: null as GameState['activeMiniGame'], school: { ...s.school } };
    if (s.activeMiniGame?.context === 'school') {
      newState.school.attendance = clampStat(newState.school.attendance - 10);
      newState.discipline = clampStat(newState.discipline - 5);
      newState.lifeEvents = [...newState.lifeEvents, { age: s.age, text: '🚫 Skipped class!' }];
    }
    if (s.activeMiniGame?.context === 'job') {
      newState.job = { ...newState.job };
      newState.job.performance = clampStat(newState.job.performance - 10);
      newState.job.totalTasks += 1;
    }
    setState(newState);
  };

  // ====== RENDER MINIGAME ======
  if (s.activeMiniGame) {
    const difficulty = Math.max(1, Math.round(s.smarts / 10));
    const mg = s.activeMiniGame;
    switch (mg.type) {
      case 'math': return <MathQuiz difficulty={difficulty} onComplete={handleMiniGameComplete} onCancel={handleMiniGameCancel} />;
      case 'typing': return <TypingTest difficulty={difficulty} onComplete={handleMiniGameComplete} onCancel={handleMiniGameCancel} />;
      case 'memory': return <MemoryGame difficulty={difficulty} onComplete={handleMiniGameComplete} onCancel={handleMiniGameCancel} />;
      case 'scramble': return <WordScramble difficulty={difficulty} onComplete={handleMiniGameComplete} onCancel={handleMiniGameCancel} />;
      case 'reaction': return <ReactionTest onComplete={handleMiniGameComplete} onCancel={handleMiniGameCancel} />;
      case 'clickspeed': return <ClickSpeed duration={10} target={20 + difficulty * 3} onComplete={handleMiniGameComplete} onCancel={handleMiniGameCancel} title={mg.jobTask || 'Work'} icon="⚡" />;
      case 'pattern': return <PatternMatch difficulty={difficulty} onComplete={handleMiniGameComplete} onCancel={handleMiniGameCancel} title={mg.jobTask || 'Problem Solving'} />;
    }
  }

  // ====== CORE GAME LOGIC ======
  const handleAgeUp = () => {
    let newState = { ...s, school: { ...s.school }, job: { ...s.job } };

    if (s.age < 12 && Math.random() < 0.4) {
      const event = randomFromArray(childhoodEvents);
      newState = applyEffects(newState, event.effects);
      newState.lifeEvents = [...newState.lifeEvents, { age: newState.age + 1, text: event.text }];
    } else if (s.age >= 12 && s.age < 18) {
      if (Math.random() < 0.5) {
        const event = randomFromArray(schoolEvents);
        newState.currentEvent = { text: event.text, emoji: '🏫', choices: event.choices };
        newState.age += 1;
        setState(newState);
        return;
      }
      if (Math.random() < 0.3) {
        const event = randomFromArray(teenEvents);
        newState = applyEffects(newState, event.effects);
        newState.lifeEvents = [...newState.lifeEvents, { age: newState.age + 1, text: event.text }];
      }
    }

    // College events
    if (s.isInSchool && s.currentEducation && s.currentEducation !== 'high_school' && Math.random() < 0.5) {
      const event = randomFromArray(collegeEvents);
      newState.currentEvent = { text: event.text, emoji: '🎓', choices: event.choices };
      newState.age += 1;
      setState(newState);
      return;
    }

    // Random events
    const applicableEvents = randomEvents.filter(e => newState.age >= e.minAge && newState.age <= e.maxAge && Math.random() < e.probability);
    if (applicableEvents.length > 0) {
      const event = randomFromArray(applicableEvents);
      newState.currentEvent = { text: event.text, choices: event.choices };
      newState.age += 1;
      setState({ ...newState, age: newState.age - 1 });
      return;
    }

    if (newState.job.title) {
      newState.job.performance = Math.round(newState.job.performance * 0.9 + 50 * 0.1);
    }

    newState = ageUp(newState);
    setState(newState);
  };

  const handleEventChoice = (choiceIdx: number) => {
    if (!s.currentEvent) return;
    const choice = s.currentEvent.choices[choiceIdx];
    let newState = applyEffects(s, choice.effects);
    newState.lifeEvents = [...newState.lifeEvents, { age: newState.age, text: `${s.currentEvent.text} → ${choice.text}` }];
    newState.currentEvent = null;
    newState = ageUp(newState);
    setState(newState);
  };

  const handleActivity = (activityIdx: number) => {
    const activity = activities[activityIdx];
    if (s.money < activity.cost) { setState({ ...s, notifications: [`Can't afford ${activity.name}!`] }); return; }
    let newState = applyEffects(s, activity.effects);
    newState.money -= activity.cost;
    newState.totalSpent += activity.cost;
    newState.lifeEvents = [...newState.lifeEvents, { age: newState.age, text: `${activity.icon} ${activity.name}` }];
    setState({ ...newState, notifications: [`You enjoyed ${activity.name}!`] });
  };

  const handleApplyJob = (job: Job) => {
    if (job.requirements.age && s.age < job.requirements.age) { setState({ ...s, notifications: [`Must be ${job.requirements.age}+`] }); return; }
    if (job.requirements.smarts && s.smarts < job.requirements.smarts) { setState({ ...s, notifications: [`Need ${job.requirements.smarts}%+ smarts`] }); return; }
    if (job.requirements.looks && s.looks < job.requirements.looks) { setState({ ...s, notifications: [`Need ${job.requirements.looks}%+ looks`] }); return; }
    if (job.requirements.health && s.health < job.requirements.health) { setState({ ...s, notifications: [`Need ${job.requirements.health}%+ health`] }); return; }
    if (job.requirements.education && !s.education.includes(job.requirements.education)) { setState({ ...s, notifications: [`Need ${job.requirements.education.replace(/_/g, ' ')} degree`] }); return; }
    if (s.isInJail) { setState({ ...s, notifications: [`Can't work in jail!`] }); return; }

    const hireChance = 0.3 + (s.smarts / 200) + (s.looks / 300) + (s.criminalRecord > 0 ? -0.2 : 0);
    if (Math.random() > hireChance) {
      setState({ ...s, notifications: [`Applied for ${job.title} but wasn't hired.`], lifeEvents: [...s.lifeEvents, { age: s.age, text: `Applied for ${job.title} but was rejected. 😔` }] });
      return;
    }

    const coworkers: Relationship[] = [];
    for (let i = 0; i < 3; i++) {
      const g = Math.random() > 0.5 ? 'male' : 'female' as const;
      const name = generateFullName(g);
      coworkers.push({
        id: 'cw_' + Date.now() + '_' + i, name: `${name.first} ${name.last}`, type: 'coworker',
        gender: g, age: s.age + randomBetween(-10, 15), relationship: randomBetween(30, 60),
        alive: true, personality: generatePersonality(),
      });
    }

    setState({
      ...s,
      job: { title: job.title, category: job.category, salary: job.salary, years: 0, performance: 50, tasksCompleted: 0, totalTasks: 0, promotionChance: 0, bossRelation: randomBetween(40, 60), satisfaction: 50 },
      salary: job.salary,
      relationships: [...s.relationships, ...coworkers],
      notifications: [`Hired as ${job.title}! 🎉`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Started working as ${job.title}! 💼` }],
      happiness: clampStat(s.happiness + 10),
    });
  };

  const handleQuitJob = () => {
    if (!s.job.title) return;
    setState({
      ...s, lifeEvents: [...s.lifeEvents, { age: s.age, text: `Quit ${s.job.title}. 👋` }],
      job: { title: null, category: null, salary: 0, years: 0, performance: 50, tasksCompleted: 0, totalTasks: 0, promotionChance: 0, bossRelation: 50, satisfaction: 50 },
      salary: 0, notifications: ['You quit your job.'],
    });
  };

  const handleRetire = () => {
    if (!s.job.title) return;
    setState({
      ...s, lifeEvents: [...s.lifeEvents, { age: s.age, text: `Retired from ${s.job.title}! 🏖️ Enjoying the golden years.` }],
      job: { title: null, category: null, salary: 0, years: 0, performance: 50, tasksCompleted: 0, totalTasks: 0, promotionChance: 0, bossRelation: 50, satisfaction: 50 },
      salary: 0, isRetired: true, retirementAge: s.age, happiness: clampStat(s.happiness + 15),
      notifications: ['You retired! Enjoy life!'],
    });
  };

  const handleBuyAsset = (asset: { name: string; category: 'vehicle' | 'property'; cost: number; appreciation: number }) => {
    if (s.money < asset.cost) { setState({ ...s, notifications: [`Can't afford ${asset.name}!`] }); return; }
    const newAsset: OwnedAsset = {
      id: 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: asset.name, category: asset.category, purchasePrice: asset.cost, currentValue: asset.cost,
      condition: 100, appreciation: asset.appreciation,
    };
    
    // If buying property, option to live there
    let newHousing = s.housing;
    if (asset.category === 'property') {
      newHousing = { current: asset.name, type: 'own', monthlyPayment: Math.floor(asset.cost * 0.005), quality: Math.min(10, Math.floor(asset.cost / 100000) + 3) };
    }
    
    setState({
      ...s, money: s.money - asset.cost, totalSpent: s.totalSpent + asset.cost,
      assets: [...s.assets, newAsset], happiness: clampStat(s.happiness + 10),
      housing: newHousing,
      notifications: [`Bought ${asset.name}!`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Bought ${asset.name} for ${formatMoney(asset.cost)}! 🏷️` }],
    });
  };

  const handleSellAsset = (assetId: string) => {
    const asset = s.assets.find(a => a.id === assetId);
    if (!asset) return;
    let newHousing = s.housing;
    if (asset.category === 'property' && s.housing.current === asset.name) {
      newHousing = { current: 'Shared Room', type: 'rent', monthlyPayment: 400, quality: 2 };
    }
    setState({
      ...s, money: s.money + asset.currentValue, assets: s.assets.filter(a => a.id !== assetId),
      housing: newHousing,
      notifications: [`Sold ${asset.name} for ${formatMoney(asset.currentValue)}!`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Sold ${asset.name} for ${formatMoney(asset.currentValue)}. 💵` }],
    });
  };

  const handleEnroll = (eduKey: string) => {
    const edu = educationPaths.find(e => e.key === eduKey);
    if (!edu) return;
    if (s.isInSchool) { setState({ ...s, notifications: ["Already in school!"] }); return; }
    if (s.smarts < edu.smartsReq) { setState({ ...s, notifications: [`Need ${edu.smartsReq}%+ smarts`] }); return; }
    if (s.education.includes(eduKey)) { setState({ ...s, notifications: ["Already have this degree!"] }); return; }
    if (s.money < edu.cost) { setState({ ...s, notifications: [`Can't afford ${formatMoney(edu.cost)} tuition!`] }); return; }
    if ((eduKey === 'college' || eduKey === 'community_college') && !s.education.includes('high_school')) { setState({ ...s, notifications: ['Need high school diploma!'] }); return; }
    if (['grad_school', 'med_school', 'law_school'].includes(eduKey) && !s.education.includes('college')) { setState({ ...s, notifications: ['Need college degree!'] }); return; }

    // Generate schoolmates for higher ed
    const schoolmates = generateSchoolFriends(s, 4, 'schoolmate');

    setState({
      ...s, isInSchool: true, currentEducation: eduKey, educationYearsLeft: edu.duration,
      money: s.money - edu.cost, totalSpent: s.totalSpent + edu.cost,
      relationships: [...s.relationships, ...schoolmates],
      notifications: [`Enrolled in ${edu.name}!`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Enrolled in ${edu.name}! 📚` }],
    });
  };

  const handleCrime = (crimeIdx: number) => {
    const crime = crimes[crimeIdx];
    const success = Math.random() < crime.successRate;
    if (success) {
      let newState = applyEffects(s, crime.effects);
      newState.money += crime.reward;
      newState.totalEarned += crime.reward;
      newState.lifeEvents = [...newState.lifeEvents, { age: s.age, text: `${crime.icon} Got away with ${crime.name}! +${formatMoney(crime.reward)}` }];
      setState({ ...newState, notifications: [`${crime.name} success! +${formatMoney(crime.reward)}`] });
    } else {
      const jailYears = Math.max(1, Math.floor(crime.jailTime));
      let newState = applyEffects(s, crime.effects);
      newState.isInJail = true;
      newState.jailYearsLeft = jailYears;
      newState.job = { title: null, category: null, salary: 0, years: 0, performance: 50, tasksCompleted: 0, totalTasks: 0, promotionChance: 0, bossRelation: 50, satisfaction: 50 };
      newState.salary = 0;
      newState.happiness = clampStat(newState.happiness - 20);
      newState.lifeEvents = [...newState.lifeEvents, { age: s.age, text: `🚔 Caught! ${jailYears} year(s) prison for ${crime.name}.` }];
      setState({ ...newState, notifications: [`Caught! ${jailYears} year(s) prison!`] });
    }
  };

  // ====== HOUSING ======
  const handleChangeHousing = (optionIdx: number) => {
    const option = rentalOptions[optionIdx];
    if (option.name === "Parents' House" && s.age >= 20) {
      setState({ ...s, notifications: ["You're too old to move back with your parents!"] });
      return;
    }
    setState({
      ...s,
      housing: { current: option.name, type: option.monthlyCost === 0 ? 'parents' : 'rent', monthlyPayment: option.monthlyCost, quality: option.quality },
      notifications: [`Moved to ${option.name}!`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `🏠 Moved to ${option.name} (${formatMoney(option.monthlyCost)}/mo)` }],
    });
  };

  // ====== EXPENSES ======
  const handleChangeExpense = (category: 'foodLevel' | 'electricityLevel' | 'insuranceLevel', level: 'basic' | 'average' | 'fancy') => {
    setState({ ...s, expenses: { ...s.expenses, [category]: level } });
  };

  // ====== BUSINESS ======
  const handleStartBusiness = (bizIdx: number) => {
    const biz = businessTypes[bizIdx];
    if (s.money < biz.startupCost) { setState({ ...s, notifications: [`Need ${formatMoney(biz.startupCost)} to start!`] }); return; }
    if (s.smarts < biz.smartsReq) { setState({ ...s, notifications: [`Need ${biz.smartsReq}%+ smarts!`] }); return; }
    if (s.business.name) { setState({ ...s, notifications: ['Already own a business!'] }); return; }

    const avgRevenue = Math.floor((biz.monthlyRevenue[0] + biz.monthlyRevenue[1]) / 2);
    setState({
      ...s,
      money: s.money - biz.startupCost, totalSpent: s.totalSpent + biz.startupCost,
      business: { name: biz.name, type: biz.name, icon: biz.icon, monthlyRevenue: avgRevenue, monthlyCost: biz.monthlyCost, reputation: 50, monthsOwned: 0, totalProfit: -biz.startupCost, isCompany: false, companyType: 'none', workers: 0, workerSalary: 800, maxWorkers: 3 },
      notifications: [`Started ${biz.name}!`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `${biz.icon} Started a ${biz.name}! Invested ${formatMoney(biz.startupCost)}` }],
      happiness: clampStat(s.happiness + 10),
    });
  };

  const handleCloseBusiness = () => {
    if (!s.business.name) return;
    const sellValue = Math.max(0, Math.floor(s.business.monthlyRevenue * 12 * s.business.reputation / 100));
    setState({
      ...s,
      money: s.money + sellValue,
      business: { name: null, type: null, icon: '💼', monthlyRevenue: 0, monthlyCost: 0, reputation: 50, monthsOwned: 0, totalProfit: 0, isCompany: false, companyType: 'none', workers: 0, workerSalary: 800, maxWorkers: 0 },
      notifications: [`Closed business. Got ${formatMoney(sellValue)} from sale.`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Closed ${s.business.name}. Sold for ${formatMoney(sellValue)}.` }],
    });
  };

  // ====== COMPANY MANAGEMENT ======
  const handleFoundCompany = (isLtd: boolean) => {
    if (!s.business.name) return;
    if (s.business.isCompany) return;
    const cost = isLtd ? 5000 : 0;
    if (s.money < cost) { setState({ ...s, notifications: [`Need ${formatMoney(cost)} to register Ltd!`] }); return; }
    setState({
      ...s,
      money: s.money - cost,
      business: { ...s.business, isCompany: true, companyType: isLtd ? 'ltd' : 'sole_prop', maxWorkers: isLtd ? 10 : 3 },
      notifications: [`Founded ${isLtd ? 'Ltd' : 'Sole Proprietorship'} company!`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `🏛️ Registered ${s.business.name} as ${isLtd ? 'Ltd Company' : 'Sole Proprietorship'}!` }],
    });
  };

  const handleHireWorker = () => {
    if (!s.business.name || !s.business.isCompany) return;
    if (s.business.workers >= s.business.maxWorkers) { setState({ ...s, notifications: [`Max ${s.business.maxWorkers} workers for this company type!`] }); return; }
    setState({
      ...s,
      business: { ...s.business, workers: s.business.workers + 1 },
      notifications: [`Hired a worker! (${s.business.workers + 1}/${s.business.maxWorkers})`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `👷 Hired worker #${s.business.workers + 1} at ${formatMoney(s.business.workerSalary)}/mo` }],
    });
  };

  const handleFireWorker = () => {
    if (!s.business.name || s.business.workers <= 0) return;
    setState({
      ...s,
      business: { ...s.business, workers: s.business.workers - 1 },
      notifications: [`Fired a worker. (${s.business.workers - 1}/${s.business.maxWorkers})`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Fired a worker.` }],
    });
  };

  // ====== PHONE ======
  const handleUpgradePhone = (tierId: number, brandChoice: 1 | 2) => {
    const tier = phoneTiers.find(t => t.id === tierId);
    if (!tier) return;
    if (s.phone.tier >= tierId) { setState({ ...s, notifications: ['Already have this or better phone!'] }); return; }
    // Moto is 15% cheaper
    const actualCost = brandChoice === 2 ? Math.round(tier.cost * 0.85) : tier.cost;
    if (s.money < actualCost) { setState({ ...s, notifications: [`Need ${formatMoney(actualCost)} for this phone!`] }); return; }
    const phoneName = brandChoice === 1 ? tier.brand1Name : tier.brand2Name;
    const brand = brandChoice === 1 ? 'noki' : 'moto' as const;
    setState({
      ...s,
      money: s.money - actualCost,
      totalSpent: s.totalSpent + actualCost,
      phone: { tier: tierId, brandChoice, brand, name: phoneName, chatLatency: tier.chatLatency, hasCall: tier.hasCall },
      notifications: [`Bought ${phoneName}! ${tier.icon}${brandChoice === 2 ? ' (15% off!)' : ''}`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `📱 Upgraded to ${phoneName} for ${formatMoney(actualCost)}!` }],
      happiness: clampStat(s.happiness + 5),
    });
  };

  // ====== INVESTMENTS ======
  const handleInvest = (typeIdx: number, amount: number) => {
    const invType = investmentTypes[typeIdx];
    if (s.money < amount) { setState({ ...s, notifications: ["Can't afford this investment!"] }); return; }
    if (amount < invType.minInvest) { setState({ ...s, notifications: [`Minimum investment: ${formatMoney(invType.minInvest)}`] }); return; }

    const newInv: InvestmentState = {
      id: 'inv_' + Date.now(), name: invType.name, icon: invType.icon, amount,
      returnRange: invType.returnRange, currentReturn: 0, yearsHeld: 0,
    };

    setState({
      ...s,
      money: s.money - amount, totalSpent: s.totalSpent + amount,
      investments: [...s.investments, newInv],
      notifications: [`Invested ${formatMoney(amount)} in ${invType.name}!`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `${invType.icon} Invested ${formatMoney(amount)} in ${invType.name}` }],
    });
  };

  const handleSellInvestment = (invId: string) => {
    const inv = s.investments.find(i => i.id === invId);
    if (!inv) return;
    setState({
      ...s,
      money: s.money + inv.amount,
      investments: s.investments.filter(i => i.id !== invId),
      notifications: [`Sold ${inv.name} for ${formatMoney(inv.amount)}!`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Sold ${inv.name} for ${formatMoney(inv.amount)} 📊` }],
    });
  };

  // ====== AI INTERACTION ======
  const handleAIInteract = (relId: string, action: string) => {
    const rel = s.relationships.find(r => r.id === relId);
    if (!rel || !rel.alive) return;
    const response = getAIResponse(rel, action);
    const newRelationships = s.relationships.map(r =>
      r.id === relId ? { ...r, relationship: clampStat(r.relationship + response.relationChange), lastInteraction: action } : r
    );
    setState({
      ...s, relationships: newRelationships,
      happiness: clampStat(s.happiness + response.happinessChange),
      lifeEvents: [...s.lifeEvents, { age: s.age, text: response.text }],
      notifications: [response.text],
    });
  };

  const handleInteractRelationship = (relId: string, action: 'spend_time' | 'compliment' | 'gift' | 'insult' | 'argue') => {
    const rel = s.relationships.find(r => r.id === relId);
    if (!rel || !rel.alive) return;
    let change = 0, text = '', moneyChange = 0, happinessChange = 0;
    switch (action) {
      case 'spend_time': change = randomBetween(3, 12); happinessChange = randomBetween(2, 8); text = `Spent time with ${rel.name}. 💕`; break;
      case 'compliment': change = randomBetween(2, 8); happinessChange = randomBetween(1, 5); text = `Complimented ${rel.name}. 😊`; break;
      case 'gift': change = randomBetween(5, 15); moneyChange = -randomBetween(20, 200); happinessChange = randomBetween(3, 8); text = `Gave ${rel.name} a gift. 🎁`; break;
      case 'insult': change = -randomBetween(10, 25); happinessChange = randomBetween(-5, 2); text = `Insulted ${rel.name}. 😤`; break;
      case 'argue': change = -randomBetween(5, 20); happinessChange = -randomBetween(3, 10); text = `Argued with ${rel.name}. 😡`; break;
    }
    if (s.money + moneyChange < 0) { setState({ ...s, notifications: ["Can't afford a gift!"] }); return; }
    const newRelationships = s.relationships.map(r => r.id === relId ? { ...r, relationship: clampStat(r.relationship + change) } : r);
    setState({ ...s, relationships: newRelationships, money: s.money + moneyChange, happiness: clampStat(s.happiness + happinessChange), lifeEvents: [...s.lifeEvents, { age: s.age, text }], notifications: [text] });
  };

  const handleDateSomeone = () => {
    if (s.age < 16) { setState({ ...s, notifications: ["Too young to date!"] }); return; }
    if (s.relationships.some(r => (r.type === 'partner' || r.type === 'spouse') && r.alive)) { setState({ ...s, notifications: ["Already in a relationship!"] }); return; }
    const partnerGender = s.gender === 'male' ? 'female' : 'male' as const;
    const name = generateFullName(partnerGender);
    const partner: Relationship = {
      id: 'rel_' + Date.now(), name: `${name.first} ${name.last}`, type: 'partner',
      gender: partnerGender, age: s.age + randomBetween(-5, 5), relationship: randomBetween(30, 60),
      alive: true, personality: generatePersonality(),
    };
    if (Math.random() * 100 > s.looks + 20) {
      setState({ ...s, notifications: [`${partner.name} said no. 💔`], lifeEvents: [...s.lifeEvents, { age: s.age, text: `Tried dating ${partner.name} but got rejected. 💔` }], happiness: clampStat(s.happiness - 5) });
      return;
    }
    setState({ ...s, relationships: [...s.relationships, partner], happiness: clampStat(s.happiness + 15), notifications: [`Dating ${partner.name}! 💕`], lifeEvents: [...s.lifeEvents, { age: s.age, text: `Started dating ${partner.name}! 💕` }] });
  };

  const handleMarry = () => {
    const partner = s.relationships.find(r => r.type === 'partner' && r.alive);
    if (!partner) { setState({ ...s, notifications: ["Need a partner!"] }); return; }
    if (partner.relationship < 60) { setState({ ...s, notifications: [`${partner.name} says it's too soon.`] }); return; }
    if (s.age < 18) { setState({ ...s, notifications: ["Too young to marry!"] }); return; }
    setState({
      ...s, relationships: s.relationships.map(r => r.id === partner.id ? { ...r, type: 'spouse' as const } : r),
      happiness: clampStat(s.happiness + 20), money: s.money - 5000, totalSpent: s.totalSpent + 5000,
      notifications: [`Married ${partner.name}! 💒`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Married ${partner.name}! 💒` }],
    });
  };

  const handleBreakup = (relId: string) => {
    const rel = s.relationships.find(r => r.id === relId);
    if (!rel) return;
    setState({
      ...s, relationships: s.relationships.map(r => r.id === relId ? { ...r, type: 'ex' as const, relationship: Math.max(0, r.relationship - 30) } : r),
      happiness: clampStat(s.happiness - 15), notifications: [`Broke up with ${rel.name}. 💔`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Broke up with ${rel.name}. 💔` }],
    });
  };

  const handleHaveChild = () => {
    if (!s.relationships.find(r => r.type === 'spouse' && r.alive)) { setState({ ...s, notifications: ["Need to be married!"] }); return; }
    if (s.age < 18) { setState({ ...s, notifications: ["Too young!"] }); return; }
    const childGender = Math.random() > 0.5 ? 'male' : 'female' as const;
    const childName = generateFullName(childGender);
    const child: Relationship = {
      id: 'rel_' + Date.now(), name: `${childName.first} ${s.lastName}`, type: 'child',
      gender: childGender, age: 0, relationship: randomBetween(60, 90), alive: true, personality: generatePersonality(),
    };
    setState({
      ...s, relationships: [...s.relationships, child], happiness: clampStat(s.happiness + 20),
      notifications: [`Had a baby ${childGender === 'male' ? 'boy' : 'girl'}: ${child.name}! 👶`],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Had a baby: ${child.name}! 👶` }],
    });
  };

  const handleNewLife = () => {
    const gender = Math.random() > 0.5 ? 'male' : 'female' as const;
    const name = generateFullName(gender);
    const country = randomFromArray(['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany']);
    setState(createCharacter(name.first, name.last, gender, country));
  };

  // School actions
  const handleAttendClass = (subjectName: string) => {
    const subjectToGame: Record<string, GameState['activeMiniGame']> = {
      'Reading': { type: 'scramble', context: 'school', subject: 'Reading' },
      'Math': { type: 'math', context: 'school', subject: 'Math' },
      'Algebra': { type: 'math', context: 'school', subject: 'Algebra' },
      'Art': { type: 'memory', context: 'school', subject: 'Art' },
      'Science': { type: 'pattern', context: 'school', subject: 'Science' },
      'English': { type: 'typing', context: 'school', subject: 'English' },
      'History': { type: 'scramble', context: 'school', subject: 'History' },
      'PE': { type: 'reaction', context: 'school', subject: 'PE' },
      'Chemistry': { type: 'pattern', context: 'school', subject: 'Chemistry' },
      'Elective': { type: 'memory', context: 'school', subject: 'Elective' },
    };
    setState({ ...s, activeMiniGame: subjectToGame[subjectName] || { type: 'math' as const, context: 'school' as const, subject: subjectName } });
  };

  const handleJoinClub = (clubName: string) => {
    setState({
      ...s, school: { ...s.school, clubMember: clubName },
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Joined ${clubName}! 🏆` }],
      notifications: [`Joined ${clubName}!`], happiness: clampStat(s.happiness + 5), popularity: clampStat(s.popularity + 3),
    });
  };

  const handleMakeFriend = () => {
    const newFriends = generateSchoolFriends(s, 1);
    setState({
      ...s, relationships: [...s.relationships, ...newFriends],
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Made a new friend: ${newFriends[0].name}! 🤝` }],
      notifications: [`New friend: ${newFriends[0].name}!`], happiness: clampStat(s.happiness + 5),
    });
  };

  // Job actions
  const handleDoWorkTask = () => {
    if (!s.job.title || !s.job.category) return;
    const tasks = jobTasks[s.job.category] || jobTasks['default'];
    const task = randomFromArray(tasks);
    setState({ ...s, activeMiniGame: { type: task.gameType, context: 'job', jobTask: task.name } });
  };

  const handleSchmooze = () => {
    const bossChange = randomBetween(3, 10);
    setState({
      ...s, job: { ...s.job, bossRelation: clampStat(s.job.bossRelation + bossChange) },
      lifeEvents: [...s.lifeEvents, { age: s.age, text: `Schmooze with boss. +${bossChange}% 🤝` }],
      notifications: [`Boss relation +${bossChange}%!`],
    });
  };

  const handleAskPromotion = () => {
    const chance = s.job.performance / 100 * 0.5 + s.job.bossRelation / 100 * 0.3 + s.smarts / 100 * 0.2;
    if (Math.random() < chance) {
      const raise = Math.floor(s.job.salary * randomBetween(10, 25) / 100);
      setState({
        ...s, job: { ...s.job, salary: s.job.salary + raise, years: 0, performance: 50 }, salary: s.job.salary + raise,
        lifeEvents: [...s.lifeEvents, { age: s.age, text: `Promoted! New salary: ${formatMoney(s.job.salary + raise)}/yr 🎉` }],
        notifications: [`Promoted! +${formatMoney(raise)}/yr!`], happiness: clampStat(s.happiness + 15),
      });
    } else {
      setState({
        ...s, job: { ...s.job, bossRelation: clampStat(s.job.bossRelation - 5) },
        notifications: ['Promotion denied.'], lifeEvents: [...s.lifeEvents, { age: s.age, text: 'Promotion denied. 😔' }],
      });
    }
  };

  // ====== RENDER SECTIONS ======

  // ====== SAVE/LOAD MENU ======
  const handleSaveToSlot = (slotId: number) => {
    const success = saveGame(slotId, s);
    setSaveSlots(getAllSlots());
    setSaveMessage(success ? `✅ Saved to Slot ${slotId + 1}!` : '❌ Save failed!');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleLoadFromSlot = (slotId: number) => {
    const loaded = loadGame(slotId);
    if (loaded) {
      setState(loaded);
      setShowSaveMenu(false);
      setSaveMessage(null);
    } else {
      setSaveMessage('❌ Load failed!');
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  const handleDeleteSlot = (slotId: number) => {
    deleteSlot(slotId);
    setSaveSlots(getAllSlots());
    setSaveMessage(`🗑️ Slot ${slotId + 1} deleted.`);
    setTimeout(() => setSaveMessage(null), 2000);
  };

  if (showSaveMenu) {
    return (
      <div className="min-h-screen bg-gray-900/95 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-5 max-w-sm w-full border border-gray-700 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-black">💾 Save / Load</h2>
            <button onClick={() => setShowSaveMenu(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
          </div>

          {saveMessage && (
            <div className="bg-gray-700 text-white text-center px-3 py-2 rounded-xl text-sm font-medium mb-3 animate-bounce">{saveMessage}</div>
          )}

          <div className="space-y-2">
            {saveSlots.map(slot => (
              <div key={slot.id} className={`rounded-xl p-3 border ${slot.occupied ? 'bg-gray-700 border-emerald-500/30' : 'bg-gray-750 border-gray-600'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{slot.occupied ? '📁' : '📂'}</span>
                    <div>
                      <p className="text-white text-sm font-bold">Slot {slot.id + 1}</p>
                      {slot.occupied ? (
                        <p className="text-gray-400 text-xs">
                          {slot.name} • Age {slot.age} • ${slot.money.toLocaleString()} • {formatSaveDate(slot.timestamp)}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-xs">Empty</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleSaveToSlot(slot.id)}
                    className="flex-1 bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-400 active:scale-95 transition-all">
                    💾 Save
                  </button>
                  {slot.occupied && (
                    <>
                      <button onClick={() => handleLoadFromSlot(slot.id)}
                        className="flex-1 bg-blue-500 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-400 active:scale-95 transition-all">
                        📂 Load
                      </button>
                      <button onClick={() => handleDeleteSlot(slot.id)}
                        className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/30 active:scale-95 transition-all">
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setShowSaveMenu(false)}
            className="w-full mt-4 bg-gray-700 text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-600 active:scale-95 transition-all">
            ← Back to Game
          </button>
        </div>
      </div>
    );
  }

  // Event modal
  if (s.currentEvent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
          <div className="text-4xl text-center mb-4">{s.currentEvent.emoji || '❓'}</div>
          <p className="text-white text-center text-lg font-medium mb-6">{s.currentEvent.text}</p>
          <div className="space-y-2">
            {s.currentEvent.choices.map((choice, idx) => (
              <button key={idx} onClick={() => handleEventChoice(idx)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-all active:scale-95 text-left">
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Death screen
  if (s.screen === 'death' || !s.alive) {
    const totalWealth = s.money + s.assets.reduce((sum, a) => sum + a.currentValue, 0) + s.investments.reduce((sum, i) => sum + i.amount, 0);
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-6xl mb-4">⚰️</div>
          <h2 className="text-3xl font-black text-white mb-2">Rest In Peace</h2>
          <h3 className="text-xl text-gray-400 mb-6">{s.firstName} {s.lastName}</h3>
          <p className="text-gray-500 mb-1">Age: {s.age} • {s.deathReason}</p>
          <p className="text-gray-500 mb-1">Net Worth: {formatMoney(totalWealth)}</p>
          <p className="text-gray-500 mb-4">Total Earned: {formatMoney(s.totalEarned)}</p>
          <div className="bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-700">
            <StatBar label="Happiness" value={s.happiness} color="bg-yellow-500" icon="😊" />
            <StatBar label="Health" value={s.health} color="bg-green-500" icon="❤️" />
            <StatBar label="Smarts" value={s.smarts} color="bg-blue-500" icon="🧠" />
            <StatBar label="Karma" value={s.karma} color="bg-purple-500" icon="☯️" />
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-700 max-h-48 overflow-y-auto">
            {s.lifeEvents.slice(-10).map((event, idx) => (
              <p key={idx} className="text-gray-400 text-sm text-left mb-1"><span className="text-gray-500">Age {event.age}:</span> {event.text}</p>
            ))}
          </div>
          <button onClick={handleNewLife} className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl hover:bg-green-400 active:scale-95 transition-all text-lg">🌱 New Life</button>
        </div>
      </div>
    );
  }

  const renderNotifications = () => {
    if (s.notifications.length === 0) return null;
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 max-w-xs">
        {s.notifications.slice(0, 2).map((n, i) => (
          <div key={i} className="bg-gray-700 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium animate-bounce text-center">{n}</div>
        ))}
      </div>
    );
  };

  const getAgeEmoji = () => {
    if (s.age < 3) return '👶'; if (s.age < 13) return '🧒'; if (s.age < 18) return '🧑';
    if (s.age < 40) return s.gender === 'male' ? '👨' : '👩';
    if (s.age < 65) return s.gender === 'male' ? '👨‍🦳' : '👩‍🦳'; return '🧓';
  };

  const getStatusLabel = () => {
    if (s.isInJail) return '🔒 In Jail';
    if (s.isRetired) return '🏖️ Retired';
    if (s.job.title) return `💼 ${s.job.title}`;
    if (s.isInSchool) {
      const labels: Record<string, string> = { 'high_school': '🏫 High School', 'college': '🎓 University', 'community_college': '🎓 Community College', 'grad_school': '🎓 Grad School', 'med_school': '🎓 Med School', 'law_school': '🎓 Law School' };
      return labels[s.currentEducation || ''] || '📚 Student';
    }
    if (s.school.enrolled) {
      const labels: Record<string, string> = { 'elementary': '🏫 Elementary', 'middle': '🏫 Middle School', 'high_school': '🏫 High School' };
      return labels[s.school.type || ''] || '🏫 Student';
    }
    return '🔍 Unemployed';
  };

  const totalIncome = (s.job.salary || 0) + (s.business.name ? Math.floor((s.business.monthlyRevenue * 12 * s.business.reputation / 100) - s.business.monthlyCost * 12) : 0);
  const totalWealth = s.money + s.assets.reduce((sum, a) => sum + a.currentValue, 0) + s.investments.reduce((sum, i) => sum + i.amount, 0);

  // ====== RENDER LIFE TAB ======
  const renderLifeTab = () => (
    <div className="pb-24">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-2xl mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">{getAgeEmoji()}</div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">{s.firstName} {s.lastName}</h2>
            <p className="text-emerald-100 text-sm">Age {s.age} • {s.country}</p>
            <p className="text-emerald-200 text-xs">{getStatusLabel()}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">{formatMoney(s.money)}</p>
            <p className="text-emerald-200 text-xs">Net: {formatMoney(totalWealth)}</p>
          </div>
        </div>
        <div className="bg-black/20 rounded-xl p-3 space-y-0.5">
          <StatBar label="Happiness" value={s.happiness} color="bg-yellow-400" icon="😊" />
          <StatBar label="Health" value={s.health} color="bg-red-400" icon="❤️" />
          <StatBar label="Smarts" value={s.smarts} color="bg-blue-400" icon="🧠" />
          <StatBar label="Looks" value={s.looks} color="bg-pink-400" icon="✨" />
          <StatBar label="Fitness" value={s.fitness} color="bg-orange-400" icon="💪" />
          <StatBar label="Karma" value={s.karma} color="bg-purple-400" icon="☯️" />
          <StatBar label="Discipline" value={s.discipline} color="bg-cyan-400" icon="📏" />
        </div>
      </div>

      {/* Financial summary for adults */}
      {s.age >= 18 && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mb-4">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">💰 Finances</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-700 rounded-xl p-2"><p className="text-gray-400 text-xs">Cash</p><p className="text-white font-bold">{formatMoney(s.money)}</p></div>
            <div className="bg-gray-700 rounded-xl p-2"><p className="text-gray-400 text-xs">Income/yr</p><p className="text-green-400 font-bold">{formatMoney(totalIncome)}</p></div>
            <div className="bg-gray-700 rounded-xl p-2"><p className="text-gray-400 text-xs">Housing</p><p className="text-white font-bold text-xs">{s.housing.current}</p></div>
            <div className="bg-gray-700 rounded-xl p-2"><p className="text-gray-400 text-xs">Expenses/yr</p><p className="text-red-400 font-bold">{formatMoney(s.annualExpenses)}</p></div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
        <h3 className="text-white font-bold mb-3">📜 Life Story</h3>
        <div ref={logRef} className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {s.lifeEvents.map((event, idx) => (
            <div key={idx} className="flex gap-2 text-sm">
              <span className="text-emerald-400 font-mono font-bold min-w-[52px]">Age {event.age}</span>
              <span className="text-gray-300">{event.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ====== SCHOOL TAB ======
  const renderSchoolTab = () => {
    // Higher education view
    if (s.isInSchool && s.currentEducation && s.currentEducation !== 'high_school') {
      const schoolmates = s.relationships.filter(r => r.type === 'schoolmate' && r.alive);
      const eduLabels: Record<string, string> = { 'college': 'University', 'community_college': 'Community College', 'grad_school': 'Graduate School', 'med_school': 'Medical School', 'law_school': 'Law School' };
      return (
        <div className="pb-24 space-y-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4">
            <h3 className="text-white font-bold text-lg">🎓 {eduLabels[s.currentEducation] || s.currentEducation}</h3>
            <p className="text-indigo-100 text-sm">{s.educationYearsLeft} year(s) remaining</p>
            <p className="text-indigo-200 text-xs">GPA boosted by minigames and study</p>
          </div>

          {/* Study minigames */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <h3 className="text-white font-bold mb-3">📚 Attend Classes</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Lecture', 'Lab', 'Seminar', 'Exam'].map(cls => (
                <button key={cls} onClick={() => handleAttendClass(cls === 'Lab' ? 'Science' : cls === 'Exam' ? 'Math' : cls === 'Seminar' ? 'History' : 'English')}
                  className="bg-gray-700 rounded-xl p-3 text-left hover:bg-gray-600 active:scale-95 transition-all">
                  <span className="text-lg">{cls === 'Lecture' ? '📝' : cls === 'Lab' ? '🔬' : cls === 'Seminar' ? '🗣️' : '📋'}</span>
                  <p className="text-white text-sm font-medium">{cls}</p>
                  <p className="text-gray-400 text-xs">+Smarts, +GPA</p>
                </button>
              ))}
            </div>
          </div>

          {/* Schoolmates */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold">👥 Schoolmates</h3>
              <button onClick={handleMakeFriend} className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-xs font-medium hover:bg-indigo-500/30">+ Meet Someone</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {schoolmates.map(sm => (
                <div key={sm.id}>
                  <button onClick={() => setSelectedRel(selectedRel === sm.id ? null : sm.id)}
                    className="w-full bg-gray-700 rounded-xl p-3 text-left hover:bg-gray-650 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{sm.gender === 'male' ? '👨‍🎓' : '👩‍🎓'}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{sm.name}</p>
                          <p className="text-gray-500 text-xs">{sm.personality.temperament} • {sm.personality.friendliness > 60 ? 'Friendly' : 'Reserved'}</p>
                        </div>
                      </div>
                      <div className="w-12 bg-gray-600 rounded-full h-2">
                        <div className={`h-2 rounded-full ${sm.relationship > 70 ? 'bg-green-400' : sm.relationship > 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${sm.relationship}%` }} />
                      </div>
                    </div>
                  </button>
                  {selectedRel === sm.id && (
                    <div className="bg-gray-700/50 rounded-xl p-3 mt-1 flex flex-wrap gap-2">
                      {['talk', 'joke', 'hangout', 'study', 'coffee', 'party'].map(action => (
                        <button key={action} onClick={() => handleAIInteract(sm.id, action)}
                          className="bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-500/30 capitalize">
                          {action === 'talk' ? '💬' : action === 'joke' ? '😄' : action === 'hangout' ? '🎮' : action === 'study' ? '📖' : action === 'coffee' ? '☕' : '🎉'} {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!s.school.enrolled && s.age < 18) {
      return (<div className="pb-24"><div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center"><div className="text-4xl mb-3">🏫</div><p className="text-gray-400">{s.age < 5 ? "School starts at age 5!" : "Waiting..."}</p></div></div>);
    }
    if (!s.school.enrolled && !s.isInSchool) {
      return (<div className="pb-24"><div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center"><div className="text-4xl mb-3">🎓</div><p className="text-gray-400">Check Education tab for higher education.</p></div></div>);
    }

    const classmates = s.relationships.filter(r => r.type === 'classmate' && r.alive);
    const schoolTypeLabel = s.school.type === 'elementary' ? 'Elementary School' : s.school.type === 'middle' ? 'Middle School' : 'High School';

    return (
      <div className="pb-24 space-y-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4">
          <h3 className="text-white font-bold text-lg">🏫 {schoolTypeLabel}</h3>
          <div className="flex justify-between mt-2">
            <div><p className="text-blue-100 text-sm">GPA: <span className="font-bold">{s.school.grade}%</span></p><p className="text-blue-200 text-xs">Attendance: {s.school.attendance}%</p></div>
            <div className="text-right"><p className="text-blue-100 text-sm">Classes: {s.school.classesAttended}</p>{s.school.clubMember && <p className="text-blue-200 text-xs">🏆 {s.school.clubMember}</p>}</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-3">📚 Attend Class</h3>
          <div className="grid grid-cols-2 gap-2">
            {s.school.subjects.map((sub, idx) => (
              <button key={idx} onClick={() => handleAttendClass(sub.name)} className="bg-gray-700 rounded-xl p-3 text-left hover:bg-gray-600 active:scale-95 transition-all">
                <div className="flex items-center gap-2 mb-1"><span className="text-lg">{sub.emoji}</span><span className="text-white text-sm font-medium">{sub.name}</span></div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className={`h-2 rounded-full ${sub.grade >= 80 ? 'bg-green-400' : sub.grade >= 60 ? 'bg-yellow-400' : sub.grade >= 40 ? 'bg-orange-400' : 'bg-red-400'}`} style={{ width: `${sub.grade}%` }} />
                </div>
                <p className="text-gray-400 text-xs mt-1">{sub.grade}% ({sub.grade >= 90 ? 'A+' : sub.grade >= 80 ? 'A' : sub.grade >= 70 ? 'B' : sub.grade >= 60 ? 'C' : sub.grade >= 50 ? 'D' : 'F'})</p>
              </button>
            ))}
          </div>
        </div>

        {!s.school.clubMember && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <h3 className="text-white font-bold mb-3">🏆 Join a Club</h3>
            <div className="grid grid-cols-2 gap-2">
              {schoolClubs.filter(c => (s.school.type === 'elementary' ? c.minAge <= 10 : s.school.type === 'middle' ? c.minAge <= 13 : true))
                .map((club, idx) => (
                  <button key={idx} onClick={() => handleJoinClub(club.name)} className="bg-gray-700 rounded-xl p-3 text-left hover:bg-gray-600 active:scale-95 transition-all">
                    <span className="text-lg">{club.icon}</span><p className="text-white text-sm font-medium">{club.name}</p><p className="text-gray-400 text-xs">{club.benefit}</p>
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold">👥 Classmates</h3>
            <button onClick={handleMakeFriend} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-500/30">+ Make Friend</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {classmates.map(cm => (
              <div key={cm.id}>
                <button onClick={() => setSelectedRel(selectedRel === cm.id ? null : cm.id)} className="w-full bg-gray-700 rounded-xl p-3 text-left hover:bg-gray-650 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{cm.gender === 'male' ? '👦' : '👧'}</span>
                      <div><p className="text-white text-sm font-medium">{cm.name}</p><p className="text-gray-500 text-xs">{cm.personality.temperament}</p></div>
                    </div>
                    <div className="w-12 bg-gray-600 rounded-full h-2">
                      <div className={`h-2 rounded-full ${cm.relationship > 70 ? 'bg-green-400' : cm.relationship > 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${cm.relationship}%` }} />
                    </div>
                  </div>
                </button>
                {selectedRel === cm.id && (
                  <div className="bg-gray-700/50 rounded-xl p-3 mt-1 flex flex-wrap gap-2">
                    {['talk', 'joke', 'hangout', 'help', 'gossip', 'study'].map(action => (
                      <button key={action} onClick={() => handleAIInteract(cm.id, action)} className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/30 capitalize">
                        {action === 'talk' ? '💬' : action === 'joke' ? '😄' : action === 'hangout' ? '🎮' : action === 'help' ? '🤝' : action === 'gossip' ? '🗣️' : '📖'} {action}
                      </button>
                    ))}
                    {cm.relationship >= 50 && cm.type === 'classmate' && (
                      <button onClick={() => { setState({ ...s, relationships: s.relationships.map(r => r.id === cm.id ? { ...r, type: 'friend' as const } : r), notifications: [`${cm.name} is now your friend!`] }); }}
                        className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/30">⭐ Best Friend</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ====== JOB TAB ======
  const renderJobTab = () => {
    const availableJobs = jobs.filter(j => {
      if (j.requirements.age && s.age < j.requirements.age) return false;
      if (j.requirements.education && !s.education.includes(j.requirements.education)) return false;
      return true;
    });

    return (
      <div className="pb-24 space-y-4">
        {s.job.title && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <h3 className="text-white font-bold mb-2">💼 {s.job.title}</h3>
            <div className="bg-gray-700 rounded-xl p-3 space-y-2">
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Salary</span><span className="text-green-400 font-bold">{formatMoney(s.job.salary)}/yr</span></div>
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Years</span><span className="text-white">{s.job.years}</span></div>
              <StatBar label="Perform." value={s.job.performance} color={s.job.performance > 70 ? "bg-green-400" : s.job.performance > 40 ? "bg-yellow-400" : "bg-red-400"} icon="📊" />
              <StatBar label="Boss" value={s.job.bossRelation} color="bg-blue-400" icon="🤵" />
              <p className="text-gray-500 text-xs">Stats bonus: 🧠{s.smarts}% 📏{s.discipline}% 💪{s.fitness}%</p>
              <div className="flex gap-2 flex-wrap pt-2">
                <button onClick={handleDoWorkTask} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-400 active:scale-95 transition-all">⚡ Do Work</button>
                <button onClick={handleSchmooze} className="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-500/30">🤝 Schmooze</button>
                {s.job.years >= 2 && s.job.performance >= 60 && (<button onClick={handleAskPromotion} className="bg-amber-500/20 text-amber-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-500/30">📈 Promote</button>)}
                {s.age >= 55 && (<button onClick={handleRetire} className="bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500/30">🏖️ Retire</button>)}
                <button onClick={handleQuitJob} className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30">👋 Quit</button>
              </div>
            </div>
            {/* Coworkers */}
            {(() => {
              const coworkers = s.relationships.filter(r => r.type === 'coworker' && r.alive);
              if (coworkers.length === 0) return null;
              return (
                <div className="mt-3">
                  <h4 className="text-gray-400 text-sm font-bold mb-2">👥 Coworkers</h4>
                  {coworkers.map(cw => (
                    <div key={cw.id}>
                      <button onClick={() => setSelectedRel(selectedRel === cw.id ? null : cw.id)}
                        className="w-full bg-gray-700/50 rounded-lg p-2 text-left flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cw.gender === 'male' ? '👨‍💼' : '👩‍💼'}</span>
                          <span className="text-white text-sm">{cw.name}</span>
                        </div>
                        <div className="w-10 bg-gray-600 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${cw.relationship > 60 ? 'bg-green-400' : 'bg-yellow-400'}`} style={{ width: `${cw.relationship}%` }} /></div>
                      </button>
                      {selectedRel === cw.id && (
                        <div className="bg-gray-700/30 rounded-lg p-2 mb-1 flex flex-wrap gap-1">
                          {['talk', 'joke', 'help', 'gossip', 'coffee', 'dinner'].map(action => (
                            <button key={action} onClick={() => handleAIInteract(cw.id, action)} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium hover:bg-blue-500/30 capitalize">{action}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-3">📋 Job Listings</h3>
          {s.age < 14 ? (<p className="text-gray-400 text-sm">Too young to work!</p>) :
           s.isInJail ? (<p className="text-gray-400 text-sm">Can't work in jail.</p>) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {availableJobs.map((job, idx) => (
                <div key={idx} className="bg-gray-700 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{job.title}</p>
                    <p className="text-green-400 text-sm">{formatMoney(job.salary)}/yr</p>
                    <p className="text-gray-400 text-xs">
                      {job.requirements.smarts ? `🧠${job.requirements.smarts}% ` : ''}{job.requirements.looks ? `✨${job.requirements.looks}% ` : ''}
                      {job.requirements.education ? `📚${job.requirements.education.replace(/_/g, ' ')}` : ''}
                    </p>
                  </div>
                  <button onClick={() => handleApplyJob(job)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-400 active:scale-95 transition-all">Apply</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ====== FINANCE TAB (Housing, Expenses, Business, Investments) ======
  const renderFinanceTab = () => (
    <div className="pb-24 space-y-4">
      {/* Financial Overview */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl p-4">
        <p className="text-yellow-100 text-sm">💰 Cash</p>
        <p className="text-white text-2xl font-black">{formatMoney(s.money)}</p>
        <p className="text-yellow-100 text-xs mt-1">Net Worth: {formatMoney(totalWealth)} • Earned: {formatMoney(s.totalEarned)}</p>
      </div>

      {/* Housing */}
      {s.age >= 16 && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-2">🏠 Housing</h3>
          <div className="bg-gray-700 rounded-xl p-3 mb-3">
            <div className="flex justify-between"><span className="text-gray-400 text-sm">Current</span><span className="text-white font-bold">{s.housing.current}</span></div>
            <div className="flex justify-between"><span className="text-gray-400 text-sm">Rent/Mortgage</span><span className="text-yellow-400">{formatMoney(s.housing.monthlyPayment)}/mo</span></div>
            <div className="flex justify-between"><span className="text-gray-400 text-sm">Quality</span>
              <span className="text-white">{'⭐'.repeat(Math.min(5, Math.ceil(s.housing.quality / 2)))}</span>
            </div>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {rentalOptions.filter(o => !(o.name === "Parents' House" && s.age >= 20)).map((opt, idx) => (
              <button key={idx} onClick={() => handleChangeHousing(idx)}
                className={`w-full bg-gray-700 rounded-lg p-2 text-left flex items-center justify-between text-sm hover:bg-gray-600 ${s.housing.current === opt.name ? 'ring-2 ring-amber-500' : ''}`}>
                <span className="text-white">{opt.icon} {opt.name}</span>
                <span className="text-yellow-400">{opt.monthlyCost === 0 ? 'Free' : `${formatMoney(opt.monthlyCost)}/mo`}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Expenses */}
      {s.age >= 18 && s.housing.type !== 'parents' && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">📊 Monthly Expenses</h3>
            <button onClick={() => setShowExpensePanel(!showExpensePanel)} className="text-gray-400 text-xs hover:text-white">{showExpensePanel ? 'Hide' : 'Adjust'}</button>
          </div>
          <div className="bg-gray-700 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-400">🏠 Rent/Mortgage</span><span className="text-white">{formatMoney(s.housing.monthlyPayment)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">🍽️ Food ({s.expenses.foodLevel})</span><span className="text-white">{formatMoney(s.expenses.foodLevel === 'basic' ? 200 : s.expenses.foodLevel === 'average' ? 400 : 800)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">⚡ Electric ({s.expenses.electricityLevel})</span><span className="text-white">{formatMoney(s.expenses.electricityLevel === 'basic' ? 80 : s.expenses.electricityLevel === 'average' ? 150 : 300)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">🛡️ Insurance ({s.expenses.insuranceLevel})</span><span className="text-white">{formatMoney(s.expenses.insuranceLevel === 'basic' ? 100 : s.expenses.insuranceLevel === 'average' ? 200 : 400)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">📱 Phone + Internet + Transport</span><span className="text-white">{formatMoney(290)}</span></div>
            {s.assets.some(a => a.category === 'vehicle') && (
              <div className="flex justify-between"><span className="text-gray-400">🚗 Car Insurance</span><span className="text-white">{formatMoney(150)}/mo</span></div>
            )}
            {s.job.salary > 0 && (
              <div className="flex justify-between"><span className="text-gray-400">🏛️ Income Tax (15%)</span><span className="text-white">{formatMoney(Math.round(s.job.salary * 0.15 / 12))}/mo</span></div>
            )}
            <hr className="border-gray-600" />
            <div className="flex justify-between font-bold"><span className="text-red-400">Total/year</span><span className="text-red-400">{formatMoney(s.annualExpenses + (s.assets.some(a => a.category === 'vehicle') ? 1800 : 0) + Math.round(s.job.salary * 0.15))}</span></div>
          </div>
          {showExpensePanel && (
            <div className="mt-3 space-y-2">
              {(['foodLevel', 'electricityLevel', 'insuranceLevel'] as const).map(cat => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-20 capitalize">{cat.replace('Level', '')}</span>
                  {(['basic', 'average', 'fancy'] as const).map(level => (
                    <button key={level} onClick={() => handleChangeExpense(cat, level)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${s.expenses[cat] === level ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                      {level}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Business */}
      {s.age >= 21 && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-2">🏢 Business</h3>
          {s.business.name ? (
            <div className="bg-gray-700 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold">{s.business.icon} {s.business.name}</p>
                {s.business.isCompany && (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.business.companyType === 'ltd' ? 'bg-blue-500/30 text-blue-400' : 'bg-amber-500/30 text-amber-400'}`}>
                    {s.business.companyType === 'ltd' ? '🏛️ Ltd' : '👤 Sole Prop'}
                  </span>
                )}
              </div>
              <StatBar label="Reputation" value={s.business.reputation} color="bg-amber-400" icon="⭐" />
              <div className="flex justify-between text-sm"><span className="text-gray-400">Monthly Revenue</span><span className="text-green-400">{formatMoney(Math.floor(s.business.monthlyRevenue * s.business.reputation / 100 * (1 + s.business.workers * 0.15) + s.business.workers * 500))}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Monthly Costs</span><span className="text-red-400">{formatMoney(s.business.monthlyCost)}</span></div>
              {s.business.workers > 0 && (
                <div className="flex justify-between text-sm"><span className="text-gray-400">👷 Worker Salaries ({s.business.workers})</span><span className="text-red-400">{formatMoney(s.business.workers * s.business.workerSalary)}/mo</span></div>
              )}
              <div className="flex justify-between text-sm"><span className="text-gray-400">Business Tax ({s.business.companyType === 'ltd' ? '25%' : '20%'})</span><span className="text-red-400">{formatMoney(Math.round((s.business.monthlyRevenue * s.business.reputation / 100 * (1 + s.business.workers * 0.15) + s.business.workers * 500 - s.business.monthlyCost - s.business.workers * s.business.workerSalary) * (s.business.companyType === 'ltd' ? 0.25 : 0.2)))}/mo</span></div>
              <div className="flex justify-between text-sm font-bold"><span className="text-gray-400">Net Profit/mo</span><span className={s.business.monthlyRevenue * s.business.reputation / 100 - s.business.monthlyCost - s.business.workers * s.business.workerSalary > 0 ? 'text-green-400' : 'text-red-400'}>{formatMoney(Math.round((s.business.monthlyRevenue * s.business.reputation / 100 * (1 + s.business.workers * 0.15) + s.business.workers * 500 - s.business.monthlyCost - s.business.workers * s.business.workerSalary) * (s.business.companyType === 'ltd' ? 0.75 : 0.8)))}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Total Profit</span><span className={s.business.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}>{formatMoney(s.business.totalProfit)}</span></div>
              <p className="text-gray-500 text-xs">Workers: +15% revenue, +$6k/yr, +5% rep cap each</p>
              
              {/* Company Registration */}
              {!s.business.isCompany && s.business.reputation >= 40 && (
                <div className="bg-gray-600/50 rounded-lg p-2 mt-2">
                  <p className="text-gray-300 text-xs mb-2">🏛️ Register as Company (unlocks workers)</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleFoundCompany(false)} className="flex-1 bg-amber-500/20 text-amber-400 px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-500/30">Sole Prop (Free, max 3)</button>
                    <button onClick={() => handleFoundCompany(true)} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${s.money >= 5000 ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-gray-600 text-gray-500'}`}>Ltd ($5K, max 10)</button>
                  </div>
                </div>
              )}

              {/* Worker Management */}
              {s.business.isCompany && (
                <div className="bg-gray-600/50 rounded-lg p-2 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-xs">👷 Workers: {s.business.workers}/{s.business.maxWorkers}</span>
                    <span className="text-gray-400 text-xs">{formatMoney(s.business.workerSalary)}/mo each</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleHireWorker} disabled={s.business.workers >= s.business.maxWorkers} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${s.business.workers < s.business.maxWorkers ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-600 text-gray-500'}`}>➕ Hire</button>
                    <button onClick={handleFireWorker} disabled={s.business.workers <= 0} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${s.business.workers > 0 ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-600 text-gray-500'}`}>➖ Fire</button>
                  </div>
                </div>
              )}

              <button onClick={handleCloseBusiness} className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30 w-full mt-2">Close Business</button>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {businessTypes.map((biz, idx) => (
                <div key={idx} className="bg-gray-700 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{biz.icon} {biz.name}</p>
                    <p className="text-gray-400 text-xs">Cost: {formatMoney(biz.startupCost)} • Rev: {formatMoney(biz.monthlyRevenue[0])}-{formatMoney(biz.monthlyRevenue[1])}/mo</p>
                    <p className="text-gray-500 text-xs">🧠{biz.smartsReq}%+ • Risk: {biz.riskLevel}%</p>
                  </div>
                  <button onClick={() => handleStartBusiness(idx)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold ${s.money >= biz.startupCost && s.smarts >= biz.smartsReq ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-gray-600 text-gray-400'}`}>Start</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Investments */}
      {s.age >= 18 && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-2">📈 Investments</h3>
          {s.investments.length > 0 && (
            <div className="space-y-2 mb-3">
              {s.investments.map(inv => (
                <div key={inv.id} className="bg-gray-700 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{inv.icon} {inv.name}</p>
                      <p className="text-green-400 text-sm">{formatMoney(inv.amount)}</p>
                      <p className="text-gray-400 text-xs">{inv.yearsHeld}yr • Last: {inv.currentReturn >= 0 ? '+' : ''}{inv.currentReturn.toFixed(1)}%</p>
                    </div>
                    <button onClick={() => handleSellInvestment(inv.id)} className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-xs font-medium">Sell</button>
                  </div>
                </div>
              ))}
              <p className="text-gray-400 text-xs text-right">Total invested: {formatMoney(s.investments.reduce((sum, i) => sum + i.amount, 0))}</p>
            </div>
          )}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {investmentTypes.map((inv, idx) => (
              <div key={idx} className="bg-gray-700 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{inv.icon} {inv.name}</p>
                  <p className="text-gray-400 text-xs">Min: {formatMoney(inv.minInvest)} • Return: {inv.returnRange[0]}% to {inv.returnRange[1]}%</p>
                  <p className="text-gray-500 text-xs">Risk: {inv.riskLevel}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {[1000, 5000, 10000].filter(amt => amt >= inv.minInvest && s.money >= amt).map(amt => (
                    <button key={amt} onClick={() => handleInvest(idx, amt)}
                      className="bg-green-500/80 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-400">{formatMoney(amt)}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ====== ASSETS TAB ======
  const renderAssetsTab = () => (
    <div className="pb-24 space-y-4">
      {/* Phone Section */}
      {s.age >= 10 && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-2">📱 Phone</h3>
          <div className="bg-gray-700 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{phoneTiers[s.phone.tier]?.icon || '📟'}</span>
                <div>
                  <p className="text-white font-medium">{s.phone.name}</p>
                  <p className="text-gray-400 text-xs">
                    {s.phone.chatLatency > 0 ? `${s.phone.chatLatency / 1000}s chat delay` : 'Instant chat'}
                    {s.phone.hasCall ? ' • 📞 Voice calls' : ''}
                  </p>
                </div>
              </div>
              <span className="text-gray-500 text-xs">Tier {s.phone.tier + 1}/4</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs mb-2">Upgrade your phone for faster texting and voice calls!</p>
          <div className="bg-gray-700/50 rounded-lg p-2 mb-2 text-xs">
            <p className="text-blue-400 mb-1">📱 <strong>Noki</strong>: +15% relationship bonus on chats • Read receipts</p>
            <p className="text-green-400">📱 <strong>Moto</strong>: 15% cheaper • Emoji reactions on messages</p>
          </div>
          <div className="space-y-2">
            {phoneTiers.filter(t => t.id > s.phone.tier).map(tier => (
              <div key={tier.id} className="bg-gray-700 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">{tier.icon} Tier {tier.id + 1}: {tier.description}</p>
                    <p className="text-yellow-400 text-xs">{formatMoney(tier.cost)}</p>
                    <p className="text-gray-500 text-xs">
                      {tier.chatLatency > 0 ? `${tier.chatLatency / 1000}s delay` : 'No delay'}
                      {tier.hasCall ? ' • Voice calls' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUpgradePhone(tier.id, 1)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${s.money >= tier.cost ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-gray-600 text-gray-400'}`}>
                    {tier.brand1Name} ({formatMoney(tier.cost)})
                  </button>
                  <button onClick={() => handleUpgradePhone(tier.id, 2)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${s.money >= Math.round(tier.cost * 0.85) ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-gray-600 text-gray-400'}`}>
                    {tier.brand2Name} ({formatMoney(Math.round(tier.cost * 0.85))})
                  </button>
                </div>
              </div>
            ))}
            {phoneTiers.filter(t => t.id > s.phone.tier).length === 0 && (
              <p className="text-emerald-400 text-sm text-center">✨ You have the best phone!</p>
            )}
          </div>
        </div>
      )}

      {s.assets.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-3">🏠 Your Assets</h3>
          {s.assets.map(asset => (
            <div key={asset.id} className="bg-gray-700 rounded-xl p-3 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{asset.category === 'vehicle' ? '🚗' : '🏠'} {asset.name}</p>
                  <p className="text-green-400 text-sm">Value: {formatMoney(asset.currentValue)}</p>
                  <p className="text-gray-400 text-xs">Paid: {formatMoney(asset.purchasePrice)} • Condition: {asset.condition}%</p>
                </div>
                <button onClick={() => handleSellAsset(asset.id)} className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-sm font-medium">Sell</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {s.age >= 16 && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-3">🚗 Vehicles</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {vehicles.map((v, idx) => (
              <div key={idx} className="bg-gray-700 rounded-xl p-3 flex items-center justify-between">
                <div><p className="text-white font-medium text-sm">{v.name}</p><p className="text-yellow-400 text-sm">{formatMoney(v.cost)}</p></div>
                <button onClick={() => handleBuyAsset(v as typeof v & { category: 'vehicle' | 'property' })}
                  className={`px-3 py-1 rounded-lg text-sm font-bold ${s.money >= v.cost ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-gray-600 text-gray-400'}`}>Buy</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {s.age >= 18 && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-3">🏠 Properties</h3>
          <p className="text-gray-400 text-xs mb-2">Buying property = you live there (saves rent!)</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {properties.map((p, idx) => (
              <div key={idx} className="bg-gray-700 rounded-xl p-3 flex items-center justify-between">
                <div><p className="text-white font-medium text-sm">{p.name}</p><p className="text-yellow-400 text-sm">{formatMoney(p.cost)}</p></div>
                <button onClick={() => handleBuyAsset(p as typeof p & { category: 'vehicle' | 'property' })}
                  className={`px-3 py-1 rounded-lg text-sm font-bold ${s.money >= p.cost ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-gray-600 text-gray-400'}`}>Buy</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ====== RELATIONSHIPS TAB ======
  const renderRelationshipsTab = () => {
    const aliveRels = s.relationships.filter(r => r.alive && r.type !== 'ex' && r.type !== 'classmate' && r.type !== 'coworker' && r.type !== 'schoolmate');
    const hasPartner = s.relationships.some(r => (r.type === 'partner' || r.type === 'spouse') && r.alive);
    const partner = s.relationships.find(r => (r.type === 'partner' || r.type === 'spouse') && r.alive);

    return (
      <div className="pb-24 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {s.age >= 16 && !hasPartner && (<button onClick={handleDateSomeone} className="bg-pink-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-pink-400 active:scale-95">💕 Find Date</button>)}
          {partner?.type === 'partner' && s.age >= 18 && (<button onClick={handleMarry} className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-400 active:scale-95">💒 Propose</button>)}
          {s.relationships.some(r => r.type === 'spouse' && r.alive) && s.age >= 18 && (<button onClick={handleHaveChild} className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-400 active:scale-95">👶 Have Child</button>)}
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-3">👥 Relationships</h3>
          {aliveRels.length === 0 ? (<p className="text-gray-400 text-sm">No relationships yet.</p>) : (
            <div className="space-y-2">
              {aliveRels.map(rel => (
                <div key={rel.id}>
                  <button onClick={() => setSelectedRel(selectedRel === rel.id ? null : rel.id)} className="w-full bg-gray-700 rounded-xl p-3 text-left hover:bg-gray-650 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {rel.type === 'parent' ? (rel.gender === 'male' ? '👨' : '👩') : rel.type === 'sibling' ? (rel.gender === 'male' ? '👦' : '👧') :
                           rel.type === 'partner' ? '💕' : rel.type === 'spouse' ? '💍' : rel.type === 'child' ? '👶' : rel.type === 'friend' ? '⭐' : '👤'}
                        </span>
                        <div><p className="text-white font-medium">{rel.name}</p><p className="text-gray-400 text-xs capitalize">{rel.type} • Age {rel.age}</p></div>
                      </div>
                      <div className="text-right">
                        <div className="w-16 bg-gray-600 rounded-full h-2"><div className={`h-full rounded-full ${rel.relationship > 70 ? 'bg-green-400' : rel.relationship > 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${rel.relationship}%` }} /></div>
                        <p className="text-gray-400 text-xs mt-1">{rel.relationship}%</p>
                      </div>
                    </div>
                  </button>
                  {selectedRel === rel.id && (
                    <div className="bg-gray-700/50 rounded-xl p-3 mt-1 flex flex-wrap gap-2">
                      <button onClick={() => handleInteractRelationship(rel.id, 'spend_time')} className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/30">🕐 Time</button>
                      <button onClick={() => handleInteractRelationship(rel.id, 'compliment')} className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/30">😊 Compliment</button>
                      <button onClick={() => handleInteractRelationship(rel.id, 'gift')} className="bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-500/30">🎁 Gift</button>
                      <button onClick={() => handleAIInteract(rel.id, 'talk')} className="bg-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-cyan-500/30">💬 Talk</button>
                      <button onClick={() => handleAIInteract(rel.id, 'joke')} className="bg-pink-500/20 text-pink-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-pink-500/30">😄 Joke</button>
                      <button onClick={() => handleAIInteract(rel.id, 'dinner')} className="bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-500/30">🍽️ Dinner</button>
                      <button onClick={() => handleInteractRelationship(rel.id, 'argue')} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30">😡 Argue</button>
                      {(rel.type === 'partner' || rel.type === 'spouse') && (<button onClick={() => handleBreakup(rel.id)} className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30">💔 Break Up</button>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ====== ACTIVITIES TAB ======
  const renderActivitiesTab = () => {
    const availableActivities = activities.filter(a => s.age >= a.minAge);
    const categories = [...new Set(availableActivities.map(a => a.category))];

    return (
      <div className="pb-24 space-y-4">
        {s.isInJail ? (<div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center"><p className="text-gray-400">Can't do activities in jail.</p></div>) : (
          categories.map(cat => (
            <div key={cat} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <h3 className="text-white font-bold mb-3 capitalize">{cat === 'fitness' ? '💪' : cat === 'leisure' ? '🎯' : cat === 'social' ? '🎉' : cat === 'education' ? '📚' : cat === 'vice' ? '🎰' : '🎨'} {cat}</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableActivities.filter(a => a.category === cat).map((activity, idx) => (
                  <button key={idx} onClick={() => handleActivity(activities.indexOf(activity))}
                    className={`bg-gray-700 rounded-xl p-3 text-left hover:bg-gray-600 active:scale-95 transition-all ${s.money < activity.cost ? 'opacity-50' : ''}`}>
                    <div className="text-xl mb-1">{activity.icon}</div>
                    <p className="text-white text-sm font-medium">{activity.name}</p>
                    {activity.cost > 0 && <p className="text-yellow-400 text-xs">{formatMoney(activity.cost)}</p>}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // ====== EDUCATION TAB ======
  const renderEducationTab = () => {
    const availableEdu = educationPaths.filter(e => {
      if (e.key === 'high_school') return false;
      if (s.education.includes(e.key)) return false;
      if ((e.key === 'college' || e.key === 'community_college') && !s.education.includes('high_school')) return false;
      if (['grad_school', 'med_school', 'law_school'].includes(e.key) && !s.education.includes('college')) return false;
      return true;
    });

    return (
      <div className="pb-24 space-y-4">
        {s.isInSchool && s.currentEducation && s.currentEducation !== 'high_school' && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-1">📚 Currently Enrolled</h3>
            <p className="text-blue-100 text-lg font-bold">{s.currentEducation.replace(/_/g, ' ')}</p>
            <p className="text-blue-200 text-sm">{s.educationYearsLeft} year(s) remaining</p>
          </div>
        )}
        {s.education.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <h3 className="text-white font-bold mb-3">🎓 Degrees</h3>
            {s.education.map((edu, idx) => (
              <div key={idx} className="bg-gray-700 rounded-xl p-3 flex items-center gap-3 mb-2">
                <span className="text-2xl">🎓</span><span className="text-white font-medium capitalize">{edu.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}
        {!s.isInSchool && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <h3 className="text-white font-bold mb-3">🏫 Enroll</h3>
            {s.age < 18 ? (<p className="text-gray-400 text-sm">Finish high school first.</p>) :
             availableEdu.length === 0 ? (<p className="text-gray-400 text-sm">{s.education.includes('high_school') ? "No more programs." : "Need high school diploma."}</p>) : (
              <div className="space-y-2">
                {availableEdu.map((edu, idx) => (
                  <div key={idx} className="bg-gray-700 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{edu.name}</p>
                      <p className="text-gray-400 text-xs">{edu.duration}yr • {formatMoney(edu.cost)} • 🧠{edu.smartsReq}%+</p>
                    </div>
                    <button onClick={() => handleEnroll(edu.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold ${s.smarts >= edu.smartsReq && s.money >= edu.cost ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-gray-600 text-gray-400'}`}>Enroll</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ====== CRIME TAB ======
  const renderCrimeTab = () => (
    <div className="pb-24 space-y-4">
      {s.isInJail && (<div className="bg-gradient-to-r from-red-700 to-orange-700 rounded-2xl p-4"><h3 className="text-white font-bold">🔒 In Prison</h3><p className="text-red-100">{s.jailYearsLeft} year(s) remaining</p></div>)}
      {s.criminalRecord > 0 && (<div className="bg-gray-800 rounded-2xl p-4 border border-gray-700"><h3 className="text-white font-bold">📋 Criminal Record</h3><p className="text-red-400">Severity: {s.criminalRecord}</p></div>)}
      <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
        <h3 className="text-white font-bold mb-3">🦹 Crime</h3>
        {s.isInJail ? (<p className="text-gray-400 text-sm">In jail.</p>) : s.age < 14 ? (<p className="text-gray-400 text-sm">Too young.</p>) : (
          <div className="space-y-2">
            {crimes.map((crime, idx) => (
              <button key={idx} onClick={() => handleCrime(idx)} className="w-full bg-gray-700 rounded-xl p-3 text-left hover:bg-gray-600 active:scale-95 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{crime.icon}</span>
                    <div>
                      <p className="text-white font-medium">{crime.name}</p>
                      <p className="text-gray-400 text-xs">Success: {Math.round(crime.successRate * 100)}% • Reward: {formatMoney(crime.reward)} • Risk: {crime.jailTime}yr</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { key: 'life', icon: '🧬' },
    { key: 'chat', icon: '💬' },
    { key: 'school', icon: '🏫' },
    { key: 'job', icon: '💼' },
    { key: 'finance', icon: '💰' },
    { key: 'assets', icon: '🏠' },
    { key: 'people', icon: '👥' },
    { key: 'fun', icon: '🎯' },
    { key: 'edu', icon: '📚' },
    { key: 'crime', icon: '🦹' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-900">
      {renderNotifications()}
      <div className="max-w-lg mx-auto p-4 pt-2">
        {/* Save button */}
        <div className="flex justify-end mb-1">
          <button onClick={() => { setSaveSlots(getAllSlots()); setShowSaveMenu(true); }}
            className="bg-gray-800 text-gray-400 hover:text-white px-3 py-1 rounded-lg text-xs font-medium border border-gray-700 hover:border-gray-500 transition-all flex items-center gap-1">
            💾 Save/Load
          </button>
        </div>
        {s.activeTab === 'life' && renderLifeTab()}
        {s.activeTab === 'school' && renderSchoolTab()}
        {s.activeTab === 'job' && renderJobTab()}
        {s.activeTab === 'finance' && renderFinanceTab()}
        {s.activeTab === 'assets' && renderAssetsTab()}
        {s.activeTab === 'people' && renderRelationshipsTab()}
        {s.activeTab === 'fun' && renderActivitiesTab()}
        {s.activeTab === 'edu' && renderEducationTab()}
        {s.activeTab === 'crime' && renderCrimeTab()}
        {s.activeTab === 'chat' && <ChatScreen state={s} onStateChange={setState} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 safe-area-bottom">
        <div className="flex justify-center -mt-5">
          <button onClick={handleAgeUp}
            className="bg-emerald-500 hover:bg-emerald-400 text-white w-14 h-14 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center text-2xl font-black active:scale-90 transition-all border-4 border-gray-800"
            title="Age +1">+1</button>
        </div>
        <div className="flex justify-around px-1 py-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setState({ ...s, activeTab: tab.key })}
              className={`flex flex-col items-center py-1 px-1 rounded-lg transition-all min-w-0 ${s.activeTab === tab.key ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <span className="text-base">{tab.icon}</span>
              <span className="text-[8px] font-medium mt-0.5 capitalize">{tab.key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
