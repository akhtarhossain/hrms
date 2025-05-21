import { useState, useEffect, useRef } from "react";
import {
  FiHome,
  FiUsers,
  FiClock,
  FiMail,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiChevronDown,
  FiChevronRight,
  FiLock,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../../src/assets/logo.png";
import SessionService from "../services/SessionService";
import { IoSettingsOutline } from "react-icons/io5";

function Sidebar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: ''
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout function
  const logout = () => {
    SessionService.logout();
    navigate("/login");
  };

const GetUser = () => {
  const user = SessionService.getLoggedIn();
  return user;
};

useEffect(() => {
  const userResponse = GetUser();
  if (userResponse?.data) {
    const { firstName, lastName, email } = userResponse.data; // Destructure once
    const fullName = `${firstName} ${lastName}`;
    setUserInfo({
    fullName: `${firstName} ${lastName}`,
    email: email
  });
  }
}, []); 
  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateAreas: `
          "header header"
          "sidebar main"
          "sidebar footer"
        `,
        gridTemplateColumns: "250px 1fr",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      <header style={{ gridArea: "header" }}>
        <nav
          className=" w-full bg-white dark:bg-gray-800 dark:border-gray-700"
          style={{ backgroundColor: "#E5D9F2" }}
        >
          <div className="px-3 py-3 lg:px-5 lg:pl-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start rtl:justify-end">
                <button
                  onClick={toggleSidebar}
                  type="button"
                  className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                    ></path>
                  </svg>
                </button>
                <a href="#" className="flex ms-2 md:me-24">
                  <img
                    src={logo}
                    className="h-12 ml-5 w-auto me-3"
                    alt="Logo"
                  />
                  {/* <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">HR Portal</span> */}
                </a>
              </div>
              {/* <div className="flex items-center">
              <div className="flex items-center ms-3">
                <div>
                  <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false">
                    <span className="sr-only">Open user menu</span>
                    <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
                  </button>
                </div>
              </div>
            </div> */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center ms-3">
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 cursor-pointer"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="w-9 h-9 rounded-full border-2 border-white shadow-md hover:scale-105 transition duration-200"
                      src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                      alt="user photo"
                    />
                  </button>
                </div>

                {/* Dropdown */}
           {open && (
            <div className="absolute right-0 z-20 mt-2 w-72 border border-gray-100 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700 animate-fade-in overflow-hidden"
            style={{ backgroundColor: '#E5D9F2' }}
            >
              {/* User Info Section */}
              <div className="px-4 py-3 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-300 font-medium text-sm">
                        {userInfo.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 py-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userInfo.fullName || 'User Name'} 
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userInfo.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <ul style={{ backgroundColor: '#F5EFFF'}}  className="py-1 text-sm text-gray-700 dark:text-gray-200"
              >
                <li>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      navigate("/profile-settings");
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                  >
                    <FiUser className="text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                    <span>Profile</span>
                  </a>
                </li>
                  <li>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      navigate("/profile-settings");
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                  >
                    <IoSettingsOutline className="text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                    <span>Settings</span>
                  </a>
                </li>
                <li>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      navigate("/change-password");
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                  >
                    <FiLock className="text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                    <span>Change Password</span>
                  </a>
                </li>
                <li className="border-t border-gray-100 dark:border-gray-700 mt-1">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer group"
                  >
                    <FiLogOut className="group-hover:text-red-700 dark:group-hover:text-red-400" />
                    <span>Logout</span>
                  </a>
                </li>
              </ul>
            </div>
          )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <aside
      id="logo-sidebar"
      aria-label="Sidebar"
      className={`w-64 h-full border-r border-gray-200 transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        sm:translate-x-0`}
      style={{
        gridArea: "sidebar",
        backgroundColor: "#E5D9F2",
      }}
    >
      <div className="h-full px-3 pb-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {/* Dashboard */}
          <li>
            <a
              href="#"
              className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group"
            >
              <FiHome className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
              <span className="ms-3"
              onClick={() => navigate("/")}
              >Dashboard</span>
            </a>
          </li>

          {/* Employees */}
          <li>
            <button
              type="button"
              onClick={() => toggleDropdown("Employees")}
              className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-[#CDC1FF] group"
            >
              <FiUsers className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Employees
              </span>
              {openDropdown === "Employees" ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )}
            </button>
            {openDropdown === "Employees" && (
              <ul className="py-2 space-y-2 pl-[30px] ml-5 border-l-[2px] border-[#A294F9] relative">
                <li>
                  <a
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap"
                      onClick={() => navigate("/employees")}
                    >
                      Employees
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Attendance */}
          <li>
            <button
              type="button"
              onClick={() => toggleDropdown("Attendance")}
              className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-[#CDC1FF] group"
            >
              <FiClock className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Attendance
              </span>
              {openDropdown === "Attendance" ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )}
            </button>
            {openDropdown === "Attendance" && (
              <ul className="py-2 space-y-2 pl-[30px] ml-5 border-l-[2px] border-[#A294F9] relative">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap"
                    onClick={() => navigate("/attendence")}
                    >
                      Attendance Records
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap" 
                    onClick={() => navigate("/admin-attendence")}
                    >
                      Time Tracking
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Request */}
           <li>
              <button
                type="button"
                onClick={() => toggleDropdown("Request")}
                className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-[#CDC1FF] group"
              >
                <FiMail className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
                <span className="flex-1 ms-3 text-left whitespace-nowrap">
                  Request
                </span>
                {openDropdown === "Request" ? (
                  <FiChevronDown className="w-4 h-4" />
                ) : (
                  <FiChevronRight className="w-4 h-4" />
                )}
              </button>
              {openDropdown === "Request" && (
                <ul className="py-2 space-y-2 pl-[44px] ml-5 border-l-[2px] border-[#A294F9] relative">
                  <li>
                    <a
                      href="#"
                      className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-26px] before:top-1/2 before:transform before:-translate-y-1/2"
                    >
                     <span className="flex-1 whitespace-nowrap"
                        onClick={() => navigate("/request-form")}
                      >
                        Add Request
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-26px] before:top-1/2 before:transform before:-translate-y-1/2"
                    >
                    <span className="flex-1 whitespace-nowrap"
                        onClick={() => navigate("/request-list")}
                      >
                        Request
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-26px] before:top-1/2 before:transform before:-translate-y-1/2"
                    >
                    <span className="flex-1 whitespace-nowrap"
                        onClick={() => navigate("/support-list")}
                      >
                       Support
                      </span>
                    </a>
                  </li>
                </ul>
              )}
              </li>

          {/* Salary */}
          <li>
            <button
              type="button"
              onClick={() => toggleDropdown("Salary")}
              className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-[#CDC1FF] group"
            >
              <FiDollarSign className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Salary
              </span>
              {openDropdown === "Salary" ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )}
            </button>
            {openDropdown === "Salary" && (
              <ul className="py-2 space-y-2 pl-[30px] ml-5 border-l-[2px] border-[#A294F9] relative">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap" onClick={() => navigate("/salary")}>Salary</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap"
                      onClick={() => navigate("/transaction")}
                    >
                      Transaction Type
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Payroll */}
          <li>
            <button
              type="button"
              onClick={() => toggleDropdown("Payroll")}
              className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-[#CDC1FF] group"
            >
              <FiDollarSign className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Payroll
              </span>
              {openDropdown === "Payroll" ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )}
            </button>
            {openDropdown === "Payroll" && (
              <ul className="py-2 space-y-2 pl-[30px] ml-5 border-l-[2px] border-[#A294F9] relative">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap" onClick={() => navigate("/payroll")}>Payroll</span>
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Event & Holiday */}
          <li>
            <button
              type="button"
              onClick={() => toggleDropdown("Event")}
              className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-[#CDC1FF] group"
            >
              <FiCalendar className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Event & Holiday
              </span>
              {openDropdown === "Event" ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )}
            </button>
            {openDropdown === "Event" && (
              <ul className="py-2 space-y-2 pl-[30px] ml-5 border-l-[2px] border-[#A294F9] relative">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap">
                      Company Events
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap">
                      Holiday Calendar
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap">
                      Time-off Planner
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Reports */}
          <li>
            <button
              type="button"
              onClick={() => toggleDropdown("Reports")}
              className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-[#CDC1FF] group"
            >
              <FiFileText className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Reports
              </span>
              {openDropdown === "Reports" ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )}
            </button>
            {openDropdown === "Reports" && (
              <ul className="py-2 space-y-2 pl-[30px] ml-5 border-l-[2px] border-[#A294F9] relative">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap">
                      Monthly Reports
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap">
                      Annual Reports
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#CDC1FF] group relative before:content-[''] before:w-2 before:h-2 before:bg-[#A294F9] before:rounded-full before:absolute before:left-[-17px] before:top-1/2 before:transform before:-translate-y-1/2"
                  >
                    <span className="flex-1 whitespace-nowrap">
                      Custom Reports
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </aside>
      <main
        style={{
          height: "100%",
          gridArea: "main",
          overflow: "auto",
        }}
      >
        <Outlet />
        <footer
          style={{
            gridArea: "footer",
          }}
          className="bg-[#E5D9F2] py-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </footer>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}

export default Sidebar;