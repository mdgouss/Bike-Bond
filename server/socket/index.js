const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const ChatMessage = require('../models/ChatMessage');
const LiveLocation = require('../models/LiveLocation');

const setupSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Connected users store
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);
    
    // Store user's socket
    connectedUsers.set(socket.user._id.toString(), socket.id);

    // Notify friends user is online
    socket.broadcast.emit('userOnline', {
      userId: socket.user._id,
      name: socket.user.name
    });

    // Join user's personal room
    socket.join(socket.user._id.toString());

    // ============ PRIVATE MESSAGING ============

    socket.on('sendPrivateMessage', async (data) => {
      try {
        const { receiverId, content, messageType = 'text' } = data;

        // Save message to database
        const message = await Message.create({
          sender: socket.user._id,
          receiver: receiverId,
          content,
          messageType
        });

        // Emit to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newPrivateMessage', {
            message,
            sender: {
              _id: socket.user._id,
              name: socket.user.name,
              avatar: socket.user.avatar
            }
          });
        }

        // Confirm to sender
        socket.emit('messageSent', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('markAsRead', async (data) => {
      try {
        const { senderId } = data;
        await Message.updateMany(
          { sender: senderId, receiver: socket.user._id, read: false },
          { read: true, readAt: Date.now() }
        );

        const senderSocketId = connectedUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messagesRead', {
            readBy: socket.user._id
          });
        }
      } catch (err) {
        console.error('Mark as read error:', err);
      }
    });

    // ============ GROUP CHAT ============

    socket.on('joinGroupChat', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('leaveGroupChat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('sendGroupMessage', async (data) => {
      try {
        const { chatId, content, messageType = 'text' } = data;

        const message = await ChatMessage.create({
          chat: chatId,
          sender: socket.user._id,
          content,
          messageType,
          readBy: [{ user: socket.user._id }]
        });

        await message.populate('sender', 'name avatar');

        // Emit to all users in the chat room
        io.to(`chat:${chatId}`).emit('newGroupMessage', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data) => {
      const { chatId, isGroup } = data;
      if (isGroup) {
        socket.to(`chat:${chatId}`).emit('userTyping', {
          user: socket.user,
          chatId
        });
      } else {
        const receiverSocketId = connectedUsers.get(chatId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('userTyping', {
            user: socket.user
          });
        }
      }
    });

    socket.on('stopTyping', (data) => {
      const { chatId, isGroup } = data;
      if (isGroup) {
        socket.to(`chat:${chatId}`).emit('userStoppedTyping', {
          userId: socket.user._id,
          chatId
        });
      } else {
        const receiverSocketId = connectedUsers.get(chatId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('userStoppedTyping', {
            userId: socket.user._id
          });
        }
      }
    });

    // ============ LIVE LOCATION (for rides) ============

    socket.on('joinRideTracking', (rideId) => {
      socket.join(`ride:${rideId}`);
    });

    socket.on('leaveRideTracking', (rideId) => {
      socket.leave(`ride:${rideId}`);
    });

    socket.on('updateLocation', async (data) => {
      try {
        const { rideId, lat, lng, speed, heading, battery } = data;

        // Update or create location record
        await LiveLocation.findOneAndUpdate(
          { user: socket.user._id, ride: rideId },
          {
            location: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            speed,
            heading,
            battery,
            lastUpdated: Date.now(),
            isActive: true
          },
          { upsert: true, new: true }
        );

        // Broadcast to all riders in the same ride
        socket.to(`ride:${rideId}`).emit('locationUpdate', {
          userId: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.avatar,
          lat,
          lng,
          speed,
          heading,
          battery,
          timestamp: Date.now()
        });
      } catch (err) {
        console.error('Location update error:', err);
      }
    });

    socket.on('stopLocationSharing', async (rideId) => {
      try {
        await LiveLocation.findOneAndUpdate(
          { user: socket.user._id, ride: rideId },
          { isActive: false }
        );

        socket.to(`ride:${rideId}`).emit('userStoppedSharing', {
          userId: socket.user._id
        });
      } catch (err) {
        console.error('Stop sharing error:', err);
      }
    });

    // ============ DISCONNECT ============

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
      connectedUsers.delete(socket.user._id.toString());

      socket.broadcast.emit('userOffline', {
        userId: socket.user._id
      });
    });
  });
};

module.exports = setupSocket;
