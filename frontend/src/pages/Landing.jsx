import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Hero_img from "../assets/hero_img.jpg";
import {Podcast,AudioWaveform,ShieldCheck } from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 text-white flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 bg-transparent">
        <h1 className="text-2xl font-bold tracking-wide">VideoMeet</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#features" className="hover:text-purple-200">Features</a>
          <a href="#about" className="hover:text-purple-200">About</a>
          <a href="#contact" className="hover:text-purple-200">Contact</a>
        </nav>
        <div className="space-x-3">
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-full text-sm font-medium">Login</button>
          <Link to="/signup">
            <button className="px-4 py-2 bg-white text-purple-700 hover:bg-purple-100 rounded-full text-sm font-medium">Sign Up</button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between flex-1 px-8 md:px-16 py-12">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Welcome to <br /> Your Video Conferencing Platform
          </h2>
          <p className="text-purple-200 text-lg">
            Connect, collaborate, and communicate seamlessly with real-time translation and HD video quality.
          </p>
          <div className="space-x-4">
            <button className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-full hover:bg-purple-100">
              Join a Meeting
            </button>
            <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-full font-semibold">
              Get Started
            </button>
          </div>
        </div>

        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src={Hero_img}
            alt="Video Conferencing Illustration"
            className="w-3/4 max-w-sm drop-shadow-md rounded-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-purple-800 py-16 px-8 md:px-16">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "HD Video & Audio", desc: "Enjoy crystal-clear communication during meetings.",icon:<Podcast className="w-6 h-6 text-purple-200" /> },
            { title: "Real-time Translation", desc: "Break language barriers with live translation.",icon:<AudioWaveform className="w-6 h-6 text-purple-200" /> },
            { title: "Secure & Reliable", desc: "Your data and privacy are fully protected.",icon:<ShieldCheck className="w-6 h-6 text-purple-200" /> },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-purple-700/50 rounded-2xl p-8 shadow-lg hover:bg-purple-700 transition"
            >
              <div className="flex  justify-center gap-2 justify-items-center">
              <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
              <span>{feature.icon}</span>
              </div>
              <p className="text-purple-200">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 py-6 text-center text-sm text-purple-300">
        © {new Date().getFullYear()} VideoMeet. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
