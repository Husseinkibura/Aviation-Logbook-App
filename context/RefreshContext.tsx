import React, { createContext, useState, useContext } from 'react';

const RefreshContext = createContext({
  shouldRefresh: false,
  setShouldRefresh: (_value: boolean) => {},
});

export const RefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const [shouldRefresh, setShouldRefresh] = useState(false);

  return (
    <RefreshContext.Provider value={{ shouldRefresh, setShouldRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
