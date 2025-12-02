import React, { useState } from 'react'
import { supabase } from "../../conn.js";
import Header from "../../components/Header";
import { Video, Search, X, Calendar, Link, Copy, Check } from 'lucide-react';

function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const generateMeetingLink = () => {
    // Generate a unique meeting ID
    const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/meeting/${meetingId}`;
    setMeetingLink(link);
    setShowLinkDialog(true);
    setIsDialogOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink);
    alert('Link copied to clipboard!');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#1E1E1E] text-white px-8 py-10">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold">
            Welcome Back <span className="text-indigo-400">User</span>,<br />
            Connect Globally. Talk Naturally.
          </h1>
        </div>

        {/* New Meeting Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center justify-center gap-2 bg-black border border-gray-600 px-5 py-3 rounded-xl font-medium hover:bg-gray-900 transition"
          >
            <Video size={18} />
            New Meeting
          </button>

          <input
            type="text"
            placeholder="Enter a link or code"
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button className="bg-black border border-gray-600 px-5 py-3 rounded-xl font-medium hover:bg-gray-900 transition">
            Join
          </button>
        </div>

        {/* Search Section */}
        <div className="flex items-center gap-3 mb-8">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search Meeting"
            className="w-full md:w-1/2 bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Recent Meetings */}
        <h2 className="text-2xl font-semibold mb-6">Recent Meetings</h2>

        <div className="space-y-4">
          {/* Meeting Card 1 */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-lg font-semibold">Meeting with Ali Khan</h3>
              <p className="text-sm text-gray-400">Yesterday • 45 min</p>
            </div>
            <div className="flex gap-3 mt-3 md:mt-0">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium">
                Rejoin
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium">
                Details
              </button>
            </div>
          </div>

          {/* Meeting Card 2 */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-lg font-semibold">Client Meeting</h3>
              <p className="text-sm text-gray-400">Oct 5 • 1 hr</p>
            </div>
            <div className="flex gap-3 mt-3 md:mt-0">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium">
                Rejoin
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium">
                Details
              </button>
            </div>
          </div>
        </div>

        {/* Dialog Box */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-11/12 md:w-96 relative">
              {/* Close Button */}
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>

              {/* Dialog Header */}
              <h2 className="text-2xl font-semibold mb-6">Create New Meeting</h2>

              {/* Options */}
              <div className="space-y-4">
                {/* New Meeting Link Option */}
                <button 
                  onClick={generateMeetingLink}
                  className="w-full flex items-center gap-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl p-4 transition"
                >
                  <div className="bg-indigo-500 p-3 rounded-lg">
                    <Link size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">New Meeting Link</h3>
                    <p className="text-sm text-gray-400">Create an instant meeting link</p>
                  </div>
                </button>

                {/* Schedule Meeting Option */}
                <button 
                  onClick={() => {
                    // Add your schedule meeting logic here
                    console.log('Opening schedule meeting form...');
                    setIsDialogOpen(false);
                  }}
                  className="w-full flex items-center gap-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl p-4 transition"
                >
                  <div className="bg-green-500 p-3 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Schedule Meeting</h3>
                    <p className="text-sm text-gray-400">Plan a meeting for later</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Link Dialog */}
        {showLinkDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-11/12 md:w-[500px] relative">
              {/* Close Button */}
              <button 
                onClick={() => setShowLinkDialog(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>

              {/* Dialog Header */}
              <h2 className="text-2xl font-semibold mb-4">Your Meeting Link is Ready!</h2>
              <p className="text-gray-400 text-sm mb-6">Share this link with anyone you want to join the meeting</p>

              {/* Meeting Link Display */}
              <div className="bg-gray-900 border border-gray-600 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div className="flex-1 overflow-hidden">
                  <p className="text-indigo-400 text-sm truncate">{meetingLink}</p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="ml-3 bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg transition"
                >
                  <Copy size={18} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    window.location.href = meetingLink;
                  }}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 py-3 rounded-xl font-medium transition"
                >
                  Start Meeting
                </button>
                <button 
                  onClick={() => setShowLinkDialog(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard