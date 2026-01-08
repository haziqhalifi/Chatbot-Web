import React from 'react';

const Section = ({ icon, title, children }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-[#0a4974] border-b-2 border-[#0a4974] border-opacity-20 pb-2 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
};

export default Section;
