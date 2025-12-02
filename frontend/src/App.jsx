import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/auth/signup";
import Signin from "./pages/auth/signin";
import Dashboard from "./pages/dashboard/dashboard.jsx";
import ReadyToJoin from "./pages/ready_to_join/ready_to_join.jsx";
import VideoChat from "./pages/Video_Chat.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ready_to_join" element={<ReadyToJoin />} />
      <Route path="/meeting/:meetingId"  element={<VideoChat />} />
      
    </Routes>
  );
}

export default App;
