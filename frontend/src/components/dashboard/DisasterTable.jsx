import React from 'react';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';

const DisasterTable = ({ disasters, onViewDetails }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Location
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date Started
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Special Case
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {disasters.map((disaster, index) => (
          <tr key={disaster.id || index} className="hover:bg-gray-50 cursor-pointer">
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-900">#{disaster.id || 'N/A'}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                {disaster.kategori?.group_helper && (
                  <img
                    src={`https://mydims.nadma.gov.my${disaster.kategori.group_helper}`}
                    alt={disaster.kategori?.name}
                    className="w-6 h-6"
                  />
                )}
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {disaster.kategori?.name || 'N/A'}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  disaster.status?.toLowerCase() === 'aktif'
                    ? 'bg-orange-100 text-orange-800'
                    : disaster.status?.toLowerCase() === 'selesai'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {disaster.status || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex flex-col text-sm text-gray-900">
                <div className="flex items-center">
                  <MapPin className="text-gray-400 mr-1" size={14} />
                  <span className="font-medium">{disaster.state?.name || 'N/A'}</span>
                </div>
                <span className="text-xs text-gray-500 ml-5">{disaster.district?.name || ''}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="text-gray-400 mr-1" size={14} />
                {disaster.datetime_start
                  ? new Date(disaster.datetime_start).toLocaleDateString()
                  : 'N/A'}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {disaster.bencana_khas?.toLowerCase() === 'ya' ? (
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Special Case
                </span>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button
                onClick={() => onViewDetails(disaster)}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                View Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DisasterTable;
