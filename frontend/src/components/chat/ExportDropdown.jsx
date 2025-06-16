import React from 'react';

const ExportDropdown = ({
  showExportDropdown,
  setShowExportDropdown,
  isExporting,
  setIsExporting,
  messages,
}) => {
  const createExportableContent = () => {
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
      border-bottom: 2px solid #0a4974;
    `;

    const title = document.createElement('h1');
    title.textContent = 'Tiara Chat Conversation';
    title.style.cssText = `
      color: #0a4974;
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
            ? 'background: linear-gradient(135deg, #0a4974, #083757); color: white; border-bottom-right-radius: 6px;'
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

  const exportToPNG = async () => {
    try {
      setIsExporting(true);
      const html2canvas = (await import('html2canvas')).default;

      const exportContent = createExportableContent();
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
      link.download = `tiara-chat-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      alert('Failed to export chat as PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const exportContent = createExportableContent();
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

      pdf.save(`tiara-chat-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export chat as PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative export-dropdown">
      <button
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        className="bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-2 transition-colors duration-200"
        aria-label="Export Chat"
        title="Export chat options"
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
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 export-dropdown">
          <div className="py-2">
            <button
              onClick={() => {
                exportToPNG();
                setShowExportDropdown(false);
              }}
              disabled={isExporting}
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
              disabled={isExporting}
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
      )}
    </div>
  );
};

export default ExportDropdown;
