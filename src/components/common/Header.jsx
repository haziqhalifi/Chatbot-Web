import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-[#2c2c2c] h-20 w-full flex items-center justify-between px-11">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-[#f0f0f0] mr-16">DisasterWatch</h1>
        <nav className="flex space-x-8">
          <Link to="/report-disaster" className="text-base font-semibold text-[#f0f0f0]">
            Report Disaster
          </Link>
          <Link to="/emergency-support" className="text-base font-semibold text-[#f0f0f0]">
            Emergency Support
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <button className="flex items-center">
          <img src="/images/img_image.png" alt="Notification" className="w-[26px] h-[23px]" />
        </button>
        <div className="flex items-center">
          <span className="text-xl text-[#f0f0f0]">English</span>
          <img src="/images/img_image_14.png" alt="Dropdown" className="w-[9px] h-[14px] ml-2" />
        </div>
        <img 
          src="/images/img_image_3.png" 
          alt="User Profile" 
          className="w-[50px] h-[50px] rounded-full"
        />
      </div>
    </header>
  );
};

export default Header;