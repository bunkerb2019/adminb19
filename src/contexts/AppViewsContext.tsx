import React, {createContext, SetStateAction, useContext, useMemo, useState} from 'react';
import {useViewsStatistics} from "../hooks/useViewsStatistics.ts";
import {RefetchOptions} from "@tanstack/react-query";

interface IAppViewsContext {
  data: {
    views?: Record<string, number>;
  } | undefined;
  filteredAndSortedData: Array<{name: string, value: number}>;
  isLoading: boolean;
  error: Error | null;
  refetch: (options?: RefetchOptions) => Promise<unknown>;
  selectedTimeRange: {
    month: number;
    year: number;
  };
  setSelectedTimeRange: React.Dispatch<SetStateAction<{
    month: number;
    year: number;
  }>>;
}

const AppViewsContext = createContext<IAppViewsContext>({
  data: undefined,
  filteredAndSortedData: [{name: '', value: 0}],
  isLoading: true,
  error: null,
  refetch: async () => {
  },
  selectedTimeRange: {month: new Date().getMonth() + 1, year: new Date().getFullYear()},
  setSelectedTimeRange: () => {
  },
});

export const AppViewsProvider = ({children}: {
  children: React.ReactNode;
}) => {
  const {data, isLoading, error, refetch} = useViewsStatistics();

  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    month: number,
    year: number
  }>({month: new Date().getMonth() + 1, year: new Date().getFullYear()});

  const filteredAndSortedData = useMemo(() => {
    if (!data?.views) {
      return [{name: '', value: 0}]
    }

    return Object.entries(data?.views)
      .filter(([date]) => {
        const d = new Date(date);
        return d.getFullYear() === selectedTimeRange.year && d.getMonth() + 1 === selectedTimeRange.month;
      })
      .sort(([dateA], [dateB]) => Number(new Date(dateA)) - Number(new Date(dateB)))
      .map(([date, value]) => ({
        name: date,
        value,
      }))
  }, [data, selectedTimeRange]);

  return (
    <AppViewsContext.Provider value={{
      data,
      filteredAndSortedData,
      isLoading,
      error,
      refetch,
      selectedTimeRange,
      setSelectedTimeRange,
    }}>
      {children}
    </AppViewsContext.Provider>
  );
};

export const useAppViewsContext = () => {
  const ctx = useContext(AppViewsContext);
  if (!ctx) throw new Error("useAppViewsContext must be used inside AppViewsProvider");
  return ctx;
};