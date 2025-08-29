# Chat App Frontend

A modern React frontend for the real-time chat application built with Vite, TailwindCSS, and Socket.IO.

## Features

- **User Authentication**: Simple login/signup with name and email
- **Real-time Chat**: Instant messaging with Socket.IO integration
- **User Management**: Browse and select users to chat with
- **Responsive Design**: Clean, modern UI that works on all devices
- **Message History**: View conversation history with date grouping
- **Live Updates**: Real-time message delivery and typing indicators

## Tech Stack

- **Frontend Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MessageInput.jsx
│   ├── MessageList.jsx
│   └── UserList.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   └── Chat.jsx
├── api.js              # API configuration and functions
├── socket.js           # Socket.IO client setup
├── App.jsx             # Main app component with routing
├── main.jsx            # React entry point
└── index.css           # Global styles and TailwindCSS
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see backend README)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your backend URL:

```bash
cp env.example .env
```

Edit `.env` with your backend URL:
```env
VITE_BACKEND_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Usage

### Login/Signup

1. Enter your name and email
2. Click "Create Account & Start Chatting"
3. You'll be automatically logged in and redirected to the chat

### Chat Interface

1. **User List (Left Sidebar)**: Browse available users and select one to chat with
2. **Chat Window (Right Side)**: View messages and send new ones
3. **Message Input**: Type your message and press Enter to send
4. **Real-time Updates**: Messages appear instantly for both sender and receiver

### Features

- **User Search**: Filter users by name or email
- **Message History**: View all conversations grouped by date
- **Typing Indicators**: See when someone is typing
- **Connection Status**: Monitor Socket.IO connection status
- **Responsive Design**: Works on desktop and mobile devices

## API Integration

The frontend integrates with the backend API endpoints:

- `POST /users` - Create user account
- `GET /users` - Get all users
- `POST /messages` - Send message
- `GET /messages` - Get user messages
- `GET /messages/conversation/:userId1/:userId2` - Get conversation

## Socket.IO Events

### Client Events
- `join` - Join user's personal room
- `disconnect` - Automatically handled

### Server Events
- `new_message` - Receive new message in real-time

## Deployment

### Vercel Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_BACKEND_URL=https://your-backend-domain.com`

### Environment Variables for Production

Make sure to set the correct backend URL in your production environment:

```env
VITE_BACKEND_URL=https://your-deployed-backend.com
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Uses modern React patterns (Hooks, functional components)
- TailwindCSS for styling
- ESLint for code quality
- Consistent component structure

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check `VITE_BACKEND_URL` in `.env`
   - Ensure backend server is running
   - Check CORS settings on backend

2. **Socket.IO Connection Issues**
   - Verify backend URL is correct
   - Check browser console for connection errors
   - Ensure backend Socket.IO server is running

3. **Build Errors**
   - Clear `node_modules` and reinstall dependencies
   - Check for syntax errors in components
   - Verify all imports are correct

### Debug Mode

Enable debug logging by checking the browser console for:
- API request/response logs
- Socket.IO connection status
- Component lifecycle events

## Contributing

1. Follow the existing code structure
2. Use TailwindCSS classes for styling
3. Maintain responsive design principles
4. Test on different screen sizes
5. Ensure Socket.IO integration works properly

## License

MIT
