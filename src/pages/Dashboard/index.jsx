import React from 'react';
import Header from '../../components/common/Header';
import MapView from './MapView';
import ChatInterface from '../../components/ui/ChatInterface'; // Import the main ChatInterface

const DisasterMap = () => {
  return (
    <div className="flex flex-col h-screen bg-[#f4f4f4]">
      <Header />
      <div className="relative flex-1 overflow-hidden">
        <MapView />
        {/* Render the ChatInterface, which handles its own open/close state */}
        <ChatInterface />
      </div>
    </div>
  );
};

export default DisasterMap;
