import React from 'react';

const Card = ({ children, className = '', padding = 'p-6' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${padding} ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

const CardTitle = ({ children, className = '', icon: Icon }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 flex items-center ${className}`}>
      {Icon && <Icon className="h-5 w-5 mr-2 text-blue-600" />}
      {children}
    </h2>
  );
};

const CardDescription = ({ children, className = '' }) => {
  return <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>;
};

const CardContent = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

const CardFooter = ({ children, className = '' }) => {
  return <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>{children}</div>;
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
