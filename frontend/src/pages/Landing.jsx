import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Hero_img from "../assets/hero_img.jpg";
import {Podcast,AudioWaveform,ShieldCheck } from 'lucide-react'


const Landing = () => {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white flex flex-col">

      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-700 bg-[#2B2B2B]">
        <h1 className="text-2xl font-bold tracking-wide text-indigo-400">VideoMeet</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#features" className="text-gray-300 hover:text-indigo-400">Features</a>
          <a href="#about" className="text-gray-300 hover:text-indigo-400">About</a>
          <a href="#contact" className="text-gray-300 hover:text-indigo-400">Contact</a>
        </nav>
        <div className="space-x-3">
          <Link to="/signin">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium">
              Login
            </button>
          </Link>

          <Link to="/signup">
            <button className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-medium">
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between flex-1 px-8 md:px-16 py-12">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-indigo-400">
            Welcome to <br /> Your Video Conferencing Platform
          </h2>
          <p className="text-gray-300 text-lg">
            Connect, collaborate, and communicate seamlessly with real-time translation and HD video quality.
          </p>
          <div className="space-x-4">
            <button className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition">
              Join a Meeting
            </button>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold">
              Get Started
            </button>
          </div>
        </div>

        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src={Hero_img}
            alt="Video Conferencing Illustration"
            className="w-3/4 max-w-sm drop-shadow-xl rounded-lg border border-gray-700"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#2B2B2B] py-16 px-8 md:px-16 border-t border-gray-700">
        <h3 className="text-3xl font-bold text-center mb-12 text-indigo-400">Why Choose Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "HD Video & Audio", desc: "Enjoy crystal-clear communication during meetings.",icon:<Podcast className="w-6 h-6 text-purple-200" /> },
            { title: "Real-time Translation", desc: "Break language barriers with live translation.",icon:<AudioWaveform className="w-6 h-6 text-purple-200" /> },
            { title: "Secure & Reliable", desc: "Your data and privacy are fully protected.",icon:<ShieldCheck className="w-6 h-6 text-purple-200" /> },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-[#1E1E1E] rounded-2xl p-8 shadow-lg border border-gray-700 hover:border-indigo-600 transition"
            >
              <div className="flex justify-center items-center gap-2 mb-3">
                <span>{feature.icon}</span>
                <h4 className="text-xl font-semibold">{feature.title}</h4>
              </div>
              <p className="text-gray-300 text-center">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2B2B2B] py-6 text-center text-sm text-gray-400 border-t border-gray-700">
        © {new Date().getFullYear()} <span className="text-indigo-400">VideoMeet</span>. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
