
import React, { useState } from "react";
import ModernSidebar from "./ModernSidebar";

interface PageWithSidebarProps {
  children: React.ReactNode;
}

const PageWithSidebar: React.FC<PageWithSidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 px-0 md:px-8 py-8">{children}</main>
    </div>
  );
};

export default PageWithSidebar;
