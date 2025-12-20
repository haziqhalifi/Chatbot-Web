import React, { useState } from 'react';
import Header from '../components/common/Header';
import MapView from '../components/dashboard/MapView';
import ChatInterface from '../components/dashboard/ChatInterface';

const Dashboard = () => {
  const [mapView, setMapView] = useState(null);
  const [chatSidebarWidth, setChatSidebarWidth] = useState(0);

  const handleMapViewReady = (view) => {
    setMapView(view);
  };

  const handleChatSidebarChange = (width) => {
    setChatSidebarWidth(width);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f4f4f4] relative overflow-hidden">
      <Header />
      <div className="flex-1 relative w-full overflow-hidden">
        <MapView onMapViewReady={handleMapViewReady} chatSidebarWidth={chatSidebarWidth} />
        <ChatInterface mapView={mapView} onSidebarChange={handleChatSidebarChange} />
      </div>
    </div>
  );
};

export default Dashboard;
