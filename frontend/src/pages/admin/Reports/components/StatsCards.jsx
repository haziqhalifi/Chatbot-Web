import React from 'react';
import { FileText, AlertTriangle, Users, TrendingUp } from 'lucide-react';

const StatsCards = ({ reports }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-blue-700">Total Reports</p>
            <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
        <div className="flex items-center">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-red-700">Active Reports</p>
            <p className="text-2xl font-bold text-red-900">
              {reports.filter((r) => r.status === 'Active').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-green-700">People Affected</p>
            <p className="text-2xl font-bold text-green-900">
              {reports.reduce((sum, r) => sum + r.affectedPeople, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-purple-700">Critical Reports</p>
            <p className="text-2xl font-bold text-purple-900">
              {reports.filter((r) => r.severity === 'Critical').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
