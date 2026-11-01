export const CAT_FACTS = [
  {
    text: 'Cats often sleep 12–16 hours a day.',
    source: 'PetMD',
    url: 'https://www.petmd.com/cat/behavior/why-do-cats-sleep-so-much',
  },
  {
    text: 'Daily play gives cats exercise and stimulation.',
    source: 'Seattle Humane',
    url: 'https://www.seattlehumane.org/resource-library/play-with-your-cat/',
  },
  {
    text: 'Whiskers help cats judge spaces and nearby things.',
    source: 'Blue Cross',
    url: 'https://www.bluecross.org.uk/advice/cat/wellbeing-and-care/why-do-cats-have-whiskers',
  },
  {
    text: 'Cats may be most active around dawn and dusk.',
    source: 'PetMD',
    url: 'https://www.petmd.com/cat/behavior/why-do-cats-sleep-so-much',
  },
];

const NEED_THOUGHTS = {
  hunger: {
    mild: ['My tummy is rumbling.', 'I could eat a little something.'],
    urgent: ["I'm hungry! Could I have some food?", "I'm really hungry!"],
  },
  thirst: {
    mild: ['A fresh sip would be lovely.', 'I could use a little water.'],
    urgent: ["I'm thirsty. Could I have fresh water?", "I'm very thirsty!"],
  },
  play: {
    mild: ['I could use a play break!', 'Want to play for a bit?'],
    urgent: ['I really need some playtime!', 'Could we play soon?'],
  },
  fatigue: {
    mild: ['I could use a cozy nap.', "I'm getting sleepy."],
    urgent: ["I'm tired. Can I rest?", "I'm very tired. A nap, please!"],
  },
};

const PERSONALITY_THOUGHTS = {
  shy: { pet: 'That was gentle. Thank you.', bird: 'A bird... I will watch from here.', toy: 'Maybe I can catch it.' },
  playful: { pet: 'More pets, please!', bird: 'Can we chase it?', toy: 'I am going to catch that feather!' },
  curious: { pet: 'What are you doing? I like it.', bird: 'What is that outside?', toy: 'I wonder where it will go.' },
  cuddly: { pet: 'Purr! Stay close?', bird: 'I will watch from your side.', toy: 'That was fun. Cuddle break?' },
};

function randomIndex(random, length) {
  const value = Number(random());
  const bounded = Number.isFinite(value) ? Math.max(0, Math.min(value, 1 - Number.EPSILON)) : 0;
  return Math.floor(bounded * length);
}

export function chooseCatThought(cat, random = Math.random, previousFactIndex = -1, previousNeedText = null) {
  const needs = cat?.needs ?? {};
  const mostUrgent = Object.entries(NEED_THOUGHTS)
    .map(([need, thoughts]) => ({ need, thoughts, value: needs[need] ?? 0 }))
    .sort((left, right) => right.value - left.value)[0];
  if (mostUrgent.value >= 45) {
    const urgency = mostUrgent.value >= 70 ? 'urgent' : 'mild';
    const options = mostUrgent.thoughts[urgency];
    const available = options.filter((text) => text !== previousNeedText);
    const text = (available.length ? available : options)[randomIndex(random, (available.length || options.length))];
    return {
      text,
      source: null,
      kind: 'need',
      factIndex: null,
      need: mostUrgent.need,
      urgency,
    };
  }

  const available = CAT_FACTS.map((fact, index) => ({ ...fact, factIndex: index }))
    .filter(({ factIndex }) => factIndex !== previousFactIndex);
  const selected = available[randomIndex(random, available.length)];
  return { ...selected, kind: 'fact' };
}

export function catBehaviorThought(action, personality = 'curious', bond = 0) {
  const thoughts = {
    food: 'That smells delicious!',
    pet: 'Purr. I like this!',
    water: 'Glug, glug. Thank you!',
    play: 'Boing! Again!',
    toy: 'That feather is fun!',
    treat: 'What a tasty surprise!',
    brush: 'My fur feels lovely!',
    walk: 'So many things to sniff!',
    rest: 'Nap time. Purr-fect.',
    sit: 'Taking a little pause.',
    stretch: 'A very big stretch!',
    groom: 'Time to tidy my fur.',
    perch: 'What a lovely view!',
    bird: 'A bird! Let’s watch!',
    bed: 'This bed is so cozy.',
  };
  const bondedThoughts = {
    pet: 'Your pets are my favorite!',
    treat: 'I trust you to pick the best treats!',
    brush: 'I like getting groomed by you.',
    toy: 'We make a great team!',
  };
  if (bond >= 70 && bondedThoughts[action]) return bondedThoughts[action];
  return PERSONALITY_THOUGHTS[personality]?.[action] ?? thoughts[action] ?? 'What a cozy place.';
}
