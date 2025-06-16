import React, { useState, useRef, useEffect } from 'react';
import { useLayer } from '../../contexts/LayerContext';
import { ChatBox, ChatButton } from '../chat';

const ChatInterface = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [savedChat, setSavedChat] = useState(() => {
    const saved = localStorage.getItem('tiara_last_chat');
    return saved ? JSON.parse(saved) : null;
  });
  const [chatKey, setChatKey] = useState(0);
  const [chatSize, setChatSize] = useState({ width: 380, height: 600 });
  const fixedPosition = { right: 16, bottom: 16 };
  const resizingRef = useRef(false);

  // Layer management
  const { isLayerActive, closeLayerIfType, activeLayer } = useLayer();

  // Close chat when modals are opened
  useEffect(() => {
    if (activeLayer) {
      const layerType = activeLayer;
      const isModal = [
        'ACCOUNT_MODAL',
        'REPORT_MODAL',
        'SETTINGS_MODAL',
        'EMERGENCY_MODAL',
      ].includes(layerType);

      if (isModal && isChatOpen) {
        setIsChatOpen(false);
      }
    }
  }, [activeLayer, isChatOpen]);

  const handleClose = (messages) => {
    setIsChatOpen(false);
    if (messages) {
      setSavedChat(messages);
      localStorage.setItem('tiara_last_chat', JSON.stringify(messages));
    }
  };

  const handleOpen = () => {
    // Close any open layers when opening chat
    closeLayerIfType('NOTIFICATION_DROPDOWN');
    closeLayerIfType('LANGUAGE_DROPDOWN');
    closeLayerIfType('PROFILE_DROPDOWN');
    setIsChatOpen(true);
  };
  const handleNewChat = () => {
    setSavedChat(null);
    localStorage.removeItem('tiara_last_chat');
    setChatKey((k) => k + 1);
  };

  // Mouse event handlers for resizing
  const handleResizeMouseDown = (e) => {
    resizingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: chatSize.width,
      startHeight: chatSize.height,
    };
    document.body.style.userSelect = 'none';
    e.stopPropagation();
    e.preventDefault();
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;
      const dx = resizingRef.current.startX - e.clientX;
      const dy = resizingRef.current.startY - e.clientY;

      const newWidth = Math.max(300, resizingRef.current.startWidth + dx);
      const newHeight = Math.max(400, resizingRef.current.startHeight + dy);

      const maxWidth = window.innerWidth - fixedPosition.right;
      const maxHeight = window.innerHeight - fixedPosition.bottom;

      setChatSize({
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight),
      });
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      document.body.style.userSelect = '';
    }; // Handle window resize to keep chat in bounds
    const handleWindowResize = () => {
      setChatSize((prevSize) => {
        const maxWidth = window.innerWidth - fixedPosition.right;
        const maxHeight = window.innerHeight - fixedPosition.bottom;
        return {
          width: Math.min(prevSize.width, maxWidth),
          height: Math.min(prevSize.height, maxHeight),
        };
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <>
      {/* Chat interface - Expanded */}
      {isChatOpen && (
        <div
          className="fixed z-50 transition-all duration-300 ease-in-out"
          style={{
            right: `${fixedPosition.right}px`,
            bottom: `${fixedPosition.bottom}px`,
            width: chatSize.width,
            height: chatSize.height,
          }}
        >
          {/* Resize handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 20,
              height: 20,
              cursor: 'nwse-resize',
              zIndex: 10,
              background: 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <polyline points="0,20 20,0" stroke="#0a4974" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <ChatBox
            key={chatKey}
            onClose={handleClose}
            onNewChat={handleNewChat}
            savedChat={savedChat}
            width={chatSize.width}
            height={chatSize.height}
          />
        </div>
      )}

      <ChatButton onClick={handleOpen} isOpen={isChatOpen} />
    </>
  );
};

export default ChatInterface;
