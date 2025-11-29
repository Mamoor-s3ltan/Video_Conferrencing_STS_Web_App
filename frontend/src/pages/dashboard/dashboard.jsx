import React from 'react'
import { supabase } from "../../conn.js";
import Header from "../../components/Header";
import { Video,Search } from 'lucide-react';

function dashboard() {
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
        <button className="flex items-center justify-center gap-2 bg-black border border-gray-600 px-5 py-3 rounded-xl font-medium hover:bg-gray-900 transition">
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
    </div>

    </>
  )
}

export default dashboard
