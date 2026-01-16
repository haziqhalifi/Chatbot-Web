import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  User,
  RefreshCw,
  Mail,
  MapPin,
  Calendar,
  MoreVertical,
  Shield,
  UserX,
  UserCheck,
  Ban,
  Unlock,
} from 'lucide-react';
import {
  AdminLayout,
  PageHeader,
  StatsCard,
  Card,
  Table,
  Badge,
  Button,
} from '../../components/admin';

const SimplifiedManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [processing, setProcessing] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/admin/users', {
        headers: { 'X-API-KEY': 'secretkey' },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId, userEmail) => {
    if (!confirm(`Promote ${userEmail} to admin?`)) return;

    try {
      setProcessing(userId);
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/promote`, {
        method: 'POST',
        headers: { 'X-API-KEY': 'secretkey' },
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error promoting user:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDemoteToUser = async (userId, userEmail) => {
    if (!confirm(`Demote ${userEmail} to regular user?`)) return;

    try {
      setProcessing(userId);
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/demote`, {
        method: 'POST',
        headers: { 'X-API-KEY': 'secretkey' },
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error demoting user:', error);
    } finally {
      setProcessing(null);
      setOpenMenuId(null);
    }
  };

  const handleSuspendUser = async (userId, userEmail) => {
    const reason = prompt(`Suspend ${userEmail}? Enter reason (optional):`);
    if (reason === null) return; // User clicked cancel

    try {
      setProcessing(userId);
      const url = new URL(`http://localhost:8000/admin/users/${userId}/suspend`);
      if (reason) url.searchParams.append('reason', reason);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'X-API-KEY': 'secretkey' },
      });

      if (response.ok) {
        await fetchUsers();
        alert('User suspended successfully');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    } finally {
      setProcessing(null);
      setOpenMenuId(null);
    }
  };

  const handleBlockUser = async (userId, userEmail) => {
    const reason = prompt(`Block ${userEmail}? Enter reason (optional):`);
    if (reason === null) return; // User clicked cancel

    try {
      setProcessing(userId);
      const url = new URL(`http://localhost:8000/admin/users/${userId}/block`);
      if (reason) url.searchParams.append('reason', reason);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'X-API-KEY': 'secretkey' },
      });

      if (response.ok) {
        await fetchUsers();
        alert('User blocked successfully');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user');
    } finally {
      setProcessing(null);
      setOpenMenuId(null);
    }
  };

  const handleUnblockUser = async (userId, userEmail) => {
    if (!confirm(`Reactivate ${userEmail}'s account?`)) return;

    try {
      setProcessing(userId);
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers: { 'X-API-KEY': 'secretkey' },
      });

      if (response.ok) {
        await fetchUsers();
        alert('User account reactivated successfully');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    } finally {
      setProcessing(null);
      setOpenMenuId(null);
    }
  };

  const toggleMenu = (userId) => {
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'All' || (user.account_status || 'active') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleVariant = (role) => {
    return role === 'admin' ? 'purple' : 'default';
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      active: 'success',
      suspended: 'warning',
      blocked: 'danger',
    };
    return variants[status] || 'default';
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Manage Users"
        description="View and manage user accounts"
        icon={Users}
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={fetchUsers} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard title="Total Users" value={users.length} icon={Users} color="blue" />
        <StatsCard
          title="Admin Users"
          value={users.filter((u) => u.role === 'admin').length}
          icon={Crown}
          color="purple"
        />
        <StatsCard
          title="Regular Users"
          value={users.filter((u) => u.role !== 'admin').length}
          icon={User}
          color="gray"
        />
      </div>

      {/* Filters & Table */}
      <Card>
        <Card.Content className="pb-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="Public">Public</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </Card.Content>

        <Card.Content className="pt-0">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>User</Table.Head>
                  <Table.Head>Role</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Location</Table.Head>
                  <Table.Head>Joined</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredUsers.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-medium text-sm">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getRoleVariant(user.role)}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusBadgeVariant(user.account_status || 'active')}>
                        {(user.account_status || 'active').charAt(0).toUpperCase() +
                          (user.account_status || 'active').slice(1)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {user.city ? (
                        <span className="flex items-center text-gray-700">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {user.city}
                          {user.country && `, ${user.country}`}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="flex items-center text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(user.created_at)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(user.id);
                          }}
                          disabled={processing === user.id}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600" />
                        </button>

                        {openMenuId === user.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              {user.role === 'admin' ? (
                                <button
                                  onClick={() => handleDemoteToUser(user.id, user.email)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                                >
                                  <User className="h-4 w-4" />
                                  <span>Demote to User</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePromoteToAdmin(user.id, user.email)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-purple-700"
                                >
                                  <Crown className="h-4 w-4" />
                                  <span>Promote to Admin</span>
                                </button>
                              )}

                              <div className="border-t border-gray-200 my-1"></div>

                              {(user.account_status || 'active') === 'active' ? (
                                <>
                                  <button
                                    onClick={() => handleSuspendUser(user.id, user.email)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-yellow-700"
                                  >
                                    <UserX className="h-4 w-4" />
                                    <span>Suspend Account</span>
                                  </button>
                                  <button
                                    onClick={() => handleBlockUser(user.id, user.email)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-700"
                                  >
                                    <Ban className="h-4 w-4" />
                                    <span>Block Account</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleUnblockUser(user.id, user.email)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-green-700"
                                >
                                  <Unlock className="h-4 w-4" />
                                  <span>Reactivate Account</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>

        {!loading && filteredUsers.length > 0 && (
          <Card.Footer>
            <p className="text-sm text-gray-600 text-center">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </Card.Footer>
        )}
      </Card>
    </AdminLayout>
  );
};

export default SimplifiedManageUsers;
