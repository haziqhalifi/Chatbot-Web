import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

const MyReportsTable = ({ reports }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Title
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Location
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Submitted
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {reports.map((report, index) => (
          <tr key={report.id || index} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-900">#{report.id}</span>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">{report.title}</div>
              <div className="text-sm text-gray-500 truncate max-w-xs">{report.description}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {report.type}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-900">
                <MapPin className="text-gray-400 mr-1" size={14} />
                {report.location}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  report.status?.toLowerCase() === 'resolved'
                    ? 'bg-green-100 text-green-800'
                    : report.status?.toLowerCase() === 'active'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {report.status || 'Pending'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="text-gray-400 mr-1" size={14} />
                {report.timestamp ? new Date(report.timestamp).toLocaleDateString() : 'N/A'}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MyReportsTable;
