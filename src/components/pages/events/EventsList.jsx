import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiFilter, FiPlus } from "react-icons/fi";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";

import EventService from "../../../services/EventService";
import { Pagination } from "../../../shared/common/Pagination";
import DeleteModal from "../../../shared/common/DeleteConfirmation";

const eventTypes = [
  "All Types",
  "Meeting",
  "Birthday",
  "Team Building",
  "Training",
  "Workshop",
  "Webinar",
  "Conference",
  "Other",
];

const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10 records per page

  // Filters jo user input field mein enter kar raha hai (pending changes)
  const [filters, setFilters] = useState({
    eventTitle: "",
    eventType: "",
    eventDate: "",
  });

  // Filters jo actually API call mein use honge (applied changes)
  const [appliedFilters, setAppliedFilters] = useState({
    eventTitle: "",
    eventType: "",
    eventDate: "",
  });

  // Events ko fetch karne ka function, useCallback ke saath
  const fetchEvents = useCallback(
    async () => {
      setLoading(true);
      setError(null); // Clear any previous error

      try {
        const params = {
          eventTitle: appliedFilters.eventTitle,
          // "All Types" ko empty string mein convert karein
          eventType: appliedFilters.eventType === "All Types" ? "" : appliedFilters.eventType,
          eventDate: appliedFilters.eventDate,
          l: pageSize, // Limit
          o: (currentPage - 1) * pageSize, // Offset
        };

        // Filters mein se empty values remove karein, jaisa PoliciesList mein tha
        const paramsToSend = Object.keys(params).reduce((acc, key) => {
          const value = params[key];
          if (value !== '' && value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {});
        
        const response = await EventService.getAllEvents(paramsToSend);

        if (response && Array.isArray(response.list)) {
          setEvents(response.list);
          setTotalCount(response.count || 0);
        } else {
          setEvents([]);
          setTotalCount(0);
          // Changed from Urdu to English
          toast.warn("No events found.");
        }
      } catch (err) {
        console.error("Events fetch karne mein error:", err);
        // Changed from Urdu to English
        setError("Could not load events. Please try again later.");
        // Changed from Urdu to English
        toast.error("Error loading events.");
        setEvents([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, appliedFilters, pageSize] // Dependencies for useCallback
  );

  // useEffect hook jo currentPage aur appliedFilters change hone par data fetch karega
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // fetchEvents itself is a dependency, which is stable due to useCallback

  // Filter input change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ // set 'filters' state (not appliedFilters)
      ...prev,
      [name]: value
    }));
  };

  // Filters apply karne ka function
  const applyFilters = () => {
    setAppliedFilters(filters); // 'filters' ko 'appliedFilters' mein set karein
    setCurrentPage(1); // Filters apply hone par page 1 par set karein
  };

  // Filters reset aur filter section close karne ka function
  const closeAndResetFilters = () => {
    const initialFilters = {
      eventTitle: "",
      eventType: "",
      eventDate: "",
    };
    setFilters(initialFilters); // pending filters (filters) ko reset karein
    setAppliedFilters(initialFilters); // Applied filters ko bhi reset karein
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
      // Changed from Urdu to English
      toast.success("Event deleted successfully.");
      fetchEvents(); // Delete ke baad list ko refresh karein
    } catch (error) {
      console.error("Event Can't be deleted.", error);
      // Changed from Urdu to English
      toast.error("Event cannot be deleted.");
    } finally {
      setShowDeleteModal(false);
      setSelectedEventId(null);
    }
  };

  // Pagination page change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // fetchEvents function automatically re-run hoga currentPage change hone ki wajah se
  };

  // --- Loading State ka Render ---
  if (loading && events.length === 0 && !error) { // Only show loading if no data and no error
    return (
      <div className="px-6 pt-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5EFFF' }}>
        {/* Changed from Urdu to English */}
        <div className="text-lg text-gray-600">Events are loading, please wait...</div>
      </div>
    );
  }
  // --- Error State ka Render ---
  if (error && events.length === 0) { // Show error if no data and error
    return (
        <div className="px-6 pt-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5EFFF' }}>
            <div className="text-lg text-red-600">{error}</div>
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
              // Changed from Urdu to English
              title="Add New Event"
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
                  value={filters.eventTitle} // Ab yeh 'filters' state use kar raha hai
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
                  value={filters.eventType} // Ab yeh 'filters' state use kar raha hai
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
                  value={filters.eventDate} // Ab yeh 'filters' state use kar raha hai
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
                {events.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} {/* PoliciesList ki tarah */}
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
              {/* Conditional rendering for loading, error, and no data */}
              {loading && events.length === 0 ? (
                <tr>
                    <td colSpan="9" className="px-4 py-6 text-center text-gray-500 text-lg">Loading events...</td>
                </tr>
              ) : events.length > 0 ? (
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
                          // Changed from Urdu to English
                          title="Edit Event"
                        >
                          <FaEdit className="text-white text-lg" />
                        </button>
                        <button
                          className="p-2 rounded shadow cursor-pointer bg-red-500 hover:bg-red-600 transition-colors"
                          onClick={() => handleDeleteClick(event._id)}
                          // Changed from Urdu to English
                          title="Delete Event"
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
                    {/* Changed from Urdu to English */}
                    {error ? <p className="text-red-600">{error}</p> : "No events found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {events.length === 0 && !error && !loading && (
            <div className="px-4 py-6 text-center text-gray-500 text-lg">
              {/* Changed from Urdu to English */}
              Click on "Add New Event" to create the first event.
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