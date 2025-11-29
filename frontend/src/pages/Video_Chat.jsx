import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const VideoChat = () => {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [error, setError] = useState(null);
  const [currentPeer, setCurrentPeer] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.on("users", (userList) => {
      setUsers(userList.filter((u) => u.id !== socketRef.current.id));
    });

    socketRef.current.on("incomingCall", async (data) => {
      console.log("Incoming call from:", data.fromUsername);
      setIncomingCall(data);
    });

    socketRef.current.on("callAnswered", async (data) => {
      console.log("Call answered");
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    });

    socketRef.current.on("iceCandidate", async (data) => {
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    socketRef.current.on("callRejected", () => {
      setError("Call was rejected");
      setIsCallActive(false);
    });

    socketRef.current.on("callEnded", () => {
      endCall();
    });

    socketRef.current.on("userDisconnected", () => {
      if (isCallActive) {
        endCall();
        setError("User disconnected");
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Initialize local video stream
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Failed to access camera/microphone: " + err.message);
        console.error("Error accessing media devices:", err);
      }
    };

    startVideo();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      socketRef.current.emit("join", { username });
      setIsJoined(true);
    }
  };

  const initiateCall = async (recipientId) => {
    if (!localStreamRef.current) {
      setError("Local stream not initialized");
      return;
    }

    try {
      setCurrentPeer(recipientId);
      peerConnectionRef.current = new RTCPeerConnection(configuration);

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("iceCandidate", {
            to: recipientId,
            candidate: event.candidate,
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnectionRef.current.onconnectionstatechange = () => {
        if (peerConnectionRef.current.connectionState === "failed") {
          setError("Connection failed");
        }
      };

      localStreamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit("call", {
        to: recipientId,
        offer: offer,
      });

      setIsCallActive(true);
    } catch (err) {
      setError("Error initiating call: " + err.message);
      console.error("Error:", err);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      setCurrentPeer(incomingCall.from);
      peerConnectionRef.current = new RTCPeerConnection(configuration);

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("iceCandidate", {
            to: incomingCall.from,
            candidate: event.candidate,
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      localStreamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit("answer", {
        to: incomingCall.from,
        answer: answer,
      });

      setIncomingCall(null);
      setIsCallActive(true);
    } catch (err) {
      setError("Error accepting call: " + err.message);
      console.error("Error:", err);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socketRef.current.emit("rejectCall", {
        to: incomingCall.from,
      });
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (currentPeer) {
      socketRef.current.emit("endCall", { to: currentPeer });
    }
    setIsCallActive(false);
    setCurrentPeer(null);
  };

  if (!isJoined) {
    return (
      <div style={styles.container}>
        <div style={styles.joinContainer}>
          <h1>WebRTC Video Chat</h1>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && joinChat()}
            />
            <button onClick={joinChat} style={styles.joinButton}>
              Join Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>WebRTC Video Chat</h1>

      {error && <div style={styles.error}>{error}</div>}

      {incomingCall && (
        <div style={styles.incomingCall}>
          <p>{incomingCall.fromUsername} is calling...</p>
          <button onClick={acceptCall} style={styles.acceptButton}>
            Accept
          </button>
          <button onClick={rejectCall} style={styles.rejectButton}>
            Reject
          </button>
        </div>
      )}

      <div style={styles.videoContainer}>
        <div style={styles.videoWrapper}>
          <h3>Your Video</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={styles.video}
          />
        </div>

        <div style={styles.videoWrapper}>
          <h3>Remote Video</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.video}
          />
        </div>
      </div>

      <div style={styles.usersContainer}>
        <h3>Available Users ({users.length})</h3>
        <div style={styles.usersList}>
          {users.map((user) => (
            <div key={user.id} style={styles.userItem}>
              <span>{user.username}</span>
              <button
                onClick={() => initiateCall(user.id)}
                disabled={isCallActive}
                style={styles.callUserButton}
              >
                Call
              </button>
            </div>
          ))}
        </div>
      </div>

      {isCallActive && (
        <button onClick={endCall} style={styles.endCallButton}>
          End Call
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  joinContainer: {
    textAlign: "center",
    marginTop: "100px",
  },
  form: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "200px",
  },
  joinButton: {
    padding: "10px 20px",
    fontSize: "16px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: {
    background: "#fee",
    color: "#c33",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  incomingCall: {
    background: "#e3f2fd",
    padding: "15px",
    borderRadius: "4px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  acceptButton: {
    background: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  rejectButton: {
    background: "#f44336",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  videoContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  videoWrapper: {
    background: "#000",
    borderRadius: "8px",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  usersContainer: {
    marginTop: "30px",
  },
  usersList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "10px",
  },
  userItem: {
    background: "#f5f5f5",
    padding: "15px",
    borderRadius: "4px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  callUserButton: {
    background: "#2196F3",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  endCallButton: {
    marginTop: "20px",
    width: "100%",
    padding: "15px",
    fontSize: "18px",
    background: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default VideoChat;