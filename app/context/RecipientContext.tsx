import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Bank {
  name: string;
  code?: string;
  logo: any;
}

interface RecipientContextType {
  selectedBank: Bank | null;
  setSelectedBank: (bank: Bank | null) => void;
  country: string;
  setCountry: (country: string) => void;
  recipientId: string | null;
  setRecipientId: (id: string | null) => void;
}

const RecipientContext = createContext<RecipientContextType | undefined>(undefined);

export const RecipientProvider = ({ children }: { children: ReactNode }) => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [country, setCountry] = useState<string>('PK');
  const [recipientId, setRecipientId] = useState<string | null>(null);

  // Debug: Log whenever recipientId changes
  const debugSetRecipientId = (id: string | null) => {
    console.log('🔄 RecipientContext: Setting recipientId to:', id);
    console.log('📱 Previous recipientId was:', recipientId);
    setRecipientId(id);
  };

  // Debug: Log current state
  console.log('🔄 RecipientContext: Current state:', { 
    selectedBank: selectedBank?.name, 
    country, 
    recipientId 
  });

  return (
    <RecipientContext.Provider value={{ 
      selectedBank, 
      setSelectedBank, 
      country, 
      setCountry, 
      recipientId, 
      setRecipientId: debugSetRecipientId 
    }}>
      {children}
    </RecipientContext.Provider>
  );
};

export const useRecipient = () => {
  const context = useContext(RecipientContext);
  if (!context) {
    throw new Error('useRecipient must be used within a RecipientProvider');
  }
  return context;
};

// Default export to prevent Expo Router from treating this as a route
export default RecipientContext; 