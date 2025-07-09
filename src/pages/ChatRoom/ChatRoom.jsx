import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Autocomplete,
  CircularProgress,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getAllUsers,
  createChatRoom,
  getAdminChatRooms,
  getChatRoomMessages,
  sendMessage,
  deleteMessage,
  setCurrentChatRoom,
  clearCurrentChatRoom,
  addMessage,
} from '../../features/admin/chatManagementSlice';
import socketService from '../../services/socket.service';
import './ChatRoom.scss';

const ChatRoom = () => {
  const dispatch = useDispatch();
  const {
    isLoading,
    chatRooms,
    currentChatRoom,
    messages,
    users,
    totalCount,
  } = useSelector((state) => state.chatManagementReducer);

  // Local state
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  
  // Socket-related refs
  const unsubscribeRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch initial data
    dispatch(getAdminChatRooms({ page: currentPage, limit: 50 }));
  }, [dispatch, currentPage]);

  // Initialize socket connection for admin
  useEffect(() => {
    const adminJson = localStorage.getItem('adminData');
    if (adminJson) {
      try {
        const admin = JSON.parse(adminJson);
        setCurrentAdmin(admin);
        
        // Initialize socket connection
        socketService.connect(admin.id);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Setup socket listeners for the current chat room
  useEffect(() => {
    console.log('currentChatRoom', currentChatRoom);
    console.log('currentAdmin', currentAdmin);
    if (currentChatRoom && currentAdmin) {
      // Join the room
      socketService.joinRoom(currentChatRoom.id);

      // Listen for messages in this room
      const unsubscribe = socketService.onRoomMessage(currentChatRoom.id, (incomingMessage) => {
        // Only add message if it's not from current admin (to avoid duplicates)
        if (incomingMessage.sender_id !== currentAdmin.id) {
          // Add the incoming message directly to state for better performance
          dispatch(addMessage(incomingMessage));
        }
      });

      // Store unsubscribe function
      unsubscribeRef.current = unsubscribe;

      // Cleanup when room changes
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        socketService.leaveRoom(currentChatRoom.id);
      };
    }
  }, [currentChatRoom, currentAdmin, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCreateRoom = () => {
    setOpenCreateModal(true);
    if (users.length === 0) {
      dispatch(getAllUsers());
    }
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setRoomName('');
    setRoomDescription('');
    setSelectedUsers([]);
  };

  const handleSubmitCreateRoom = async () => {
    if (!roomName.trim() || selectedUsers.length === 0) {
      return;
    }

    const roomData = {
      name: roomName,
      description: roomDescription,
      userEmails: selectedUsers.map(user => user.email),
      roomType: 'group',
    };

    const result = await dispatch(createChatRoom(roomData));
    console.log('result', result);
    if (result.type === '/chat/createChatRoom/fulfilled') {
      handleCloseCreateModal();
      // Refresh room list
      dispatch(getAdminChatRooms({ page: 1, limit: 50 }));
    }
  };

  const handleRoomClick = (room) => {
    dispatch(setCurrentChatRoom(room));
    dispatch(getChatRoomMessages({ roomId: room.id, page: 1, limit: 100 }));
    
    // Scroll to bottom after loading messages
    setTimeout(() => {
      scrollToBottom();
    }, 200);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChatRoom) return;

    const messageData = {
      message: newMessage,
      messageType: 'text',
    };

    const result = await dispatch(sendMessage({ 
      roomId: currentChatRoom.id, 
      messageData 
    }));
    console.log('result', result);
    
    if (result.type === '/chat/sendMessage/fulfilled') {
      setNewMessage('');
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  const handleDeleteMessage = (messageId) => {
    dispatch(deleteMessage(messageId));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading && chatRooms.length === 0) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="chat-room-container">
      {!currentChatRoom ? (
        // Main room list view
        <div className="room-list-view">
          <div className="room-list-header">
            <Typography variant="h4" component="h1" className="page-title">
              Chat Rooms
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateRoom}
              className="create-room-btn"
            >
              Create Room
            </Button>
          </div>

          <div className="rooms-grid">
            {chatRooms.length === 0 ? (
              <Box className="empty-state">
                <ChatIcon className="empty-icon" />
                <Typography variant="h6" color="textSecondary">
                  No chat rooms created yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Create your first chat room to start communicating
                </Typography>
              </Box>
            ) : (
              chatRooms.map((room) => (
                <Card 
                  key={room.id} 
                  className="room-card"
                  onClick={() => handleRoomClick(room)}
                >
                  <CardContent>
                    <div className="room-header">
                      <Typography variant="h6" className="room-name">
                        {room.name}
                      </Typography>
                      <Chip 
                        label={room.status} 
                        color={room.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </div>
                    
                    {room.description && (
                      <Typography variant="body2" color="textSecondary" className="room-description">
                        {room.description}
                      </Typography>
                    )}

                    <div className="room-stats">
                      <div className="stat-item">
                        <GroupIcon className="stat-icon" />
                        <span>{room.memberCount || 0} members</span>
                      </div>
                      <div className="stat-item">
                        <AccessTimeIcon className="stat-icon" />
                        <span>{formatDate(room.created_at)}</span>
                      </div>
                    </div>

                    {room.lastMessage && (
                      <div className="last-message">
                        <Typography variant="caption" color="textSecondary">
                          Last message: {room.lastMessage.message}
                        </Typography>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        // Split view with chat window
        <div className="chat-split-view">
          {/* Left side - Room list */}
          <div className="room-sidebar">
            <Typography variant="h6" className="sidebar-title">
              Chat Rooms
            </Typography>
            <Divider />
            <div className="sidebar-rooms">
              {chatRooms.map((room) => (
                <div
                  key={room.id}
                  className={`sidebar-room ${currentChatRoom.id === room.id ? 'active' : ''}`}
                  onClick={() => handleRoomClick(room)}
                >
                  <Typography variant="subtitle2" className="sidebar-room-name">
                    {room.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {room.memberCount || 0} members
                  </Typography>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Chat window */}
          <div className="chat-window">
            <div className="chat-header">
              <Button 
                onClick={() => dispatch(clearCurrentChatRoom())}
                className="back-btn"
              >
                ← Back
              </Button>
                  {/* <Typography variant="h6" className="chat-title">
                    {currentChatRoom.name}
                  </Typography> */}
              {/* <Typography variant="body2" color="textSecondary">
                {currentChatRoom.memberCount || 0} members
              </Typography> */}
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-messages">
                  <Typography variant="body2" color="textSecondary">
                    No messages yet. Start the conversation!
                  </Typography>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="message-item">
                    <div className="message-header">
                      <Avatar className="sender-avatar">
                        {message.sender?.first_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <div className="message-info">
                        <Typography variant="subtitle2" className="sender-name">
                          {`${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatTime(message.created_at)}
                        </Typography>
                      </div>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="delete-message-btn"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                    <div className="message-content">
                      <Typography variant="body1">
                        {message.message}
                      </Typography>
                      {message.privacy_masked && (
                        <Chip 
                          label="Privacy Protected" 
                          size="small" 
                          color="info" 
                          className="privacy-chip"
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="message-input"
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="send-btn"
              >
                <SendIcon />
              </IconButton>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      <Dialog 
        open={openCreateModal} 
        onClose={handleCloseCreateModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Chat Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            variant="outlined"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="form-field"
          />
          
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={roomDescription}
            onChange={(e) => setRoomDescription(e.target.value)}
            className="form-field"
          />

          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
            value={selectedUsers}
            onChange={(event, newValue) => setSelectedUsers(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={`${option.first_name} ${option.last_name}`}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Users"
                placeholder="Search users..."
                className="form-field"
              />
            )}
            className="user-select"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal}>Cancel</Button>
          <Button 
            onClick={handleSubmitCreateRoom}
            variant="contained"
            disabled={!roomName.trim() || selectedUsers.length === 0}
          >
            Create Room
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ChatRoom; 