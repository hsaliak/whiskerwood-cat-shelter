export const MAX_CATS = 10;
export const GOOD_MOOD_THRESHOLD = 45;
export const CAT_SIZES = ['small', 'medium', 'fat'];
export const CAT_BUILDS = ['slim', 'average', 'round'];
export const CAT_PERSONALITIES = ['shy', 'playful', 'curious', 'cuddly'];
export const CAT_PATTERNS = ['solid', 'tabby', 'tuxedo', 'calico'];

export const CARE_ACTIONS = {
  food: { hunger: -55, bond: 1, message: 'A tasty meal!' },
  pet: { bond: 3, message: 'Your gentle pets made your cat feel loved!' },
  water: { thirst: -65, bond: 1, message: 'Fresh water!' },
  play: { play: -42, fatigue: 10, bond: 3, message: 'Playtime was a hit!' },
  walk: { play: -32, fatigue: 12, bond: 2, message: 'A lovely little walk!' },
  rest: { fatigue: -55, bond: 1, message: 'A cozy nap restored energy!' },
  treat: { hunger: -18, bond: 3, message: 'A little treat made your cat purr!' },
  brush: { bond: 4, message: 'A gentle brushing strengthened your bond!' },
  toy: { play: -28, fatigue: 8, bond: 3, message: 'Feather-toy time was a hit!' },
};

export const DAILY_EVENTS = [
  {
    title: 'A volunteer brings a feather toy',
    description: 'There is time for one extra play break with the selected cat.',
    actionLabel: 'Share the toy',
    action: 'toy',
    effect: { play: -10, bond: 2 },
    result: 'A cheerful play break brightened the afternoon.',
  },
  {
    title: 'A neighbor shares treats',
    description: 'A small cat-safe treat is available for the selected cat.',
    actionLabel: 'Offer a treat',
    action: 'treat',
    effect: { hunger: -10, bond: 2 },
    result: 'The little treat was enjoyed.',
  },
  {
    title: 'A quiet afternoon at the shelter',
    description: 'A quiet rest break could help the selected cat feel settled.',
    actionLabel: 'Give a cozy rest',
    action: 'rest',
    effect: { fatigue: -8, bond: 2 },
    result: 'A quiet rest made the shelter feel cozy.',
  },
];

const DAILY_NEED_INCREASE = {
  hunger: 18,
  thirst: 22,
  play: 15,
  fatigue: 8,
};

export const SAMPLE_CATS = [
  {
    id: 'marmalade',
    name: 'Marmalade',
    breed: 'Domestic longhair',
    size: 'medium',
    color: 0xe9a35f,
    accent: 0xfff0d7,
    outlineColor: 0x80563f,
    eyeColor: 0x805b35,
    markings: 'tabby',
    fur: 'fluffy',
    personality: 'cuddly',
    bond: 10,
    needs: { hunger: 12, thirst: 8, play: 14, fatigue: 8 },
  },
  {
    id: 'pepper',
    name: 'Pepper',
    breed: 'Russian blue mix',
    size: 'small',
    color: 0x8297b4,
    accent: 0xdce5f0,
    outlineColor: 0x536479,
    eyeColor: 0xa98245,
    markings: 'silver',
    fur: 'sleek',
    personality: 'shy',
    bond: 8,
    needs: { hunger: 8, thirst: 12, play: 10, fatigue: 14 },
  },
];

const ARRIVAL_CATS = [
  {
    id: 'poppy',
    name: 'Poppy',
    breed: 'Domestic shorthair',
    size: 'small',
    color: 0xc98270,
    accent: 0xffe6d8,
    outlineColor: 0x795044,
    eyeColor: 0x725738,
    markings: 'tabby',
    fur: 'sleek',
    personality: 'curious',
    needs: { hunger: 9, thirst: 10, play: 12, fatigue: 8 },
  },
  {
    id: 'juniper',
    name: 'Juniper',
    breed: 'Domestic longhair',
    size: 'medium',
    color: 0x7d8d83,
    accent: 0xe5eadf,
    outlineColor: 0x4f5e56,
    eyeColor: 0xa78a4f,
    markings: 'silver',
    fur: 'fluffy',
    personality: 'cuddly',
    needs: { hunger: 11, thirst: 9, play: 8, fatigue: 12 },
  },
  {
    id: 'mochi',
    name: 'Mochi',
    breed: 'Cream point mix',
    size: 'small',
    color: 0xd8c4a4,
    accent: 0xfff2dc,
    outlineColor: 0x806e59,
    eyeColor: 0x6d91a0,
    markings: 'silver',
    fur: 'sleek',
    personality: 'shy',
    needs: { hunger: 10, thirst: 12, play: 9, fatigue: 10 },
  },
  {
    id: 'fig',
    name: 'Fig',
    breed: 'Domestic shorthair',
    size: 'medium',
    color: 0x66616f,
    accent: 0xd8d0df,
    outlineColor: 0x45414b,
    eyeColor: 0xb7a760,
    markings: 'silver',
    fur: 'sleek',
    personality: 'playful',
    needs: { hunger: 8, thirst: 11, play: 13, fatigue: 9 },
  },
];

export const VISITORS = [
  {
    name: 'Avery',
    type: 'trustworthy',
    avatar: '🧑‍🌾',
    greeting: 'Hello! I brought my carrier and a few questions.',
    acceptResponse: 'They thank you and wait patiently to meet a cat.',
    rejectResponse: 'They understand and leave with a kind word for the cats.',
    description: 'A quiet visitor in a denim jacket, carrying a well-used cat carrier.',
    clues: ['Asked about the cats’ medical history', 'Has already prepared a safe room at home'],
    explanation: 'They asked about health care and prepared a safe home, both signs of a thoughtful adopter.',
    color: '#d89d72',
  },
  {
    name: 'Blake',
    type: 'shifty',
    avatar: '🧑‍💼',
    greeting: 'I am in a hurry. Can I leave with a cat right away?',
    acceptResponse: 'They start asking to take a cat immediately, without answering your questions.',
    rejectResponse: 'They leave quickly when asked about their home plans.',
    description: 'A hurried visitor in a bright coat who keeps checking the time.',
    clues: ['Refuses to answer questions about their home', 'Insists the cat should be an outdoor-only pet'],
    explanation: 'Avoiding basic home questions and dismissing indoor safety suggest the cats may not be cared for safely.',
    color: '#8c7bc3',
  },
  {
    name: 'Casey',
    type: 'trustworthy',
    avatar: '🧑‍🍳',
    greeting: 'I would love to learn about each cat’s routine.',
    acceptResponse: 'They listen carefully and are happy to meet a cat at its own pace.',
    rejectResponse: 'They thank you for your time and leave politely.',
    description: 'A thoughtful visitor with a notebook and a calm, patient manner.',
    clues: ['Brought notes about food and care costs', 'Wants to meet the cat slowly and calmly'],
    explanation: 'Planning for ongoing costs and giving a cat time to adjust are strong signs of a responsible home.',
    color: '#6caaa0',
  },
  {
    name: 'Drew',
    type: 'shifty',
    avatar: '🧑‍🎨',
    greeting: 'I am looking for a cat that matches my room.',
    acceptResponse: 'They focus on appearance and rush to choose more than one cat.',
    rejectResponse: 'They leave disappointed that you asked about veterinary care.',
    description: 'A stylish visitor who talks more about matching fur colors than daily care.',
    clues: ['Says they will not visit a vet', 'Asks to take home more than one cat immediately'],
    explanation: 'Refusing veterinary care and rushing to take several cats are serious welfare concerns.',
    color: '#c87982',
  },
  {
    name: 'Ellis',
    type: 'trustworthy',
    avatar: '🧑‍🔬',
    greeting: 'I have written down a few nearby veterinary clinics.',
    acceptResponse: 'They are glad to talk through the cat’s health and settling-in needs.',
    rejectResponse: 'They accept your decision and wish the cats well.',
    description: 'A soft-spoken visitor with a list of nearby veterinary clinics.',
    clues: ['Has a plan for regular checkups', 'Asked how to help a new cat settle in'],
    explanation: 'Planning for health care and asking about a gradual adjustment show thoughtful preparation.',
    color: '#83a2c0',
  },
  {
    name: 'Finley',
    type: 'shifty',
    avatar: '🧑‍💻',
    greeting: 'I do not think cats need much looking after.',
    acceptResponse: 'They still have no plan for veterinary care or a quiet indoor space.',
    rejectResponse: 'They leave after you explain the shelter’s care standards.',
    description: 'A confident visitor who says cats can look after themselves.',
    clues: ['Does not plan to arrange veterinary care', 'Has no quiet indoor space ready'],
    explanation: 'Skipping veterinary care and lacking a safe settling space are serious care concerns.',
    color: '#d19b63',
  },
  {
    name: 'Harper',
    type: 'trustworthy',
    avatar: '🧑‍🎓',
    greeting: 'I checked that my building allows cats.',
    acceptResponse: 'They are happy to discuss slow introductions to their resident pet.',
    rejectResponse: 'They thank you and say they will prepare more before trying again.',
    description: 'A cheerful visitor who has brought a carrier and questions about routines.',
    clues: ['Checked that their landlord allows pets', 'Plans to introduce the cat slowly to a resident pet'],
    explanation: 'Confirming pet permission and planning a careful introduction help keep the cat safe.',
    color: '#9d8db7',
  },
  {
    name: 'Quinn',
    type: 'shifty',
    avatar: '🧑‍🚀',
    greeting: 'I want a kitten as a surprise for someone.',
    acceptResponse: 'They keep talking about photos instead of the cat’s care needs.',
    rejectResponse: 'They leave after you explain that a pet should never be a surprise.',
    description: 'An energetic visitor hoping to surprise someone with a kitten.',
    clues: ['Has not asked the recipient if they want a pet', 'Wants a kitten for social media photos'],
    explanation: 'A pet should not be a surprise, and choosing one for photos ignores the long-term care it needs.',
    color: '#d5865f',
  },
];

function randomItem(items, random) {
  const value = Number(random());
  const boundedValue = Number.isFinite(value)
    ? Math.max(0, Math.min(value, 1 - Number.EPSILON))
    : 0;
  return items[Math.floor(boundedValue * items.length)];
}

function chooseNextVisitor(previousVisitor, random) {
  const candidates = VISITORS.filter((visitor) => visitor.name !== previousVisitor?.name);
  return randomItem(candidates.length ? candidates : VISITORS, random);
}

export function createInitialState(random = Math.random) {
  return {
    day: 1,
    score: 0,
    cats: SAMPLE_CATS.map((cat) => ({ ...cat, needs: { ...cat.needs } })),
    selectedCatId: SAMPLE_CATS[0].id,
    visitorIndex: 0,
    visitor: randomItem(VISITORS, random),
    assessment: null,
    adoptedToday: false,
    pendingArrival: false,
    pendingArrivalCat: null,
    arrivalIndex: 0,
    lastArrival: null,
    dailyEvent: null,
    message: 'Welcome! Take care of your cats, then assess today’s visitor.',
  };
}

export function addCat(state, cat) {
  if (!cat?.id || state.cats.length >= MAX_CATS || state.cats.some(({ id }) => id === cat.id)) {
    return false;
  }
  state.cats.push({
    ...cat,
    personality: CAT_PERSONALITIES.includes(cat.personality) ? cat.personality : 'curious',
    bond: Math.max(0, Math.min(100, cat.bond ?? 0)),
    needs: { ...cat.needs },
  });
  if (!state.selectedCatId) state.selectedCatId = cat.id;
  return true;
}

export function getMood(cat) {
  const { hunger, thirst, play, fatigue } = cat.needs;
  const highestNeed = Math.max(hunger, thirst, play, fatigue);
  if (highestNeed >= 70) return 'Needs care';
  if (highestNeed >= GOOD_MOOD_THRESHOLD) return 'A little unsettled';
  if (fatigue <= 18) return 'Bright-eyed';
  return 'Content';
}

export function isGoodMood(cat) {
  return Object.values(cat.needs).every((need) => need < GOOD_MOOD_THRESHOLD);
}

function adjustNeed(cat, key, amount) {
  cat.needs[key] = Math.max(0, Math.min(100, cat.needs[key] + amount));
}

export function applyCareAction(state, action) {
  const cat = state.cats.find(({ id }) => id === state.selectedCatId);
  const effect = CARE_ACTIONS[action];
  if (!cat || !effect) return false;

  Object.entries(effect).forEach(([key, amount]) => {
    if (key === 'message') return;
    if (key === 'bond') {
      cat.bond = Math.max(0, Math.min(100, (cat.bond ?? 0) + amount));
      return;
    }
    adjustNeed(cat, key, amount);
  });
  state.message = `${cat.name}: ${effect.message}`;
  return true;
}

export function resolveDailyEvent(state, accept) {
  const event = state.dailyEvent;
  if (!event || event.completed) return false;

  if (accept) {
    const cat = state.cats.find(({ id }) => id === state.selectedCatId);
    if (!cat) return false;
    Object.entries(event.effect).forEach(([key, amount]) => {
      if (key === 'bond') cat.bond = Math.max(0, Math.min(100, (cat.bond ?? 0) + amount));
      else adjustNeed(cat, key, amount);
    });
    state.message = `${cat.name}: ${event.result}`;
  } else {
    state.message = 'You passed on today’s extra activity.';
  }
  event.completed = true;
  return true;
}

export function assessVisitor(state, decision) {
  if (state.assessment || !['accept', 'reject'].includes(decision)) return false;
  const accepted = decision === 'accept';
  const correct = (state.visitor.type === 'trustworthy') === accepted;
  state.score += correct ? 1 : -1;
  state.assessment = { decision, correct, type: state.visitor.type };
  state.adoptedToday = false;
  state.message = correct
    ? `Good call! ${state.visitor.name} was ${state.visitor.type}. +1 point.`
    : `Not quite. ${state.visitor.name} was ${state.visitor.type}. −1 point.`;
  return true;
}

export function canAdopt(state, catId) {
  const cat = state.cats.find(({ id }) => id === catId);
  return Boolean(
    cat &&
      state.assessment?.decision === 'accept' &&
      state.assessment.type === 'trustworthy' &&
      !state.adoptedToday &&
      isGoodMood(cat),
  );
}

export function adoptCat(state, catId) {
  if (!canAdopt(state, catId)) return false;
  const catIndex = state.cats.findIndex(({ id }) => id === catId);
  const [cat] = state.cats.splice(catIndex, 1);
  state.score += 2;
  state.adoptedToday = true;
  state.pendingArrival = true;
  state.selectedCatId = state.cats[0]?.id ?? null;
  state.message = `${cat.name} found a loving home! +2 points.`;
  return true;
}

export function customizeIncomingCat(state, appearance) {
  const cat = state.pendingArrivalCat;
  if (!cat || !appearance || typeof appearance !== 'object') return false;

  if (CAT_SIZES.includes(appearance.size)) cat.size = appearance.size;
  if (CAT_BUILDS.includes(appearance.build)) cat.build = appearance.build;
  if (CAT_PATTERNS.includes(appearance.pattern)) {
    cat.pattern = appearance.pattern;
    cat.markings = appearance.pattern;
  }
  const coatColor = normalizeAppearanceColor(appearance.color);
  const patternColor = normalizeAppearanceColor(appearance.patternColor);
  if (coatColor !== null) cat.color = coatColor;
  if (patternColor !== null) {
    cat.patternColor = patternColor;
    cat.accent = patternColor;
  }
  state.lastArrival = cat;
  return true;
}

function normalizeAppearanceColor(value) {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xffffff) {
    return value;
  }
  if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
    return Number.parseInt(value.slice(1), 16);
  }
  return null;
}

export function welcomeIncomingCat(state) {
  const cat = state.pendingArrivalCat;
  if (!cat || !addCat(state, cat)) return false;
  state.pendingArrivalCat = null;
  state.lastArrival = state.cats.find(({ id }) => id === cat.id);
  state.selectedCatId = cat.id;
  state.message = `${cat.name} has joined the shelter. Welcome!`;
  return true;
}

export function endDay(state, random = Math.random) {
  if (state.pendingArrivalCat) return state;
  state.cats.forEach((cat) => {
    Object.entries(DAILY_NEED_INCREASE).forEach(([need, amount]) => adjustNeed(cat, need, amount));
  });
  state.day += 1;
  state.dailyEvent = state.day % 2 === 0
    ? { ...DAILY_EVENTS[Math.floor(state.day / 2 - 1) % DAILY_EVENTS.length], completed: false }
    : null;
  state.visitorIndex += 1;
  state.visitor = chooseNextVisitor(state.visitor, random);
  state.assessment = null;
  state.adoptedToday = false;
  state.lastArrival = null;

  if (state.pendingArrival && state.cats.length < MAX_CATS) {
    const template = ARRIVAL_CATS[state.arrivalIndex % ARRIVAL_CATS.length];
    const generation = Math.floor(state.arrivalIndex / ARRIVAL_CATS.length) + 1;
    const cat = {
      ...template,
      id: `${template.id}-${state.arrivalIndex + 1}`,
      name: generation === 1 ? template.name : `${template.name} ${generation}`,
      build: 'average',
      personality: template.personality ?? 'curious',
      bond: 0,
      pattern: CAT_PATTERNS.includes(template.markings) ? template.markings : 'tabby',
      patternColor: template.accent ?? 0xfff0d7,
      needs: { ...template.needs },
    };
    state.arrivalIndex += 1;
    state.pendingArrivalCat = cat;
    state.lastArrival = cat;
    state.message = `${cat.name} is waiting to be welcomed into the shelter.`;
  } else {
    state.message = `Day ${state.day}. A new visitor has arrived.`;
  }
  state.pendingArrival = false;
  return state;
}
