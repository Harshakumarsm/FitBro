import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

// ZegoCloud credentials - using the existing project credentials
const appID = 801669669; // Your ZegoCloud App ID
const serverSecret = 'bdd60459ed65397e41f6d262a98a5d3b'; // Your ZegoCloud Server Secret

const VideoCallPage = () => {
  const { sessionId } = useParams();
  const [joinCode, setJoinCode] = useState(sessionId || '');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [zegoEngine, setZegoEngine] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // Load ZegoCloud SDK
  useEffect(() => {
    // Function to load the ZegoCloud SDK
    const loadZegoSDK = () => {
      // Check if the SDK is already loaded
      if (window.ZegoExpressEngine) {
        console.log('ZegoCloud SDK already loaded');
        setSdkLoaded(true);
        return;
      }

      // Create a script element to load the SDK
      const script = document.createElement('script');
      script.src = 'https://web.sdk.zego.im/express/2.24.5/ZegoExpressWebRTC.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';

      // Set up event handlers for the script
      script.onload = () => {
        console.log('ZegoCloud SDK loaded successfully');
        setSdkLoaded(true);
      };

      script.onerror = (e) => {
        console.error('Failed to load ZegoCloud SDK', e);
        setError('Failed to load video call service. Please try again later.');
      };

      // Add the script to the document
      document.head.appendChild(script);
    };

    // Load the SDK
    loadZegoSDK();

    // Cleanup function
    return () => {
      if (isJoined && zegoEngine) {
        handleLeaveCall();
      }
    };
  }, []);

  // Initialize ZegoEngine when SDK is loaded
  useEffect(() => {
    // Only proceed if the SDK is loaded
    if (!sdkLoaded || !window.ZegoExpressEngine) return;

    const initializeZegoEngine = async () => {
      try {
        console.log('Initializing ZegoExpressEngine with appID:', appID);

        // Create ZegoExpressEngine instance with the correct parameters
        // The first parameter is appID, the second is the environment (0 for production)
        const zg = new window.ZegoExpressEngine(appID, 0);

        // Set log level (optional)
        zg.setLogConfig({
          logLevel: 'info',
        });

        // Set event handlers
        zg.on('roomStreamUpdate', (roomID, updateType, streamList, extendedData) => {
          console.log('Room stream update:', roomID, updateType, streamList);

          if (updateType === 'ADD') {
            // New stream added, play the stream
            if (streamList && streamList.length > 0) {
              const streamID = streamList[0].streamID;
              console.log('Playing remote stream:', streamID);

              zg.startPlayingStream(streamID)
                .then((stream) => {
                  console.log('Remote stream started:', stream);
                  setRemoteStream(stream);
                  if (remoteStreamRef.current) {
                    remoteStreamRef.current.srcObject = stream;
                  }
                })
                .catch(err => {
                  console.error('Failed to play remote stream:', err);
                });
            }
          } else if (updateType === 'DELETE') {
            // Stream removed
            console.log('Remote stream removed');
            setRemoteStream(null);
            if (remoteStreamRef.current) {
              remoteStreamRef.current.srcObject = null;
            }
          }
        });

        zg.on('roomStateUpdate', (roomID, state, errorCode, extendedData) => {
          console.log('Room state update:', roomID, state, errorCode);
          if (state === 'DISCONNECTED') {
            setIsJoined(false);
          }
        });

        zg.on('roomUserUpdate', (roomID, updateType, userList) => {
          console.log('Room user update:', roomID, updateType, userList);
        });

        // Set the ZegoEngine state
        setZegoEngine(zg);
        console.log('ZegoExpressEngine initialized successfully');
      } catch (error) {
        console.error('Failed to initialize ZegoEngine:', error);
        setError('Failed to initialize video call service. Please try again later.');
      }
    };

    // Initialize ZegoEngine
    initializeZegoEngine();

    // Cleanup function
    return () => {
      if (zegoEngine) {
        // Clean up any event listeners if needed
      }
    };
  }, [sdkLoaded]);

  const handleJoinCall = async () => {
    if (!joinCode.trim() || !userName.trim()) {
      setError('Please enter both your name and the join code.');
      return;
    }

    if (!zegoEngine) {
      setError('Video call service is not ready yet. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Joining call with code:', joinCode, 'and user:', userName);

      // Generate a unique user ID if not provided
      const userID = `user_${Date.now()}`;

      // Login to the room with the correct parameters
      // The token is generated using the server secret, but for testing we can use a simple token
      const token = '';  // Empty token for testing, in production this should be generated on your server

      // Login to the room
      await zegoEngine.loginRoom(joinCode, token, {
        userID: userID,
        userName: userName
      }, { userUpdate: true });

      console.log('Successfully logged in to room:', joinCode);

      // Request camera and microphone permissions
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });

        console.log('Media permissions granted:', mediaStream);

        // Create a stream with the specified constraints
        const streamID = `stream_${userID}_${Date.now()}`;
        const localStreamObj = await zegoEngine.createStream({
          camera: {
            audio: true,
            video: true
          },
          streamID: streamID
        });

        console.log('Local stream created:', localStreamObj);

        // Set local stream
        setLocalStream(localStreamObj);
        if (localStreamRef.current) {
          localStreamRef.current.srcObject = localStreamObj;
        }

        // Publish stream
        await zegoEngine.startPublishingStream(streamID, localStreamObj);
        console.log('Started publishing stream:', streamID);

        setIsJoined(true);
      } catch (mediaError) {
        console.error('Failed to get media permissions:', mediaError);
        setError('Please allow camera and microphone access to join the call.');
      }
    } catch (error) {
      console.error('Failed to join call:', error);
      setError('Failed to join the call. Please check your permissions and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveCall = async () => {
    if (!zegoEngine) return;

    try {
      console.log('Leaving call...');

      // Stop publishing local stream
      if (localStream) {
        const streamID = localStream.streamID;
        if (streamID) {
          console.log('Stopping publishing stream:', streamID);
          zegoEngine.stopPublishingStream(streamID);
        }
        zegoEngine.destroyStream(localStream);
        setLocalStream(null);
      }

      // Stop playing remote stream
      if (remoteStream) {
        console.log('Stopping playing remote stream');
        zegoEngine.stopPlayingStream(remoteStream.streamID);
        setRemoteStream(null);
      }

      // Logout from room
      console.log('Logging out from room:', joinCode);
      await zegoEngine.logoutRoom(joinCode);

      // Clear video elements
      if (localStreamRef.current) {
        localStreamRef.current.srcObject = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.srcObject = null;
      }

      setIsJoined(false);
      console.log('Successfully left the call');
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  };

  const toggleMicrophone = () => {
    if (!localStream) return;

    try {
      console.log('Toggling microphone, current state:', isMicMuted);
      zegoEngine.mutePublishStreamAudio(localStream.streamID, !isMicMuted);
      setIsMicMuted(!isMicMuted);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  const toggleCamera = () => {
    if (!localStream) return;

    try {
      console.log('Toggling camera, current state:', isCameraOff);
      zegoEngine.mutePublishStreamVideo(localStream.streamID, !isCameraOff);
      setIsCameraOff(!isCameraOff);
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  return (
    <section className="py-8 bg-gray-900 min-h-screen w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">FitBro Video Session</h1>
          <p className="text-gray-300">
            Connect with your trainer for a personalized fitness session
          </p>
        </div>

        {!isJoined ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Join Your Session</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="userName" className="block text-gray-700 font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#178582]"
                  placeholder="Enter your name"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="joinCode" className="block text-gray-700 font-medium mb-2">Join Code</label>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#178582]"
                  placeholder="Enter the 6-digit code"
                />
              </div>

              <button
                onClick={handleJoinCall}
                disabled={isLoading || !zegoEngine}
                className="w-full bg-[#178582] hover:bg-teal-700 text-white py-2 rounded-md font-medium transition duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Joining...' : 'Join Session'}
              </button>

              {!zegoEngine && (
                <p className="mt-3 text-sm text-gray-500 text-center">
                  Loading video call service...
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-2">
                <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                  {!remoteStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-lg">Waiting for trainer to join...</div>
                    </div>
                  )}
                  <video
                    ref={remoteStreamRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  ></video>
                </div>
              </div>

              <div>
                <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                  {!localStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-lg">Camera off</div>
                    </div>
                  )}
                  <video
                    ref={localStreamRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  ></video>
                </div>

                <div className="mt-4 bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Session Info</h3>
                  <div className="text-gray-300 text-sm">
                    <p><span className="font-medium">Session ID:</span> {sessionId}</p>
                    <p><span className="font-medium">Join Code:</span> {joinCode}</p>
                    <p><span className="font-medium">Status:</span> {remoteStream ? 'Connected with trainer' : 'Waiting for trainer'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={toggleMicrophone}
                className={`${isMicMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white p-3 rounded-full`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              <button
                onClick={toggleCamera}
                className={`${isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white p-3 rounded-full`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                onClick={handleLeaveCall}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoCallPage;