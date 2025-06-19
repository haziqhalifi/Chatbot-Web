import React from 'react';

const ExportDropdown = ({
  showExportDropdown,
  setShowExportDropdown,
  isExporting,
  setIsExporting,
  messages,
  mapView,
  exportType,
  setExportType,
}) => {
  const createChatExportableContent = () => {
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
      background: #ffffff;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
    `;

    // Add header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #3b82f6;
    `;

    const title = document.createElement('h1');
    title.textContent = 'Tiara Chat Conversation';
    title.style.cssText = `
      color: #3b82f6;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    `;

    const timestamp = document.createElement('div');
    timestamp.textContent = `Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    timestamp.style.cssText = `
      color: #666;
      font-size: 14px;
      margin-left: auto;
    `;

    header.appendChild(title);
    header.appendChild(timestamp);
    exportContainer.appendChild(header);

    // Add messages
    messages.forEach((message) => {
      if (message.text === 'Tiara is typing...' || message.isTranscribing) {
        return;
      }

      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        display: flex;
        margin-bottom: 15px;
        ${message.sender === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
      `;

      const messageContent = document.createElement('div');
      messageContent.style.cssText = `
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 18px;
        ${
          message.sender === 'user'
            ? 'background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border-bottom-right-radius: 6px;'
            : 'background: #f5f5f5; color: #333; border: 1px solid #e0e0e0; border-bottom-left-radius: 6px;'
        }
        word-wrap: break-word;
        position: relative;
      `;

      const messageText = document.createElement('div');
      messageText.innerHTML = message.text.replace(/\n/g, '<br>');
      messageText.style.cssText = `
        font-size: 14px;
        line-height: 1.4;
      `;

      const messageMeta = document.createElement('div');
      messageMeta.style.cssText = `
        font-size: 11px;
        opacity: 0.7;
        margin-top: 5px;
        ${message.sender === 'user' ? 'text-align: right;' : 'text-align: left;'}
      `;
      messageMeta.textContent = `${message.sender === 'user' ? 'You' : 'Tiara'} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      messageContent.appendChild(messageText);
      messageContent.appendChild(messageMeta);
      messageDiv.appendChild(messageContent);
      exportContainer.appendChild(messageDiv);
    });

    return exportContainer;
  };

  const createMapExportableContent = async () => {
    // Use ArcGIS takeScreenshot if available
    if (mapView && typeof mapView.takeScreenshot === 'function') {
      const screenshot = await mapView.takeScreenshot();
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        background: #ffffff;
        padding: 20px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      const img = document.createElement('img');
      img.src = screenshot.dataUrl;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '12px';
      img.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
      exportContainer.appendChild(img);
      // Add export info
      const exportInfo = document.createElement('div');
      exportInfo.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        font-size: 14px;
        color: #666;
      `;
      exportInfo.innerHTML = `
        <strong>Export Information:</strong><br>
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
        This is a screenshot of the current map view
      `;
      exportContainer.appendChild(exportInfo);
      return exportContainer;
    }
    // Fallback to html2canvas if ArcGIS screenshot is not available
    const mapElement = document.getElementById('real-map-container');
    if (mapElement) {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(mapElement, { useCORS: true });
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        background: #ffffff;
        padding: 20px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.maxWidth = '100%';
      img.style.borderRadius = '12px';
      img.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
      exportContainer.appendChild(img);
      const exportInfo = document.createElement('div');
      exportInfo.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        font-size: 14px;
        color: #666;
      `;
      exportInfo.innerHTML = `
        <strong>Export Information:</strong><br>
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
        This is a screenshot of the current map view
      `;
      exportContainer.appendChild(exportInfo);
      return exportContainer;
    }

    console.log('Starting map export, mapView:', mapView);

    try {
      // Find the actual map container element
      const mapContainer = mapView.container;
      console.log('Map container found:', mapContainer);

      if (!mapContainer) {
        throw new Error('Map container not found');
      }

      // Create a simple container
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        background: #ffffff;
        padding: 20px;
        text-align: center;
        min-height: 400px;
      `;

      // Add a title
      const title = document.createElement('h2');
      title.textContent = 'Malaysia Disaster Management Map';
      title.style.cssText = `
        color: #3b82f6;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      exportContainer.appendChild(title);

      // Create a placeholder for the map
      const mapPlaceholder = document.createElement('div');
      mapPlaceholder.style.cssText = `
        width: 100%;
        height: 500px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
      `;

      // Add map icon
      const mapIcon = document.createElement('div');
      mapIcon.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 4m0 13V4m-6 3l6-3"/>
        </svg>
      `;
      mapIcon.style.cssText = `
        margin-bottom: 16px;
        opacity: 0.8;
      `;

      // Add map info
      const mapInfo = document.createElement('div');
      mapInfo.style.cssText = `
        text-align: center;
        z-index: 1;
      `;

      const mapTitle = document.createElement('h3');
      mapTitle.textContent = 'Interactive Map View';
      mapTitle.style.cssText = `
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
      `;

      const mapDescription = document.createElement('p');
      mapDescription.textContent = 'Malaysia Disaster Management System';
      mapDescription.style.cssText = `
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 16px;
      `;

      const mapDetails = document.createElement('div');
      mapDetails.style.cssText = `
        font-size: 12px;
        opacity: 0.8;
        line-height: 1.4;
      `;

      // Try to get map details if available
      try {
        const center = mapView.center;
        const zoom = mapView.zoom;
        mapDetails.innerHTML = `
          <div>Center: ${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)}</div>
          <div>Zoom Level: ${zoom.toFixed(2)}</div>
          <div>Scale: 1:${Math.round(mapView.scale)}</div>
          <div>Layers: ${mapView.map.layers.length} active</div>
        `;
      } catch (error) {
        mapDetails.innerHTML = `
          <div>Map data unavailable</div>
        `;
      }

      mapInfo.appendChild(mapTitle);
      mapInfo.appendChild(mapDescription);
      mapInfo.appendChild(mapDetails);
      mapPlaceholder.appendChild(mapIcon);
      mapPlaceholder.appendChild(mapInfo);

      // Add decorative elements
      const decoration = document.createElement('div');
      decoration.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
        opacity: 0.3;
        pointer-events: none;
      `;
      mapPlaceholder.appendChild(decoration);

      exportContainer.appendChild(mapPlaceholder);

      // Add export info
      const exportInfo = document.createElement('div');
      exportInfo.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        font-size: 14px;
        color: #666;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      exportInfo.innerHTML = `
        <strong>Export Information:</strong><br>
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
        This is a visual representation of the map view
      `;
      exportContainer.appendChild(exportInfo);

      return exportContainer;
    } catch (error) {
      console.error('Failed to create map export content:', error);

      // Create a fallback container with error message
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        background: #ffffff;
        padding: 20px;
        text-align: center;
        min-height: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        color: #666;
        padding: 40px;
        border: 2px dashed #ccc;
        border-radius: 8px;
        background: #f9f9f9;
      `;
      errorDiv.innerHTML = `
        <h3>Map Export Unavailable</h3>
        <p>The map could not be exported at this time.</p>
        <p>Error: ${error.message}</p>
      `;

      exportContainer.appendChild(errorDiv);
      return exportContainer;
    }
  };

  const createCombinedExportableContent = async () => {
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
      background: #ffffff;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
    `;

    // Add header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #3b82f6;
    `;

    const title = document.createElement('h1');
    title.textContent = 'Tiara Disaster Management Report';
    title.style.cssText = `
      color: #3b82f6;
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    `;

    const timestamp = document.createElement('div');
    timestamp.textContent = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    timestamp.style.cssText = `
      color: #666;
      font-size: 14px;
      margin-left: auto;
    `;

    header.appendChild(title);
    header.appendChild(timestamp);
    exportContainer.appendChild(header);

    // Add map section
    if (mapView && typeof mapView.takeScreenshot === 'function') {
      const screenshot = await mapView.takeScreenshot();
      const mapSection = document.createElement('div');
      mapSection.style.cssText = `
        margin-bottom: 30px;
      `;

      const mapTitle = document.createElement('h2');
      mapTitle.textContent = 'Current Map View';
      mapTitle.style.cssText = `
        color: #3b82f6;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 15px;
      `;

      mapSection.appendChild(mapTitle);

      // Add the screenshot image
      const img = document.createElement('img');
      img.src = screenshot.dataUrl;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '12px';
      img.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
      img.style.marginBottom = '15px';
      mapSection.appendChild(img);

      exportContainer.appendChild(mapSection);
    } else if (mapView) {
      // ... existing placeholder logic ...
    }

    // Add chat section
    const chatSection = document.createElement('div');
    chatSection.style.cssText = `
      margin-top: 30px;
    `;

    const chatTitle = document.createElement('h2');
    chatTitle.textContent = 'Chat Conversation';
    chatTitle.style.cssText = `
      color: #3b82f6;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
    `;

    chatSection.appendChild(chatTitle);

    // Add messages
    messages.forEach((message) => {
      if (message.text === 'Tiara is typing...' || message.isTranscribing) {
        return;
      }

      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        display: flex;
        margin-bottom: 15px;
        ${message.sender === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
      `;

      const messageContent = document.createElement('div');
      messageContent.style.cssText = `
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 18px;
        ${
          message.sender === 'user'
            ? 'background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border-bottom-right-radius: 6px;'
            : 'background: #f5f5f5; color: #333; border: 1px solid #e0e0e0; border-bottom-left-radius: 6px;'
        }
        word-wrap: break-word;
        position: relative;
      `;

      const messageText = document.createElement('div');
      messageText.innerHTML = message.text.replace(/\n/g, '<br>');
      messageText.style.cssText = `
        font-size: 14px;
        line-height: 1.4;
      `;

      const messageMeta = document.createElement('div');
      messageMeta.style.cssText = `
        font-size: 11px;
        opacity: 0.7;
        margin-top: 5px;
        ${message.sender === 'user' ? 'text-align: right;' : 'text-align: left;'}
      `;
      messageMeta.textContent = `${message.sender === 'user' ? 'You' : 'Tiara'} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      messageContent.appendChild(messageText);
      messageContent.appendChild(messageMeta);
      messageDiv.appendChild(messageContent);
      chatSection.appendChild(messageDiv);
    });

    exportContainer.appendChild(chatSection);

    return exportContainer;
  };

  const exportToPNG = async () => {
    try {
      setIsExporting(true);
      const html2canvas = (await import('html2canvas')).default;

      let exportContent;
      let filename;

      switch (exportType) {
        case 'chat':
          exportContent = createChatExportableContent();
          filename = `tiara-chat-${new Date().toISOString().split('T')[0]}.png`;
          break;
        case 'map':
          exportContent = await createMapExportableContent();
          filename = `tiara-map-${new Date().toISOString().split('T')[0]}.png`;
          break;
        case 'combined':
          exportContent = await createCombinedExportableContent();
          filename = `tiara-report-${new Date().toISOString().split('T')[0]}.png`;
          break;
        default:
          exportContent = createChatExportableContent();
          filename = `tiara-chat-${new Date().toISOString().split('T')[0]}.png`;
      }

      document.body.appendChild(exportContent);

      const canvas = await html2canvas(exportContent, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: exportContent.offsetWidth,
        height: exportContent.scrollHeight,
      });

      document.body.removeChild(exportContent);

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      alert(`Failed to export ${exportType} as PNG. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      let exportContent;
      let filename;

      switch (exportType) {
        case 'chat':
          exportContent = createChatExportableContent();
          filename = `tiara-chat-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'map':
          exportContent = await createMapExportableContent();
          filename = `tiara-map-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'combined':
          exportContent = await createCombinedExportableContent();
          filename = `tiara-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        default:
          exportContent = createChatExportableContent();
          filename = `tiara-chat-${new Date().toISOString().split('T')[0]}.pdf`;
      }

      document.body.appendChild(exportContent);

      const canvas = await html2canvas(exportContent, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: exportContent.offsetWidth,
        height: exportContent.scrollHeight,
      });

      document.body.removeChild(exportContent);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert(`Failed to export ${exportType} as PDF. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative export-dropdown">
      <button
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        className="bg-white hover:bg-gray-100 text-blue-600 rounded-full p-2 transition-colors duration-200 shadow-md"
        aria-label="Export Options"
        title="Export options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>

      {showExportDropdown && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 export-dropdown">
          <div className="py-2">
            {/* Export Type Selection */}
            <div className="px-4 py-2 border-b border-gray-100">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Export Type
              </label>
              <div className="mt-2 space-y-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    value="chat"
                    checked={exportType === 'chat'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Chat Only</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    value="map"
                    checked={exportType === 'map'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Map Only</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    value="combined"
                    checked={exportType === 'combined'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Chat + Map</span>
                </label>
              </div>
            </div>

            {/* Export Format Buttons */}
            <div className="px-4 py-2">
              <button
                onClick={() => {
                  exportToPNG();
                  setShowExportDropdown(false);
                }}
                disabled={isExporting || (exportType !== 'chat' && !mapView)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21,15 16,10 5,21"></polyline>
                  </svg>
                )}
                <span>{isExporting ? 'Exporting...' : 'Export as PNG'}</span>
              </button>
              <button
                onClick={() => {
                  exportToPDF();
                  setShowExportDropdown(false);
                }}
                disabled={isExporting || (exportType !== 'chat' && !mapView)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                )}
                <span>{isExporting ? 'Exporting...' : 'Export as PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
