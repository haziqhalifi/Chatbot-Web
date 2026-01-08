import React from 'react';

const TypeDistributionChart = ({
  activeTab,
  typeDistribution,
  myReportTypeDistribution,
  myReports,
  onNavigateToReport,
}) => {
  const distribution = activeTab === 'disasters' ? typeDistribution : myReportTypeDistribution;
  const isEmpty = Object.keys(distribution).length === 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {activeTab === 'disasters' ? 'Disaster Types Distribution' : 'My Report Types Distribution'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(distribution).map(([type, count]) => (
          <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{count}</p>
            <p className="text-sm text-gray-600 capitalize">{type}</p>
          </div>
        ))}
      </div>
      {activeTab === 'myreports' && myReports.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No reports submitted yet</p>
          <button
            onClick={onNavigateToReport}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit Your First Report
          </button>
        </div>
      )}
    </div>
  );
};

export default TypeDistributionChart;
