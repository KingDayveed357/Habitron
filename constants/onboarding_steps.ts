// // app/constants/onboarding_steps.ts
// import { OnboardingStep } from "@/interfaces/interfaces";
// import { Dimensions } from "react-native";

// const SCREEN_WIDTH = Dimensions.get('window').width;
// const SCREEN_HEIGHT = Dimensions.get('window').height;

// const ONBOARDING_STEPS: OnboardingStep[] = [
//   {
//     id: 1,
//     title: 'How long do you usually sleep each night? 😴',
//     subtitle: 'Understanding your sleeping patterns helps us optimize your habit tracking experience.',
//     type: 'single',
//     options: [
//       { id: '1', label: 'Less than 5 hours', emoji: '😴' },
//       { id: '2', label: '5 - 7 hours', emoji: '😴' },
//       { id: '3', label: '7 - 8 hours', emoji: '😴' },
//       { id: '4', label: '8 - 9 hours', emoji: '😴' },
//       { id: '5', label: 'More than 9 hours', emoji: '😴' },
//     ],
//   },
//   {
//     id: 2,
//     title: 'What time do you usually wake up? 🌅',
//     subtitle: 'Knowing your wake time helps us create a healthy routine that matches your lifestyle.',
//     type: 'time',
//   },
//   {
//     id: 3,
//     title: 'What time do you usually end your day? 🌙',
//     subtitle: 'Let us know when you typically end your day so we can optimize your evening routine.',
//     type: 'time',
//   },
//   {
//     id: 4,
//     title: 'Do you often procrastinate? 👀',
//     subtitle: 'Understanding your procrastination tendencies helps us tailor strategies to keep you on track.',
//     type: 'single',
//     options: [
//       { id: '1', label: 'Always', emoji: '😅' },
//       { id: '2', label: 'Sometimes', emoji: '🙂' },
//       { id: '3', label: 'Rarely', emoji: '😊' },
//       { id: '4', label: 'Never', emoji: '😇' },
//     ],
//   },
//   {
//     id: 5,
//     title: 'Do you often find it hard to focus? 🧠',
//     subtitle: 'Let us know if focus is a struggle for you so we can provide targeted support.',
//     type: 'single',
//     options: [
//       { id: '1', label: 'Constantly', emoji: '😵' },
//       { id: '2', label: 'Occasionally', emoji: '😐' },
//       { id: '3', label: 'Rarely', emoji: '🙂' },
//       { id: '4', label: 'Never', emoji: '😎' },
//     ],
//   },
//   {
//     id: 6,
//     title: 'What influenced you to become organized? ⚡',
//     subtitle: 'Understanding your motivations helps us align with your goals. Select all that apply.',
//     type: 'multiple',
//     options: [
//       { id: '1', label: 'Lack of Motivation', emoji: '😔' },
//       { id: '2', label: 'Work Overload', emoji: '💼' },
//       { id: '3', label: 'Cluttered Environment', emoji: '🏠' },
//       { id: '4', label: 'Digital Distractions', emoji: '📱' },
//       { id: '5', label: 'Lack of Time Management', emoji: '⏰' },
//     ],
//   },
//   {
//     id: 7,
//     title: 'What do you want to achieve with ? 💪',
//     subtitle: 'Your aspirations guide our efforts to support and empower you on your journey. Select all that apply.',
//     type: 'multiple',
//     options: [
//       { id: '1', label: 'Build Healthy Habits', emoji: '🍎' },
//       { id: '2', label: 'Boost Productivity', emoji: '🚀' },
//       { id: '3', label: 'Achieve Personal Goals', emoji: '🎯' },
//       { id: '4', label: 'Manage Stress & Anxiety', emoji: '😌' },
//       { id: '5', label: 'Other (Specify)', emoji: '✨' },
//     ],
//   },
//   {
//     id: 8,
//     title: "Let's make a contract ✍️",
//     subtitle: 'Review & sign your personalized commitment to achieving your goals with Habitron.',
//     type: 'contract',
//   },
// ];

// export default ONBOARDING_STEPS



// app/constants/onboarding_steps.ts
import { OnboardingStep } from "@/interfaces/interfaces";

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "What areas of your life do you want to improve?",
    subtitle: "Choose all that matter to you. This helps us personalize your habit suggestions.",
    type: 'multiple',
    options: [
      { id: 'health', label: 'Health & Fitness', emoji: '💪' },
      { id: 'productivity', label: 'Productivity & Focus', emoji: '🎯' },
      { id: 'mindfulness', label: 'Mindfulness & Mental Health', emoji: '🧘' },
      { id: 'learning', label: 'Learning & Growth', emoji: '📚' },
      { id: 'social', label: 'Relationships & Social', emoji: '🤝' },
      { id: 'finance', label: 'Financial Wellness', emoji: '💰' },
    ],
  },
  {
    id: 2,
    title: "What time do you usually start your day?",
    subtitle: "We'll suggest morning habits that fit your natural rhythm.",
    type: 'time',
    context: 'wakeup'
  },
  {
    id: 3,
    title: "What's your biggest challenge right now?",
    subtitle: "Understanding your struggles helps us provide better support.",
    type: 'single',
    options: [
      { id: 'motivation', label: 'Staying motivated', emoji: '😔' },
      { id: 'consistency', label: 'Being consistent', emoji: '🔄' },
      { id: 'focus', label: 'Maintaining focus', emoji: '🧠' },
      { id: 'overwhelm', label: 'Feeling overwhelmed', emoji: '😰' },
      { id: 'procrastination', label: 'Procrastination', emoji: '⏰' },
      { id: 'stress', label: 'Managing stress', emoji: '😤' },
    ],
  },
  {
    id: 4,
    title: "How would you describe your current routine?",
    subtitle: "This helps us understand where you're starting from.",
    type: 'single',
    options: [
      { id: 'no_routine', label: 'I have no routine', emoji: '🌪️' },
      { id: 'inconsistent', label: 'Inconsistent and chaotic', emoji: '📉' },
      { id: 'some_structure', label: 'Some structure, but needs work', emoji: '🔨' },
      { id: 'fairly_structured', label: 'Fairly structured', emoji: '📋' },
      { id: 'very_structured', label: 'Very structured and disciplined', emoji: '🎖️' },
    ],
  },
  {
    id: 5,
    title: "What time of day do you feel most productive?",
    subtitle: "We'll schedule your most important habits during your peak hours.",
    type: 'single',
    options: [
      { id: 'early_morning', label: 'Early Morning (5-8 AM)', emoji: '🌅' },
      { id: 'morning', label: 'Morning (8-12 PM)', emoji: '☀️' },
      { id: 'afternoon', label: 'Afternoon (12-5 PM)', emoji: '🌤️' },
      { id: 'evening', label: 'Evening (5-9 PM)', emoji: '🌆' },
      { id: 'night', label: 'Night Owl (9 PM+)', emoji: '🌙' },
    ],
  },
  {
    id: 6,
    title: "How much time can you realistically commit daily?",
    subtitle: "Be honest - we'll recommend habits that fit your schedule.",
    type: 'single',
    options: [
      { id: '5min', label: '5-10 minutes', emoji: '⚡' },
      { id: '15min', label: '15-30 minutes', emoji: '⏱️' },
      { id: '30min', label: '30-60 minutes', emoji: '⏰' },
      { id: '60min', label: '1+ hours', emoji: '🕐' },
    ],
  },
  {
    id: 7,
    title: "What motivates you most?",
    subtitle: "We'll use this to craft personalized encouragement and rewards.",
    type: 'multiple',
    maxSelections: 3,
    options: [
      { id: 'progress', label: 'Seeing visible progress', emoji: '📈' },
      { id: 'competition', label: 'Competing with others', emoji: '🏆' },
      { id: 'achievement', label: 'Unlocking achievements', emoji: '🎖️' },
      { id: 'accountability', label: 'Being held accountable', emoji: '👥' },
      { id: 'rewards', label: 'Earning rewards', emoji: '🎁' },
      { id: 'health', label: 'Better health', emoji: '❤️' },
      { id: 'impact', label: 'Making an impact', emoji: '🌍' },
    ],
  },
  {
    id: 8,
    title: "Let's set your commitment level",
    subtitle: "Make a promise to yourself. Your future self will thank you!",
    type: 'contract',
  },
];

export default ONBOARDING_STEPS;