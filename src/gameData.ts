// ============ NAMES & GENERATION ============
export const maleNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
  'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
  'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin',
  'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank',
  'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose',
  'Nathan', 'Henry', 'Peter', 'Douglas', 'Zachary', 'Kyle', 'Noah', 'Ethan',
  'Liam', 'Mason', 'Logan', 'Lucas', 'Aiden', 'Oliver', 'Elijah', 'Sebastian'
];

export const femaleNames = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan',
  'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra',
  'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol',
  'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura',
  'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda',
  'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine',
  'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
  'Diane', 'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia', 'Victoria',
  'Kelly', 'Lauren', 'Christina', 'Joan', 'Evelyn', 'Judith', 'Megan',
  'Andrea', 'Cheryl', 'Hannah', 'Jacqueline', 'Martha', 'Gloria', 'Teresa',
  'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Aria', 'Ella'
];

export const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
  'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Phillips', 'Evans', 'Turner',
  'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
  'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan',
  'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim',
  'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James',
  'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo'
];

export const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Japan', 'Brazil', 'Mexico', 'Italy', 'Spain', 'South Korea',
  'India', 'Sweden', 'Norway', 'Netherlands', 'Switzerland', 'Argentina'
];

// ============ SCHOOL ============
export interface SchoolEvent {
  text: string;
  choices: { text: string; effects: Partial<StatEffects> }[];
}

export interface StatEffects {
  happiness: number;
  health: number;
  smarts: number;
  looks: number;
  money: number;
  karma: number;
  discipline: number;
  popularity: number;
  relationship?: { name: string; type: string; change: number };
  criminal?: number;
}

export const schoolEvents: SchoolEvent[] = [
  {
    text: 'A classmate is copying your test answers.',
    choices: [
      { text: 'Tell the teacher', effects: { karma: 5, popularity: -5, smarts: 2 } },
      { text: 'Let them copy', effects: { karma: -3, popularity: 5 } },
      { text: 'Cover your paper', effects: { karma: 2 } },
      { text: 'Give wrong answers', effects: { karma: -5, popularity: -3, smarts: 2 } },
    ]
  },
  {
    text: 'You found $20 on the school floor.',
    choices: [
      { text: 'Turn it in', effects: { karma: 10, happiness: 3 } },
      { text: 'Keep it', effects: { money: 20, karma: -5, happiness: 5 } },
      { text: 'Ask around', effects: { karma: 8, popularity: 3 } },
    ]
  },
  {
    text: 'A bully is picking on a younger student.',
    choices: [
      { text: 'Stand up to them', effects: { karma: 10, popularity: 5, health: -5, happiness: 5 } },
      { text: 'Get a teacher', effects: { karma: 5, popularity: -2 } },
      { text: 'Walk away', effects: { karma: -3 } },
    ]
  },
  {
    text: 'Your teacher offers extra credit.',
    choices: [
      { text: 'Do the extra work', effects: { smarts: 8, happiness: -3, discipline: 3 } },
      { text: 'Decline politely', effects: {} },
    ]
  },
  {
    text: 'Someone starts a rumor about you.',
    choices: [
      { text: 'Confront them', effects: { popularity: 3, happiness: -5 } },
      { text: 'Ignore it', effects: { karma: 3, happiness: -3 } },
      { text: 'Start a rumor back', effects: { karma: -10, popularity: -5 } },
    ]
  },
  {
    text: 'A friend asks you to skip class.',
    choices: [
      { text: 'Skip with them', effects: { happiness: 5, smarts: -5, popularity: 3, criminal: 1 } },
      { text: 'Stay in class', effects: { smarts: 3, popularity: -2, discipline: 3 } },
      { text: 'Convince them to stay', effects: { karma: 5, smarts: 2 } },
    ]
  },
  {
    text: 'The school science fair is coming up.',
    choices: [
      { text: 'Enter ambitious project', effects: { smarts: 10, happiness: 5 } },
      { text: 'Do the minimum', effects: { smarts: 3 } },
      { text: 'Partner with smart kid', effects: { smarts: 5, popularity: 2 } },
    ]
  },
  {
    text: 'A classmate invites you to their party.',
    choices: [
      { text: 'Go with a gift', effects: { happiness: 8, popularity: 8, money: -25 } },
      { text: 'Go empty-handed', effects: { happiness: 5, popularity: 3 } },
      { text: "Say you're busy", effects: { popularity: -5 } },
    ]
  },
  {
    text: 'Your gym teacher wants you for sports tryouts.',
    choices: [
      { text: 'Try out!', effects: { health: 8, happiness: 5, popularity: 5 } },
      { text: 'Politely decline', effects: {} },
      { text: 'Fake an injury', effects: { karma: -5, health: -2 } },
    ]
  },
  {
    text: 'You have a chance to join the school play.',
    choices: [
      { text: 'Audition!', effects: { happiness: 8, popularity: 5, looks: 2 } },
      { text: 'Help backstage', effects: { karma: 3, smarts: 2 } },
      { text: 'Skip it', effects: {} },
    ]
  },
];

// ============ COLLEGE/UNI EVENTS ============
export const collegeEvents: SchoolEvent[] = [
  {
    text: 'Your professor invited you to a research project.',
    choices: [
      { text: 'Accept enthusiastically', effects: { smarts: 12, happiness: 5, discipline: 5 } },
      { text: 'Too busy partying', effects: { happiness: 5, smarts: -3 } },
    ]
  },
  {
    text: 'Your roommate is being really loud at night.',
    choices: [
      { text: 'Talk to them about it', effects: { karma: 3, happiness: 2, discipline: 2 } },
      { text: 'Report them to RA', effects: { karma: -2, happiness: 3 } },
      { text: 'Join the party!', effects: { happiness: 8, smarts: -3, popularity: 5 } },
      { text: 'Passive-aggressively slam things', effects: { karma: -5, happiness: -3 } },
    ]
  },
  {
    text: 'There\'s a huge college party this weekend.',
    choices: [
      { text: 'Party all night!', effects: { happiness: 12, health: -5, popularity: 8 } },
      { text: 'Go for a bit then study', effects: { happiness: 5, popularity: 3, smarts: 3 } },
      { text: 'Stay home and study', effects: { smarts: 8, happiness: -3, discipline: 5 } },
    ]
  },
  {
    text: 'Your study group needs help with the final project.',
    choices: [
      { text: 'Lead the group', effects: { smarts: 8, popularity: 5, discipline: 3 } },
      { text: 'Do your part only', effects: { smarts: 5, discipline: 2 } },
      { text: 'Let others carry you', effects: { karma: -5, popularity: -3 } },
    ]
  },
  {
    text: 'A classmate asked you on a study date.',
    choices: [
      { text: 'Say yes!', effects: { happiness: 10, smarts: 3, popularity: 3 } },
      { text: 'Keep it professional', effects: { smarts: 5, discipline: 3 } },
      { text: 'Awkwardly decline', effects: { happiness: -3 } },
    ]
  },
  {
    text: 'You got an internship offer at a great company.',
    choices: [
      { text: 'Take it!', effects: { smarts: 10, money: 3000, discipline: 5, happiness: 8 } },
      { text: 'Focus on classes instead', effects: { smarts: 5, discipline: 3 } },
    ]
  },
  {
    text: 'There\'s a protest on campus about tuition.',
    choices: [
      { text: 'Join the protest', effects: { karma: 5, popularity: 5, happiness: 3 } },
      { text: 'Observe from afar', effects: {} },
      { text: 'Post about it online', effects: { popularity: 3 } },
    ]
  },
  {
    text: 'Your professor is offering extra tutoring sessions.',
    choices: [
      { text: 'Attend every one', effects: { smarts: 10, discipline: 5, happiness: -2 } },
      { text: 'Go occasionally', effects: { smarts: 5, discipline: 2 } },
      { text: 'I\'m fine without', effects: {} },
    ]
  },
];

// ============ LIFE EVENTS BY AGE ============
export const childhoodEvents = [
  { text: 'You learned to ride a bike! 🚲', effects: { health: 5, happiness: 8 } },
  { text: 'You made a new friend at the playground. 🤝', effects: { happiness: 10, popularity: 5 } },
  { text: 'You got sick with the flu. 🤒', effects: { health: -10, happiness: -5 } },
  { text: 'Your family went on a vacation! ✈️', effects: { happiness: 15 } },
  { text: 'You won a spelling bee! 🏆', effects: { smarts: 10, happiness: 8, popularity: 3 } },
  { text: 'You fell off the swings. 🩹', effects: { health: -5, happiness: -3 } },
  { text: 'Your parents got you a pet! 🐕', effects: { happiness: 15, karma: 5 } },
  { text: 'You started reading chapter books. 📖', effects: { smarts: 8 } },
  { text: 'You helped an elderly neighbor. 🤝', effects: { karma: 10, happiness: 5 } },
  { text: 'Your birthday party was amazing! 🎂', effects: { happiness: 15, popularity: 5 } },
];

export const teenEvents = [
  { text: 'You got your first smartphone! 📱', effects: { happiness: 10 } },
  { text: 'You started working out. 💪', effects: { health: 8, looks: 5 } },
  { text: 'You got your first part-time job. 💼', effects: { money: 500, happiness: 5 } },
  { text: 'You went to prom! 💃', effects: { happiness: 12, popularity: 5 } },
  { text: "You got your driver's license! 🚗", effects: { happiness: 10, smarts: 3 } },
  { text: 'You experimented with a new style. ✨', effects: { looks: 3, happiness: 5 } },
  { text: 'You stayed up all night studying. 📚', effects: { smarts: 8, health: -5 } },
  { text: 'You volunteered at a local shelter. 🤝', effects: { karma: 12, happiness: 8 } },
];

export const adultEvents = [
  { text: 'You attended a networking event and made great connections. 🤝', effects: { popularity: 8, smarts: 3 } },
  { text: 'You discovered a passion for cooking gourmet meals. 👨‍🍳', effects: { happiness: 8, smarts: 3 } },
  { text: 'You ran a half-marathon! 🏃', effects: { health: 10, happiness: 12, looks: 3 } },
  { text: 'You started a side hustle that\'s doing well! 💰', effects: { money: 5000, happiness: 8 } },
  { text: 'You got a speeding ticket. 🚓', effects: { money: -300, happiness: -5 } },
  { text: 'You won a local trivia competition! 🧠', effects: { smarts: 5, happiness: 8, money: 500 } },
  { text: 'You renovated your living space. 🔨', effects: { happiness: 10, money: -2000 } },
  { text: 'You adopted a rescue pet! 🐱', effects: { happiness: 12, karma: 8 } },
  { text: 'You learned to invest in stocks! 📈', effects: { smarts: 8, money: 3000 } },
  { text: 'You had a health scare that was a wake-up call. ⚠️', effects: { health: -10, happiness: -8, discipline: 10 } },
  { text: 'You organized a charity event! 🎗️', effects: { karma: 15, popularity: 10, happiness: 8 } },
  { text: 'You wrote a blog that went viral! 📝', effects: { popularity: 15, money: 2000 } },
];

export const midlifeEvents = [
  { text: 'You\'re having a midlife crisis... 😰', effects: { happiness: -15 } },
  { text: 'You bought an expensive sports car on impulse! 🏎️', effects: { happiness: 10, money: -35000, looks: 3 } },
  { text: 'You started mentoring younger colleagues. 👨‍🏫', effects: { karma: 10, happiness: 8, popularity: 5 } },
  { text: 'You began writing your memoirs. 📖', effects: { smarts: 5, happiness: 5 } },
  { text: 'You took up golf and it\'s surprisingly fun! ⛳', effects: { happiness: 8, health: 3 } },
  { text: 'An old friend reconnected with you after years. 🤗', effects: { happiness: 12, popularity: 5 } },
  { text: 'You got a big promotion at work! 📈', effects: { money: 15000, happiness: 12 } },
  { text: 'Your doctor said to watch your cholesterol. 🩺', effects: { health: -5, happiness: -5 } },
  { text: 'You started a garden and found peace in it. 🌱', effects: { happiness: 10, health: 5 } },
  { text: 'You considered starting your own business. 💡', effects: { smarts: 5, happiness: 5 } },
];

export const seniorEvents = [
  { text: 'Your grandchild visited and it was wonderful! 👶', effects: { happiness: 20 } },
  { text: 'You started volunteering at the community center. 🏛️', effects: { karma: 12, happiness: 10 } },
  { text: 'You celebrated a major anniversary! 💍', effects: { happiness: 15 } },
  { text: 'You took up painting as a hobby. 🎨', effects: { happiness: 10, smarts: 3 } },
  { text: 'You went on a cruise with your partner. 🚢', effects: { happiness: 15, money: -5000 } },
  { text: 'You wrote your will and got affairs in order. 📋', effects: { discipline: 5, karma: 3 } },
  { text: 'You taught a young neighbor to garden. 🌻', effects: { karma: 10, happiness: 8 } },
  { text: 'Your health took a downturn. 🏥', effects: { health: -15, happiness: -10 } },
  { text: 'You received a lifetime achievement award! 🏆', effects: { happiness: 20, popularity: 15 } },
  { text: 'You downsized to a cozier home. 🏡', effects: { happiness: 5, money: 50000 } },
];

// ============ RANDOM EVENTS ============
export interface RandomEvent {
  text: string;
  minAge: number;
  maxAge: number;
  choices: { text: string; effects: Partial<StatEffects> }[];
  probability: number;
}

export const randomEvents: RandomEvent[] = [
  {
    text: 'You found a wallet on the street with $500 in it.',
    minAge: 10, maxAge: 100, probability: 0.05,
    choices: [
      { text: 'Return it', effects: { karma: 15, happiness: 8 } },
      { text: 'Keep the money', effects: { money: 500, karma: -10 } },
    ]
  },
  {
    text: 'A stranger offers you a mysterious pill at a party.',
    minAge: 16, maxAge: 50, probability: 0.04,
    choices: [
      { text: 'Take it', effects: { happiness: 10, health: -15, karma: -5 } },
      { text: 'Refuse', effects: { karma: 5 } },
    ]
  },
  {
    text: 'You won the lottery! 🎉',
    minAge: 18, maxAge: 100, probability: 0.008,
    choices: [
      { text: 'Celebrate!', effects: { money: 100000, happiness: 25 } },
    ]
  },
  {
    text: 'You were in a minor car accident.',
    minAge: 16, maxAge: 100, probability: 0.03,
    choices: [
      { text: 'Go to the hospital', effects: { health: -10, money: -2000 } },
      { text: 'Walk it off', effects: { health: -20 } },
      { text: 'Sue the other driver', effects: { money: 5000, karma: -5 } },
    ]
  },
  {
    text: 'You received an inheritance from a distant relative.',
    minAge: 18, maxAge: 100, probability: 0.02,
    choices: [
      { text: 'Accept graciously', effects: { money: 25000, happiness: 10 } },
      { text: 'Donate to charity', effects: { karma: 20, happiness: 15 } },
    ]
  },
  {
    text: 'Someone broke into your home!',
    minAge: 18, maxAge: 100, probability: 0.03,
    choices: [
      { text: 'Call the police', effects: { money: -1000, happiness: -10 } },
      { text: 'Confront the burglar', effects: { health: -15, happiness: -5, karma: 5 } },
    ]
  },
  {
    text: 'A viral video of you goes online!',
    minAge: 12, maxAge: 100, probability: 0.03,
    choices: [
      { text: 'Embrace the fame', effects: { popularity: 15, happiness: 8 } },
      { text: 'Try to remove it', effects: { happiness: -5 } },
      { text: 'Monetize it', effects: { money: 2000, popularity: 10 } },
    ]
  },
  {
    text: 'You found a stray dog.',
    minAge: 8, maxAge: 100, probability: 0.04,
    choices: [
      { text: 'Adopt it', effects: { happiness: 12, karma: 10, money: -200 } },
      { text: 'Take to shelter', effects: { karma: 8 } },
      { text: 'Leave it', effects: { karma: -5 } },
    ]
  },
  {
    text: 'A friend invites you to invest in their startup.',
    minAge: 22, maxAge: 100, probability: 0.04,
    choices: [
      { text: 'Invest $5,000', effects: { money: -5000 } },
      { text: 'Politely decline', effects: {} },
      { text: 'Invest $1,000', effects: { money: -1000 } },
    ]
  },
  // 30+ events
  {
    text: 'Your investment paid off massively!',
    minAge: 28, maxAge: 100, probability: 0.04,
    choices: [
      { text: 'Reinvest', effects: { money: 20000, smarts: 5 } },
      { text: 'Cash out and celebrate', effects: { money: 15000, happiness: 15 } },
    ]
  },
  {
    text: 'A headhunter offers you an amazing job opportunity.',
    minAge: 25, maxAge: 60, probability: 0.05,
    choices: [
      { text: 'Take the meeting', effects: { money: 10000, happiness: 8, smarts: 3 } },
      { text: 'Loyal to current job', effects: { karma: 5, discipline: 3 } },
    ]
  },
  {
    text: 'You discovered a talent for public speaking!',
    minAge: 25, maxAge: 100, probability: 0.03,
    choices: [
      { text: 'Start giving talks', effects: { popularity: 10, money: 3000, happiness: 8 } },
      { text: 'Keep it to myself', effects: { smarts: 3 } },
    ]
  },
  {
    text: 'Your neighbor wants you to invest in real estate together.',
    minAge: 30, maxAge: 100, probability: 0.04,
    choices: [
      { text: 'Go for it!', effects: { money: -10000, smarts: 5 } },
      { text: 'Too risky', effects: {} },
    ]
  },
  {
    text: 'You got into a fender bender. The other driver is furious.',
    minAge: 16, maxAge: 100, probability: 0.03,
    choices: [
      { text: 'Apologize sincerely', effects: { karma: 5, money: -500 } },
      { text: 'Argue with them', effects: { happiness: -5, karma: -3 } },
      { text: 'Exchange insurance info calmly', effects: { discipline: 3 } },
    ]
  },
  {
    text: 'You were offered a book deal to write about your life!',
    minAge: 35, maxAge: 100, probability: 0.02,
    choices: [
      { text: 'Write the book!', effects: { money: 25000, happiness: 15, popularity: 10, smarts: 5 } },
      { text: 'Too personal, decline', effects: { happiness: -3 } },
    ]
  },
  {
    text: 'Your company is downsizing. Layoffs are coming.',
    minAge: 25, maxAge: 65, probability: 0.04,
    choices: [
      { text: 'Work extra hard to stay', effects: { discipline: 8, happiness: -8, health: -5 } },
      { text: 'Start looking elsewhere', effects: { smarts: 3, happiness: -3 } },
      { text: 'Volunteer for the buyout', effects: { money: 20000, happiness: 5 } },
    ]
  },
  {
    text: 'An old friend wants to reconnect after years.',
    minAge: 28, maxAge: 100, probability: 0.05,
    choices: [
      { text: 'Meet up with them!', effects: { happiness: 12, popularity: 5 } },
      { text: 'Too much has changed', effects: { happiness: -3 } },
    ]
  },
  {
    text: 'You found out your credit score is excellent!',
    minAge: 22, maxAge: 100, probability: 0.04,
    choices: [
      { text: 'Apply for better rates', effects: { money: 3000, happiness: 5 } },
      { text: 'Nice, keep saving', effects: { discipline: 3, happiness: 3 } },
    ]
  },
  {
    text: 'A pipe burst in your home causing water damage!',
    minAge: 20, maxAge: 100, probability: 0.03,
    choices: [
      { text: 'Call a plumber ASAP', effects: { money: -3000, happiness: -5 } },
      { text: 'Try to fix it yourself', effects: { money: -500, health: -5, smarts: 3 } },
      { text: 'File insurance claim', effects: { money: -1000, happiness: -3 } },
    ]
  },
  {
    text: 'Your doctor recommends a healthier lifestyle.',
    minAge: 30, maxAge: 100, probability: 0.05,
    choices: [
      { text: 'Join a gym and eat healthy', effects: { health: 12, happiness: 3, looks: 5, money: -500 } },
      { text: 'Promise to do better', effects: { health: 3 } },
      { text: 'Ignore the advice', effects: { health: -5, karma: -3 } },
    ]
  },
];

// ============ JOBS ============
export interface Job {
  title: string;
  salary: number;
  requirements: { smarts?: number; looks?: number; age?: number; education?: string; health?: number };
  category: string;
  stressLevel: number;
}

export const jobs: Job[] = [
  { title: 'Fast Food Worker', salary: 18000, requirements: { age: 16 }, category: 'food', stressLevel: 30 },
  { title: 'Cashier', salary: 20000, requirements: { age: 16 }, category: 'retail', stressLevel: 25 },
  { title: 'Dog Walker', salary: 15000, requirements: { age: 14 }, category: 'animals', stressLevel: 10 },
  { title: 'Janitor', salary: 22000, requirements: { age: 18 }, category: 'maintenance', stressLevel: 20 },
  { title: 'Warehouse Worker', salary: 28000, requirements: { age: 18 }, category: 'labor', stressLevel: 40 },
  { title: 'Gas Station Attendant', salary: 19000, requirements: { age: 16 }, category: 'retail', stressLevel: 20 },
  { title: 'Landscaper', salary: 25000, requirements: { age: 18 }, category: 'labor', stressLevel: 35 },
  { title: 'Grocery Bagger', salary: 16000, requirements: { age: 14 }, category: 'retail', stressLevel: 15 },
  { title: 'Office Assistant', salary: 30000, requirements: { age: 18, education: 'high_school' }, category: 'office', stressLevel: 25 },
  { title: 'Security Guard', salary: 32000, requirements: { age: 18, education: 'high_school' }, category: 'security', stressLevel: 35 },
  { title: 'Mechanic', salary: 38000, requirements: { age: 18, education: 'high_school', smarts: 30 }, category: 'trades', stressLevel: 30 },
  { title: 'Electrician', salary: 42000, requirements: { age: 18, education: 'high_school', smarts: 35 }, category: 'trades', stressLevel: 30 },
  { title: 'Bank Teller', salary: 30000, requirements: { age: 18, education: 'high_school', smarts: 40 }, category: 'finance', stressLevel: 25 },
  { title: 'Receptionist', salary: 28000, requirements: { age: 18, education: 'high_school' }, category: 'office', stressLevel: 20 },
  { title: 'Construction Worker', salary: 36000, requirements: { age: 18, education: 'high_school' }, category: 'labor', stressLevel: 45 },
  { title: 'Firefighter', salary: 45000, requirements: { age: 18, education: 'high_school', health: 50 }, category: 'emergency', stressLevel: 60 },
  { title: 'Police Officer', salary: 48000, requirements: { age: 21, education: 'high_school', health: 40 }, category: 'law', stressLevel: 65 },
  { title: 'Accountant', salary: 55000, requirements: { age: 22, education: 'college', smarts: 50 }, category: 'finance', stressLevel: 40 },
  { title: 'Marketing Specialist', salary: 52000, requirements: { age: 22, education: 'college', smarts: 40 }, category: 'business', stressLevel: 35 },
  { title: 'Software Developer', salary: 80000, requirements: { age: 22, education: 'college', smarts: 60 }, category: 'tech', stressLevel: 45 },
  { title: 'Teacher', salary: 45000, requirements: { age: 22, education: 'college', smarts: 45 }, category: 'education', stressLevel: 50 },
  { title: 'Nurse', salary: 60000, requirements: { age: 22, education: 'college', smarts: 50 }, category: 'medical', stressLevel: 55 },
  { title: 'Graphic Designer', salary: 48000, requirements: { age: 22, education: 'college', smarts: 35 }, category: 'creative', stressLevel: 30 },
  { title: 'Engineer', salary: 75000, requirements: { age: 22, education: 'college', smarts: 65 }, category: 'engineering', stressLevel: 45 },
  { title: 'Financial Analyst', salary: 68000, requirements: { age: 22, education: 'college', smarts: 55 }, category: 'finance', stressLevel: 50 },
  { title: 'Real Estate Agent', salary: 50000, requirements: { age: 22, education: 'college', looks: 30 }, category: 'sales', stressLevel: 40 },
  { title: 'Architect', salary: 65000, requirements: { age: 22, education: 'college', smarts: 60 }, category: 'creative', stressLevel: 40 },
  { title: 'Lawyer', salary: 95000, requirements: { age: 25, education: 'grad_school', smarts: 70 }, category: 'law', stressLevel: 70 },
  { title: 'Doctor', salary: 150000, requirements: { age: 26, education: 'med_school', smarts: 80 }, category: 'medical', stressLevel: 75 },
  { title: 'Surgeon', salary: 250000, requirements: { age: 30, education: 'med_school', smarts: 90 }, category: 'medical', stressLevel: 85 },
  { title: 'Professor', salary: 85000, requirements: { age: 28, education: 'grad_school', smarts: 75 }, category: 'education', stressLevel: 40 },
  { title: 'Data Scientist', salary: 110000, requirements: { age: 24, education: 'grad_school', smarts: 70 }, category: 'tech', stressLevel: 45 },
  { title: 'Investment Banker', salary: 130000, requirements: { age: 24, education: 'grad_school', smarts: 75 }, category: 'finance', stressLevel: 80 },
  { title: 'Dentist', salary: 120000, requirements: { age: 26, education: 'med_school', smarts: 65 }, category: 'medical', stressLevel: 40 },
  { title: 'Actor', salary: 35000, requirements: { age: 18, looks: 50 }, category: 'entertainment', stressLevel: 40 },
  { title: 'Model', salary: 40000, requirements: { age: 18, looks: 70 }, category: 'entertainment', stressLevel: 35 },
  { title: 'Professional Athlete', salary: 80000, requirements: { age: 18, health: 80 }, category: 'sports', stressLevel: 50 },
  { title: 'Chef', salary: 40000, requirements: { age: 18, education: 'high_school' }, category: 'food', stressLevel: 50 },
  { title: 'Pilot', salary: 90000, requirements: { age: 23, education: 'college', smarts: 60, health: 50 }, category: 'aviation', stressLevel: 45 },
];

// ============ ASSETS ============
export interface Asset {
  name: string;
  category: 'vehicle' | 'property' | 'luxury';
  cost: number;
  condition: number;
  appreciation: number;
}

export const vehicles: Omit<Asset, 'condition'>[] = [
  { name: 'Used Honda Civic', category: 'vehicle', cost: 8000, appreciation: -8 },
  { name: 'Used Toyota Corolla', category: 'vehicle', cost: 7500, appreciation: -8 },
  { name: 'Ford Focus', category: 'vehicle', cost: 18000, appreciation: -12 },
  { name: 'Honda Accord', category: 'vehicle', cost: 25000, appreciation: -10 },
  { name: 'Toyota Camry', category: 'vehicle', cost: 27000, appreciation: -10 },
  { name: 'BMW 3 Series', category: 'vehicle', cost: 42000, appreciation: -15 },
  { name: 'Mercedes C-Class', category: 'vehicle', cost: 45000, appreciation: -15 },
  { name: 'Tesla Model 3', category: 'vehicle', cost: 40000, appreciation: -12 },
  { name: 'Porsche 911', category: 'vehicle', cost: 100000, appreciation: -8 },
  { name: 'Ferrari 488', category: 'vehicle', cost: 280000, appreciation: -5 },
  { name: 'Lamborghini Huracán', category: 'vehicle', cost: 260000, appreciation: -5 },
  { name: 'Ford F-150', category: 'vehicle', cost: 35000, appreciation: -10 },
  { name: 'Jeep Wrangler', category: 'vehicle', cost: 32000, appreciation: -5 },
  { name: 'Motorcycle', category: 'vehicle', cost: 8000, appreciation: -10 },
];

export const properties: Omit<Asset, 'condition'>[] = [
  { name: 'Studio Apartment', category: 'property', cost: 80000, appreciation: 3 },
  { name: '1-Bedroom Condo', category: 'property', cost: 150000, appreciation: 3 },
  { name: '2-Bedroom Apartment', category: 'property', cost: 200000, appreciation: 3 },
  { name: 'Small House', category: 'property', cost: 250000, appreciation: 4 },
  { name: 'Suburban Home', category: 'property', cost: 350000, appreciation: 4 },
  { name: 'Large Family Home', category: 'property', cost: 500000, appreciation: 4 },
  { name: 'Luxury Condo', category: 'property', cost: 800000, appreciation: 5 },
  { name: 'Beach House', category: 'property', cost: 1200000, appreciation: 5 },
  { name: 'Mansion', category: 'property', cost: 3000000, appreciation: 5 },
  { name: 'Penthouse', category: 'property', cost: 5000000, appreciation: 6 },
];

// ============ HOUSING & LIVING ============
export interface HousingOption {
  name: string;
  type: 'rent' | 'own';
  monthlyCost: number; // rent or mortgage payment
  quality: number; // 1-10 happiness bonus
  icon: string;
}

export const rentalOptions: HousingOption[] = [
  { name: 'Parents\' House', type: 'rent', monthlyCost: 0, quality: 3, icon: '🏠' },
  { name: 'Shared Room', type: 'rent', monthlyCost: 400, quality: 2, icon: '🛏️' },
  { name: 'Studio Apartment', type: 'rent', monthlyCost: 800, quality: 4, icon: '🏢' },
  { name: '1-Bedroom Apt', type: 'rent', monthlyCost: 1200, quality: 5, icon: '🏢' },
  { name: '2-Bedroom Apt', type: 'rent', monthlyCost: 1600, quality: 6, icon: '🏠' },
  { name: 'Nice House Rental', type: 'rent', monthlyCost: 2200, quality: 7, icon: '🏡' },
  { name: 'Luxury Apartment', type: 'rent', monthlyCost: 3500, quality: 9, icon: '🏙️' },
];

export const monthlyExpenses = {
  food: { basic: 200, average: 400, fancy: 800 },
  electricity: { basic: 80, average: 150, fancy: 300 },
  insurance: { basic: 100, average: 200, fancy: 400 },
  phone: 80,
  internet: 60,
  transportation: 150,
};

// ============ ACTIVITIES ============
export interface Activity {
  name: string;
  icon: string;
  category: 'fitness' | 'leisure' | 'social' | 'education' | 'vice' | 'hobby';
  effects: Partial<StatEffects>;
  cost: number;
  minAge: number;
}

export const activities: Activity[] = [
  { name: 'Go to the Gym', icon: '💪', category: 'fitness', effects: { health: 8, looks: 3, happiness: 5 }, cost: 0, minAge: 12 },
  { name: 'Go for a Run', icon: '🏃', category: 'fitness', effects: { health: 5, happiness: 3 }, cost: 0, minAge: 8 },
  { name: 'Yoga', icon: '🧘', category: 'fitness', effects: { health: 5, happiness: 8 }, cost: 20, minAge: 14 },
  { name: 'Martial Arts', icon: '🥋', category: 'fitness', effects: { health: 8, happiness: 5, discipline: 5 }, cost: 50, minAge: 6 },
  { name: 'Read a Book', icon: '📚', category: 'education', effects: { smarts: 5, happiness: 3 }, cost: 0, minAge: 6 },
  { name: 'Study', icon: '📖', category: 'education', effects: { smarts: 8, happiness: -3, discipline: 3 }, cost: 0, minAge: 6 },
  { name: 'Learn Instrument', icon: '🎸', category: 'hobby', effects: { smarts: 3, happiness: 5 }, cost: 30, minAge: 6 },
  { name: 'Watch TV', icon: '📺', category: 'leisure', effects: { happiness: 5, smarts: -2 }, cost: 0, minAge: 3 },
  { name: 'Play Video Games', icon: '🎮', category: 'leisure', effects: { happiness: 8, health: -2 }, cost: 0, minAge: 5 },
  { name: 'Go to Movies', icon: '🎬', category: 'leisure', effects: { happiness: 8 }, cost: 15, minAge: 5 },
  { name: 'Go to Concert', icon: '🎵', category: 'social', effects: { happiness: 12 }, cost: 80, minAge: 14 },
  { name: 'Party', icon: '🎉', category: 'social', effects: { happiness: 10, health: -5, popularity: 5 }, cost: 30, minAge: 16 },
  { name: 'Volunteer', icon: '🤝', category: 'social', effects: { karma: 12, happiness: 5 }, cost: 0, minAge: 12 },
  { name: 'Meditate', icon: '🧠', category: 'leisure', effects: { happiness: 8, health: 3 }, cost: 0, minAge: 10 },
  { name: 'Travel', icon: '✈️', category: 'leisure', effects: { happiness: 15, smarts: 3 }, cost: 2000, minAge: 18 },
  { name: 'Go to a Bar', icon: '🍺', category: 'vice', effects: { happiness: 5, health: -5, looks: -2 }, cost: 40, minAge: 21 },
  { name: 'Go to the Spa', icon: '💆', category: 'leisure', effects: { happiness: 10, looks: 5, health: 3 }, cost: 100, minAge: 16 },
  { name: 'Go on a Diet', icon: '🥗', category: 'fitness', effects: { health: 5, looks: 5, happiness: -5 }, cost: 0, minAge: 14 },
  { name: 'Take a Vacation', icon: '🏖️', category: 'leisure', effects: { happiness: 20, health: 5 }, cost: 3000, minAge: 18 },
  { name: 'Gambling', icon: '🎰', category: 'vice', effects: { happiness: 3, karma: -3 }, cost: 100, minAge: 21 },
  { name: 'Gardening', icon: '🌱', category: 'hobby', effects: { happiness: 8, health: 3, karma: 3 }, cost: 50, minAge: 10 },
  { name: 'Photography', icon: '📷', category: 'hobby', effects: { happiness: 8, smarts: 3 }, cost: 30, minAge: 12 },
  { name: 'Cooking Class', icon: '👨‍🍳', category: 'hobby', effects: { happiness: 8, smarts: 5 }, cost: 100, minAge: 16 },
  { name: 'Painting', icon: '🎨', category: 'hobby', effects: { happiness: 10, smarts: 3 }, cost: 50, minAge: 8 },
  { name: 'Fishing', icon: '🎣', category: 'hobby', effects: { happiness: 8, health: 3 }, cost: 20, minAge: 8 },
  { name: 'Host a Dinner Party', icon: '🍽️', category: 'social', effects: { happiness: 12, popularity: 8, karma: 3 }, cost: 200, minAge: 22 },
  { name: 'Join a Sports League', icon: '⚽', category: 'fitness', effects: { health: 10, happiness: 8, popularity: 5 }, cost: 100, minAge: 18 },
  { name: 'Start a Podcast', icon: '🎙️', category: 'hobby', effects: { popularity: 8, smarts: 3, money: 500 }, cost: 200, minAge: 18 },
  { name: 'Learn to Code', icon: '💻', category: 'education', effects: { smarts: 10, money: 1000 }, cost: 200, minAge: 14 },
  { name: 'Wine Tasting', icon: '🍷', category: 'social', effects: { happiness: 8, looks: 2, popularity: 3 }, cost: 80, minAge: 21 },
  { name: 'Therapy Session', icon: '🛋️', category: 'leisure', effects: { happiness: 15, health: 5 }, cost: 150, minAge: 16 },
];

// ============ CRIME ============
export interface Crime {
  name: string;
  icon: string;
  successRate: number;
  reward: number;
  jailTime: number;
  effects: Partial<StatEffects>;
}

export const crimes: Crime[] = [
  { name: 'Shoplift', icon: '🛒', successRate: 0.7, reward: 50, jailTime: 0.5, effects: { karma: -5, criminal: 1 } },
  { name: 'Pick Pocket', icon: '👛', successRate: 0.5, reward: 200, jailTime: 1, effects: { karma: -8, criminal: 2 } },
  { name: 'Burglary', icon: '🏠', successRate: 0.35, reward: 5000, jailTime: 3, effects: { karma: -15, criminal: 5 } },
  { name: 'Grand Theft Auto', icon: '🚗', successRate: 0.25, reward: 15000, jailTime: 5, effects: { karma: -20, criminal: 8 } },
  { name: 'Rob a Bank', icon: '🏦', successRate: 0.1, reward: 100000, jailTime: 15, effects: { karma: -30, criminal: 15 } },
  { name: 'Tax Fraud', icon: '📄', successRate: 0.4, reward: 20000, jailTime: 4, effects: { karma: -12, criminal: 6 } },
  { name: 'Insurance Fraud', icon: '📋', successRate: 0.45, reward: 15000, jailTime: 3, effects: { karma: -15, criminal: 5 } },
];

// ============ EDUCATION ============
export interface Education {
  name: string;
  duration: number;
  cost: number;
  smartsReq: number;
  key: string;
}

export const educationPaths: Education[] = [
  { name: 'High School', duration: 4, cost: 0, smartsReq: 0, key: 'high_school' },
  { name: 'Community College', duration: 2, cost: 10000, smartsReq: 25, key: 'community_college' },
  { name: 'University', duration: 4, cost: 40000, smartsReq: 40, key: 'college' },
  { name: 'Graduate School', duration: 2, cost: 30000, smartsReq: 60, key: 'grad_school' },
  { name: 'Medical School', duration: 4, cost: 80000, smartsReq: 75, key: 'med_school' },
  { name: 'Law School', duration: 3, cost: 60000, smartsReq: 65, key: 'law_school' },
];

// ============ SCHOOL CLUBS ============
export interface SchoolClub {
  name: string;
  icon: string;
  benefit: string;
  minAge: number;
}

export const schoolClubs: SchoolClub[] = [
  { name: 'Chess Club', icon: '♟️', benefit: '+Smarts', minAge: 6 },
  { name: 'Art Club', icon: '🎨', benefit: '+Creativity', minAge: 6 },
  { name: 'Drama Club', icon: '🎭', benefit: '+Popularity', minAge: 10 },
  { name: 'Science Club', icon: '🔬', benefit: '+Smarts', minAge: 10 },
  { name: 'Sports Team', icon: '⚽', benefit: '+Fitness', minAge: 8 },
  { name: 'Music Band', icon: '🎵', benefit: '+Happiness', minAge: 10 },
  { name: 'Debate Team', icon: '🗣️', benefit: '+Smarts +Pop', minAge: 12 },
  { name: 'Student Council', icon: '🏛️', benefit: '+Discipline', minAge: 12 },
  { name: 'Coding Club', icon: '💻', benefit: '+Smarts', minAge: 12 },
  { name: 'Robotics Team', icon: '🤖', benefit: '+Smarts', minAge: 14 },
  { name: 'Track & Field', icon: '🏃', benefit: '+Fitness', minAge: 10 },
];

// ============ JOB TASKS ============
export interface JobTask {
  name: string;
  gameType: 'math' | 'typing' | 'memory' | 'scramble' | 'reaction' | 'clickspeed' | 'pattern';
}

export const jobTasks: Record<string, JobTask[]> = {
  food: [{ name: 'Take Orders', gameType: 'memory' }, { name: 'Prep Food', gameType: 'clickspeed' }],
  retail: [{ name: 'Stock Shelves', gameType: 'clickspeed' }, { name: 'Process Returns', gameType: 'math' }],
  office: [{ name: 'File Reports', gameType: 'typing' }, { name: 'Organize Files', gameType: 'memory' }],
  tech: [{ name: 'Debug Code', gameType: 'pattern' }, { name: 'Write Code', gameType: 'typing' }],
  medical: [{ name: 'Patient Records', gameType: 'typing' }, { name: 'Diagnose Patient', gameType: 'pattern' }],
  finance: [{ name: 'Balance Sheets', gameType: 'math' }, { name: 'Risk Analysis', gameType: 'pattern' }],
  education: [{ name: 'Grade Papers', gameType: 'typing' }, { name: 'Prepare Lesson', gameType: 'memory' }],
  creative: [{ name: 'Design Layout', gameType: 'memory' }, { name: 'Client Presentation', gameType: 'typing' }],
  law: [{ name: 'Legal Research', gameType: 'typing' }, { name: 'Case Analysis', gameType: 'pattern' }],
  labor: [{ name: 'Heavy Lifting', gameType: 'clickspeed' }, { name: 'Assembly Work', gameType: 'reaction' }],
  trades: [{ name: 'Wire Circuit', gameType: 'pattern' }, { name: 'Install Parts', gameType: 'clickspeed' }],
  entertainment: [{ name: 'Rehearsal', gameType: 'memory' }, { name: 'Performance', gameType: 'reaction' }],
  sports: [{ name: 'Training Session', gameType: 'clickspeed' }, { name: 'Game Day', gameType: 'reaction' }],
  security: [{ name: 'Patrol', gameType: 'reaction' }, { name: 'Monitor Cameras', gameType: 'memory' }],
  emergency: [{ name: 'Emergency Response', gameType: 'reaction' }, { name: 'Fitness Training', gameType: 'clickspeed' }],
  business: [{ name: 'Market Analysis', gameType: 'pattern' }, { name: 'Budget Planning', gameType: 'math' }],
  engineering: [{ name: 'Calculate Specs', gameType: 'math' }, { name: 'Design Review', gameType: 'pattern' }],
  media: [{ name: 'Write Article', gameType: 'typing' }, { name: 'Research Story', gameType: 'scramble' }],
  sales: [{ name: 'Client Pitch', gameType: 'typing' }, { name: 'Market Research', gameType: 'pattern' }],
  animals: [{ name: 'Walk Dogs', gameType: 'clickspeed' }, { name: 'Feed Animals', gameType: 'memory' }],
  maintenance: [{ name: 'Clean Floors', gameType: 'clickspeed' }, { name: 'Fix Equipment', gameType: 'reaction' }],
  aviation: [{ name: 'Pre-flight Check', gameType: 'memory' }, { name: 'Navigation', gameType: 'math' }],
  default: [{ name: 'Complete Task', gameType: 'typing' }, { name: 'Problem Solving', gameType: 'pattern' }],
};

// ============ BUSINESS ============
export interface BusinessType {
  name: string;
  icon: string;
  startupCost: number;
  monthlyRevenue: [number, number]; // min, max
  monthlyCost: number;
  riskLevel: number; // 0-100
  smartsReq: number;
}

export const businessTypes: BusinessType[] = [
  { name: 'Food Truck', icon: '🚚', startupCost: 30000, monthlyRevenue: [3000, 8000], monthlyCost: 2000, riskLevel: 40, smartsReq: 25 },
  { name: 'Online Store', icon: '🛍️', startupCost: 5000, monthlyRevenue: [500, 5000], monthlyCost: 300, riskLevel: 30, smartsReq: 35 },
  { name: 'Restaurant', icon: '🍕', startupCost: 100000, monthlyRevenue: [8000, 25000], monthlyCost: 12000, riskLevel: 60, smartsReq: 40 },
  { name: 'Tech Startup', icon: '💻', startupCost: 50000, monthlyRevenue: [0, 50000], monthlyCost: 8000, riskLevel: 80, smartsReq: 65 },
  { name: 'Gym', icon: '🏋️', startupCost: 80000, monthlyRevenue: [5000, 15000], monthlyCost: 5000, riskLevel: 45, smartsReq: 30 },
  { name: 'Laundromat', icon: '👕', startupCost: 40000, monthlyRevenue: [3000, 7000], monthlyCost: 2000, riskLevel: 20, smartsReq: 20 },
  { name: 'Real Estate Agency', icon: '🏘️', startupCost: 60000, monthlyRevenue: [5000, 30000], monthlyCost: 5000, riskLevel: 50, smartsReq: 50 },
  { name: 'Consulting Firm', icon: '📊', startupCost: 20000, monthlyRevenue: [5000, 20000], monthlyCost: 3000, riskLevel: 35, smartsReq: 60 },
];

// ============ PHONES ============
// Brand 1 = Noki (Apple-like): Reliable, +relationship boost, no lag spikes
// Brand 2 = Moto (Samsung-like): Feature-rich, cheaper, voice effects, emojis
export interface PhoneTier {
  id: number;
  brand1Name: string;
  brand2Name: string;
  cost: number;
  chatLatency: number; // milliseconds
  hasCall: boolean;
  icon: string;
  description: string;
}

export interface PhoneBrandFeatures {
  name: string;
  color: string;
  relationBonus: number; // % bonus to relationship gains
  priceMultiplier: number; // cost multiplier
  voicePitch: number; // for TTS effects
  hasEmojiReactions: boolean;
  hasReadReceipts: boolean;
  specialty: string;
}

export const phoneBrands: Record<string, PhoneBrandFeatures> = {
  noki: { 
    name: 'Noki', 
    color: '#3B82F6', // blue
    relationBonus: 15, // 15% more relationship per chat
    priceMultiplier: 1.0, 
    voicePitch: 1.0,
    hasEmojiReactions: false,
    hasReadReceipts: true,
    specialty: 'Reliability & Relationship+' 
  },
  moto: { 
    name: 'Moto', 
    color: '#10B981', // green
    relationBonus: 0,
    priceMultiplier: 0.85, // 15% cheaper
    voicePitch: 1.1, // slightly different voice
    hasEmojiReactions: true,
    hasReadReceipts: false,
    specialty: 'Cheap & Emoji Reactions' 
  },
};

export const phoneTiers: PhoneTier[] = [
  { id: 0, brand1Name: 'NokiBrick', brand2Name: 'MotoBlock', cost: 0, chatLatency: 1500, hasCall: false, icon: '📟', description: 'Basic SMS only' },
  { id: 1, brand1Name: 'NokiFlip', brand2Name: 'MotoFlap', cost: 2500, chatLatency: 500, hasCall: false, icon: '📱', description: 'Faster texting + Games' },
  { id: 2, brand1Name: 'NokiSmart', brand2Name: 'MotoPhone', cost: 35000, chatLatency: 0, hasCall: true, icon: '📲', description: 'Instant chat + Soma' },
  { id: 3, brand1Name: 'NokiPro', brand2Name: 'MotoPro', cost: 120000, chatLatency: 0, hasCall: true, icon: '📳', description: 'Premium + No Soma delay' },
];

// ============ INVESTMENTS ============
export interface InvestmentType {
  name: string;
  icon: string;
  minInvest: number;
  returnRange: [number, number]; // annual % return range (can be negative)
  riskLevel: string;
}

export const investmentTypes: InvestmentType[] = [
  { name: 'Savings Account', icon: '🏦', minInvest: 100, returnRange: [1, 3], riskLevel: 'Low' },
  { name: 'Bonds', icon: '📜', minInvest: 1000, returnRange: [2, 6], riskLevel: 'Low' },
  { name: 'Index Fund', icon: '📈', minInvest: 500, returnRange: [-5, 15], riskLevel: 'Medium' },
  { name: 'Individual Stocks', icon: '📊', minInvest: 100, returnRange: [-30, 40], riskLevel: 'High' },
  { name: 'Real Estate Fund', icon: '🏠', minInvest: 5000, returnRange: [-10, 20], riskLevel: 'Medium' },
  { name: 'Cryptocurrency', icon: '₿', minInvest: 50, returnRange: [-50, 100], riskLevel: 'Very High' },
];

// ============ HELPER FUNCTIONS ============

export function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function generateName(gender: 'male' | 'female'): string {
  const firstNames = gender === 'male' ? maleNames : femaleNames;
  return randomFromArray(firstNames);
}

export function generateFullName(gender: 'male' | 'female'): { first: string; last: string } {
  return { first: generateName(gender), last: randomFromArray(lastNames) };
}

export function formatMoney(amount: number): string {
  if (amount < 0) return '-$' + Math.abs(amount).toLocaleString();
  return '$' + amount.toLocaleString();
}
