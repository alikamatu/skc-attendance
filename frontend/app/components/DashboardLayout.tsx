"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { 
  FaHome, 
  FaChartBar, 
  FaChevronRight,
  FaChevronLeft
} from "react-icons/fa";
import { FiUsers, FiSettings, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // Initialize the router for navigation

  const navItems = [
    { 
      path: "/dashboard", 
      name: "Dashboard", 
      icon: <FaHome className="text-lg" />,
      matchExact: true
    },
    { 
      path: "/dashboard/students", 
      name: "Students", 
      icon: <FiUsers className="text-lg" />,
      matchExact: false
    },
    { 
      path: "/dashboard/reports", 
      name: "Reports", 
      icon: <FaChartBar className="text-lg" />,
      matchExact: false
    },
    { 
      path: "/dashboard/settings", 
      name: "Settings", 
      icon: <FiSettings className="text-lg" />,
      matchExact: false
    }
  ];

  const isActive = (path: string, exact: boolean) => {
    return exact ? pathname === path : pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Clear authentication data (e.g., tokens)
    localStorage.removeItem("token"); // Example: Remove token from localStorage
    sessionStorage.clear(); // Clear session storage if needed

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ width: isOpen ? 256 : 80 }}
        animate={{ width: isOpen ? 256 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-gray-900 text-white flex flex-col ${isOpen ? "w-64" : "w-20"} h-full`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold whitespace-nowrap"
              >
                SKCF Attendance
              </motion.h1>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive(item.path, item.matchExact) 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <span className="flex-shrink-0">
                      {item.icon}
                    </span>
                    <AnimatePresence initial={false}>
                      {(isOpen || isHovered) && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout} // Attach the logout handler
            className="flex items-center gap-3 w-full p-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FiLogOut className="text-lg" />
            <AnimatePresence initial={false}>
              {(isOpen || isHovered) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => isActive(item.path, item.matchExact))?.name || "Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  A
                </div>
                <span className="hidden md:inline text-sm font-medium">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
