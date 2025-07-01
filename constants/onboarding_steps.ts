import { OnboardingStep } from "@/interfaces/interfaces";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'How long do you usually sleep each night? 😴',
    subtitle: 'Understanding your sleeping patterns helps us optimize your habit tracking experience.',
    type: 'single',
    options: [
      { id: '1', label: 'Less than 5 hours', emoji: '😴' },
      { id: '2', label: '5 - 7 hours', emoji: '😴' },
      { id: '3', label: '7 - 8 hours', emoji: '😴' },
      { id: '4', label: '8 - 9 hours', emoji: '😴' },
      { id: '5', label: 'More than 9 hours', emoji: '😴' },
    ],
  },
  {
    id: 2,
    title: 'What time do you usually wake up? 🌅',
    subtitle: 'Knowing your wake time helps us create a healthy routine that matches your lifestyle.',
    type: 'time',
  },
  {
    id: 3,
    title: 'What time do you usually end your day? 🌙',
    subtitle: 'Let us know when you typically end your day so we can optimize your evening routine.',
    type: 'time',
  },
  {
    id: 4,
    title: 'Do you often procrastinate? 👀',
    subtitle: 'Understanding your procrastination tendencies helps us tailor strategies to keep you on track.',
    type: 'single',
    options: [
      { id: '1', label: 'Always', emoji: '😅' },
      { id: '2', label: 'Sometimes', emoji: '🙂' },
      { id: '3', label: 'Rarely', emoji: '😊' },
      { id: '4', label: 'Never', emoji: '😇' },
    ],
  },
  {
    id: 5,
    title: 'Do you often find it hard to focus? 🧠',
    subtitle: 'Let us know if focus is a struggle for you so we can provide targeted support.',
    type: 'single',
    options: [
      { id: '1', label: 'Constantly', emoji: '😵' },
      { id: '2', label: 'Occasionally', emoji: '😐' },
      { id: '3', label: 'Rarely', emoji: '🙂' },
      { id: '4', label: 'Never', emoji: '😎' },
    ],
  },
  {
    id: 6,
    title: 'What influenced you to become organized? ⚡',
    subtitle: 'Understanding your motivations helps us align with your goals. Select all that apply.',
    type: 'multiple',
    options: [
      { id: '1', label: 'Lack of Motivation', emoji: '😔' },
      { id: '2', label: 'Work Overload', emoji: '💼' },
      { id: '3', label: 'Cluttered Environment', emoji: '🏠' },
      { id: '4', label: 'Digital Distractions', emoji: '📱' },
      { id: '5', label: 'Lack of Time Management', emoji: '⏰' },
    ],
  },
  {
    id: 7,
    title: 'What do you want to achieve with ? 💪',
    subtitle: 'Your aspirations guide our efforts to support and empower you on your journey. Select all that apply.',
    type: 'multiple',
    options: [
      { id: '1', label: 'Build Healthy Habits', emoji: '🍎' },
      { id: '2', label: 'Boost Productivity', emoji: '🚀' },
      { id: '3', label: 'Achieve Personal Goals', emoji: '🎯' },
      { id: '4', label: 'Manage Stress & Anxiety', emoji: '😌' },
      { id: '5', label: 'Other (Specify)', emoji: '✨' },
    ],
  },
  {
    id: 8,
    title: "Let's make a contract ✍️",
    subtitle: 'Review & sign your personalized commitment to achieving your goals with Habitron.',
    type: 'contract',
  },
];

export default ONBOARDING_STEPS