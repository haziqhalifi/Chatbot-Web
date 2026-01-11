import React from 'react';
import AnalyticsCard from './AnalyticsCard';
import { BarChart3, AlertTriangle, TrendingUp, CheckCircle, Calendar } from 'lucide-react';

const AnalyticsGrid = ({ activeTab, analytics, myReportsAnalytics }) => {
  if (activeTab === 'disasters') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Disasters"
          value={analytics.total}
          icon={BarChart3}
          iconColor="text-blue-600"
          bgColor="from-blue-50 to-blue-100"
          borderColor="border-blue-200"
        />
        <AnalyticsCard
          title="Active/Ongoing"
          value={analytics.active}
          icon={AlertTriangle}
          iconColor="text-orange-600"
          bgColor="from-orange-50 to-orange-100"
          borderColor="border-orange-200"
        />
        <AnalyticsCard
          title="Resolved"
          value={analytics.resolved}
          icon={TrendingUp}
          iconColor="text-green-600"
          bgColor="from-green-50 to-green-100"
          borderColor="border-green-200"
        />
        <AnalyticsCard
          title="Critical/High Priority"
          value={analytics.critical}
          icon={AlertTriangle}
          iconColor="text-red-600"
          bgColor="from-red-50 to-red-100"
          borderColor="border-red-200"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <AnalyticsCard
        title="Total Reports"
        value={myReportsAnalytics.total}
        icon={BarChart3}
        iconColor="text-blue-600"
        bgColor="from-blue-50 to-blue-100"
        borderColor="border-blue-200"
      />
      <AnalyticsCard
        title="Pending/Active"
        value={myReportsAnalytics.pending}
        icon={AlertTriangle}
        iconColor="text-orange-600"
        bgColor="from-orange-50 to-orange-100"
        borderColor="border-orange-200"
      />
      <AnalyticsCard
        title="Resolved"
        value={myReportsAnalytics.resolved}
        icon={CheckCircle}
        iconColor="text-green-600"
        bgColor="from-green-50 to-green-100"
        borderColor="border-green-200"
      />
      <AnalyticsCard
        title="This Month"
        value={myReportsAnalytics.thisMonth}
        icon={Calendar}
        iconColor="text-blue-600"
        bgColor="from-blue-50 to-blue-100"
        borderColor="border-blue-200"
      />
    </div>
  );
};

export default AnalyticsGrid;
