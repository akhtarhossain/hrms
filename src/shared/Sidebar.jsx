import { useState } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiClock, 
  FiMail, 
  FiDollarSign, 
  FiCalendar,
  FiFileText,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';

function Sidebar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      dropdown: false
    },
    {
      name: 'Employees',
      icon: <FiUsers className="w-5 h-5" />,
      dropdown: true,
      subItems: ['Employee List', 'Add/Edit Employee', 'Employee Profile']
    },
    {
      name: 'Attendance',
      icon: <FiClock className="w-5 h-5" />,
      dropdown: true,
      subItems: ['Attendance Records', 'Time Tracking', 'Absence Management']
    },
    {
      name: 'Request',
      icon: <FiMail className="w-5 h-5" />,
      dropdown: true,
      subItems: ['Leave Requests', 'Overtime Requests', 'Permission Requests,Leave Requests', 'Overtime Requests', 'Permission Requests,Leave Requests', 'Overtime Requests', 'Permission Requests,Leave Requests', 'Overtime Requests', 'Permission Requests,Leave Requests', 'Overtime Requests', 'Permission Requests,Leave Requests', 'Overtime Requests', 'Permission Requests']
    },
    {
      name: 'Salary',
      icon: <FiDollarSign className="w-5 h-5" />,
      dropdown: true,
      subItems: ['Payroll', 'Salary Slips', 'Deductions & Bonuses']
    },
    {
      name: 'Event & Holiday',
      icon: <FiCalendar className="w-5 h-5" />,
      dropdown: true,
      subItems: ['Company Events', 'Holiday Calendar', 'Time-off Planner']
    },
    {
      name: 'Reports',
      icon: <FiFileText className="w-5 h-5" />,
      dropdown: true,
      subItems: ['Monthly Reports', 'Annual Reports', 'Custom Reports']
    }
  ];

  return (
    <>
      <nav className="fixed top-0 z-40 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button 
                onClick={toggleSidebar}
                type="button" 
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
              </button>
              <a href="#" className="flex ms-2 md:me-24">
                <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 me-3" alt="FlowBite Logo" />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">HR Portal</span>
              </a>
            </div>
            <div className="flex items-center">
              <div className="flex items-center ms-3">
                <div>
                  <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false">
                    <span className="sr-only">Open user menu</span>
                    <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <aside 
        id="logo-sidebar" 
        className={`fixed top-0 left-0 z-30 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`} 
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.dropdown ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.name)}
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                        {item.icon}
                      </span>
                      <span className="flex-1 ms-3 text-left whitespace-nowrap">{item.name}</span>
                      {openDropdown === item.name ? (
                        <FiChevronDown className="w-4 h-4" />
                      ) : (
                        <FiChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {openDropdown === item.name && (
                      <ul className="py-2 space-y-2 pl-11">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <a
                              href="#"
                              className="flex items-center p-2 text-gray-900 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                            >
                              <span className="flex-1 whitespace-nowrap">{subItem}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                      {item.icon}
                    </span>
                    <span className="ms-3">{item.name}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black opacity-50 sm:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}

export default Sidebar;