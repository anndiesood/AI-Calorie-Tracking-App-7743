import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDatabase, FiWifi, FiWifiOff, FiRefreshCw, FiCheck, FiX, FiZap, FiHardDrive } = FiIcons;

const SupabaseStatus = () => {
  const { useSupabase } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    setIsConnected(useSupabase);
    setLastChecked(new Date());
  }, [useSupabase]);

  const checkConnection = async () => {
    setIsChecking(true);
    const connected = await testSupabaseConnection();
    setIsConnected(connected);
    setLastChecked(new Date());
    setIsChecking(false);
  };

  const getStatusIcon = () => {
    if (isChecking) return FiRefreshCw;
    if (isConnected) return FiZap;
    return FiHardDrive;
  };

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-50 border-green-200 text-green-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  const getStatusText = () => {
    if (isConnected) return 'LIVE MODE';
    return 'DEV MODE';
  };

  const getStorageText = () => {
    if (isConnected) return 'Supabase';
    return 'localStorage';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-16 right-4 z-40"
    >
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm shadow-sm border ${getStatusColor()}`}>
        <SafeIcon icon={FiDatabase} className="w-4 h-4" />
        <SafeIcon 
          icon={getStatusIcon()} 
          className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} 
        />
        <div className="flex flex-col">
          <span className="font-medium text-xs">
            {getStatusText()}
          </span>
          <span className="text-xs opacity-75">
            {getStorageText()}
          </span>
        </div>
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
          title="Refresh connection status"
        >
          <SafeIcon 
            icon={FiRefreshCw} 
            className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>
      
      {lastChecked && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          Last: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </motion.div>
  );
};

export default SupabaseStatus;