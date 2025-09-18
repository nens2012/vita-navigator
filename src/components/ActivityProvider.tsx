import { FC, PropsWithChildren } from 'react';
import { ActivityContext } from '../context/ActivityContext';
import { useActivityData } from '../hooks/useActivityData';

export const ActivityProvider: FC<PropsWithChildren> = ({ children }) => {
  const activityData = useActivityData();

  return (
    <ActivityContext.Provider value={activityData}>
      {children}
    </ActivityContext.Provider>
  );
};