# 🃏 Tongits Go

**Tongits Go** is an online multiplayer card game inspired by the traditional Filipino game "Tongits." Built using modern frontend technologies, the game offers real-time interactions, an engaging user interface, and smooth gameplay across different devices.

---

## 🚀 Features

- 🎮 Real-time multiplayer Tongits gameplay
- 👥 Create or join rooms with friends
- 🔐 Secure user login and session handling
- ⚡ Fast UI with React and responsive design
- 🔄 Backend API integration for player actions and game state

---

## 🛠️ Tech Stack

- **Frontend**: React.js, JavaScript, Tailwind CSS or Bootstrap (depending on project)
- **Routing**: React Router
- **Authentication**: Cookie-based or token-based login system
- **Backend**: *(Assumed external – communicates via REST APIs or WebSockets)*

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/clairenjuguna/tongits-go.git
cd tongits-go
2. Install Dependencies
bash
Copy
Edit
npm install
3. Start the Development Server
bash
Copy
Edit
npm start
The app will be available at http://localhost:3000.

🔑 Authentication
New users can register or existing users can log in.

Authenticated sessions are stored via cookies or tokens.

Users are redirected to the game lobby upon login.

📁 Project Structure
plaintext
Copy
Edit
tongits-go/
├── public/
├── src/
│   ├── components/      # UI components (cards, player panels, etc.)
│   ├── pages/           # Screens like Login, Game Lobby, and Game Table
│   ├── utils/           # Helper functions (game rules, state handlers)
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
🎮 How the Game Works
Join/Create a Room: Players can join an existing game or create a new room.

Game Play: Players take turns drawing, discarding, and forming melds.

Win Condition: The round ends when a player declares “Tongits” or the draw pile is empty.

Scoreboard: Points are calculated and displayed at the end of each round.

🤝 Contributing
Contributions are welcome! To contribute:

Fork the repository.

Create a new branch.

Make your changes.

Submit a pull request.

📄 License
This project is licensed under the MIT License.

👩‍💻 Author
Claire Njuguna
