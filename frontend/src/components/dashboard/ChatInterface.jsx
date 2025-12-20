import React, { useState, useRef, useEffect } from 'react';
import { useLayer } from '../../contexts/LayerContext';
import { ChatBox, ChatButton } from '../chat';
import { Maximize2, Minimize2, Sidebar } from 'lucide-react';

const ChatInterface = ({ mapView: parentMapView, onSidebarChange }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [savedChat, setSavedChat] = useState(null);
  const [chatKey, setChatKey] = useState(0);
  const [chatSize, setChatSize] = useState({ width: 380, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [showSizeIndicator, setShowSizeIndicator] = useState(false);
  const [mapView, setMapView] = useState(null);
  const [displayMode, setDisplayMode] = useState(() => {
    // Load saved preference from localStorage
    return localStorage.getItem('chatDisplayMode') || 'popup';
  });
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

  // Notify parent component about sidebar width changes
  useEffect(() => {
    if (onSidebarChange) {
      if (isChatOpen && displayMode === 'sidebar') {
        onSidebarChange(chatSize.width);
      } else {
        onSidebarChange(0);
      }
    }
  }, [isChatOpen, displayMode, chatSize.width, onSidebarChange]);

  const handleClose = () => {
    setIsChatOpen(false);
  };

  const handleOpen = () => {
    // Close any open layers when opening chat
    closeLayerIfType('NOTIFICATION_DROPDOWN');
    closeLayerIfType('LANGUAGE_DROPDOWN');
    closeLayerIfType('PROFILE_DROPDOWN');
    setIsChatOpen(true);
  };

  const handleNewChat = () => {
    setChatKey((k) => k + 1);
  };

  // Toggle display mode between popup and sidebar
  const toggleDisplayMode = () => {
    const newMode = displayMode === 'popup' ? 'sidebar' : 'popup';
    setDisplayMode(newMode);
    localStorage.setItem('chatDisplayMode', newMode);
    
    // Reset size when switching modes
    if (newMode === 'sidebar') {
      setChatSize({ width: 420, height: window.innerHeight });
    } else {
      setChatSize({ width: 380, height: 600 });
    }
  };

  // Enhanced mouse event handlers for resizing
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    resizingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: chatSize.width,
      startHeight: chatSize.height,
    };

    setIsResizing(true);
    setShowSizeIndicator(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';

    // Add resize feedback class to body
    document.body.classList.add('chat-resizing');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;

      if (displayMode === 'sidebar') {
        // Sidebar resize - only width changes
        const dx = resizingRef.current.startX - e.clientX;
        const minWidth = 320;
        const maxWidth = window.innerWidth * 0.5; // Max 50% of screen width
        
        const newWidth = Math.max(minWidth, Math.min(maxWidth, resizingRef.current.startWidth + dx));
        
        setChatSize({
          width: newWidth,
          height: window.innerHeight,
        });
      } else {
        // Popup resize - width and height change
        const dx = resizingRef.current.startX - e.clientX;
        const dy = resizingRef.current.startY - e.clientY;

        // Improved constraints with better minimum sizes
        const minWidth = 320;
        const minHeight = 450;
        const maxWidth = window.innerWidth - fixedPosition.right - 20;
        const maxHeight = window.innerHeight - fixedPosition.bottom - 20;

        const newWidth = Math.max(minWidth, Math.min(maxWidth, resizingRef.current.startWidth + dx));
        const newHeight = Math.max(
          minHeight,
          Math.min(maxHeight, resizingRef.current.startHeight + dy)
        );

        setChatSize({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = false;
        setIsResizing(false);

        // Hide size indicator after a delay
        setTimeout(() => setShowSizeIndicator(false), 1000);

        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.classList.remove('chat-resizing');
      }
    };

    // Handle window resize to keep chat in bounds
    const handleWindowResize = () => {
      setChatSize((prevSize) => {
        if (displayMode === 'sidebar') {
          const maxWidth = window.innerWidth * 0.5;
          const minWidth = 320;
          return {
            width: Math.max(minWidth, Math.min(prevSize.width, maxWidth)),
            height: window.innerHeight,
          };
        } else {
          const maxWidth = window.innerWidth - fixedPosition.right - 20;
          const maxHeight = window.innerHeight - fixedPosition.bottom - 20;
          const minWidth = 320;
          const minHeight = 450;

          return {
            width: Math.max(minWidth, Math.min(prevSize.width, maxWidth)),
            height: Math.max(minHeight, Math.min(prevSize.height, maxHeight)),
          };
        }
      });
    };

    // Handle escape key to cancel resize
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && resizingRef.current) {
        // Reset to original size
        if (displayMode === 'sidebar') {
          setChatSize({
            width: resizingRef.current.startWidth,
            height: window.innerHeight,
          });
        } else {
          setChatSize({
            width: resizingRef.current.startWidth,
            height: resizingRef.current.startHeight,
          });
        }
        handleMouseUp();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('chat-resizing');
    };
  }, [displayMode]);

  return (
    <>
      {/* Chat interface - Popup or Sidebar Mode */}
      {isChatOpen && (
        <div
          className={`fixed z-50 chat-window ${isResizing ? 'resizing' : ''} ${
            displayMode === 'sidebar' 
              ? 'top-0 right-0 h-full shadow-2xl' 
              : 'chat-window'
          }`}
          style={
            displayMode === 'sidebar'
              ? {
                  width: chatSize.width,
                  height: '100vh',
                  top: 0,
                  right: 0,
                }
              : {
                  right: `${fixedPosition.right}px`,
                  bottom: `${fixedPosition.bottom}px`,
                  width: chatSize.width,
                  height: chatSize.height,
                }
          }
        >
          {/* Display Mode Toggle Button */}
          <div
            className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-md cursor-pointer transition-all duration-200"
            onClick={toggleDisplayMode}
            title={displayMode === 'popup' ? 'Switch to Sidebar' : 'Switch to Popup'}
          >
            {displayMode === 'popup' ? (
              <Sidebar className="w-4 h-4 text-blue-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-blue-600" />
            )}
          </div>

          {/* Resize Handles - Only show for popup mode */}
          {displayMode === 'popup' && (
            <>
              {/* Enhanced Resize Handle - Top Left */}
              <div
                onMouseDown={handleResizeMouseDown}
                className={`absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-10 group chat-resize-handle ${
                  isResizing ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                }`}
                style={{
                  background: 'linear-gradient(135deg, transparent 50%, rgba(59, 130, 246, 0.1) 50%)',
                }}
              >
                {/* Resize handle visual indicator */}
                <div className="absolute top-1 left-1 w-4 h-4">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-blue-600">
                    <path
                      d="M2 14L14 2M6 2H2V6M10 14H14V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 rounded-tl-lg transition-opacity duration-200" />
              </div>

              {/* Enhanced Resize Handle - Bottom Right */}
              <div
                onMouseDown={handleResizeMouseDown}
                className={`absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-10 group chat-resize-handle ${
                  isResizing ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 50%, transparent 50%)',
                }}
              >
                {/* Resize handle visual indicator */}
                <div className="absolute bottom-1 right-1 w-4 h-4">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-blue-600">
                    <path
                      d="M2 14L14 2M6 2H2V6M10 14H14V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 rounded-br-lg transition-opacity duration-200" />
              </div>
            </>
          )}

          {/* Resize Handle for Sidebar - Left Edge Only */}
          {displayMode === 'sidebar' && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();

                resizingRef.current = {
                  startX: e.clientX,
                  startWidth: chatSize.width,
                };

                setIsResizing(true);
                setShowSizeIndicator(true);
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'ew-resize';
                document.body.classList.add('chat-resizing');
              }}
              className={`absolute top-0 left-0 w-2 h-full cursor-ew-resize z-10 group ${
                isResizing ? 'bg-blue-600 bg-opacity-20' : 'hover:bg-blue-600 hover:bg-opacity-10'
              }`}
            >
              <div className="absolute top-1/2 left-0 w-full h-12 transform -translate-y-1/2 flex items-center justify-center">
                <div className="w-1 h-8 bg-blue-600 opacity-0 group-hover:opacity-50 rounded-full transition-opacity duration-200" />
              </div>
            </div>
          )}

          {/* Size Indicator */}
          {showSizeIndicator && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded z-20 pointer-events-none size-indicator shadow-md">
              {Math.round(chatSize.width)} × {Math.round(chatSize.height)}
            </div>
          )}

          {/* Resize border indicator */}
          {isResizing && (
            <div className="absolute inset-0 border-2 border-blue-600 border-dashed pointer-events-none z-5 resize-border" />
          )}

          <ChatBox
            key={chatKey}
            onClose={handleClose}
            onNewChat={handleNewChat}
            width={chatSize.width}
            height={chatSize.height}
            mapView={parentMapView}
            displayMode={displayMode}
          />
        </div>
      )}

      <ChatButton onClick={handleOpen} isOpen={isChatOpen} />
    </>
  );
};

export default ChatInterface;
