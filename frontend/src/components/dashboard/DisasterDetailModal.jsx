import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

const DisasterDetailModal = ({ disaster, onClose }) => {
  if (!disaster) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {disaster.kategori?.group_helper && (
              <img
                src={`https://mydims.nadma.gov.my${disaster.kategori.group_helper}`}
                alt={disaster.kategori?.name}
                className="w-10 h-10"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Disaster #{disaster.id}</h2>
              <p className="text-sm text-gray-600">{disaster.kategori?.name || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Status & Special Case */}
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  disaster.status?.toLowerCase() === 'aktif'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {disaster.status}
              </span>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Special Case</p>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  disaster.bencana_khas?.toLowerCase() === 'ya'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {disaster.bencana_khas || 'Tidak'}
              </span>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Location Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="font-medium text-gray-900">{disaster.state?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">District</p>
                <p className="font-medium text-gray-900">{disaster.district?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Latitude</p>
                <p className="font-medium text-gray-900">{disaster.latitude || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Longitude</p>
                <p className="font-medium text-gray-900">{disaster.longitude || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              Timeline
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium text-gray-900">
                  {disaster.datetime_start
                    ? new Date(disaster.datetime_start).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium text-gray-900">
                  {disaster.datetime_end
                    ? new Date(disaster.datetime_end).toLocaleString()
                    : 'Ongoing'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-medium text-gray-900">
                  {disaster.created_at ? new Date(disaster.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {disaster.updated_at ? new Date(disaster.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Case Details */}
          {disaster.case && (
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Case Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Relief Centers (PPS)</p>
                  <p className="font-medium text-gray-900">{disaster.case.jumlah_pps || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Families Affected</p>
                  <p className="font-medium text-gray-900">{disaster.case.jumlah_keluarga || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Victims</p>
                  <p className="font-medium text-gray-900">{disaster.case.jumlah_mangsa || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {disaster.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{disaster.description}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Level ID</p>
                <p className="font-medium text-gray-900">{disaster.level_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Backdated</p>
                <p className="font-medium text-gray-900">{disaster.is_backdated ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-gray-600">Created By</p>
                <p className="font-medium text-gray-900">User #{disaster.created_by_id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => {
              window.open(
                `https://maps.google.com/?q=${disaster.latitude},${disaster.longitude}`,
                '_blank'
              );
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <MapPin size={16} />
            View on Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisasterDetailModal;
