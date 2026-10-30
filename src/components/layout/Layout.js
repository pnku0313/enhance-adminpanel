"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useSidebar } from "../../context/SidebarContext";
import { clsx } from "clsx";

const Layout = ({ children }) => {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main
          className={clsx(
            "flex-1 transition-all duration-300 ease-in-out pt-[72px]",
            isOpen && !isMobile ? "lg:ml-[288px]" : "ml-0"
          )}
        >
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;