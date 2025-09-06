// WebRTC functionality for voice and video calls

// DOM elements
const callContainer = document.getElementById('call-container');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const callStatus = document.getElementById('call-status');
const callDuration = document.getElementById('call-duration');
const remoteUserName = document.getElementById('remote-user-name');
const toggleVideoBtn = document.getElementById('toggle-video-btn');
const toggleAudioBtn = document.getElementById('toggle-audio-btn');
const endCallBtn = document.getElementById('end-call-btn');
const voiceCallBtn = document.getElementById('voice-call-btn');
const videoCallBtn = document.getElementById('video-call-btn');
const incomingCallModal = document.getElementById('incoming-call-modal');
const callerName = document.getElementById('caller-name');
const callTypeLabel = document.getElementById('call-type-label');
const acceptCallBtn = document.getElementById('accept-call-btn');
const rejectCallBtn = document.getElementById('reject-call-btn');
const callerAvatar = document.getElementById('caller-avatar');

// WebRTC state
let localStream = null;
let remoteStream = null;
let peerConnection = null;
let callType = null; // 'voice' or 'video'
let callInProgress = false;
let callPartner = null;
let callStartTime = null;
let durationInterval = null;

// ICE server configuration
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

// Initialize WebRTC
const initWebRTC = () => {
  // Set up event listeners
  voiceCallBtn.addEventListener('click', () => startCall('voice'));
  videoCallBtn.addEventListener('click', () => startCall('video'));
  toggleVideoBtn.addEventListener('click', toggleVideo);
  toggleAudioBtn.addEventListener('click', toggleAudio);
  endCallBtn.addEventListener('click', endCall);
  acceptCallBtn.addEventListener('click', acceptIncomingCall);
  rejectCallBtn.addEventListener('click', rejectIncomingCall);
  
  // Set up socket event listeners
  socket.on('webrtc-offer', handleOffer);
  socket.on('webrtc-answer', handleAnswer);
  socket.on('webrtc-ice-candidate', handleIceCandidate);
  socket.on('webrtc-call-request', handleCallRequest);
  socket.on('webrtc-call-response', handleCallResponse);
  socket.on('webrtc-hang-up', handleRemoteHangup);
};

// Start a call
const startCall = async (type) => {
  if (callInProgress) {
    alert('You are already in a call');
    return;
  }
  
  if (!Chat.getCurrentRoom()) {
    alert('Please select a room first');
    return;
  }
  
  // Check if it's a direct message room
  const room = Chat.getCurrentRoom();
  if (room.type !== 'direct') {
    alert('You can only call in direct message rooms');
    return;
  }
  
  // Get other participant
  const otherParticipant = room.participants.find(p => p.id !== Auth.currentUser().id);
  if (!otherParticipant) {
    alert('No participant to call');
    return;
  }
  
  // Check if user is online
  if (otherParticipant.status === 'offline') {
    alert('User is offline and cannot receive calls');
    return;
  }
  
  // Set call type
  callType = type;
  callPartner = otherParticipant;
  
  // Show call UI in connecting state
  showCallUI('connecting');
  
  try {
    // Get user media
    const constraints = {
      audio: true,
      video: type === 'video'
    };
    
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Show local video
    localVideo.srcObject = localStream;
    
    // Send call request
    socket.emit('webrtc-call-request', {
      target: callPartner.id,
      callType
    });
    
    callStatus.textContent = 'Calling...';
  } catch (error) {
    console.error('Error starting call:', error);
    alert(`Failed to access camera/microphone: ${error.message}`);
    endCall();
  }
};

// Handle incoming call request
const handleCallRequest = (data) => {
  if (callInProgress) {
    // Automatically reject if already in a call
    socket.emit('webrtc-call-response', {
      target: data.from,
      accepted: false
    });
    return;
  }
  
  // Show incoming call UI
  callPartner = { id: data.from, username: data.fromUsername };
  callType = data.callType;
  
  callerName.textContent = data.fromUsername;
  callTypeLabel.textContent = data.callType === 'video' ? 'Video Call' : 'Voice Call';
  
  // Try to get avatar
  const user = users.find(u => u.id === data.from);
  if (user && user.avatar) {
    callerAvatar.style.backgroundImage = `url(${user.avatar})`;
  } else {
    callerAvatar.style.backgroundImage = 'none';
    callerAvatar.textContent = data.fromUsername.charAt(0).toUpperCase();
  }
  
  // Show incoming call modal
  incomingCallModal.classList.add('active');
  
  // Play ringtone
  playRingtone();
};

// Play ringtone
const playRingtone = () => {
  // Create audio element for ringtone
  const ringtone = new Audio('/audio/ringtone.mp3'); // You'll need to add this file
  ringtone.loop = true;
  ringtone.play().catch(e => console.error('Failed to play ringtone:', e));
  
  // Store in a variable so we can stop it
  window.currentRingtone = ringtone;
};

// Stop ringtone
const stopRingtone = () => {
  if (window.currentRingtone) {
    window.currentRingtone.pause();
    window.currentRingtone.currentTime = 0;
    window.currentRingtone = null;
  }
};

// Accept incoming call
const acceptIncomingCall = async () => {
  stopRingtone();
  incomingCallModal.classList.remove('active');
  
  try {
    // Get user media
    const constraints = {
      audio: true,
      video: callType === 'video'
    };
    
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Show call UI
    showCallUI('connecting');
    
    // Show local video
    localVideo.srcObject = localStream;
    
    // Send acceptance
    socket.emit('webrtc-call-response', {
      target: callPartner.id,
      accepted: true
    });
    
    // Create peer connection
    createPeerConnection();
    
    callStatus.textContent = 'Connecting...';
  } catch (error) {
    console.error('Error accepting call:', error);
    alert(`Failed to access camera/microphone: ${error.message}`);
    
    // Send rejection due to error
    socket.emit('webrtc-call-response', {
      target: callPartner.id,
      accepted: false
    });
    
    endCall();
  }
};

// Reject incoming call
const rejectIncomingCall = () => {
  stopRingtone();
  incomingCallModal.classList.remove('active');
  
  // Send rejection
  socket.emit('webrtc-call-response', {
    target: callPartner.id,
    accepted: false
  });
  
  // Reset call state
  callPartner = null;
  callType = null;
};

// Handle call response
const handleCallResponse = async (data) => {
  if (data.accepted) {
    // Call accepted, create peer connection
    createPeerConnection();
    
    // Create and send offer
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socket.emit('webrtc-offer', {
        target: callPartner.id,
        offer: peerConnection.localDescription
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Failed to create call offer');
      endCall();
    }
  } else {
    // Call rejected
    alert('Call was rejected or could not be connected');
    endCall();
  }
};

// Create peer connection
const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(iceServers);
  
  // Add local stream tracks to peer connection
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
  
  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('webrtc-ice-candidate', {
        target: callPartner.id,
        candidate: event.candidate
      });
    }
  };
  
  // Handle connection state changes
  peerConnection.onconnectionstatechange = () => {
    switch(peerConnection.connectionState) {
      case 'connected':
        callStatus.textContent = 'Connected';
        startCallTimer();
        break;
      case 'disconnected':
      case 'failed':
        endCall();
        break;
    }
  };
  
  // Handle remote stream
  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
    }
    
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
    
    // Set remote user name
    remoteUserName.textContent = callPartner.username || 'User';
    
    // Update call status
    callInProgress = true;
  };
};

// Handle offer
const handleOffer = async (data) => {
  // If not in a call or not the expected call, ignore
  if (!callPartner || data.from !== callPartner.id) return;
  
  try {
    // Create peer connection if not exists
    if (!peerConnection) {
      createPeerConnection();
    }
    
    // Set remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    // Create answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send answer
    socket.emit('webrtc-answer', {
      target: callPartner.id,
      answer: peerConnection.localDescription
    });
  } catch (error) {
    console.error('Error handling offer:', error);
    alert('Failed to process call offer');
    endCall();
  }
};

// Handle answer
const handleAnswer = async (data) => {
  // If not in a call or not the expected call, ignore
  if (!callPartner || data.from !== callPartner.id) return;
  
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  } catch (error) {
    console.error('Error handling answer:', error);
    alert('Failed to process call answer');
    endCall();
  }
};

// Handle ICE candidate
const handleIceCandidate = async (data) => {
  // If not in a call or not the expected call, ignore
  if (!callPartner || data.from !== callPartner.id || !peerConnection) return;
  
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
  }
};

// Handle remote hangup
const handleRemoteHangup = (data) => {
  if (callPartner && data.from === callPartner.id) {
    alert('Call ended by remote user');
    endCall();
  }
};

// Toggle video
const toggleVideo = () => {
  if (!localStream) return;
  
  const videoTrack = localStream.getVideoTracks()[0];
  if (videoTrack) {
    const enabled = !videoTrack.enabled;
    videoTrack.enabled = enabled;
    
    // Update button icon
    toggleVideoBtn.innerHTML = enabled ? 
      '<i class="fas fa-video"></i>' : 
      '<i class="fas fa-video-slash"></i>';
  }
};

// Toggle audio
const toggleAudio = () => {
  if (!localStream) return;
  
  const audioTrack = localStream.getAudioTracks()[0];
  if (audioTrack) {
    const enabled = !audioTrack.enabled;
    audioTrack.enabled = enabled;
    
    // Update button icon
    toggleAudioBtn.innerHTML = enabled ? 
      '<i class="fas fa-microphone"></i>' : 
      '<i class="fas fa-microphone-slash"></i>';
  }
};

// End call
const endCall = () => {
  // Send hangup signal if in a call
  if (callPartner) {
    socket.emit('webrtc-hang-up', {
      target: callPartner.id
    });
  }
  
  // Stop call timer
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }
  
  // Close peer connection
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  // Stop media streams
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
    remoteStream = null;
  }
  
  // Reset video elements
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
  
  // Hide call UI
  hideCallUI();
  
  // Reset call state
  callInProgress = false;
  callPartner = null;
  callType = null;
  callStartTime = null;
  
  // Stop ringtone if playing
  stopRingtone();
  
  // Hide incoming call modal if open
  incomingCallModal.classList.remove('active');
};

// Show call UI
const showCallUI = (state) => {
  callContainer.classList.remove('hidden');
  
  // Set UI based on state
  if (state === 'connecting') {
    callStatus.textContent = 'Connecting...';
    callDuration.textContent = '00:00';
  }
  
  // Set video visibility based on call type
  if (callType === 'voice') {
    localVideo.classList.add('hidden');
    remoteVideo.classList.add('hidden');
    toggleVideoBtn.classList.add('hidden');
  } else {
    localVideo.classList.remove('hidden');
    remoteVideo.classList.remove('hidden');
    toggleVideoBtn.classList.remove('hidden');
  }
};

// Hide call UI
const hideCallUI = () => {
  callContainer.classList.add('hidden');
};

// Start call timer
const startCallTimer = () => {
  callStartTime = new Date();
  
  // Update call duration every second
  durationInterval = setInterval(() => {
    const now = new Date();
    const diff = now - callStartTime;
    
    // Format as MM:SS
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    callDuration.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
};

// Export functions
window.WebRTC = {
  initialize: initWebRTC
};
