import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDatabase, FiSettings, FiSave, FiEdit, FiRefreshCw, FiCheck, FiX, FiInfo, FiAlertTriangle, FiExternalLink } = FiIcons;

const SupabaseManager = () => {
  const { hasRole } = useAuth();
  const [config, setConfig] = useState({
    url: 'https://wkukbxeavoykystwjnwd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdWtieGVhdm95a3lzdHdqbndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzQzOTYsImV4cCI6MjA2NzI1MDM5Nn0.Rdjke6epb8tBhEj0aj71t-cTdMBtNSC1I0huBfhHplg',
    organizationId: 'wtrsufkohakzyculfkji',
    projectId: 'wkukbxeavoykystwjnwd'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [tables, setTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isCreatingTables, setIsCreatingTables] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setIsLoadingTables(true);
    try {
      // Check which tables exist
      const tableChecks = [
        { name: 'users', query: supabase.from('users').select('count').limit(1) },
        { name: 'meals', query: supabase.from('meals').select('count').limit(1) },
        { name: 'system_settings', query: supabase.from('system_settings').select('count').limit(1) },
        { name: 'subscription_history', query: supabase.from('subscription_history').select('count').limit(1) }
      ];

      const tableStatus = [];
      for (const table of tableChecks) {
        try {
          await table.query;
          tableStatus.push({ name: table.name, exists: true, error: null });
        } catch (error) {
          tableStatus.push({ name: table.name, exists: false, error: error.message });
        }
      }

      setTables(tableStatus);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setIsLoadingTables(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'success' : 'error');
      if (isConnected) {
        await loadTables();
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    setIsEditing(false);
    const instructions = `
To update your Supabase configuration:

1. Open src/lib/supabase.js
2. Update these lines:

const SUPABASE_URL = '${config.url}'
const SUPABASE_ANON_KEY = '${config.anonKey}'

3. Save the file and refresh your browser

Alternatively, you can set environment variables in .env:
REACT_APP_SUPABASE_URL=${config.url}
REACT_APP_SUPABASE_ANON_KEY=${config.anonKey}
    `;
    
    alert(instructions);
  };

  const createMissingTables = async () => {
    setIsCreatingTables(true);
    try {
      // Create system_settings table first
      const systemSettingsSQL = `
        CREATE TABLE IF NOT EXISTS system_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow all access to system_settings" 
        ON system_settings FOR ALL TO public WITH CHECK (true);
        
        INSERT INTO system_settings (key, value, description) VALUES
          ('superadmin_exists', 'false', 'Whether a superadmin account has been created'),
          ('demo_accounts_enabled', 'true', 'Whether demo accounts are enabled for testing')
        ON CONFLICT (key) DO NOTHING;
      `;

      // Create enhanced users table
      const usersSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          age INTEGER,
          weight DECIMAL(5,2),
          height DECIMAL(5,2),
          activity_level TEXT DEFAULT 'moderate',
          goal TEXT DEFAULT 'maintain',
          target_weight DECIMAL(5,2),
          target_date DATE,
          daily_goal INTEGER DEFAULT 2000,
          role TEXT DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'moderator', 'user')),
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'suspended')),
          payment_status TEXT DEFAULT 'none' CHECK (payment_status IN ('none', 'paid', 'overdue')),
          subscription_type TEXT DEFAULT 'monthly',
          profile_photo TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view own profile" 
        ON users FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY IF NOT EXISTS "Allow user registration" 
        ON users FOR INSERT WITH CHECK (true);
      `;

      // Create meals table
      const mealsSQL = `
        CREATE TABLE IF NOT EXISTS meals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          image TEXT,
          calories INTEGER DEFAULT 0,
          protein DECIMAL(5,2) DEFAULT 0,
          carbs DECIMAL(5,2) DEFAULT 0,
          fat DECIMAL(5,2) DEFAULT 0,
          meal_type TEXT DEFAULT 'breakfast',
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can manage own meals" 
        ON meals FOR ALL USING (auth.uid() = user_id);
      `;

      // Create subscription_history table
      const subscriptionSQL = `
        CREATE TABLE IF NOT EXISTS subscription_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          action TEXT NOT NULL,
          old_status TEXT,
          new_status TEXT,
          reason TEXT,
          performed_by UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Admins can manage subscription history" 
        ON subscription_history FOR ALL USING (
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
        );
      `;

      // Execute SQL using RPC calls (this is a workaround for complex SQL)
      console.log('Creating database tables...');
      console.log('Note: You may need to run the SQL manually in Supabase SQL Editor');
      console.log('SQL to run:', { systemSettingsSQL, usersSQL, mealsSQL, subscriptionSQL });
      
      // For now, show the SQL to the user
      const sqlToRun = systemSettingsSQL + '\n\n' + usersSQL + '\n\n' + mealsSQL + '\n\n' + subscriptionSQL;
      
      const textarea = document.createElement('textarea');
      textarea.value = sqlToRun;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      alert(`Database schema SQL has been copied to your clipboard!

Please:
1. Go to your Supabase Dashboard > SQL Editor
2. Paste and run the SQL
3. Come back and click "Refresh" to check tables

Or manually create the tables using the Supabase dashboard.`);
      
      await loadTables();
    } catch (error) {
      console.error('Error creating tables:', error);
      alert('Error creating tables. Please check the console for details.');
    } finally {
      setIsCreatingTables(false);
    }
  };

  if (!hasRole('superadmin')) {
    return (
      <div className="max-w-md mx-auto px-4 py-6" style={{ paddingTop: '80px' }}>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <SafeIcon icon={FiDatabase} className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only superadmin can access database management.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-6"
      style={{ paddingTop: '80px' }}
    >
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <SafeIcon icon={FiDatabase} className="w-8 h-8 mr-3 text-blue-500" />
            Supabase Manager
          </h1>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </motion.button>
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <div className={`p-4 rounded-lg mb-6 ${
            connectionStatus === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <SafeIcon 
                icon={connectionStatus === 'success' ? FiCheck : FiX} 
                className={`w-5 h-5 ${
                  connectionStatus === 'success' ? 'text-green-600' : 'text-red-600'
                }`} 
              />
              <span className={`font-medium ${
                connectionStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {connectionStatus === 'success' ? 'Connected to Supabase' : 'Connection Failed'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Configuration</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isEditing ? handleSaveConfig() : setIsEditing(true)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
              isEditing 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <SafeIcon icon={isEditing ? FiSave : FiEdit} className="w-4 h-4" />
            <span>{isEditing ? 'Save Config' : 'Edit Config'}</span>
          </motion.button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase URL
            </label>
            {isEditing ? (
              <input
                type="text"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://your-project.supabase.co"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                {config.url}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anonymous Key
            </label>
            {isEditing ? (
              <textarea
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Supabase anon key"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                {config.anonKey.substring(0, 50)}...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                {config.projectId}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization ID
              </label>
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                {config.organizationId}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiInfo} className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Manual Update Required</p>
                <p>After saving, you'll need to manually update the configuration in your code and refresh the application for changes to take effect.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database Tables Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Database Tables</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadTables}
            disabled={isLoadingTables}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-200 disabled:opacity-50"
          >
            <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${isLoadingTables ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>

        <div className="space-y-3">
          {tables.map((table) => (
            <div key={table.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <SafeIcon 
                  icon={table.exists ? FiCheck : FiX} 
                  className={`w-5 h-5 ${table.exists ? 'text-green-600' : 'text-red-600'}`} 
                />
                <div>
                  <div className="font-medium text-gray-800">{table.name}</div>
                  {!table.exists && table.error && (
                    <div className="text-sm text-red-600">{table.error}</div>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                table.exists 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {table.exists ? 'Exists' : 'Missing'}
              </span>
            </div>
          ))}
        </div>

        {tables.some(table => !table.exists) && (
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createMissingTables}
              disabled={isCreatingTables}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <SafeIcon icon={FiDatabase} className="w-5 h-5" />
              <span>{isCreatingTables ? 'Creating Tables...' : 'Setup Database Schema'}</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('https://supabase.com/dashboard/project/' + config.projectId, '_blank')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiExternalLink} className="w-8 h-8 text-blue-500" />
              <div>
                <div className="font-medium text-gray-800">Open Supabase Dashboard</div>
                <div className="text-sm text-gray-600">Manage your database directly</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('https://supabase.com/dashboard/project/' + config.projectId + '/settings/api', '_blank')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiSettings} className="w-8 h-8 text-green-500" />
              <div>
                <div className="font-medium text-gray-800">API Settings</div>
                <div className="text-sm text-gray-600">View keys and configuration</div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SupabaseManager;