import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiList } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from 'axios';
import EventService from "../../../services/EventService";

const eventTypes = [
  "Meeting",
  "Birthday",
  "Holiday Party",
  "Training",
  "Team Building",
  "Announcement",
  "Other",
];

const EventsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    eventTitle: "",
    eventType: "Meeting",
    eventDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    organizer: "",
    attendees: "",
    description: "",
    isRecurring: false,
    sendReminder: false,
  });

  const [errors, setErrors] = useState({});
  const [documentName, setDocumentName] = useState('');
  const [documentUploadStatus, setDocumentUploadStatus] = useState('idle');
  const [DocuUrl, setDocuUrl] = useState('');

  useEffect(() => {
    if (id) {
      EventService.getEventById(id)
        .then((response) => {
          if (response) {
            setFormData({
              ...response,
              eventDate: response.eventDate
                ? new Date(response.eventDate).toISOString().split("T")[0]
                : "",
              isRecurring: response.isRecurring || false,
              sendReminder: response.sendReminder || false,
              endTime: response.endTime || "",
              attendees: response.attendees || "",
            });
          } else {
            toast.error("Event not found.");
            navigate("/events-list");
          }
        })
        .catch((error) => {
          console.error("Error fetching event:", error);
          toast.error("Failed to load event data.");
          navigate("/events-list");
        });
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.eventTitle.trim()) {
      tempErrors.eventTitle = "Event Title is required.";
      isValid = false;
    }
    if (!formData.eventDate) {
      tempErrors.eventDate = "Event Date is required.";
      isValid = false;
    }
       if (!formData.endDate) {
      tempErrors.endDate = "End Date is required.";
      isValid = false;
    }
    if (!formData.startTime) {
      tempErrors.startTime = "Start Time is required.";
      isValid = false;
    }
    if (!formData.location.trim()) {
      tempErrors.location = "Location is required.";
      isValid = false;
    }
    if (!formData.organizer.trim()) {
      tempErrors.organizer = "Organizer/Host is required.";
      isValid = false;
    }
    if (!formData.description.trim()) {
      tempErrors.description = "Event Description is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) {
    toast.error("Please fill in all required fields.");
    return;
  }

  // Prepare the event data
  const eventData = {
    eventTitle: formData.eventTitle,
    eventType: formData.eventType,
    eventDate: formData.eventDate,
    endDate: formData.endDate,
    startTime: formData.startTime,
    endTime: formData.endTime,
    location: formData.location,
    organizer: formData.organizer,
    description: formData.description,
    isRecurring: formData.isRecurring,
    sendReminder: formData.sendReminder,
    docuAttachment: DocuUrl,
  };

  try {
    // Save the event (create or update)
    let response;
    if (id) {
      response = await EventService.updateEvent(id, eventData);
    } else {
      response = await EventService.createEvent(eventData);
    }

    if (response) {
      toast.success(`Event ${id ? "updated" : "created"} successfully!`);

      try {
        await EventService.sendEventNotification( eventData);
        toast.info("Notification emails sent to all employees");
      } catch (emailError) {
        console.error("Error sending notifications:", emailError);
        const emailErrorMessage = emailError.response?.data?.message || 
        "Failed to send notifications";
        toast.warning(`Event saved but: ${emailErrorMessage}`);
      }

      // Schedule reminder if checkbox is checked
      if (formData.sendReminder) {
        try {
          await EventService.scheduleEventReminder(eventData);
          toast.info("Reminder scheduled for 1 day before the event");
        } catch (reminderError) {
          console.error("Error scheduling reminder:", reminderError);
          const reminderErrorMessage = reminderError.response?.data?.message || 
                                    "Failed to schedule reminder";
          toast.warning(`Event saved but: ${reminderErrorMessage}`);
        }
      }      
      navigate("/events-list");
    }
  } catch (error) {
    console.error("Error saving event:", error);
    const errorMessage = error.response?.data?.message || 
    error.message || 
    "Unknown error occurred";
    toast.error(`Failed to save event: ${errorMessage}`);
  }
};
const handleDocumentUpload = async (e) => {
  const file = e.target?.files?.[0];
  if (!file) return;
  setDocumentName('');
  setDocumentUploadStatus('uploading');
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'image/jpg', 'video/mp4', 'video/3gpp', 'text/srt',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    toast.error('File type not supported.');
    setDocumentUploadStatus('idle');
    return;
  }

  try {
    setDocumentName(file.name);
    const projectData = { name: file.name, access: "public-read" };
    const response = await EventService.uploadDocument(projectData);

    if (response?.message && Array.isArray(response.message)) {
      response.message.forEach((msg) => toast.error(msg));
      setDocumentUploadStatus('idle');
      return;
    }

    const uploadUrl = response.location;
    if (!uploadUrl) {
      toast.error("No upload URL received.");
      setDocumentUploadStatus('idle');
      return;
    }

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
        "x-amz-acl": "public-read",
      }
    });

    const trimmedDOCUrl = uploadUrl.split("?")[0];
    setDocuUrl(trimmedDOCUrl);
    setDocumentUploadStatus('uploaded');
    toast.success("Document uploaded successfully!");
  } catch (err) {
    console.error("Upload failed:", err);
    setDocumentUploadStatus('idle');
    toast.error("Upload failed! Please try again.");
  } finally {
    e.target.value = '';
  }
};
  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {id ? "Edit Event" : "Add New Event"}
        </h2>
        <button
          onClick={() => navigate("/events-list")}
          title="Events List"
          className="p-2 bg-[#A294F9] rounded shadow hover:bg-[#8D7BE7] transition-colors"
        >
          <FiList className="text-white" />
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4 w-full">
              <div className="w-1/2">
                <label
                  htmlFor="eventTitle"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  Event Title
                </label>
                <input
                  type="text"
                  id="eventTitle"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.eventTitle ? "border-red-500" : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none`}
                  placeholder="Enter event title"
                />
                {errors.eventTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventTitle}
                  </p>
                )}
              </div>

              <div className="w-1/2">
                <label
                  htmlFor="eventType"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  Event Type
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none"
                >
                  {eventTypes.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mb-4 w-full">
              <div className="w-1/2">
                <label
                  htmlFor="eventDate"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  Event Date
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.eventDate ? "border-red-500" : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none`}
                />
                {errors.eventDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventDate}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="eventDate"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.endDate}
                  </p>
                )}
              </div>
             
            </div>
            

            <div className="flex gap-4 mb-4 w-full">
               <div className="w-1/2">
                <label
                  htmlFor="startTime"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none`}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startTime}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="endTime"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  End Time (Optional)
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                />
              </div>

            </div>

            <div className="flex gap-4 mb-4 w-full">
              <div className="w-1/2">
                <label
                  htmlFor="organizer"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  Organizer/Host
                </label>
                <input
                  type="text"
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.organizer ? "border-red-500" : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none`}
                  placeholder="e.g., HR Department, John Doe"
                />
                {errors.organizer && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.organizer}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="attendees"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  Attendees/Participants (Optional)
                </label>
                <textarea
                  id="attendees"
                  name="attendees"
                  rows="1"
                  value={formData.attendees}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none resize-y"
                  placeholder="e.g., All Employees, Marketing Team, Alice, Bob"
                ></textarea>
              </div>
            </div>

            <div className="w-full mb-4">
              <label
                htmlFor="description"
                className="block mb-1 font-semibold text-[#333]"
              >
                Event Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className={`w-full p-2 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none resize-y`}
                placeholder="Enter event description and details"
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex gap-4 mb-4 w-full items-center">
              
              <div className="w-1/2">
                <label
                  htmlFor="location"
                  className="block mb-1 font-semibold text-[#333]"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none`}
                  placeholder="e.g., Conference Room A, Zoom Link"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.location}
                  </p>
                )}
              </div>
               <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Document <span className="text-red-500">*</span>
                </label>
                <div
                  className={`w-full p-2 border ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  } rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none`}
                  onClick={() => document.getElementById('documentUpload')?.click()}
                >
                  {documentName ? (
                    <div className="flex items-center space-x-2 max-w-full">
                      <span className="text-sm text-gray-600 truncate max-w-xs">{documentName}</span>
                      {documentUploadStatus === 'uploading' && (
                        <div className="relative w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-indigo-600 animate-bounce"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Please choose document</span>
                  )}
                  <input
                    id="documentUpload"
                    name="documentUpload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                  />
                </div>
              </div>
          
            </div>
            <div className="flex gap-4 mb-4 w-full items-center justify-content-center">
             <div className="w-1/2 flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#A294F9] focus:ring-[#A294F9] border-gray-300 rounded"
                />
                <label
                  htmlFor="isRecurring"
                  className="ml-2 block font-semibold text-[#333]"
                >
                  Is Recurring Event?
                </label>
              </div>
              <div className="w-1/2 flex items-center">
                <input
                  type="checkbox"
                  id="sendReminder"
                  name="sendReminder"
                  checked={formData.sendReminder}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#A294F9] focus:ring-[#A294F9] border-gray-300 rounded"
                />
                <label
                  htmlFor="sendReminder"
                  className="ml-2 block font-semibold text-[#333]"
                >
                  Send Reminder?
                </label>
              </div>
              </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => navigate("/events-list")}
                className="px-4 py-2 rounded shadow text-white bg-gray-500 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded shadow text-white bg-[#A294F9] hover:bg-[#8D7BE7] transition-colors"
              >
                {id ? "Update Event" : "Save Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventsForm;