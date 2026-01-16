import React from 'react';
import { Card, Badge, Button } from '../../components/admin';

const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <Button className="absolute top-2 right-2" variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
        <Card>
          <Card.Header>
            <Card.Title>{notification.title}</Card.Title>
            <Card.Description>{notification.message}</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="mb-2">
              <Badge variant="info">Type: {notification.type}</Badge>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Recipients:</span>{' '}
              {notification.user_count ?? notification.recipient_count ?? 0}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Sent:</span>{' '}
              {notification.latest_created_at || notification.created_at
                ? new Date(
                    notification.latest_created_at || notification.created_at
                  ).toLocaleString()
                : 'N/A'}
            </div>
            {notification.first_created_at && (
              <div className="mb-2">
                <span className="font-semibold">First Sent:</span>{' '}
                {new Date(notification.first_created_at).toLocaleString()}
              </div>
            )}
            {notification.total_notifications && (
              <div className="mb-2">
                <span className="font-semibold">Total Notifications:</span>{' '}
                {notification.total_notifications}
              </div>
            )}
            {notification.unread_count !== undefined && (
              <div className="mb-2">
                <span className="font-semibold">Unread:</span> {notification.unread_count}
              </div>
            )}
            {notification.disaster_type && (
              <div className="mb-2">
                <span className="font-semibold">Disaster Type:</span> {notification.disaster_type}
              </div>
            )}
            {notification.location && (
              <div className="mb-2">
                <span className="font-semibold">Location:</span> {notification.location}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
