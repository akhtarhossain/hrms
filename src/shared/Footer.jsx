import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#E5D9F2] py-2">
      <div className="text-center text-sm pt-4">
        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
