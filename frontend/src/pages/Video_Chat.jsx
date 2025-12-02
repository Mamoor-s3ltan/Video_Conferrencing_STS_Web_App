// MeetingRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Users,
  MessageSquare,
  Copy
} from 'lucide-react';



const SOCKET_SERVER = 'http://localhost:3001';

function VideoChat() {
  // Get meetingId from URL
  const getMeetingIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/meeting\/([^/]+)/);
    return match ? match[1] : null;
  };

  const meetingId = getMeetingIdFromUrl();
  
  // Refs
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  
  // State
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [remoteStreams, setRemoteStreams] = useState({});

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize media and socket
  useEffect(() => {
    if (hasJoined) {
      initializeMediaAndSocket();
    }

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    };
  }, [hasJoined]);

  const initializeMediaAndSocket = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize socket - You need to import io from 'socket.io-client'
      // For now, this will throw an error until you install the package
      if (typeof io !== 'undefined') {
        socketRef.current = io(SOCKET_SERVER);

        // Socket event listeners
        socketRef.current.on('connect', () => {
          console.log('Connected to signaling server');
          socketRef.current.emit('joinMeeting', {
            meetingId,
            username
          });
        });

        socketRef.current.on('meetingJoined', (data) => {
          console.log('Successfully joined meeting:', data);
          setParticipants(data.participants);
        });

        socketRef.current.on('existingParticipants', async (data) => {
          console.log('Existing participants:', data.participants);
          for (const participant of data.participants) {
            await createPeerConnection(participant.socketId, true);
          }
        });

        socketRef.current.on('participantJoined', async (data) => {
          console.log('New participant joined:', data.participant);
          setParticipants(prev => [...prev, data.participant]);
        });

        socketRef.current.on('incomingCall', async (data) => {
          console.log('Incoming call from:', data.from);
          await handleIncomingCall(data);
        });

        socketRef.current.on('callAnswered', async (data) => {
          console.log('Call answered by:', data.from);
          const pc = peerConnectionsRef.current[data.from];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        });

        socketRef.current.on('iceCandidate', async (data) => {
          console.log('Received ICE candidate from:', data.from);
          const pc = peerConnectionsRef.current[data.from];
          if (pc && data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        });

        socketRef.current.on('participantLeft', (data) => {
          console.log('Participant left:', data.username);
          setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
          
          if (peerConnectionsRef.current[data.socketId]) {
            peerConnectionsRef.current[data.socketId].close();
            delete peerConnectionsRef.current[data.socketId];
          }

          setRemoteStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[data.socketId];
            return newStreams;
          });
        });

        socketRef.current.on('meetingError', (data) => {
          alert(data.message);
          window.location.href = '/dashboard';
        });
      } else {
        console.error('Socket.io not loaded. Please install socket.io-client');
      }

    } catch (error) {
      console.error('Error initializing media:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const createPeerConnection = async (participantId, shouldCreateOffer) => {
    try {
      const pc = new RTCPeerConnection(iceServers);
      peerConnectionsRef.current[participantId] = pc;

      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.ontrack = (event) => {
        console.log('Received remote track from:', participantId);
        setRemoteStreams(prev => ({
          ...prev,
          [participantId]: event.streams[0]
        }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('iceCandidate', {
            to: participantId,
            candidate: event.candidate
          });
        }
      };

      if (shouldCreateOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        if (socketRef.current) {
          socketRef.current.emit('call', {
            to: participantId,
            offer: offer,
            meetingId
          });
        }
      }

      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  };

  const handleIncomingCall = async (data) => {
    try {
      const pc = await createPeerConnection(data.from, false);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      if (socketRef.current) {
        socketRef.current.emit('answer', {
          to: data.from,
          answer: answer
        });
      }
    } catch (error) {
      console.error('Error handling incoming call:', error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const leaveMeeting = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveMeeting', { meetingId });
    }
    window.location.href = '/dashboard';
  };

  const copyMeetingLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('Meeting link copied to clipboard!');
  };

  const sendMessage = () => {
    if (messageInput.trim() && socketRef.current) {
      const message = {
        from: username,
        text: messageInput,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, message]);
      setMessageInput('');
    }
  };

  // Join screen
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-semibold mb-2">Join Meeting</h1>
          <p className="text-gray-400 mb-6">Meeting ID: {meetingId}</p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => username.trim() && setHasJoined(true)}
            disabled={!username.trim()}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-xl font-medium transition"
          >
            Join Meeting
          </button>
        </div>
      </div>
    );
  }

  // Meeting room screen
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Meeting Room</h2>
          <p className="text-sm text-gray-400">ID: {meetingId}</p>
        </div>
        <button
          onClick={copyMeetingLink}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
        >
          <Copy size={16} />
          <span className="text-sm">Copy Link</span>
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium">{username} (You)</span>
            </div>
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff size={48} className="text-gray-600" />
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {Object.entries(remoteStreams).map(([participantId, stream]) => (
            <RemoteVideo
              key={participantId}
              stream={stream}
              participant={participants.find(p => p.socketId === participantId)}
            />
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button
            onClick={leaveMeeting}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition"
          >
            <PhoneOff size={20} />
          </button>

          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
          >
            <Users size={20} />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 p-6 overflow-auto z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Participants ({participants.length})</h3>
            <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.socketId}
                className="bg-gray-800 rounded-lg p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">
                  {participant.username.charAt(0).toUpperCase()}
                </div>
                <span>{participant.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 flex flex-col z-50">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h3 className="text-xl font-semibold">Chat</h3>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center text-sm">No messages yet</p>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-3">
                <div className="font-semibold text-sm text-indigo-400">{msg.from}</div>
                <div className="text-sm mt-1">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Remote Video Component
function RemoteVideo({ stream, participant }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 px-3 py-1 rounded-lg">
        <span className="text-sm font-medium">{participant?.username || 'Unknown'}</span>
      </div>
    </div>
  );
}

export default VideoChat;