import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiShield, FiUsers, FiSettings, FiDollarSign, FiPause, FiPlay, 
  FiTrash2, FiEdit, FiSearch, FiRefreshCw, FiAlertTriangle,
  FiTrendingUp, FiCreditCard, FiClock, FiUserX 
} = FiIcons;

const SuperadminPanel = () => {
  const { user, hasRole, useSupabase, suspendUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasRole('superadmin')) {
      loadData();
    }
  }, [activeTab, hasRole, useSupabase]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useSupabase) {
        await Promise.all([
          loadUsers(),
          loadSubscriptionHistory(),
          loadSystemStats()
        ]);
      } else {
        loadLocalData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUsers(data || []);
  };

  const loadSubscriptionHistory = async () => {
    const { data, error } = await supabase
      .from('subscription_history')
      .select(`
        *,
        user:users(name, email),
        performer:performed_by(name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    setSubscriptions(data || []);
  };

  const loadSystemStats = async () => {
    const { data: usersData } = await supabase
      .from('users')
      .select('subscription_status, role, status');

    if (usersData) {
      const stats = {
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => u.status === 'active').length,
        premiumUsers: usersData.filter(u => u.subscription_status === 'premium').length,
        suspendedUsers: usersData.filter(u => u.subscription_status === 'suspended').length,
        adminUsers: usersData.filter(u => ['superadmin', 'admin', 'moderator'].includes(u.role)).length
      };
      setSystemStats(stats);
    }
  };

  const loadLocalData = () => {
    const localUsers = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
    setUsers(localUsers);
    
    const stats = {
      totalUsers: localUsers.length,
      activeUsers: localUsers.filter(u => u.status === 'active').length,
      premiumUsers: localUsers.filter(u => u.subscription_status === 'premium').length,
      suspendedUsers: localUsers.filter(u => u.subscription_status === 'suspended').length,
      adminUsers: localUsers.filter(u => ['superadmin', 'admin', 'moderator'].includes(u.role)).length
    };
    setSystemStats(stats);
  };

  const handleSuspendUser = async (userId, reason = 'Manual suspension by superadmin') => {
    if (window.confirm('Are you sure you want to suspend this user? They will be logged out immediately.')) {
      const result = await suspendUser(userId, reason);
      if (result.success) {
        await loadData();
      } else {
        setError(result.error);
      }
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      if (useSupabase) {
        const { error } = await supabase
          .from('users')
          .update({ 
            subscription_status: 'free',
            payment_status: 'none',
            status: 'active'
          })
          .eq('id', userId);

        if (error) throw error;

        // Log the action
        await supabase
          .from('subscription_history')
          .insert([{
            user_id: userId,
            action: 'reactivated',
            old_status: 'suspended',
            new_status: 'free',
            reason: 'Manual reactivation by superadmin',
            performed_by: user.id
          }]);
      } else {
        const localUsers = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        const userIndex = localUsers.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
          localUsers[userIndex].subscription_status = 'free';
          localUsers[userIndex].payment_status = 'none';
          localUsers[userIndex].status = 'active';
          localStorage.setItem('mealTracker_users', JSON.stringify(localUsers));
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error reactivating user:', error);
      setError('Failed to reactivate user');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      if (useSupabase) {
        const { error } = await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', userId);

        if (error) throw error;
      } else {
        const localUsers = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        const userIndex = localUsers.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
          localUsers[userIndex].role = newRole;
          localStorage.setItem('mealTracker_users', JSON.stringify(localUsers));
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || u.subscription_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'subscriptions', label: 'Subscriptions', icon: FiDollarSign },
    { id: 'system', label: 'System Settings', icon: FiSettings }
  ];

  const roles = [
    { value: 'superadmin', label: 'Superadmin', color: 'bg-purple-100 text-purple-800' },
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' },
    { value: 'moderator', label: 'Moderator', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'user', label: 'User', color: 'bg-green-100 text-green-800' }
  ];

  if (!hasRole('superadmin')) {
    return (
      <div className="max-w-md mx-auto px-4 py-6" style={{ paddingTop: '80px' }}>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <SafeIcon icon={FiShield} className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only superadmin can access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto px-4 py-6 space-y-6"
      style={{ paddingTop: '80px' }}
    >
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <SafeIcon icon={FiShield} className="w-8 h-8 mr-3 text-purple-500" />
            Superadmin Panel
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              {useSupabase ? '✓ Supabase' : '⚠ localStorage'}
            </span>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon 
                icon={FiRefreshCw} 
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers || 0}</div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{systemStats.activeUsers || 0}</div>
            <div className="text-sm text-green-700">Active Users</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{systemStats.premiumUsers || 0}</div>
            <div className="text-sm text-purple-700">Premium Users</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{systemStats.suspendedUsers || 0}</div>
            <div className="text-sm text-red-700">Suspended</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{systemStats.adminUsers || 0}</div>
            <div className="text-sm text-yellow-700">Admin Users</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">User Management</h2>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Subscription</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium">{u.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{u.name}</div>
                          <div className="text-sm text-gray-600">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={u.id === user.id}
                      >
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.subscription_status === 'premium' ? 'bg-green-100 text-green-800' :
                        u.subscription_status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.subscription_status || 'free'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        u.payment_status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.payment_status || 'none'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        {u.id !== user.id && (
                          <>
                            {u.subscription_status === 'suspended' ? (
                              <button
                                onClick={() => handleReactivateUser(u.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Reactivate user"
                              >
                                <SafeIcon icon={FiPlay} className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(u.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Suspend user"
                              >
                                <SafeIcon icon={FiPause} className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription History</h2>
          
          {subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status Change</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.slice(0, 20).map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{sub.user?.name}</div>
                        <div className="text-sm text-gray-600">{sub.user?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sub.action === 'suspended' ? 'bg-red-100 text-red-800' :
                          sub.action === 'reactivated' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {sub.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {sub.old_status} → {sub.new_status}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {sub.reason || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {sub.performer?.name || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiCreditCard} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No subscription history</h3>
              <p className="text-gray-600">Subscription changes will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Settings</h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Superadmin Features</h3>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    <li>• Full user management and role assignment</li>
                    <li>• Subscription control and billing management</li>
                    <li>• System-wide settings and configuration</li>
                    <li>• User suspension and reactivation</li>
                    <li>• Complete audit trail and activity logs</li>
                    <li>• Demo account management</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Database Status</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {useSupabase ? 'Connected to Supabase' : 'Using localStorage fallback'}
                </p>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  useSupabase ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {useSupabase ? 'Production Ready' : 'Development Mode'}
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Demo Accounts</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Demo accounts are automatically disabled when superadmin is created
                </p>
                <div className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                  Disabled
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SuperadminPanel;