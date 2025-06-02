import React from 'react';
import Header from '../../components/common/Header';
import MapView from './MapView';
import ChatInterface from '../../components/ui/ChatInterface';

const DisasterMap = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#f4f4f4] relative overflow-hidden">
      <Header />
      <div className="flex-1 relative w-full overflow-hidden">
        <MapView />
        <ChatInterface />
      </div>
    </div>
  );
};

export default DisasterMap;
