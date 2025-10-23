import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div>
        {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 bg-transparent">
        <Link to="/"><h1 className="text-2xl font-bold tracking-wide">VideoMeet</h1></Link>
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
    </div>
  )
}

export default Header