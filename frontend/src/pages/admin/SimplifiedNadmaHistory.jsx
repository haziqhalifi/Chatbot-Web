import React, { useState, useEffect } from 'react';
import { Database, MapPin, RefreshCw, Search, Eye } from 'lucide-react';
import {
  AdminLayout,
  PageHeader,
  StatsCard,
  Card,
  Table,
  Badge,
  Button,
} from '../../components/admin';

const SimplifiedNadmaHistory = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/map/admin/nadma/history?limit=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setDisasters(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching NADMA history:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableStatuses = ['All', ...new Set(disasters.map((d) => d?.status).filter(Boolean))];
  const availableCategories = [
    'All',
    ...new Set(disasters.map((d) => d?.kategori?.name).filter(Boolean)),
  ];
  const availableStates = ['All', ...new Set(disasters.map((d) => d?.state?.name).filter(Boolean))];

  const filteredDisasters = disasters.filter((disaster) => {
    const status = String(disaster?.status || '');
    const category = String(disaster?.kategori?.name || '');
    const state = String(disaster?.state?.name || '');
    const district = String(disaster?.district?.name || '');
    const description = String(disaster?.description || disaster?.special_report || '');
    const id = String(disaster?.id ?? '');

    const matchesSearch =
      !searchTerm ||
      [id, status, category, district, state, description]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || category === categoryFilter;
    const matchesState = stateFilter === 'All' || state === stateFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesState;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusVariant = (status) => {
    return status?.toLowerCase() === 'aktif' ? 'warning' : 'success';
  };

  return (
    <AdminLayout>
      <PageHeader
        title="NADMA Disaster History"
        description="View historical disaster data from NADMA database"
        icon={Database}
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={fetchDisasters} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total Disasters" value={disasters.length} icon={Database} color="blue" />
        <StatsCard
          title="Active"
          value={disasters.filter((d) => d.status?.toLowerCase() === 'aktif').length}
          icon={MapPin}
          color="yellow"
        />
        <StatsCard
          title="Categories"
          value={new Set(disasters.map((d) => d?.kategori?.name).filter(Boolean)).size}
          icon={Database}
          color="purple"
        />
        <StatsCard
          title="States Affected"
          value={new Set(disasters.map((d) => d?.state?.name).filter(Boolean)).size}
          icon={MapPin}
          color="green"
        />
      </div>

      {/* Filters & Table */}
      <Card>
        <Card.Content className="pb-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search disasters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Status' : s}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableStates.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All States' : s}
                </option>
              ))}
            </select>
          </div>
        </Card.Content>

        <Card.Content className="pt-0">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading NADMA disaster history...</p>
            </div>
          ) : filteredDisasters.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No disasters found</p>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>ID</Table.Head>
                  <Table.Head>Category</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Location</Table.Head>
                  <Table.Head>Victims</Table.Head>
                  <Table.Head>Started</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredDisasters.slice(0, 50).map((disaster) => (
                  <Table.Row key={disaster.id}>
                    <Table.Cell className="font-medium">#{disaster.id}</Table.Cell>
                    <Table.Cell>{disaster.kategori?.name || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusVariant(disaster.status)}>
                        {disaster.status || 'N/A'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {[disaster.district?.name, disaster.state?.name].filter(Boolean).join(', ') ||
                        'N/A'}
                    </Table.Cell>
                    <Table.Cell>
                      {disaster.case?.jumlah_mangsa
                        ? `${disaster.case.jumlah_mangsa} people`
                        : 'N/A'}
                    </Table.Cell>
                    <Table.Cell className="text-gray-500">
                      {formatDate(disaster.datetime_start)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>

        {!loading && filteredDisasters.length > 0 && (
          <Card.Footer>
            <p className="text-sm text-gray-600 text-center">
              Showing {Math.min(50, filteredDisasters.length)} of {filteredDisasters.length}{' '}
              disasters
            </p>
          </Card.Footer>
        )}
      </Card>
    </AdminLayout>
  );
};

export default SimplifiedNadmaHistory;
