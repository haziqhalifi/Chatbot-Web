import React, { useState, useEffect } from 'react';
import { Users, Crown, User, RefreshCw, Mail, MapPin, Calendar } from 'lucide-react';
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
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleVariant = (role) => {
    return role === 'admin' ? 'purple' : 'default';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                      {user.role === 'admin' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={User}
                          onClick={() => handleDemoteToUser(user.id, user.email)}
                          disabled={processing === user.id}
                        >
                          {processing === user.id ? 'Processing...' : 'Demote'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Crown}
                          onClick={() => handlePromoteToAdmin(user.id, user.email)}
                          disabled={processing === user.id}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          {processing === user.id ? 'Processing...' : 'Promote'}
                        </Button>
                      )}
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
