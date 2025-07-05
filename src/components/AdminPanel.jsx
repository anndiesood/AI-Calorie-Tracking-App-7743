import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiShield, FiEdit, FiTrash2, FiPlus, FiSearch, FiRefreshCw } = FiIcons;

const AdminPanel = () => {
  const { user, hasPermission, useSupabase } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasPermission('manage_users')) {
      loadUsers();
    }
  }, [useSupabase, hasPermission]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useSupabase) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } else {
        // Load from localStorage
        const allUsers = JSON.parse(localStorage.getItem('mealTracker_users') || '[]');
        setUsers(allUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const updateUserRole = async (userId, newRole) => {
    try {
      if (useSupabase) {
        // Update in Supabase
        const { error } = await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Update in localStorage
        const updatedUsers = users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        );
        localStorage.setItem('mealTracker_users', JSON.stringify(updatedUsers));
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      if (useSupabase) {
        // Update in Supabase
        const { error } = await supabase
          .from('users')
          .update({ status: newStatus })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Update in localStorage
        const updatedUsers = users.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        );
        localStorage.setItem('mealTracker_users', JSON.stringify(updatedUsers));
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their meal data.')) {
      try {
        if (useSupabase) {
          // Delete from Supabase (meals will be deleted via cascade)
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

          if (error) throw error;
        } else {
          // Delete from localStorage
          const updatedUsers = users.filter(u => u.id !== userId);
          localStorage.setItem('mealTracker_users', JSON.stringify(updatedUsers));
          localStorage.removeItem(`mealTracker_${userId}`);
        }

        // Update local state
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  const roles = [
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' },
    { value: 'moderator', label: 'Moderator', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'user', label: 'User', color: 'bg-green-100 text-green-800' }
  ];

  if (!hasPermission('manage_users')) {
    return (
      <div className="max-w-md mx-auto px-4 py-6" style={{ paddingTop: '80px' }}>
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <SafeIcon icon={FiShield} className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-6"
      style={{ paddingTop: '80px' }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <SafeIcon icon={FiUsers} className="w-8 h-8 mr-3 text-primary-500" />
            User Management
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 flex items-center space-x-4">
              <span>Total Users: {users.length}</span>
              {useSupabase && <span className="text-green-600">✓ Supabase</span>}
              {!useSupabase && <span className="text-yellow-600">⚠ localStorage</span>}
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon 
                icon={FiRefreshCw} 
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            {u.profile_photo || u.profilePhoto ? (
                              <img 
                                src={u.profile_photo || u.profilePhoto} 
                                alt={u.name} 
                                className="w-full h-full object-cover rounded-full" 
                              />
                            ) : (
                              <span className="text-primary-600 font-medium">{u.name?.charAt(0) || 'U'}</span>
                            )}
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
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={u.id === user.id}
                        >
                          {roles.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={u.status || 'active'}
                          onChange={(e) => updateUserStatus(u.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={u.id === user.id}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(u.created_at || u.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {u.id !== user.id && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <SafeIcon icon={FiUsers} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedRole !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No users have signed up yet.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AdminPanel;