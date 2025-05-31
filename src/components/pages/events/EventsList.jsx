import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiFilter, FiPlus } from "react-icons/fi"; // Filter aur Plus icons
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa"; // Edit, Trash, Search icons
import { toast } from "react-toastify"; // Notifications ke liye

// Apni EventService ko import karein. Path verify kar lein.
import EventService from "../../../services/EventService";
// Pagination component import kiya gaya hai (assuming yeh shared/common mein hai)
import { Pagination } from "../../../shared/common/Pagination";
// Delete Confirmation Modal (agar aap isko PoliciesList ki tarah istemal karna chahte hain)
import DeleteModal from "../../../shared/common/DeleteConfirmation";

// Event Types options
const eventTypes = [
  "All Types",
  "Meeting",
  "Birthday",
  "Holiday Party",
  "Training",
  "Team Building",
  "Announcement",
  "Other",
];

const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false); // Filter section ko toggle karne ke liye

  // Delete Modal ke liye states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Pagination UI ke liye states (yeh ab backend pagination se sync hoga)
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Har page par kitne items dikhane hain

  // Filter states
  const [filters, setFilters] = useState({
    eventTitle: "",
    eventType: "",
    eventDate: "",
  });

  // Jab tak search button click na ho, tab tak filters ko store karne ke liye
  const [pendingFilters, setPendingFilters] = useState({
    eventTitle: "",
    eventType: "",
    eventDate: "",
  });

  // Events ko fetch karne ka function
  const fetchEvents = useCallback(
    async (currentAppliedFilters, page = 1, limit = pageSize) => {
      setLoading(true);
      setError(null);

      try {
        // Sirf non-empty filters ko parameters mein shamil karein
        const paramsToSend = Object.keys(currentAppliedFilters).reduce((acc, key) => {
          const value = currentAppliedFilters[key];
          if (value !== "" && value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {});

        // Pagination parameters bhi add karein
        paramsToSend.page = page;
        paramsToSend.limit = limit;

        const response = await EventService.getAllEvents(paramsToSend);

        if (response && Array.isArray(response.list)) {
          setEvents(response.list);
          setTotalCount(response.count || 0); // Backend se total count lenge
        } else {
          setEvents([]);
          setTotalCount(0);
          toast.warn("Koi events nahi mile.");
        }
        setCurrentPage(page);
      } catch (err) {
        console.error("Events fetch karne mein error:", err);
        setError("Events load nahi ho sake. Zara baad mein dobara koshish karein.");
        toast.error("Events load karne mein error.");
        setEvents([]); // Error par events list khali kar dein
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Component mount hone par aur filters ya page change hone par events fetch karein
  useEffect(() => {
    // Shuru mein ya page change par, current applied filters se data fetch karein
    fetchEvents(filters, currentPage, pageSize);
  }, [fetchEvents, filters, currentPage, pageSize]); // 'filters' ab woh hain jo 'applyFilters' ke baad set hote hain

  // Filter input change handler - yeh ab 'pendingFilters' ko update karega
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filters apply karne ka function
  const applyFilters = () => {
    setFilters(pendingFilters); // pendingFilters ko actual filters mein update karein
    setCurrentPage(1); // Filters apply karne par page ko 1 par reset karein
    // showFilter ko true hi rehne denge takay filter section open rahe
  };

  // Filters reset aur filter section close karne ka function
  const closeAndResetFilters = () => { // Function ka naam change kiya
    const initialFilters = {
      eventTitle: "",
      eventType: "",
      eventDate: "",
    };
    setPendingFilters(initialFilters); // Pending filters ko reset karein
    setFilters(initialFilters); // Applied filters ko bhi reset karein
    setCurrentPage(1); // Page ko 1 par reset karein
    setShowFilter(false); // Filters ko hide karein
  };

  // Delete button click handler
  const handleDeleteClick = (id) => {
    setSelectedEventId(id);
    setShowDeleteModal(true);
  };

  // Delete confirmation handler
  const confirmDelete = async () => {
    try {
      await EventService.deleteEvent(selectedEventId);
      toast.success("Event Deleted Successfully.");
      fetchEvents(filters, currentPage, pageSize); // Delete ke baad list ko refresh karein
    } catch (error) {
      console.error("Event Can't be deleted.", error);
      toast.error("Event Can't be deleted.");
    } finally {
      setShowDeleteModal(false);
      setSelectedEventId(null);
    }
  };

  // Pagination page change handler
  const handlePageChange = (page) => {
    setCurrentPage(page); // Current page ko update karein
    // fetchEvents function automatically re-run hoga useEffect ki wajah se
  };

  // --- Loading aur Error States ka Render ---
  if (loading) {
    return (
      <div className="px-6 pt-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="text-lg text-gray-600">Events load ho rahe hain, intezaar karein...</div>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <>
      <div className="px-6 pt-6 min-h-screen font-inter" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Events</h2>
          <div className="flex space-x-2">
            <button
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
              title="Filter Events"
            >
              <FiFilter className="text-white text-xl" />
            </button>
            <button
              className="p-2 rounded shadow cursor-pointer"
              onClick={() => navigate("/events-form")}
              title="Naya Event Shamil Karein"
              style={{ backgroundColor: "#A294F9" }}
            >
              <FiPlus className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* --- Filter Section --- */}
        <div className={`overflow-hidden transition-all duration-400 ease-in-out ${showFilter ? "max-h-96" : "max-h-0"}`}>
          <div className="p-4 mb-4 rounded-lg ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
              <div>
                <label htmlFor="filterTitle" className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  id="filterTitle"
                  name="eventTitle"
                  value={pendingFilters.eventTitle} // pendingFilters use karein
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Search by event title"
                />
              </div>
              <div>
                <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  id="filterType"
                  name="eventType"
                  value={pendingFilters.eventType} // pendingFilters use karein
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none"
                >
                  {eventTypes.map((type, idx) => (
                    <option key={idx} value={type === "All Types" ? "" : type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="date"
                  id="filterDate"
                  name="eventDate"
                  value={pendingFilters.eventDate} // pendingFilters use karein
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeAndResetFilters}
                className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white border-gray-300 cursor-pointer transition-colors"
              >
                Close 
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 rounded shadow text-white cursor-pointer flex items-center"
                style={{ backgroundColor: "#A294F9" }}
              >
                <FaSearch className="mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* --- Events Table Section --- */}
        <div className="overflow-x-auto p-3 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {totalCount}
              </span>{" "}
              entries
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: "#E5D9F2" }}>
              <tr>
                <th className="px-4 py-3 text-left">Event Title</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Organizer</th>
                <th className="px-4 py-3 text-center">Recurring</th>
                <th className="px-4 py-3 text-center">Reminder</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                    <td className="px-4 py-3 font-medium">{event.eventTitle}</td>
                    <td className="px-4 py-3">{event.eventType}</td>
                    <td className="px-4 py-3">
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {`${event.startTime || 'N/A'}${event.endTime ? ' - ' + event.endTime : ''}`}
                    </td>
                    <td className="px-4 py-3">{event.location}</td>
                    <td className="px-4 py-3">{event.organizer}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.isRecurring ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {event.isRecurring ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.sendReminder ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                        {event.sendReminder ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          className="p-2 rounded shadow cursor-pointer bg-[#A294F9] hover:bg-[#8D7BE7] transition-colors"
                          onClick={() => navigate(`/events-form/${event._id}`)}
                          title="Event Edit Karein"
                        >
                          <FaEdit className="text-white text-lg" />
                        </button>
                        <button
                          className="p-2 rounded shadow cursor-pointer bg-red-500 hover:bg-red-600 transition-colors"
                          onClick={() => handleDeleteClick(event._id)}
                          title="Event Delete Karein"
                        >
                          <FaTrashAlt className="text-white text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-6 text-center text-gray-500 text-lg">
                    {error ? <p className="text-red-600">{error}</p> : "Koi event nahi mila."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {events.length === 0 && !error && !loading && (
            <div className="px-4 py-6 text-center text-gray-500 text-lg">
              "Naya Event Shamil Karein" button par click kar ke pehla event banayen.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
};
export default EventsList;