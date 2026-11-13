import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNavigation } from './MobileNavigation';

export const AppShell: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-graphite-900 text-graphite-100">
      {/* Top Navbar */}
      <Navbar 
        isMobileDrawerOpen={mobileDrawerOpen}
        onToggleMobileDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)} 
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <DesktopSidebar />

        {/* Main Workspace Area with mobile padding for bottom bar */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6 p-3 md:p-6 bg-graphite-900 focus:outline-none">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation and Drawer */}
      <MobileNavigation 
        isOpen={mobileDrawerOpen} 
        onClose={() => setMobileDrawerOpen(false)} 
      />
    </div>
  );
};
