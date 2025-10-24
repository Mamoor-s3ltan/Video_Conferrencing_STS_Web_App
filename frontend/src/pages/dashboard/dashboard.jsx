import React, { useState, useRef, useEffect } from "react";
import { Search, Video, User, Link, Calendar, X, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateLink = () => {
    const randomCode = Math.random().toString(36).substring(2, 8);
    const newLink = `${window.location.origin}/meeting/${randomCode}`;
    setMeetingLink(newLink);
    setOpenDialog(true);
    setOpenDropdown(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink);
    alert("✅ Meeting link copied!");
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white px-6 py-8 font-sans relative">
      {/* Navbar */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-semibold text-indigo-400">VideoMeet</h1>
        <nav className="flex gap-8 items-center">
          <a href="#" className="text-gray-300 hover:text-indigo-400">Dashboard</a>
          <a href="#" className="text-gray-300 hover:text-indigo-400">Settings</a>
          <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition">
            <User size={18} />
          </div>
        </nav>
      </header>

      {/* Welcome */}
      <section className="mb-10">
        <h2 className="text-3xl font-medium leading-snug">
          Welcome Back, <span className="text-indigo-400">User</span> 👋<br />
          Connect Globally. Talk Naturally.
        </h2>
      </section>

      {/* Meeting Controls */}
      <section className="flex flex-wrap gap-3 items-center mb-10 relative">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
          >
            <Video size={18} /> New Meeting
          </button>

          {/* Dropdown */}
          {openDropdown && (
            <div className="absolute mt-2 w-56 bg-[#2B2B2B] border border-gray-700 rounded-xl shadow-lg z-10">
              <button
                className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#3A3A3A] transition"
                onClick={handleCreateLink}
              >
                <Link size={18} className="text-indigo-400" />
                <span>Create a Meeting Link</span>
              </button>
              <button
                className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#3A3A3A] transition"
                onClick={() => alert("Schedule meeting feature coming soon!")}
              >
                <Calendar size={18} className="text-indigo-400" />
                <span>Schedule Meeting</span>
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="Enter a link or code"
          className="bg-[#2B2B2B] border border-gray-600 text-gray-200 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button 
        onClick={() => navigate("/ready_to_join")}
        className="bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition">
          Join
        </button>
      </section>

      {/* Search Bar */}
      <div className="flex items-center bg-[#2B2B2B] rounded-lg px-3 py-2 w-full max-w-md mb-6 border border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search Meeting"
          className="bg-transparent border-none text-gray-200 w-full px-2 focus:outline-none"
        />
      </div>

      {/* Recent Meetings */}
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Recent Meetings</h3>

      <div className="space-y-4">
        {[
          { title: "Meeting with Ali Khan", time: "Yesterday - 45 min" },
          { title: "Client Meeting", time: "Oct 5 - 1 hr" },
        ].map((meeting, i) => (
          <div
            key={i}
            className="bg-[#2B2B2B] rounded-xl p-4 flex justify-between items-center border border-gray-700 hover:border-indigo-600 transition"
          >
            <div>
              <p className="text-white font-medium">{meeting.title}</p>
              <p className="text-gray-400 text-sm">{meeting.time}</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white text-sm font-medium transition">
                Rejoin
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-gray-200 font-medium transition">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog for Meeting Link */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#2B2B2B] rounded-2xl p-6 w-96 border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-indigo-400">
                Meeting Link Created
              </h4>
              <button onClick={() => setOpenDialog(false)}>
                <X className="text-gray-400 hover:text-gray-200" size={20} />
              </button>
            </div>

            <p className="text-gray-300 mb-3">
              Share this link with others to let them join your meeting:
            </p>

            <div className="flex items-center bg-[#1E1E1E] border border-gray-600 rounded-lg px-3 py-2 mb-5">
              <input
                type="text"
                value={meetingLink}
                readOnly
                className="bg-transparent text-gray-200 w-full focus:outline-none text-sm"
              />
              <button onClick={copyToClipboard}>
                <Copy size={18} className="text-indigo-400 hover:text-indigo-300" />
              </button>
            </div>

            <div className="flex justify-end">
              <button
               onClick={() => navigate("/ready_to_join")}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white font-medium transition"
              >
                Start Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
