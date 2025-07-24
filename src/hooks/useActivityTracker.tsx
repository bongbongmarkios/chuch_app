
// src/hooks/useActivityTracker.tsx
'use client';

import type { UserActivity, Hymn } from '@/types'; // Import Hymn type
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

const MAX_RECENT_ITEMS = 10; // Keep a rolling window of 10 items for each category

interface ActivityContextType extends UserActivity {
  addHymnView: (hymnTitleEnglish: string) => void; // Parameter is now explicitly English title
  addReadingView: (title: string) => void;
  addProgramItemView: (title: string) => void;
  clearActivity: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const getInitialState = (): UserActivity => {
  if (typeof window !== 'undefined') {
    const storedActivity = localStorage.getItem('userActivity');
    if (storedActivity) {
      try {
        const parsed = JSON.parse(storedActivity) as UserActivity;
        // Ensure arrays are initialized if not present
        return {
          recentHymns: parsed.recentHymns || [],
          recentReadings: parsed.recentReadings || [],
          recentProgramItems: parsed.recentProgramItems || [],
        };
      } catch (error) {
        console.error("Failed to parse user activity from localStorage", error);
      }
    }
  }
  return {
    recentHymns: [],
    recentReadings: [],
    recentProgramItems: [],
  };
};


export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [activity, setActivity] = useState<UserActivity>(getInitialState);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userActivity', JSON.stringify(activity));
    }
  }, [activity]);


  const addToRollingArray = useCallback((arr: string[], item: string) => {
    const newArr = [item, ...arr.filter(i => i !== item)]; // Add to front, remove duplicates
    return newArr.slice(0, MAX_RECENT_ITEMS);
  }, []);

  // Updated to accept English title for consistency in tracking
  const addHymnView = useCallback((hymnTitleEnglish: string) => {
    setActivity(prev => ({
      ...prev,
      recentHymns: addToRollingArray(prev.recentHymns, hymnTitleEnglish),
    }));
  }, [addToRollingArray]);

  const addReadingView = useCallback((title: string) => {
    setActivity(prev => ({
      ...prev,
      recentReadings: addToRollingArray(prev.recentReadings, title),
    }));
  }, [addToRollingArray]);

  const addProgramItemView = useCallback((title: string) => {
    setActivity(prev => ({
      ...prev,
      recentProgramItems: addToRollingArray(prev.recentProgramItems, title),
    }));
  }, [addToRollingArray]);
  
  const clearActivity = useCallback(() => {
    const clearedState = { recentHymns: [], recentReadings: [], recentProgramItems: [] };
    setActivity(clearedState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userActivity', JSON.stringify(clearedState));
    }
  }, []);

  return (
    <ActivityContext.Provider value={{ ...activity, addHymnView, addReadingView, addProgramItemView, clearActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};
