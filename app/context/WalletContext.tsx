import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

interface WalletData {
  balance: number;
  transactions: any[];
  lastUpdated: string;
}

interface WalletContextType {
  walletData: WalletData;
  loading: boolean;
  refreshWallet: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  addTransaction: (transaction: any) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    transactions: [],
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);

  const refreshWallet = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/wallet/get-by-user');
      
      if (response && response.balance !== undefined) {
        console.log('🔍 Wallet API response:', response);
        console.log('📝 Transactions from API:', response.transactions);
        
        // Ensure all transactions have a date field
        const transactionsWithDates = (response.transactions || []).map(tx => ({
          ...tx,
          date: tx.date || tx.createdAt || new Date().toISOString()
        }));
        
        console.log('📝 Transactions with dates:', transactionsWithDates);
        
        setWalletData({
          balance: response.balance,
          transactions: transactionsWithDates,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Wallet refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBalance = useCallback((newBalance: number) => {
    setWalletData(prev => ({
      ...prev,
      balance: newBalance,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const addTransaction = useCallback((transaction: any) => {
    // Ensure transaction has a date field
    const transactionWithDate = {
      ...transaction,
      date: transaction.date || transaction.createdAt || new Date().toISOString()
    };
    
    console.log('📝 Adding transaction with date:', transactionWithDate);
    
    setWalletData(prev => ({
      ...prev,
      transactions: [transactionWithDate, ...prev.transactions].slice(0, 10), // Keep only last 10
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const value: WalletContextType = {
    walletData,
    loading,
    refreshWallet,
    updateBalance,
    addTransaction
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Add default export to fix expo-router error
export default WalletProvider;
