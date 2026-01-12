// Export utility functions for reports

export const exportReportsJSON = (reports) => {
  const dataStr = JSON.stringify(reports, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `disaster_reports_${new Date().toISOString().split('T')[0]}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const exportReportsCSV = async (token) => {
  try {
    const response = await fetch('http://localhost:8000/admin/reports/export/csv', {
      method: 'GET',
      headers: {
        'X-API-Key': 'secretkey',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disaster_reports_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Failed to export reports as CSV. Please try again.');
  }
};

export const exportReportsPDF = async (token) => {
  try {
    const response = await fetch('http://localhost:8000/admin/reports/export/pdf', {
      method: 'GET',
      headers: {
        'X-API-Key': 'secretkey',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disaster_reports_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Failed to export reports as PDF. Please try again.');
  }
};
