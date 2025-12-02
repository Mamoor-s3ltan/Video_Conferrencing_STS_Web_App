import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      setSession(JSON.parse(storedSession));
      console.log(session)
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("session");
    setSession(null);
    navigate("/"); // redirect to home
  };

  return (
    <header className={!session? "flex justify-between items-center px-8 py-4 bg-transparent" :"flex justify-between items-center px-8 py-4  border-gray-700 bg-[#2D2F31]"}>
      {/* Logo */}
      <Link to="/">
        <h1 className="text-2xl font-bold tracking-wide text-indigo-400">
          VideoMeet
        </h1>
      </Link>

      {/* Navigation */}
      {!session ? (
        <nav className="hidden md:flex space-x-6">
          <a href="#features" className="hover:text-purple-200">
            Features
          </a>
          <a href="#about" className="hover:text-purple-200">
            About
          </a>
          <a href="#contact" className="hover:text-purple-200">
            Contact
          </a>
        </nav>
      ) : (
        <div className="space-x-3 hidden md:flex">
          <Link to="/profile">
            <button className="px-4 py-2 text-white rounded-full text-sm font-medium cursor-pointer">
              Profile
            </button>
          </Link>
          <Link to="/settings">
            <button className="px-4 py-2 text-white  rounded-full text-sm font-medium cursor-pointer">
              Settings
            </button>
          </Link>
        </div>
      )}

      {/* Right Side Buttons */}
      <div className="space-x-3">
        {!session ? (
          <>
            <Link to="/signin">
              <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-full text-sm font-medium">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 bg-white text-purple-700 hover:bg-purple-100 rounded-full text-sm font-medium">
                Sign Up
              </button>
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-white cursor-pointer bg-red-500 hover:bg-red-600 rounded-full text-sm font-medium"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
