
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage
let notices = [];
let nextId = 1;

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// GET all active notices
app.get('/api/notices', (req, res) => {
  try {
    const activeNotices = notices.filter(notice => notice.isActive)
                                 .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log('📋 Sending', activeNotices.length, 'notices to client');
    res.json(activeNotices);
  } catch (error) {
    console.error('❌ Error getting notices:', error);
    res.status(500).json({ error: 'Failed to get notices' });
  }
});

// CREATE new notice
app.post('/api/notices', (req, res) => {
  try {
    const { title, content, author, department, priority } = req.body;
    
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'Title, content, and author are required' });
    }

    const notice = {
      _id: nextId.toString(),
      title,
      content,
      author,
      department: department || 'General',
      priority: priority || 'medium',
      createdAt: new Date(),
      isActive: true
    };
    
    notices.unshift(notice);
    nextId++;
    
    console.log('✅ New notice created:', { id: notice._id, title: notice.title });
    
    // Broadcast to all connected clients
    io.emit('new-notice', notice);
    res.status(201).json(notice);
  } catch (error) {
    console.error('❌ Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// DELETE notice
app.delete('/api/notices/:id', (req, res) => {
  try {
    const noticeId = req.params.id;
    console.log('🗑️ Delete request for ID:', noticeId);
    
    const noticeIndex = notices.findIndex(notice => 
      notice._id.toString() === noticeId.toString() && notice.isActive
    );
    
    if (noticeIndex !== -1) {
      notices[noticeIndex].isActive = false;
      console.log('✅ Notice marked as deleted:', noticeId);
      
      // Broadcast deletion to all clients
      io.emit('delete-notice', noticeId);
      res.json({ message: 'Notice deleted successfully', id: noticeId });
    } else {
      console.log('❌ Notice not found or already deleted:', noticeId);
      res.status(404).json({ error: 'Notice not found' });
    }
  } catch (error) {
    console.error('❌ Error deleting notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Display: http://localhost:${PORT}`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
  console.log('💾 Using in-memory storage');
});