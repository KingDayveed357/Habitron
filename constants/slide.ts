// slides.ts
import { Slide } from '@/interfaces/interfaces';
import { icons } from './icons'; // adjust path as needed

export const slides: Slide[] = [
  {
    id: '1',
    title: 'Welcome to Habitron - Your Personal Habit Tracker!',
    description: 'Take control of your habits and transform your life with Habitron. Let’s get started on your journey to success!',
    image: icons.onboarding1,
  },
  {
    id: '2',
    title: 'Explore Habitron Features for Your Journey!',
    description: 'With intuitive habit creation and insightful progress tracking, Habitron makes it easy to stay focused, motivated, and accountable.',
    image: icons.onboarding2,
  },
  {
    id: '3',
    title: 'Unlock Your Potential with Habitron Now!',
    description: 'Achieve your goals with Habitron’s suite of features. Start your habit journey today and unlock your full potential!',
    image: icons.onboarding3,
  },
];
