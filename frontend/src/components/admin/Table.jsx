import React from 'react';

const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return <thead className="bg-gray-50 border-b border-gray-200">{children}</thead>;
};

const TableBody = ({ children }) => {
  return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>;
};

const TableRow = ({ children, onClick, className = '' }) => {
  return (
    <tr
      className={`${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

const TableHead = ({ children, className = '' }) => {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '' }) => {
  return <td className={`px-6 py-4 text-sm text-gray-900 ${className}`}>{children}</td>;
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;
