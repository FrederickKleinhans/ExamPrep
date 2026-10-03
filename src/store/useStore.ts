import { create } from 'zustand';
import { createDataSlice } from './dataSlice';
import { createExamSlice } from './examSlice';
import { createStudySlice } from './studySlice';
import type { Store } from './storeTypes';

export const useStore = create<Store>()((...args) => ({
  ...createDataSlice(...args),
  ...createStudySlice(...args),
  ...createExamSlice(...args),
}));
