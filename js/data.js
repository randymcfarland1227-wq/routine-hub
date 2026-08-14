// Snapshot of routines from the "Routines" Google Sheet.
// Edit this file directly when routines change, or ask Claude to re-sync it from the Sheet.

const CATEGORIES = [
  { id: 'mind',       label: 'Mind',       icon: '🧠', blurb: 'Mental clarity, reflection, learning' },
  { id: 'body',       label: 'Body',       icon: '💪', blurb: 'Fitness, nourishment, physical self-care' },
  { id: 'soul',       label: 'Soul',       icon: '✨', blurb: 'Grounding, fulfillment, creative practice' },
  { id: 'cleaning',   label: 'Cleaning',   icon: '🧹', blurb: 'Keeping the space physically clean' },
  { id: 'organizing', label: 'Organizing', icon: '🗂️', blurb: 'Admin, planning, finances, upkeep' },
  { id: 'dog',        label: 'Marvel',     icon: '🐾', blurb: 'Grooming, training, bonding, supplies' },
];

// freq: sort weight, higher = more frequent. active:false = currently paused per the sheet.
const ROUTINES = [
  // ---------- MIND ----------
  { category: 'mind', focus: 'Healthy Minds Session', why: 'To aid in mental growth for being present', what: 'Healthy Minds intentional session', frequency: 'Daily', freq: 7, duration: '5 mins a day', object: 'Healthy Minds App', active: true },
  { category: 'mind', focus: 'Journaling', why: 'To channel joys and desires — reflection on optimism, not bad things', what: 'Journaling a page or paragraph', frequency: '3x / week', freq: 3, duration: 'Beginning, mid, end of week', object: 'Notes, Google Doc, Paper, Bear', active: true },
  { category: 'mind', focus: 'Reading', why: 'To grow attention span while learning and relaxing the mind', what: 'Reading 10–15 pages', frequency: '2x / week', freq: 2, duration: '2x / week', object: 'Books', active: true },
  { category: 'mind', focus: 'Clothes Audit', why: 'To feel confident in my inventory and best reflect my personal style and life', what: 'Monthly Goodwill / clothing audit', frequency: 'Monthly', freq: 0.25, duration: 'Monthly', object: 'Money, closet audit', active: false },

  // ---------- BODY ----------
  { category: 'body', focus: 'Cardio Training', why: 'To build endurance for summer and festival season', what: 'Stairmaster, treadmill, walking', frequency: '3x / week', freq: 3, duration: '15 min sessions', object: 'Gym, time', active: true },
  { category: 'body', focus: 'Protein Intake', why: 'To give the body the proper resources to grow strength', what: 'Meal prepping, protein shakes, clean eating', frequency: 'Daily', freq: 7, duration: '189g a day', object: 'Food shopping, protein powder', active: true },
  { category: 'body', focus: 'Vitamins / Supplements', why: 'To support recovery and well-being', what: 'Daily vitamins, creatine and fiber', frequency: 'Daily', freq: 7, duration: 'Reset pill organizer on Sunday', object: 'Vitamins and supplements', active: true },
  { category: 'body', focus: 'Abdominal Training', why: 'To grow abdominal region, internal muscles and sculpt physique', what: 'Ab-focused gym session', frequency: '2x / week', freq: 2, duration: 'Abs, 2x / week', object: 'Gym, time', active: true },
  { category: 'body', focus: 'Water Intake', why: 'To properly hydrate the body and support endurance and recovery', what: 'Drinking water', frequency: 'Daily', freq: 7, duration: '3–4 liters or 4–5 bottles (32oz)', object: 'Water bottle, citrus occasionally', active: true },
  { category: 'body', focus: 'Moisturize Body', why: 'To support skin health and elasticity', what: 'Moisturize entire body after shower', frequency: '4x / week', freq: 4, duration: 'Every day or every 2 days', object: 'Lotion', active: true },
  { category: 'body', focus: 'Feet Care', why: 'To support flexibility and decrease dead skin cells', what: 'Footbath, pumice stone, urea cream', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Urea cream', active: true },
  { category: 'body', focus: 'Weekly Bath', why: 'To aid muscle recovery and support relaxation', what: 'Nourishing bath with epsom salt', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Epsom salt', active: true },
  { category: 'body', focus: 'Washing Face / Complexion', why: 'To help even complexion and increase moisture barrier', what: 'Wash face, moisturize', frequency: 'Daily', freq: 7, duration: 'Daily, bi-daily shave', object: 'Face wash, moisturizer, razors', active: true },
  { category: 'body', focus: 'Getting Haircut', why: 'To aid hair growth and evenness', what: 'Schedule haircut (Mira or Towson shop)', frequency: 'Monthly', freq: 0.25, duration: 'Bi-weekly or monthly', object: 'Money', active: false },

  // ---------- SOUL ----------
  { category: 'soul', focus: 'Main Session', why: 'To place the most emphasis on the current week’s topic', what: 'Main session from hub', frequency: '2x / week', freq: 2, duration: '45 min session', object: 'Sessions list', active: true },
  { category: 'soul', focus: 'Support Session', why: 'To give awareness to a supplementary category', what: 'Support session from hub', frequency: 'Weekly', freq: 1, duration: '20 mins / week', object: 'Sessions list', active: true },
  { category: 'soul', focus: 'Maintenance Session', why: 'To keep visibility on last week’s focus', what: 'Maintenance session from hub', frequency: 'Weekly', freq: 1, duration: '10–15 mins', object: 'Sessions list', active: true },
  { category: 'soul', focus: 'Monthly Review', why: 'To review growth and observe strategic direction', what: 'Review all content and interest from prior month', frequency: 'Monthly', freq: 0.25, duration: '45 mins', object: 'Sessions list', active: false },

  // ---------- CLEANING ----------
  { category: 'cleaning', focus: 'Wash Bedding', why: 'To help with complexion and overall dust', what: 'Strip duvet and all covers on weekend', frequency: 'Weekly', freq: 1, duration: 'End of week', object: 'Detergent', active: true },
  { category: 'cleaning', focus: 'Vacuum Room', why: 'To help deal with Marvel’s hair and dust', what: 'Vacuum after mom gets off work', frequency: '4x / week', freq: 4, duration: 'When mom isn’t working', object: 'Vacuum', active: true },
  { category: 'cleaning', focus: 'Wipe Room Surfaces', why: 'To keep surfaces clean and space peaceful', what: 'Wipe down surfaces', frequency: '4x / week', freq: 4, duration: '4x / week', object: 'Rags, cleaner', active: true },
  { category: 'cleaning', focus: 'Vacuum Car', why: 'To keep the car clean and peaceful', what: 'Clean car on the way back from the gym', frequency: 'Weekly', freq: 1, duration: 'Once a week, maybe Saturdays', object: 'Quarters', active: true },
  { category: 'cleaning', focus: 'Clean Laundry', why: 'To ensure smooth daily life and peace', what: 'Clean, wash and put away all clothes', frequency: 'Weekly', freq: 1, duration: 'Weekly, maybe Fridays', object: 'Detergent', active: true },
  { category: 'cleaning', focus: 'Clean Phone / Laptop / Glasses', why: 'To take care of belongings and feel at peace', what: 'Alcohol and screen wipes to remove grime and dust', frequency: '2x / week', freq: 2, duration: 'Twice a week', object: 'Alcohol wipes', active: true },
  { category: 'cleaning', focus: 'Clean Tote Bag', why: 'To feel prepared and organized', what: 'Take out non-needed things, audit contents', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'N/A', active: true },
  { category: 'cleaning', focus: 'Clean Headphones', why: 'To promote ear health and sound quality', what: 'Alcohol wipes to remove wax and dirt', frequency: 'Weekly', freq: 1, duration: 'Once a week, maybe Sundays', object: 'Alcohol wipes', active: true },

  // ---------- ORGANIZING ----------
  { category: 'organizing', focus: 'Digital Declutter', why: 'To reduce digital noise and clutter', what: 'Delete old messages, emails, and unused apps', frequency: 'Weekly', freq: 1, duration: 'Once a week, maybe Sundays', object: 'Planner', active: true },
  { category: 'organizing', focus: 'Water Plants', why: 'To keep plants healthy and alive', what: 'Bottom water all plants (see Plant Care)', frequency: 'Weekly', freq: 1, duration: 'Once a week, maybe Sundays', object: 'Big plastic container', active: true },
  { category: 'organizing', focus: 'Organize Drawers', why: 'To keep tools and possessions available', what: 'Organize dresser drawers and contents', frequency: 'Bi-weekly', freq: 0.5, duration: 'Weekly / bi-weekly', object: 'N/A', active: true },
  { category: 'organizing', focus: 'Weekly Grocery Shop', why: 'To enable other growth topics and save money', what: 'Instacart or in-store shop', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Food stamps / money', active: true },
  { category: 'organizing', focus: 'Meal Prepping', why: 'To enable convenience, healthy eating, and summer goals', what: 'Prep ingredients for the week, freeze what needs to last', frequency: 'Weekly', freq: 1, duration: 'Weekly, 45 mins', object: 'Grocery shopping, clean kitchen', active: true },
  { category: 'organizing', focus: 'Personal Finance Allocation', why: 'To ensure all bills and personal expenses are allocated', what: 'Review upcoming bills and needed expenses, allocate', frequency: 'Weekly', freq: 1, duration: 'Weekly, 30 mins', object: 'Randall', active: true },
  { category: 'organizing', focus: 'Savings Allocations', why: 'To ensure excess funds are put aside', what: 'After personal allocation, move leftover to savings', frequency: 'Weekly', freq: 1, duration: 'Weekly, 10 mins', object: 'Next Steps Doc (Bucket List, Credit, Savings)', active: true },
  { category: 'organizing', focus: 'Needed Purchases', why: 'To ensure an object doesn’t block a growth routine', what: 'Review inventory and sheet for what’s needed', frequency: 'Weekly', freq: 1, duration: 'Weekly, 10 mins', object: 'Short Term Task List', active: true },
  { category: 'organizing', focus: 'Goal / Effort Review', why: 'To ensure effort goes to something wanted', what: 'Review personal / life goals, adjust week structure', frequency: 'Weekly', freq: 1, duration: 'Weekly, 25 mins', object: 'Master Goals (Why) to Routine (How) List', active: true },
  { category: 'organizing', focus: 'Week Planner Prep', why: 'To smoothly complete needed things without drowning', what: 'Fill planner with tasks / projects', frequency: 'Weekly', freq: 1, duration: 'Weekly, Sundays', object: 'Planner', active: true },
  { category: 'organizing', focus: 'Non-Routine Task Review', why: 'To not stay narrowed on routine — also catch one-time items', what: 'Use master task list, plan accordingly', frequency: 'Weekly', freq: 1, duration: 'Weekly, 10 mins', object: 'Short Term Task List', active: true },
  { category: 'organizing', focus: 'Next Step Awareness Review', why: 'To give attention to the bigger plan and feel movement', what: 'Use next step guide, see what can be completed', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Next Steps Doc (Bucket List, Credit, Savings)', active: true },
  { category: 'organizing', focus: 'Family Altruism Review', why: 'To see what effort can go toward independence, ease transitions', what: 'Review bucket list, check status of action items', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Next Steps Doc (Bucket List, Credit, Savings)', active: true },
  { category: 'organizing', focus: 'Family Finance Review', why: 'To give peace of mind on plans and bill status', what: 'Review family finances tracker, update / plan', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'House / Family Hub', active: true },

  // ---------- DOG (Marvel) ----------
  { category: 'dog', focus: 'Daily Brushing', why: 'To help with shedding', what: 'Use brush in AM', frequency: 'Daily', freq: 7, duration: 'Daily', object: '', active: true },
  { category: 'dog', focus: 'Play Sessions', why: 'To give him an outlet for energy', what: 'Tug of war, fetch', frequency: 'Daily', freq: 7, duration: '20–30 mins', object: '', active: true },
  { category: 'dog', focus: 'Cuddling', why: 'To bond and snuggle', what: 'Giving attention to just him', frequency: 'Daily', freq: 7, duration: '20–30 mins', object: '', active: true },
  { category: 'dog', focus: 'Behavior Training', why: 'To help with natural behavior', what: 'Use Marvel hub for commands', frequency: 'Daily', freq: 7, duration: 'Daily, audit weekly', object: '', active: true },
  { category: 'dog', focus: 'Walks', why: 'To help socialization and bonding, and regulate', what: 'Walks around the block', frequency: '4x / week', freq: 4, duration: '20–30 mins', object: 'Leash, clicker, treats, treat tote', active: true },
  { category: 'dog', focus: 'Command Training', why: 'To help with command listening', what: 'Use Marvel hub for commands', frequency: '3x / week', freq: 3, duration: '20–30 mins', object: 'Clicker, treats', active: true },
  { category: 'dog', focus: 'Weekly Vacuum (Marvel)', why: 'To really help with shedding', what: 'Vacuum brush attachment', frequency: 'Weekly', freq: 1, duration: 'Weekly, 20–25 mins', object: 'Vacuum / brush', active: true },
  { category: 'dog', focus: 'Brush Teeth', why: 'For oral health', what: 'Use finger brush to get teeth', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Toothbrush', active: true },
  { category: 'dog', focus: 'Supply Inventory Count', why: 'To see what consumables Marvel needs', what: 'Check food, treats, chews, toys, plan accordingly', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: '', active: true },
  { category: 'dog', focus: 'Behavior Train Audit', why: 'To narrow focus topics for the coming week', what: 'Use hub to plan needed behavioral improvements', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Marvel Guide', active: true },
  { category: 'dog', focus: 'Supply Organization', why: 'To audit Marvel’s existing inventory and see what’s needed', what: 'Clean Marvel’s drawers and stuff around the house', frequency: 'Bi-weekly', freq: 0.5, duration: 'Bi-weekly', object: '', active: true },
  { category: 'dog', focus: 'Clip Nails', why: 'For health, balance, and grip', what: 'Clip nails or take to groomer', frequency: 'Monthly', freq: 0.25, duration: 'Monthly', object: 'Clippers', active: false },
  { category: 'dog', focus: 'Behavioral Audit', why: 'To place findings into action', what: 'Dig into behaviors to work on', frequency: 'Monthly', freq: 0.25, duration: 'Monthly', object: '', active: false },
];

// Reference table, shown inside the Organizing category.
const PLANTS = [
  { group: 'Twice a week', items: [
    { name: 'Baby Roses (mini roses)', light: 'Full sun / strongest direct light (morning window best)', water: 'Every 2–4 days, keep lightly moist', tips: 'Water until it drains. Deadhead blooms. Watch for spider mites in dry heat.' },
    { name: 'Bonsai', light: 'Very bright; often some direct sun', water: 'Every 2–5 days', tips: 'Small pot dries fast — water thoroughly.' },
  ]},
  { group: '1–2x a week', items: [
    { name: 'Fern', light: 'Medium–bright indirect', water: 'Every 3–6 days, evenly moist', tips: 'Loves humidity, hates heater air. Don’t let it dry out fully.' },
    { name: 'Polka Dot Plant', light: 'Bright indirect', water: 'Every 4–7 days, top ½–1" dry', tips: 'Pinch tips for bushiness. Droops fast when thirsty.' },
  ]},
  { group: 'Weekly', items: [
    { name: 'Dottie Calathea (Pink)', light: 'Medium–bright indirect, no direct sun', water: 'Every 5–9 days, top 1" dry', tips: 'Filtered/distilled water helps. Keep away from vents.' },
    { name: 'Calathea Medallion', light: 'Medium–bright indirect, no direct sun', water: 'Every 5–9 days, top 1" dry', tips: 'Leaf curl = too dry (soil or air).' },
    { name: 'Baby Monstera', light: 'Bright indirect', water: 'Every 7–10 days, top ~2" dry', tips: 'Chunky airy soil. Rotate. More light = faster growth.' },
    { name: 'Shamrock (Oxalis)', light: 'Bright indirect, gentle morning sun OK', water: 'Every 7–12 days, top 1–2" dry', tips: 'May go dormant — water way less until new growth returns.' },
  ]},
  { group: 'Biweekly', items: [
    { name: 'Big Monstera', light: 'Bright indirect, tolerates some sun', water: 'Every 10–14 days, top 2–3" dry', tips: 'Deep water and drain fully.' },
    { name: 'Rubber Plant', light: 'Bright indirect, some direct OK', water: 'Every 10–14 days, top 2–3" dry', tips: 'Wipe leaves for better light absorption.' },
    { name: 'Peperomia (Pink)', light: 'Bright indirect → medium', water: 'Every 10–14 days, top half dries', tips: 'Overwatering causes mushy stems.' },
    { name: 'Striped Dracaena', light: 'Medium–bright indirect', water: 'Every 10–18 days, top 2–4" dry', tips: 'Brown tips = minerals/salts; filtered water helps.' },
  ]},
  { group: 'Every 2+ weeks', items: [
    { name: 'Aloe', light: 'Bright light + some direct sun', water: 'Every 2–4 weeks, only when fully dry', tips: 'Succulent soil + drainage.' },
    { name: 'Ghost Echeveria', light: 'Full sun / max light', water: 'Every 2–4+ weeks, fully dry', tips: 'Keep water out of the rosette.' },
    { name: 'ZZ Plant', light: 'Low → bright indirect', water: 'Every 2–4 weeks, mostly dry', tips: 'The #1 danger is overwatering.' },
  ]},
];
