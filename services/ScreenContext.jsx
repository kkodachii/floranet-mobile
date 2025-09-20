import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'expo-router';

const ScreenContext = createContext();

export const useScreenContext = () => {
  const context = useContext(ScreenContext);
  if (!context) {
    throw new Error('useScreenContext must be used within a ScreenProvider');
  }
  return context;
};

export const ScreenProvider = ({ children }) => {
  const pathname = usePathname();
  const [currentScreen, setCurrentScreen] = useState(pathname);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setCurrentScreen(pathname);
  }, [pathname]);

  const isChatScreen = () => {
    return currentScreen === '/Chat/ChatHomepage' || currentScreen === '/Chat/ChatScreen';
  };

  const isChatHomepage = () => {
    return currentScreen === '/Chat/ChatHomepage';
  };

  const isChatScreenOnly = () => {
    return currentScreen === '/Chat/ChatScreen';
  };

  const shouldPollConversations = () => {
    // Only poll conversations when on ChatHomepage AND modal is not open AND not searching
    return currentScreen === '/Chat/ChatHomepage' && !isModalOpen && !isSearching;
  };

  const setModalState = (open) => {
    setIsModalOpen(open);
    if (!open) {
      setIsSearching(false); // Reset searching state when modal closes
    }
  };

  const setSearchingState = (searching) => {
    setIsSearching(searching);
  };

  const value = {
    currentScreen,
    isChatScreen,
    isChatHomepage,
    isChatScreenOnly,
    shouldPollConversations,
    setModalState,
    setSearchingState,
  };

  return (
    <ScreenContext.Provider value={value}>
      {children}
    </ScreenContext.Provider>
  );
};
