import { TextAnimationType } from '../types.ts';

export function getAnimationClass(anim: TextAnimationType): string {
  switch (anim) {
    case 'fade':
      return 'animate-fade-in';
    case 'slide_up':
      return 'animate-slide-up';
    case 'pop':
      return 'animate-pop-in';
    default:
      return '';
  }
}
