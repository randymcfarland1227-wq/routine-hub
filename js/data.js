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
  { id: 'mind-healthy-minds-session', category: 'mind', dateAdded: '2026-01-01', focus: 'Healthy Minds Sessions', why: 'To aid in mental growth and being present', what: 'Awareness Monday, Connection Tuesday, Insight Wednesday, Purpose Thursday, Foundations Friday', frequency: 'Habit · Mon–Fri', freq: 5, duration: 'One guided session each weekday', object: 'Healthy Minds App', active: true },
  { id: 'mind-journaling', category: 'mind', dateAdded: '2026-01-01', focus: 'Journal or Self Discovery', why: 'To channel joys and desires and stay connected to yourself', what: 'Journal, reflect, or complete a self-discovery practice', frequency: 'Habit · Daily', freq: 7, duration: 'A page, paragraph, or short prompt', object: 'Notes, Google Doc, paper, or Bear', active: true },
  { id: 'mind-reading', category: 'mind', dateAdded: '2026-01-01', focus: 'Read (Even 3 Pages)', why: 'To grow attention span while learning and relaxing the mind', what: 'Read at least three pages', frequency: 'Habit · Every 3 days', freq: 2.33, duration: 'Three or more pages', object: 'Books', active: true },
  { id: 'mind-clothes-audit', category: 'organizing', dateAdded: '2026-01-01', focus: 'Monthly Closet Audit', why: 'To keep clothing visible, usable, and aligned with your life', what: 'Review seasonal clothes, shoes, and items to donate or reorganize', frequency: 'Task · 1st Sat monthly', freq: 0.25, duration: 'Monthly', object: 'Closet and donation bags', active: true },
  { id: 'mind-smile-to-yourself', category: 'mind', dateAdded: '2026-08-28', focus: 'Smile to Yourself', why: 'To intentionally create a small moment of warmth and self-connection', what: 'Pause and smile to yourself', frequency: 'Habit · Daily', freq: 7, duration: 'A few seconds', object: '', active: true },
  { id: 'mind-weekday-reminders', category: 'mind', dateAdded: '2026-08-28', focus: 'Weekday Alignment Reminders', why: 'To reconnect daily actions with the life you are building', what: 'Review the Why and Emphasis reminders saved in TickTick', frequency: 'Task · Mon–Fri', freq: 5, duration: 'Brief morning check-in', object: 'TickTick reminders', active: true },
  { id: 'mind-personal-check-in', category: 'mind', dateAdded: '2026-08-28', focus: 'Personal Check-In', why: 'To review routines, projects, tasks, and self-grounding', what: 'Complete the routines, projects/tasks, and grounding checklist', frequency: 'Task · Every other Sat', freq: 0.5, duration: 'Bi-weekly', object: 'TickTick checklist', active: true },

  // ---------- BODY ----------
  { id: 'body-cardio-training', category: 'body', dateAdded: '2026-01-01', focus: 'Cardio', why: 'To build endurance for summer and festival season', what: 'Stairmaster, treadmill, or walking', frequency: 'Task · Tue & Fri', freq: 2, duration: 'Two sessions a week', object: 'Gym and time', active: true },
  { id: 'body-protein-intake', category: 'body', dateAdded: '2026-01-01', focus: 'Protein Intake', why: 'To give the body the proper resources to grow strength', what: 'Meal prepping, protein shakes, clean eating', frequency: 'Not in TickTick', freq: 0, duration: '189g a day', object: 'Food shopping and protein powder', active: false },
  { id: 'body-vitamins-supplements', category: 'body', dateAdded: '2026-01-01', focus: 'Take Medicine & Vitamins', why: 'To support health, recovery, and well-being', what: 'Take daily medicine and vitamins', frequency: 'Habit · Daily', freq: 7, duration: 'Daily', object: 'Medicine and supplements', active: true },
  { id: 'body-abdominal-training', category: 'body', dateAdded: '2026-01-01', focus: 'Abdominal Training', why: 'To grow abdominal and internal muscles and sculpt physique', what: 'Complete an ab-focused gym session', frequency: 'Task · Mon & Wed', freq: 2, duration: 'Two sessions a week', object: 'Gym and time', active: true },
  { id: 'body-water-intake', category: 'body', dateAdded: '2026-01-01', focus: 'Water Intake', why: 'To properly hydrate the body and support endurance and recovery', what: 'Drink water throughout the day', frequency: 'Not in TickTick', freq: 0, duration: '3–4 liters or 4–5 bottles (32oz)', object: 'Water bottle', active: false },
  { id: 'body-moisturize-body', category: 'body', dateAdded: '2026-01-01', focus: 'Moisturize Body', why: 'To support skin health and elasticity', what: 'Moisturize entire body after shower', frequency: 'Habit · Sun, Mon, Wed & Fri', freq: 4, duration: 'Four times a week', object: 'Lotion', active: true },
  { id: 'body-feet-care', category: 'body', dateAdded: '2026-01-01', focus: 'Foot Care and Moisturize', why: 'To support flexibility and decrease dead skin cells', what: 'Footbath, pumice stone, and urea cream', frequency: 'Task · Friday', freq: 1, duration: 'Weekly', object: 'Urea cream', active: true },
  { id: 'body-weekly-bath', category: 'body', dateAdded: '2026-01-01', focus: 'Epsom Salt Bath', why: 'To aid muscle recovery and support relaxation', what: 'Take a nourishing bath with Epsom salt', frequency: 'Habit · Friday', freq: 1, duration: 'Weekly', object: 'Epsom salt', active: true },
  { id: 'body-washing-face-complexion', category: 'body', dateAdded: '2026-01-01', focus: 'Face Washing & Care', why: 'To help even complexion and support the moisture barrier', what: 'Wash face and moisturize', frequency: 'Habit · Daily', freq: 7, duration: 'Daily', object: 'Face wash and moisturizer', active: true },
  { id: 'body-getting-haircut', category: 'body', dateAdded: '2026-01-01', focus: 'Schedule Haircut', why: 'To support hair growth, evenness, and regular grooming', what: 'Schedule a haircut', frequency: 'Task · Every 3rd Sat', freq: 0.33, duration: 'Every three weeks', object: 'Money and preferred barber', active: true },
  { id: 'body-put-out-gym-clothes', category: 'body', dateAdded: '2026-08-28', focus: 'Put Out Gym Clothes', why: 'To reduce friction before the gym', what: 'Lay out the next gym outfit', frequency: 'Habit · Sun–Fri', freq: 6, duration: 'Night before', object: 'Gym clothes', active: true },
  { id: 'body-nail-cuticle-care', category: 'body', dateAdded: '2026-08-28', focus: 'Nail and Cuticle Care', why: 'To maintain comfortable, well-kept hands and nails', what: 'Trim, clean, and care for nails and cuticles', frequency: 'Task · Wednesday', freq: 1, duration: 'Weekly', object: 'Nail-care tools', active: true },

  // ---------- SOUL ----------
  { id: 'soul-main-session', category: 'soul', dateAdded: '2026-01-01', focus: 'Music Session — Main', why: 'To place the most emphasis on the current music topic', what: 'Complete the main music session and log the result', frequency: 'Task · Tuesday', freq: 1, duration: 'Weekly', object: 'Music setup and session log', active: true },
  { id: 'soul-support-session', category: 'soul', dateAdded: '2026-01-01', focus: 'Music Session — Support', why: 'To give attention to a supplementary music skill', what: 'Complete the support music session and log the result', frequency: 'Task · Thursday', freq: 1, duration: 'Weekly', object: 'Music setup and session log', active: true },
  { id: 'soul-maintenance-session', category: 'soul', dateAdded: '2026-01-01', focus: 'Music Session — Maintenance', why: 'To maintain visibility and momentum on recent work', what: 'Complete the maintenance music session and log the result', frequency: 'Task · Wednesday', freq: 1, duration: 'Weekly', object: 'Music setup and session log', active: true },
  { id: 'soul-monthly-review', category: 'soul', dateAdded: '2026-01-01', focus: 'Music Month Review', why: 'To review progress and choose the next musical emphasis', what: 'Review the month’s sessions, work, and development', frequency: 'Task · Last Mon monthly', freq: 0.25, duration: 'Monthly', object: 'Music session log', active: true },
  { id: 'soul-vocal-training', category: 'soul', dateAdded: '2026-08-28', focus: 'Vocal Training / Warm-Ups', why: 'To build vocal control, consistency, and recording readiness', what: 'Complete vocal warm-ups or a focused training session', frequency: 'Habit · Mon, Wed & Fri', freq: 3, duration: 'Three times a week', object: 'Vocal exercises', active: true },
  { id: 'soul-pinterest-reset', category: 'soul', dateAdded: '2026-08-28', focus: 'Pinterest Board Reset', why: 'To keep visual inspiration current and intentional', what: 'Review and reset Pinterest boards', frequency: 'Task · 1st Sat every 2 months', freq: 0.125, duration: 'Every two months', object: 'Pinterest', active: true },

  // ---------- CLEANING ----------
  { id: 'cleaning-wash-bedding', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Wash Bedding', why: 'To help with complexion and overall dust', what: 'Strip the duvet and all bedding, wash, dry, and remake the bed', frequency: 'Task · Every other Fri', freq: 0.5, duration: 'Bi-weekly', object: 'Detergent', active: true },
  { id: 'cleaning-vacuum-room', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Vacuum Room', why: 'To help manage Marvel’s hair and dust', what: 'Vacuum the room; this currently appears in TickTick as both a habit and a task', frequency: 'Habit + task · Sun, Tue, Thu & Sat', freq: 4, duration: 'Four times a week', object: 'Vacuum', active: true },
  { id: 'cleaning-wipe-room-surfaces', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Wipe Room Surfaces', why: 'To keep surfaces clean and the space peaceful', what: 'Wipe down room surfaces; this currently appears in TickTick as both a habit and a task', frequency: 'Habit + task · Sun, Tue, Thu & Sat', freq: 4, duration: 'Four times a week', object: 'Rags and cleaner', active: true },
  { id: 'cleaning-vacuum-car', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Vacuum Car', why: 'To keep the car clean and peaceful', what: 'Vacuum the car, ideally around the gym trip', frequency: 'Task · Saturday', freq: 1, duration: 'Weekly', object: 'Quarters or car vacuum', active: true },
  { id: 'cleaning-clean-laundry', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Wash Clothes', why: 'To ensure smooth daily life and peace', what: 'Wash, dry, fold, and put away clothes', frequency: 'Task · Friday', freq: 1, duration: 'Weekly', object: 'Detergent', active: true },
  { id: 'cleaning-clean-phone-laptop-glasses', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Wipe Down Phone, Laptop, and Glasses', why: 'To take care of belongings and feel at peace', what: 'Remove grime, fingerprints, and dust from daily devices and glasses', frequency: 'Task · Tue, Thu & Sat', freq: 3, duration: 'Three times a week', object: 'Alcohol and screen-safe wipes', active: true },
  { id: 'cleaning-clean-tote-bag', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Clean Out Tote', why: 'To feel prepared and organized', what: 'Remove unneeded items and audit the tote’s contents', frequency: 'Task · Friday', freq: 1, duration: 'Weekly', object: '', active: true },
  { id: 'cleaning-clean-headphones', category: 'cleaning', dateAdded: '2026-01-01', focus: 'Clean Headphones', why: 'To promote ear health and sound quality', what: 'Remove wax, dirt, and grime with appropriate wipes', frequency: 'Task · Mon & Fri', freq: 2, duration: 'Twice a week', object: 'Alcohol wipes', active: true },
  { id: 'cleaning-wash-tote-bag', category: 'cleaning', dateAdded: '2026-08-28', focus: 'Wash Tote Bag', why: 'To keep the everyday tote fresh and ready to use', what: 'Wash and fully dry the tote bag', frequency: 'Task · Every other Fri', freq: 0.5, duration: 'Bi-weekly', object: 'Laundry supplies', active: true },

  // ---------- ORGANIZING ----------
  { id: 'organizing-digital-declutter', category: 'organizing', dateAdded: '2026-01-01', focus: 'Digital Declutter', why: 'To reduce digital noise and clutter', what: 'Review emails, contacts, browser history, saved payment methods, and old photos', frequency: 'Task · Sunday', freq: 1, duration: 'Weekly', object: 'Phone and computer', active: true },
  { id: 'organizing-water-plants', category: 'organizing', dateAdded: '2026-01-01', focus: 'Water Plants', why: 'To keep plants healthy and alive', what: 'Water plants according to the plant-care reference', frequency: 'Task · Monday', freq: 1, duration: 'Weekly', object: 'Watering container', active: true },
  { id: 'organizing-organize-drawers', category: 'organizing', dateAdded: '2026-01-01', focus: 'Reset Drawers, Closet, and Fireplace', why: 'To keep possessions available and shared spaces reset', what: 'Reset drawers, closet, and fireplace area', frequency: 'Task · Friday', freq: 1, duration: 'Weekly', object: '', active: true },
  { id: 'organizing-weekly-grocery-shop', category: 'organizing', dateAdded: '2026-01-01', focus: 'Put Grocery Order In', why: 'To enable healthy eating and keep needed food available', what: 'Submit the weekly grocery order', frequency: 'Task · Friday', freq: 1, duration: 'Weekly', object: 'Grocery list and payment method', active: true },
  { id: 'organizing-meal-prepping', category: 'organizing', dateAdded: '2026-01-01', focus: 'Meal Prep', why: 'To enable convenience, healthy eating, and fitness goals', what: 'Prepare ingredients and meals for the coming week', frequency: 'Task · Friday', freq: 1, duration: 'Weekly', object: 'Groceries and a clean kitchen', active: true },
  { id: 'organizing-personal-finance-allocation', category: 'organizing', dateAdded: '2026-01-01', focus: 'Weekly Finances Review', why: 'To keep bills, expenses, purchases, savings, and family needs visible', what: 'Complete the finance review checklist in TickTick', frequency: 'Task · Wednesday', freq: 1, duration: 'Weekly', object: 'Finance trackers', active: true },
  { id: 'organizing-savings-allocations', category: 'organizing', dateAdded: '2026-01-01', focus: 'Savings Allocations', why: 'To ensure excess funds are put aside', what: 'After personal allocation, move leftover funds to savings as part of Weekly Finances Review', frequency: 'Task bundle · Wednesday', freq: 1, duration: 'Weekly', object: 'Next Steps document', active: true },
  { id: 'organizing-needed-purchases', category: 'organizing', dateAdded: '2026-01-01', focus: 'Needed / Recurring Purchase Review', why: 'To ensure a missing object does not block a growth routine', what: 'Review inventory and needed purchases as part of Weekly Finances Review', frequency: 'Task bundle · Wednesday', freq: 1, duration: 'Weekly', object: 'Inventory and purchase list', active: true },
  { id: 'organizing-goal-effort-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Goal Review', why: 'To ensure effort is going toward something wanted', what: 'Review personal and life goals and adjust direction', frequency: 'Task · 1st Sat monthly', freq: 0.25, duration: 'Monthly', object: 'Goals and effort documents', active: true },
  { id: 'organizing-week-planner-prep', category: 'organizing', dateAdded: '2026-01-01', focus: 'Fill in Planner for Week', why: 'To complete needed things without feeling overwhelmed', what: 'Fill the planner with tasks and projects for the coming week', frequency: 'Task · Sunday', freq: 1, duration: 'Weekly', object: 'Planner', active: true },
  { id: 'organizing-non-routine-task-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Add Non-Scheduled Efforts', why: 'To keep flexible efforts such as reading, water, and journaling visible', what: 'Add non-scheduled efforts from the Goal and Effort sheet into the week', frequency: 'Task · Sunday', freq: 1, duration: 'Weekly', object: 'Goal and Effort sheet', active: true },
  { id: 'organizing-next-step-awareness-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Next Step Awareness Review', why: 'To give attention to the bigger plan and feel movement', what: 'Use the next-step guide to identify a concrete move', frequency: 'Not in TickTick', freq: 0, duration: 'Weekly', object: 'Next Steps document', active: false },
  { id: 'organizing-family-altruism-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Family Altruism Review', why: 'To see what effort can support independence and ease transitions', what: 'Review bucket-list action items as an optional part of Weekly Finances Review', frequency: 'Task bundle · Wed (optional)', freq: 1, duration: 'Weekly', object: 'Next Steps document', active: true },
  { id: 'organizing-family-finance-review', category: 'organizing', dateAdded: '2026-01-01', focus: 'Family Finance Review', why: 'To create peace of mind about plans and bill status', what: 'Review the family finances tracker as an optional part of Weekly Finances Review', frequency: 'Task bundle · Wed (optional)', freq: 1, duration: 'Weekly', object: 'House / Family Hub', active: true },
  { id: 'organizing-reset-medicine-holder', category: 'organizing', dateAdded: '2026-08-28', focus: 'Reset Medicine and Vitamin Holder', why: 'To make the daily medicine and vitamin habit easy to complete', what: 'Refill and reset the medicine and vitamin organizer', frequency: 'Task · Friday', freq: 1, duration: 'Weekly', object: 'Medicine and supplements', active: true },

  // ---------- DOG (Marvel) ----------
  { id: 'dog-daily-brushing', category: 'dog', dateAdded: '2026-01-01', focus: 'Daily Brushing', why: 'To help with shedding', what: 'Brush Marvel in the morning', frequency: 'Not in TickTick', freq: 0, duration: 'Daily', object: 'Brush', active: false },
  { id: 'dog-play-sessions', category: 'dog', dateAdded: '2026-01-01', focus: 'Train / Play with Marvel', why: 'To give Marvel an outlet for energy and strengthen your bond', what: 'Complete a focused training or play session', frequency: 'Habit · Mon, Wed & Fri', freq: 3, duration: 'Three times a week', object: 'Toys, clicker, and treats', active: true },
  { id: 'dog-cuddling', category: 'dog', dateAdded: '2026-01-01', focus: 'Cuddling', why: 'To bond and snuggle', what: 'Give Marvel your undivided attention', frequency: 'Not in TickTick', freq: 0, duration: '20–30 mins', object: '', active: false },
  { id: 'dog-behavior-training', category: 'dog', dateAdded: '2026-01-01', focus: 'Daily Marvel', why: 'To give Marvel varied attention and enrichment during the workweek', what: 'Choose at least one activity from each category: Sniff, Move, and Think', frequency: 'Task · Mon–Fri', freq: 5, duration: 'Weekdays', object: 'Marvel activity references', active: true },
  { id: 'dog-walks', category: 'dog', dateAdded: '2026-01-01', focus: 'Walk Marvel', why: 'To support socialization, bonding, and regulation', what: 'Take Marvel for a focused walk', frequency: 'Habit · Mon, Fri & Sat', freq: 3, duration: 'Three times a week', object: 'Leash, clicker, treats, and treat tote', active: true },
  { id: 'dog-command-training', category: 'dog', dateAdded: '2026-01-01', focus: 'Command Training', why: 'To help with command listening', what: 'Use the Marvel Hub for commands', frequency: 'Covered by Train / Play habit', freq: 0, duration: '20–30 mins', object: 'Clicker and treats', active: false },
  { id: 'dog-weekly-vacuum-marvel', category: 'dog', dateAdded: '2026-01-01', focus: 'Vacuum Brush Marvel', why: 'To reduce shedding and loose hair', what: 'Use the vacuum brush attachment; this currently appears in TickTick as both a habit and a task', frequency: 'Habit + task · Sun, Tue & Thu', freq: 3, duration: 'Three times a week', object: 'Vacuum brush attachment', active: true },
  { id: 'dog-brush-teeth', category: 'dog', dateAdded: '2026-01-01', focus: 'Brush Teeth', why: 'To support oral health', what: 'Use a finger brush to clean Marvel’s teeth', frequency: 'Not in TickTick', freq: 0, duration: 'Weekly', object: 'Dog toothbrush', active: false },
  { id: 'dog-supply-inventory-count', category: 'dog', dateAdded: '2026-01-01', focus: 'Marvel Supply Count / Resupply', why: 'To keep food, treats, chews, and toys available', what: 'Complete the Marvel supply checklist within Weekly Finances Review', frequency: 'Task bundle · Wednesday', freq: 1, duration: 'Weekly', object: 'Marvel supplies', active: true },
  { id: 'dog-behavior-train-audit', category: 'dog', dateAdded: '2026-01-01', focus: 'Marvel Review', why: 'To review Marvel’s needs and choose the next areas of attention', what: 'Review routines, behavior, grooming, and supplies', frequency: 'Task · Monthly on the 30th', freq: 0.25, duration: 'Monthly', object: 'Marvel Guide', active: true },
  { id: 'dog-supply-organization', category: 'dog', dateAdded: '2026-01-01', focus: 'Supply Organization', why: 'To audit Marvel’s existing inventory and see what is needed', what: 'Clean and organize Marvel’s drawers and supplies', frequency: 'Not in TickTick', freq: 0, duration: 'Bi-weekly', object: '', active: false },
  { id: 'dog-clip-nails', category: 'dog', dateAdded: '2026-01-01', focus: 'Schedule Marvel Groomer Visit', why: 'To maintain grooming, nail health, balance, and comfort', what: 'Schedule Marvel’s monthly trip to the groomer', frequency: 'Task · Monthly on the 13th', freq: 0.25, duration: 'Monthly', object: 'Groomer contact and funds', active: true },
  { id: 'dog-behavioral-audit', category: 'dog', dateAdded: '2026-01-01', focus: 'Behavioral Audit', why: 'To place findings into action', what: 'Dig into behaviors to work on', frequency: 'Covered by Marvel Review', freq: 0, duration: 'Monthly', object: '', active: false },
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

// Complete inventory transcribed from the Milanote "Daily Alignment / Motivation Station".
// Items with routineId are visibly married to their current Routine Hub / TickTick counterpart.
// Unmatched items stay visible as Milanote-only; they are intentionally not auto-added to TickTick.
const ALIGNMENT_AREAS = [
  { id: 'movement', label: 'Daily Physical Activity', short: 'Movement', icon: '🏃', color: '#2f9e6e' },
  { id: 'nutrition', label: 'Nutrition & Wellness', short: 'Nutrition', icon: '🥗', color: '#6f9f3c' },
  { id: 'recovery', label: 'Rest, Relaxing & Recovery', short: 'Recovery', icon: '🌙', color: '#5d79aa' },
  { id: 'mind', label: 'Mind', short: 'Mind', icon: '🧠', color: '#6c63c7' },
  { id: 'occupation', label: 'Income / Occupation', short: 'Occupation', icon: '💼', color: '#9b6b43' },
  { id: 'life-path', label: 'Life Path', short: 'Life Path', icon: '🧭', color: '#bf7b2e' },
  { id: 'self-care', label: 'Self-Care Practices', short: 'Self-Care', icon: '🫧', color: '#c26078' },
  { id: 'creative', label: 'Creative / Tinkering', short: 'Creative', icon: '🎨', color: '#b36c2e' },
  { id: 'marvel', label: 'Marvel', short: 'Marvel', icon: '🐾', color: '#d6693f' },
  { id: 'maintenance', label: 'Cleaning, Organizing & Maintaining', short: 'Maintenance', icon: '🧹', color: '#2fa3b8' },
];

const MOTIVATION_MAP_GROUPS = [
  { area: 'movement', label: 'Fitness & Activity — Gym Sessions', items: [
    { title: 'Full Sessions', type: 'habit' },
    { title: 'Enough Weight', type: 'reminder' },
    { title: 'Movement Timing', type: 'reminder' },
    { title: 'Active PT', type: 'habit' },
    { title: 'Warm-Up Stretch', type: 'habit' },
    { title: 'Cool-Down Stretch', type: 'habit' },
    { title: 'Endurance Cardio', type: 'habit', routineId: 'body-cardio-training' },
  ]},
  { area: 'movement', label: 'Fitness & Activity — Movement Through the Day', items: [
    { title: 'Daily Walks', type: 'habit' },
    { title: 'Stretch Breaks', type: 'habit' },
    { title: 'Standing', type: 'habit' },
  ]},

  { area: 'nutrition', label: 'Micro and Macronutrients', items: [
    { title: 'Protein Intake', type: 'habit', routineId: 'body-protein-intake' },
    { title: 'Antioxidants', type: 'habit' },
  ]},
  { area: 'nutrition', label: 'Daily Supplements', items: [
    { title: 'Morning Vitamins', type: 'habit', routineId: 'body-vitamins-supplements' },
    { title: 'Nightly Vitamins', type: 'habit', routineId: 'body-vitamins-supplements' },
    { title: 'Fiber Intake', type: 'habit' },
    { title: 'Creatine', type: 'habit' },
  ]},
  { area: 'nutrition', label: 'Daily Flow', items: [
    { title: 'Daily Fluid Intake', type: 'habit', routineId: 'body-water-intake' },
    { title: 'Energy Snacks', type: 'habit' },
    { title: 'Spaced Meals', type: 'habit' },
  ]},

  { area: 'recovery', label: 'Rest', items: [
    { title: 'Rest — Physical and Mental While Awake', type: 'reminder' },
    { title: 'Sleep', type: 'habit' },
    { title: 'Wind-Down Routine', type: 'routine' },
    { title: 'Sleep Supplements', type: 'habit' },
    { title: 'Stretching / Yoga', type: 'habit' },
  ]},
  { area: 'recovery', label: 'Rest / Recreational', items: [
    { title: 'Relaxing Activities', type: 'habit' },
    { title: 'Non-Analytical / Straightforward Tasks', type: 'reminder' },
  ]},
  { area: 'recovery', label: 'Recovery Sessions — 4–5x a Week', items: [
    { title: 'TENS Machine', type: 'habit' },
    { title: 'Massage Gun', type: 'habit' },
    { title: 'Dry Brushing', type: 'habit' },
    { title: 'Massage Chair at Gym', type: 'habit' },
  ]},

  { area: 'mind', label: 'Regulatory', items: [
    { title: 'Organized Mindset — Priorities, Effort, etc.', type: 'reminder' },
    { title: 'Organized Finances — What We Have', type: 'task', routineId: 'organizing-personal-finance-allocation' },
    { title: 'Organized Financial Plan — How We Are Using It', type: 'project', routineId: 'organizing-savings-allocations' },
  ]},
  { area: 'mind', label: 'Motivating Qualities to Cultivate', items: [
    { title: 'Mind Defined Purpose — Mindset', type: 'reminder' },
    { title: 'Mind Defined Direction — Based on Actual Movement and Actions', type: 'reminder' },
    { title: 'Emotional Cultivation — Joy', type: 'reminder' },
    { title: 'Curiosity — Allowing Curiosity', type: 'reminder' },
    { title: 'Mind Self-Assurance — Confidence in Action, Decisions, and Trajectory', type: 'reminder' },
  ]},
  { area: 'mind', label: 'Regulation and Growth', items: [
    { title: 'Emotional Development — Book Reading and Self-Connection', type: 'habit', routineId: 'mind-reading' },
    { title: 'Healthy Mind Sessions — Small Guided Audio Episodes', type: 'habit', routineId: 'mind-healthy-minds-session' },
    { title: 'Strategies — Build from Wanting to Grow Past Certain Habits', type: 'project' },
  ]},
  { area: 'mind', label: 'Exploration and Discovery', items: [
    { title: 'Self-Discovery — Getting Familiar with Me', type: 'habit', routineId: 'mind-journaling' },
    { title: 'Guided Journaling — Exploring Life Areas', type: 'habit', routineId: 'mind-journaling' },
    { title: 'Reflection — Learning from Experience', type: 'habit', routineId: 'mind-journaling' },
    { title: 'Meditation — Solitude in Quiet', type: 'habit', routineId: 'mind-healthy-minds-session' },
  ]},

  { area: 'occupation', label: 'Occupational Search — Daily', items: [
    { title: 'Role Applications', type: 'task' },
    { title: 'Automation-Found Roles', type: 'task' },
    { title: 'Personally Found Roles', type: 'task' },
    { title: 'Recruiter Search', type: 'task' },
    { title: 'Development', type: 'project' },
  ]},
  { area: 'occupation', label: 'Side Hustles — Daily', items: [
    { title: 'Clothes and Object Selling', type: 'project' },
    { title: 'Candles', type: 'project' },
  ]},

  { area: 'life-path', label: 'Actual Goals and Direction — Short Term', items: [
    { title: 'What We Want / Immediate Problems It Solves', type: 'project' },
    { title: 'How We Are Getting There / Method to Complete', type: 'project' },
    { title: 'Why We Are Doing It / Justification', type: 'reminder' },
  ]},
  { area: 'life-path', label: 'Actual Goals and Direction — Long Term', items: [
    { title: 'Spiritual Fulfillment and Alignment — Actual Long-Term Actions', type: 'project' },
    { title: 'Past Stabilization and Getting Our Footing — Fulfillment-Based Actions', type: 'project' },
    { title: 'Long-Term Past Stabilization', type: 'project' },
  ]},

  { area: 'self-care', label: 'Daily Self-Care', items: [
    { title: 'Teeth Brushing', type: 'habit' },
    { title: 'Flossing, Mouthwash, and Tongue Scraper', type: 'habit' },
    { title: 'Face Washing', type: 'habit', routineId: 'body-washing-face-complexion' },
    { title: 'Shower / Bath', type: 'habit', routineId: 'body-weekly-bath' },
  ]},
  { area: 'self-care', label: 'Self-Care Routine', items: [
    { title: 'Nails — Cut, Clean, and Cuticles — Weekly Wednesday', type: 'task', routineId: 'body-nail-cuticle-care' },
    { title: 'Foot Care — Weekly', type: 'task', routineId: 'body-feet-care' },
    { title: 'Face Shaving — Every Three Days', type: 'habit' },
    { title: 'Body Shaving — Once a Week', type: 'habit' },
  ]},

  { area: 'creative', label: 'Creative / Tinkering', items: [
    { title: 'Music and Singing — Broad Category', type: 'habit', routineId: 'soul-main-session' },
    { title: 'Curiosity “Recess” Exploration', type: 'habit' },
    { title: 'Development — Intentional Learning', type: 'habit' },
    { title: 'Art Form — Unrestricted, Non-Guided', type: 'habit' },
  ]},
  { area: 'creative', label: 'Creative Projects', items: [
    { title: 'Deep Dives — Large Projects', type: 'project' },
    { title: 'Botanicals / Lotions — Curious', type: 'project' },
    { title: 'Sewing / Knitting Projects — Making Savanna a Baby Blanket', type: 'project' },
  ]},

  { area: 'marvel', label: 'Marvel', items: [
    { title: 'Attention — More Patience', type: 'reminder' },
    { title: 'Training — Intentional Sessions', type: 'habit', routineId: 'dog-play-sessions' },
    { title: 'Grooming', type: 'task', routineId: 'dog-clip-nails' },
    { title: 'Physical Activity — Walks, Playing, and Backyard Time', type: 'habit', routineId: 'dog-walks' },
  ]},

  { area: 'maintenance', label: 'Clean Environment', items: [
    { title: 'Clean Bathroom — Weekly', type: 'task' },
    { title: 'Clean Room / Organized — Daily', type: 'task' },
    { title: 'Kitchen Usable for Making Food', type: 'task' },
    { title: 'Car — Saturdays', type: 'task', routineId: 'cleaning-vacuum-car' },
  ]},
  { area: 'maintenance', label: 'Organized Space', items: [
    { title: 'Organized Closet — Weekly', type: 'task', routineId: 'mind-clothes-audit', note: 'The matrix says weekly; the current TickTick closet audit is monthly.' },
    { title: 'Organized Possessions / Items — Friday', type: 'task', routineId: 'organizing-organize-drawers' },
  ]},
  { area: 'maintenance', label: 'Clean Laundry', items: [
    { title: 'Clean Clothes — Friday', type: 'task', routineId: 'cleaning-clean-laundry' },
    { title: 'Clean Towels — Friday', type: 'task' },
    { title: 'Clean Bedding — Every Other Friday', type: 'task', routineId: 'cleaning-wash-bedding' },
  ]},
  { area: 'maintenance', label: 'Maintaining', items: [
    { title: 'Plants — Monday and Friday', type: 'task', routineId: 'organizing-water-plants', note: 'The matrix says Monday and Friday; current TickTick says Monday.' },
  ]},
];

// Where TickTick / Routine Hub-only items belong when they are added to the union.
const ROUTINE_ALIGNMENT_AREAS = {
  'body-cardio-training': 'movement',
  'body-abdominal-training': 'movement',
  'body-put-out-gym-clothes': 'movement',
  'body-protein-intake': 'nutrition',
  'body-vitamins-supplements': 'nutrition',
  'body-water-intake': 'nutrition',
  'body-weekly-bath': 'recovery',
  'body-moisturize-body': 'self-care',
  'body-feet-care': 'self-care',
  'body-washing-face-complexion': 'self-care',
  'body-getting-haircut': 'self-care',
  'body-nail-cuticle-care': 'self-care',
  'mind-clothes-audit': 'maintenance',
  'mind-weekday-reminders': 'life-path',
  'mind-personal-check-in': 'life-path',
  'soul-main-session': 'creative',
  'soul-support-session': 'creative',
  'soul-maintenance-session': 'creative',
  'soul-monthly-review': 'creative',
  'soul-vocal-training': 'creative',
  'soul-pinterest-reset': 'creative',
  'organizing-personal-finance-allocation': 'occupation',
  'organizing-savings-allocations': 'occupation',
  'organizing-needed-purchases': 'maintenance',
  'organizing-goal-effort-review': 'life-path',
  'organizing-week-planner-prep': 'life-path',
  'organizing-non-routine-task-review': 'life-path',
  'organizing-next-step-awareness-review': 'life-path',
  'organizing-family-altruism-review': 'life-path',
  'organizing-family-finance-review': 'occupation',
};

const DAILY_ANCHORS = [
  'The goal is attention, not doing everything at once.',
  'Choose priorities and direction before asking for perfect effort.',
  'Rest and recovery support the actions that matter tomorrow.',
  'Joy and curiosity are valid forms of meaningful progress.',
  'Confidence grows through small actions and trusted decisions.',
  'A minimum version still counts as giving this area attention.',
  'Keep what stabilizes daily life visible; let growth practices return at their next cycle.',
];
