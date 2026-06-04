import { createContext } from 'react';

export const AppContext = createContext<{
  isAnimationEnabled: boolean;
  setIsAnimationEnabled: (isAnimationEnabled: boolean) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}>({
  isAnimationEnabled: false,
  setIsAnimationEnabled: () => {},
  isEditing: false,
  setIsEditing: () => {},
});
