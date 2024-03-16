import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Message, MessageType, StoredAnimation, LottieAnimation, EventType } from '../frontend/src/types';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 4000;

const animations: Record<string, StoredAnimation> = {};



io.on('connection', (socket: Socket) => {
  console.log('New client connected');

  socket.on(EventType.ChatMessage, (msg: Message) => {
    io.emit(EventType.ChatMessage, msg);
  });

  socket.on(EventType.Edit, (msg: Message) => {
    if (msg.animation) {
      animations[msg.animation?.url] = msg.animation;

      io.emit(EventType.Edit, {
        type: MessageType.EditEnd,
        animation: msg.animation,
        editBy: msg.editBy
      });
    } else {
      io.emit(EventType.Edit, msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.post('/download-lottie', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    if (animations[url]) {
      return res.json(animations[url]);
    }

    const response = await axios.get<LottieAnimation>(url);
    const lottieJson = response.data;

    animations[url] = {
      url,
      data: lottieJson,
      scale: 1
    }

    res.json(animations[url]);
  } catch (error) {
    console.error('Failed to download Lottie JSON:', error);
    res.status(500).send('Failed to download Lottie JSON');
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
