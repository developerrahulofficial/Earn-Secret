# 🎮 Connect the Dots - 2 Player Shape Game

A real-time multiplayer game where two players take turns connecting dots to form shapes and earn points. Built with React, Express, WebSockets, and PostgreSQL.

![Game Preview](https://img.shields.io/badge/Status-Live-success)
![Node.js](https://img.shields.io/badge/Node.js-v22-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)

<img width="3080" height="1816" alt="image" src="https://github.com/user-attachments/assets/585152ed-fbe9-4772-93c3-ea8516dfe486" />

## ✨ Features

- 🎯 **Real-time Multiplayer** - Play with friends using room codes
- 🎨 **Interactive Canvas** - Draw lines between dots to create shapes
- 🏆 **Score Tracking** - Earn points based on shape complexity
- 🎭 **Player Avatars** - Unique avatar system for each player
- 🌓 **Dark/Light Mode** - Toggle between themes
- 🔊 **Sound Effects** - Immersive audio feedback
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **WebSocket Communication** - Low-latency real-time gameplay
- 🎉 **Animations** - Confetti, sparkles, and reveal effects

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/developerrahulofficial/Earn-Secret.git
cd Earn-Secret
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=development
PORT=5000
```

4. **Push database schema**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

### Deploy to Render

1. **Create accounts**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

2. **Set up PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Choose a name and region
   - Select free tier (or paid for production)
   - Copy the **Internal Database URL**

3. **Deploy Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: Your app name
     - **Region**: Choose closest region
     - **Branch**: `main`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or paid)

4. **Add Environment Variables**
   ```
   DATABASE_URL=<your-postgres-internal-url>
   SESSION_SECRET=<random-secret-string>
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment
   - Your app will be live at: `https://your-app-name.onrender.com`

6. **Run Database Migrations** (first time only)
   - Go to your web service → Shell tab
   - Run: `npm run db:push`

### Important Notes

- ✅ **Render supports WebSockets** - Perfect for this real-time game
- ⚠️ **Free tier limitations**: Services spin down after 15 minutes of inactivity (30s cold start)
- 💡 **Use paid tier** for production to avoid cold starts

### Alternative Platforms

This app works on any platform that supports:
- Node.js servers
- WebSocket connections
- PostgreSQL databases

**Recommended platforms:**
- [Render.com](https://render.com) ⭐ (Best for this app)
- [Railway.app](https://railway.app)
- [Fly.io](https://fly.io)
- [Heroku](https://heroku.com)

**Not recommended:**
- ❌ Vercel (doesn't support WebSockets)
- ❌ Netlify (serverless only)

## 🎮 How to Play

1. **Create a Room**
   - Click "Create Room" on the home page
   - Share the room code with your friend

2. **Join a Room**
   - Enter the room code
   - Wait for both players to join

3. **Take Turns**
   - Connect dots on your turn to form shapes
   - Earn points based on shape size and complexity
   - First player to reach the target score wins!

4. **Game Controls**
   - Click dots to create connections
   - Complete shapes to earn points
   - Use strategy to block your opponent

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide Icons** - Icon library

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **WebSocket (ws)** - Real-time communication
- **PostgreSQL** - Database
- **Drizzle ORM** - Database toolkit
- **Passport.js** - Authentication
- **Express Session** - Session management

### DevOps
- **ESBuild** - Fast bundling
- **tsx** - TypeScript execution
- **cross-env** - Cross-platform env variables

## 📁 Project Structure

```
Earn-Secret/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── server/              # Backend Express app
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── game.ts          # Game logic
│   ├── storage.ts       # Database layer
│   └── vite.ts          # Vite dev server
├── shared/              # Shared types/schemas
│   └── schema.ts        # Database schema
├── script/              # Build scripts
│   └── build.ts         # Production build
├── dist/                # Build output
├── package.json         # Dependencies
└── README.md           # You are here!
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**Build fails with missing dependencies**
- Ensure all build dependencies are in `dependencies` not `devDependencies`
- Run `npm install` again

**WebSocket connection fails**
- Check that your deployment platform supports WebSockets
- Verify environment variables are set correctly

**Database connection errors**
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from your deployment
- Run `npm run db:push` to initialize schema

**App doesn't start on Render**
- Check build logs for errors
- Verify all environment variables are set
- Ensure start command is `npm start`

## 📧 Contact

- GitHub: [@developerrahulofficial](https://github.com/developerrahulofficial)
- Repository: [Earn-Secret](https://github.com/developerrahulofficial/Earn-Secret)

## 🌟 Show Your Support

Give a ⭐️ if you like this project!

---

Built with ❤️ using React, Express, and WebSockets
