// Snapshot of routines from the "Routines" Google Sheet.
// Edit this file directly when routines change, or ask Claude to re-sync it from the Sheet.

// Bi-Weekly Review cadence: first review is this date, then repeats every REVIEW_INTERVAL_DAYS.
const REVIEW_ANCHOR_DATE = '2026-08-15';
const REVIEW_INTERVAL_DAYS = 14;

const CATEGORIES = [
  { id: 'mind',       label: 'Mind',       icon: '🧠', blurb: 'Mental clarity, reflection, learning' },
  { id: 'body',       label: 'Body',       icon: '💪', blurb: 'Fitness, nourishment, physical self-care' },
  { id: 'soul',       label: 'Soul',       icon: '✨', blurb: 'Grounding, fulfillment, creative practice' },
  { id: 'cleaning',   label: 'Cleaning',   icon: '🧹', blurb: 'Keeping the space physically clean' },
  { id: 'organizing', label: 'Organizing', icon: '🗂️', blurb: 'Admin, planning, finances, upkeep' },
  { id: 'dog',        label: 'Marvel',     icon: '🐾', blurb: 'Grooming, training, bonding, supplies' },
];

// freq: sort weight, higher = more frequent. active:false = currently paused per the sheet.
// dateAdded: 'YYYY-MM-DD' — set to today when adding a new routine to get an auto "NEW" badge for 2 weeks.
const ROUTINES = [
  // ---------- MIND ----------
  { id: 'mind-healthy-minds-session', category: 'mind', dateAdded: '2026-01-01', focus: 'Healthy Minds Session', why: 'To aid in mental growth for being present', what: 'Healthy Minds intentional session', frequency: 'Daily', freq: 7, duration: '5 mins a day', object: 'Healthy Minds App', active: true },
  { id: 'mind-journaling', category: 'mind', dateAdded: '2026-01-01', focus: 'Journaling', why: 'To channel joys and desires — reflection on optimism, not bad things', what: 'Journaling a page or paragraph', frequency: '3x / week', freq: 3, duration: 'Beginning, mid, end of week', object: 'Notes, Google Doc, Paper, Bear', active: true },
  { id: 'mind-reading', category: 'mind', dateAdded: '2026-01-01', focus: 'Reading', why: 'To grow attention span while learning and relaxing the mind', what: 'Reading 10–15 pages', frequency: '2x / week', freq: 2, duration: '2x / week', object: 'Books', active: true },
  { id: 'mind-clothes-audit', category: 'mind', dateAdded: '2026-01-01', focus: 'Clothes Audit', why: 'To feel confident in my inventory and best reflect my personal style and life', what: 'Monthly Goodwill / clothing audit', frequency: 'Monthly', freq: 0.25, duration: 'Monthly', object: 'Money, closet audit', active: false },

  // ---------- BODY ----------
  { id: 'body-cardio-training', category: 'body', dateAdded: '2026-01-01', focus: 'Cardio Training', why: 'To build endurance for summer and festival season', what: 'Stairmaster, treadmill, walking', frequency: '3x / week', freq: 3, duration: '15 min sessions', object: 'Gym, time', active: true },
  { id: 'body-protein-intake', category: 'body', dateAdded: '2026-01-01', focus: 'Protein Intake', why: 'To give the body the proper resources to grow strength', what: 'Meal prepping, protein shakes, clean eating', frequency: 'Daily', freq: 7, duration: '189g a day', object: 'Food shopping, protein powder', active: true },
  { id: 'body-vitamins-supplements', category: 'body', dateAdded: '2026-01-01', focus: 'Vitamins / Supplements', why: 'To support recovery and well-being', what: 'Daily vitamins, creatine and fiber', frequency: 'Daily', freq: 7, duration: 'Reset pill organizer on Sunday', object: 'Vitamins and supplements', active: true },
  { id: 'body-abdominal-training', category: 'body', dateAdded: '2026-01-01', focus: 'Abdominal Training', why: 'To grow abdominal region, internal muscles and sculpt physique', what: 'Ab-focused gym session', frequency: '2x / week', freq: 2, duration: 'Abs, 2x / week', object: 'Gym, time', active: true },
  { id: 'body-water-intake', category: 'body', dateAdded: '2026-01-01', focus: 'Water Intake', why: 'To properly hydrate the body and support endurance and recovery', what: 'Drinking water', frequency: 'Daily', freq: 7, duration: '3–4 liters or 4–5 bottles (32oz)', object: 'Water bottle, citrus occasionally', active: true },
  { id: 'body-moisturize-body', category: 'body', dateAdded: '2026-01-01', focus: 'Moisturize Body', why: 'To support skin health and elasticity', what: 'Moisturize entire body after shower', frequency: '4x / week', freq: 4, duration: 'Every day or every 2 days', object: 'Lotion', active: true },
  { id: 'body-feet-care', category: 'body', dateAdded: '2026-01-01', focus: 'Feet Care', why: 'To support flexibility and decrease dead skin cells', what: 'Footbath, pumice stone, urea cream', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Urea cream', active: true },
  { id: 'body-weekly-bath', category: 'body', dateAdded: '2026-01-01', focus: 'Weekly Bath', why: 'To aid muscle recovery and support relaxation', what: 'Nourishing bath with epsom salt', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Epsom salt', active: true },
  { id: 'body-washing-face-complexion', category: 'body', dateAdded: '2026-01-01', focus: 'Washing Face / Complexion', why: 'To help even complexion and increase moisture barrier', what: 'Wash face, moisturize', frequency: 'Daily', freq: 7, duration: 'Daily, bi-daily shave', object: 'Face wash, moisturizer, razors', active: true },
  { id: 'body-getting-haircut', category: 'body', dateAdded: '2026-01-01', focus: 'Getting Haircut', why: 'To aid hair growth and evenness', what: 'Schedule haircut (Mira or Towson shop)', frequency: 'Monthly', freq: 0.25, duration: 'Bi-weekly or monthly', object: 'Money', active: false },

  // ---------- SOUL ----------
  { id: 'soul-main-session', category: 'soul', dateAdded: '2026-01-01', focus: 'Main Session', why: 'To place the most emphasis on the current week’s topic', what: 'Main session from hub', frequency: '2x / week', freq: 2, duration: '45 min session', object: 'Sessions list', active: true },
  { id: 'soul-support-session', category: 'soul', dateAdded: '2026-01-01', focus: 'Support Session', why: 'To give awareness to a supplementary category', what: 'Support session from hub', frequency: 'Weekly', freq: 1, duration: '20 mins / week', object: 'Sessions list', active: true },
  { id: 'soul-maintenance-session', category: 'soul', dateAdded: '2026-01-01', focus: 'Maintenance Session', why: 'To keep visibility on last week’s focus', what: 'Maintenance session from hub', frequency: 'Weekly', freq: 1, duration: '10–15 mins', object: 'Sessions list', active: true },
  { id: 'soul-monthly-review', category: 'soul', dateAdded: '2026-01-01', focus: 'Monthly Review', why: 'To review growth and observe strategic direction', what: 'Review all content and interest from prior month', frequency: 'Monthly', freq: 0.25, duration: '45 mins', object: 'Sessions list', active: false },

  // ---------- CLEANING ----------
  { id: 'cleaning-wash-bedding', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Wash Bedding', why: 'To help with complexion and overall dust', what: 'Strip duvet and all covers on weekend', frequency: 'Weekly', freq: 1, duration: 'End of week', object: 'Detergent', active: true },
  { id: 'cleaning-vacuum-room', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Vacuum Room', why: 'To help deal with Marvel’s hair and dust', what: 'Vacuum after mom gets off work', frequency: '4x / week', freq: 4, duration: 'When mom isn’t working', object: 'Vacuum', active: true },
  { id: 'cleaning-wipe-room-surfaces', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Wipe Room Surfaces', why: 'To keep surfaces clean and space peaceful', what: 'Wipe down surfaces', frequency: '4x / week', freq: 4, duration: '4x / week', object: 'Rags, cleaner', active: true },
  { id: 'cleaning-vacuum-car', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Vacuum Car', why: 'To keep the car clean and peaceful', what: 'Clean car on the way back from the gym', frequency: 'Weekly', freq: 1, duration: 'Once a week, maybe Saturdays', object: 'Quarters', active: true },
  { id: 'cleaning-clean-laundry', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Clean Laundry', why: 'To ensure smooth daily life and peace', what: 'Clean, wash and put away all clothes', frequency: 'Weekly', freq: 1, duration: 'Weekly, maybe Fridays', object: 'Detergent', active: true },
  { id: 'cleaning-clean-phone-laptop-glasses', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Clean Phone / Laptop / Glasses', why: 'To take care of belongings and feel at peace', what: 'Alcohol and screen wipes to remove grime and dust', frequency: '2x / week', freq: 2, duration: 'Twice a week', object: 'Alcohol wipes', active: true },
  { id: 'cleaning-clean-tote-bag', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Clean Tote Bag', why: 'To feel prepared and organized', what: 'Take out non-needed things, audit contents', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'N/A', active: true },
  { id: 'cleaning-clean-headphones', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Clean Headphones', why: 'To promote ear health and sound quality', what: 'Alcohol wipes to remove wax and dirt', frequency: 'Weekly', freq: 1, duration: 'Once a week, maybe Sundays', object: 'Alcohol wipes', active: true },

  // ---------- ORGANIZING ----------
  { id: 'organizing-digital-declutter', category: 'organizing', dateAdded: '2026-01-01', focus: 'Digital Declutter', why: 'To reduce digital noise and clutter', what: 'Delete old messages, emails, and unused apps', frequency: 'Weekly', freq: 1, duration: 'Once a week, maybe Sundays', object: 'Planner', active: true },
  { id: 'organizing-water-plants', category: 'organizing', dateAdded: '2026-01-01', focus: 'Water Plants', why: 'To keep plants healthy and alive', what: 'Bottom water all plants (see Plant Care)', frequency: 'Weekly', freq: 1, duration: 'Once a week, maybe Sundays', object: 'Big plastic container', active: true },
  { id: 'organizing-organize-drawers', category: 'organizing', dateAdded: '2026-01-01', focus: 'Organize Drawers', why: 'To keep tools and possessions available', what: 'Organize dresser drawers and contents', frequency: 'Bi-weekly', freq: 0.5, duration: 'Weekly / bi-weekly', object: 'N/A', active: true },
  { id: 'organizing-weekly-grocery-shop', category: 'organizing', dateAdded: '2026-01-01', focus: 'Weekly Grocery Shop', why: 'To enable other growth topics and save money', what: 'Instacart or in-store shop', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Food stamps / money', active: true },
  { id: 'organizing-meal-prepping', category: 'organizing', dateAdded: '2026-01-01', focus: 'Meal Prepping', why: 'To enable convenience, healthy eating, and summer goals', what: 'Prep ingredients for the week, freeze what needs to last', frequency: 'Weekly', freq: 1, duration: 'Weekly, 45 mins', object: 'Grocery shopping, clean kitchen', active: true },
  { id: 'organizing-personal-finance-allocation', category: 'organizing', dateAdded: '2026-01-01', focus: 'Personal Finance Allocation', why: 'To ensure all bills and personal expenses are allocated', what: 'Review upcoming bills and needed expenses, allocate', frequency: 'Weekly', freq: 1, duration: 'Weekly, 30 mins', object: 'Randall', active: true },
  { id: 'organizing-savings-allocations', category: 'organizing', dateAdded: '2026-01-01', focus: 'Savings Allocations', why: 'To ensure excess funds are put aside', what: 'After personal allocation, move leftover to savings', frequency: 'Weekly', freq: 1, duration: 'Weekly, 10 mins', object: 'Next Steps Doc (Bucket List, Credit, Savings)', active: true },
  { id: 'organizing-needed-purchases', category: 'organizing', dateAdded: '2026-01-01', focus: 'Needed Purchases', why: 'To ensure an object doesn’t block a growth routine', what: 'Review inventory and sheet for what’s needed', frequency: 'Weekly', freq: 1, duration: 'Weekly, 10 mins', object: 'Short Term Task List', active: true },
  { id: 'organizing-goal-effort-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Goal / Effort Review', why: 'To ensure effort goes to something wanted', what: 'Review personal / life goals, adjust week structure', frequency: 'Weekly', freq: 1, duration: 'Weekly, 25 mins', object: 'Master Goals (Why) to Routine (How) List', active: true },
  { id: 'organizing-week-planner-prep', category: 'organizing', dateAdded: '2026-01-01', focus: 'Week Planner Prep', why: 'To smoothly complete needed things without drowning', what: 'Fill planner with tasks / projects', frequency: 'Weekly', freq: 1, duration: 'Weekly, Sundays', object: 'Planner', active: true },
  { id: 'organizing-non-routine-task-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Non-Routine Task Review', why: 'To not stay narrowed on routine — also catch one-time items', what: 'Use master task list, plan accordingly', frequency: 'Weekly', freq: 1, duration: 'Weekly, 10 mins', object: 'Short Term Task List', active: true },
  { id: 'organizing-next-step-awareness-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Next Step Awareness Review', why: 'To give attention to the bigger plan and feel movement', what: 'Use next step guide, see what can be completed', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Next Steps Doc (Bucket List, Credit, Savings)', active: true },
  { id: 'organizing-family-altruism-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Family Altruism Review', why: 'To see what effort can go toward independence, ease transitions', what: 'Review bucket list, check status of action items', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Next Steps Doc (Bucket List, Credit, Savings)', active: true },
  { id: 'organizing-family-finance-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Family Finance Review', why: 'To give peace of mind on plans and bill status', what: 'Review family finances tracker, update / plan', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'House / Family Hub', active: true },

  // ---------- DOG (Marvel) ----------
  { id: 'dog-daily-brushing', category: 'dog', dateAdded: '2026-01-01', focus: 'Daily Brushing', why: 'To help with shedding', what: 'Use brush in AM', frequency: 'Daily', freq: 7, duration: 'Daily', object: '', active: true },
  { id: 'dog-play-sessions', category: 'dog', dateAdded: '2026-01-01', focus: 'Play Sessions', why: 'To give him an outlet for energy', what: 'Tug of war, fetch', frequency: 'Daily', freq: 7, duration: '20–30 mins', object: '', active: true },
  { id: 'dog-cuddling', category: 'dog', dateAdded: '2026-01-01', focus: 'Cuddling', why: 'To bond and snuggle', what: 'Giving attention to just him', frequency: 'Daily', freq: 7, duration: '20–30 mins', object: '', active: true },
  { id: 'dog-behavior-training', category: 'dog', dateAdded: '2026-01-01', focus: 'Behavior Training', why: 'To help with natural behavior', what: 'Use Marvel hub for commands', frequency: 'Daily', freq: 7, duration: 'Daily, audit weekly', object: '', active: true },
  { id: 'dog-walks', category: 'dog', dateAdded: '2026-01-01', focus: 'Walks', why: 'To help socialization and bonding, and regulate', what: 'Walks around the block', frequency: '4x / week', freq: 4, duration: '20–30 mins', object: 'Leash, clicker, treats, treat tote', active: true },
  { id: 'dog-command-training', category: 'dog', dateAdded: '2026-01-01', focus: 'Command Training', why: 'To help with command listening', what: 'Use Marvel hub for commands', frequency: '3x / week', freq: 3, duration: '20–30 mins', object: 'Clicker, treats', active: true },
  { id: 'dog-weekly-vacuum-marvel', category: 'dog', dateAdded: '2026-01-01', focus: 'Weekly Vacuum (Marvel)', why: 'To really help with shedding', what: 'Vacuum brush attachment', frequency: 'Weekly', freq: 1, duration: 'Weekly, 20–25 mins', object: 'Vacuum / brush', active: true },
  { id: 'dog-brush-teeth', category: 'dog', dateAdded: '2026-01-01', focus: 'Brush Teeth', why: 'For oral health', what: 'Use finger brush to get teeth', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Toothbrush', active: true },
  { id: 'dog-supply-inventory-count', category: 'dog', dateAdded: '2026-01-01', focus: 'Supply Inventory Count', why: 'To see what consumables Marvel needs', what: 'Check food, treats, chews, toys, plan accordingly', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: '', active: true },
  { id: 'dog-behavior-train-audit', category: 'dog', dateAdded: '2026-01-01', focus: 'Behavior Train Audit', why: 'To narrow focus topics for the coming week', what: 'Use hub to plan needed behavioral improvements', frequency: 'Weekly', freq: 1, duration: 'Weekly', object: 'Marvel Guide', active: true },
  { id: 'dog-supply-organization', category: 'dog', dateAdded: '2026-01-01', focus: 'Supply Organization', why: 'To audit Marvel’s existing inventory and see what’s needed', what: 'Clean Marvel’s drawers and stuff around the house', frequency: 'Bi-weekly', freq: 0.5, duration: 'Bi-weekly', object: '', active: true },
  { id: 'dog-clip-nails', category: 'dog', dateAdded: '2026-01-01', focus: 'Clip Nails', why: 'For health, balance, and grip', what: 'Clip nails or take to groomer', frequency: 'Monthly', freq: 0.25, duration: 'Monthly', object: 'Clippers', active: false },
  { id: 'dog-behavioral-audit', category: 'dog', dateAdded: '2026-01-01', focus: 'Behavioral Audit', why: 'To place findings into action', what: 'Dig into behaviors to work on', frequency: 'Monthly', freq: 0.25, duration: 'Monthly', object: '', active: false },
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
