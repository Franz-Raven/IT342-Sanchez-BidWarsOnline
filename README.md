# IT342-G1 Sanchez - BidWars Online

A full-stack real-time gaming aggregator platform featuring Plinko, Mines, and Hi-Lo games with integrated wallet system, WebSocket real-time updates, and QRPh payment gateway.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Game Mechanics](#game-mechanics)
- [Frontend Components](#frontend-components)
- [Backend Architecture](#backend-architecture)
- [Security Features](#security-features)
- [WebSocket Integration](#websocket-integration)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

BidWars Online is a real-time gaming aggregator platform that acts as a central hub managing user wallets, authentication, and payment processing while integrating specialized game engines. The architecture demonstrates:

- **Session-based game persistence** (Hi-Lo, Mines)
- **Instant settlement games** (Plinko)
- **Real-time balance updates** via WebSocket (STOMP/SockJS)
- **Combinatorial probability calculations** (Mines)
- **Progressive multiplier systems** (Hi-Lo)
- **PayMongo QRPh integration** for deposits (Test Mode)

### Core Games

1. **Hi-Lo** - Card prediction game with progressive multipliers
2. **Plinko** - Probability-based ball drop with risk levels
3. **Mines** - Minesweeper-style grid with combinatorial math

## 🛠️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 17
- **Database:** MySQL (Hostinger-ready)
- **Authentication:** JWT (JSON Web Tokens) with Spring Security
- **Real-time:** WebSocket (STOMP over SockJS)
- **ORM:** Spring Data JPA
- **Build Tool:** Maven
- **Payments:** PayMongo API (QRPh Test Mode)

### Frontend (Web)
- **Framework:** Next.js 15+
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3.4
- **Language:** TypeScript 5
- **Components:** shadcn/ui, Radix UI
- **Icons:** Lucide React
- **HTTP Client:** Fetch API
- **WebSocket:** SockJS Client, STOMP.js

### Frontend (Mobile)
- **Language:** Kotlin
- **Framework:** Jetpack Compose
- **HTTP Client:** Retrofit
- **Build Tool:** Gradle
- **Target:** Android 8.0+ (API 26+)

### Deployment
- **Backend:** Railway
- **Frontend:** Vercel
- **Mobile:** APK Distribution

## 📁 Project Structure

```
IT342-Sanchez-BidWarsOnline/
├── bidwarsonline/                    # Spring Boot Backend
│   ├── src/main/java/edu/cit/
│   │   ├── BidwarsOnlineApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java   # JWT & CORS
│   │   │   └── WebSocketConfig.java  # STOMP configuration
│   │   ├── controller/
│   │   │   ├── AuthController.java   # Register, Login, Logout
│   │   │   ├── HiloController.java   # Hi-Lo game endpoints
│   │   │   ├── PlinkoController.java # Plinko game endpoints
│   │   │   ├── MinesController.java  # Mines game endpoints
│   │   │   └── WalletController.java # Balance, Transactions
│   │   ├── dto/
│   │   │   ├── PlaceBetRequest.java
│   │   │   ├── HiloResponse.java
│   │   │   ├── PlinkoResponse.java
│   │   │   └── MinesResponse.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Wallet.java
│   │   │   ├── BetRecord.java
│   │   │   ├── HiloSession.java
│   │   │   └── MinesSession.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── WalletRepository.java
│   │   │   ├── BetRecordRepository.java
│   │   │   ├── HiloSessionRepository.java
│   │   │   └── MinesSessionRepository.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── JwtService.java
│   │   │   ├── WalletService.java
│   │   │   ├── HiloService.java
│   │   │   ├── PlinkoService.java
│   │   │   └── MinesService.java
│   │   └── util/
│   │       └── MinesMathUtil.java    # Combinatorial probability
│   ├── pom.xml
│   └── application.properties
│
├── web/                              # Next.js Frontend
│   ├── app/
│   │   ├── (navbar)/
│   │   │   ├── layout.tsx            # Navbar layout
│   │   │   ├── landing/page.tsx      # Landing page
│   │   │   ├── hilo/page.tsx         # Hi-Lo game
│   │   │   ├── plinko/page.tsx       # Plinko game
│   │   │   └── mines/page.tsx        # Mines game
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── api.ts
│   │   └── api/
│   │       ├── auth.ts
│   │       ├── hilo.ts
│   │       ├── plinko.ts
│   │       └── mines.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── hilo.ts
│   │   ├── plinko.ts
│   │   └── mines.ts
│   ├── components/
│   │   ├── navigation.tsx
│   │   └── ui/
│   │       └── button.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── tailwind.config.ts
│
├── mobile/                           # Android Kotlin App
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/
│   │   │   │   └── res/
│   │   │   └── androidTest/
│   │   └── build.gradle.kts
│   ├── gradle/
│   ├── build.gradle.kts
│   └── settings.gradle.kts
│
└── docs/
    ├── IT342_Phase3_BidWarsOnline_Sanchez.pdf
    ├── TASK_CHECKLIST.md
    └── games_documentation.md
```

## 📦 Prerequisites

- **Java 17** or higher
- **Node.js 18+** or higher
- **npm** or **yarn**
- **MySQL 8.0+**
- **Maven 3.8+**
- **Android Studio** (for mobile development)

## 🚀 Installation & Setup

### 1. Backend Setup

#### a. Database Configuration

Create a MySQL database:

```sql
CREATE DATABASE bidwars_online;
CREATE USER 'bidwars_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON bidwars_online.* TO 'bidwars_user'@'localhost';
FLUSH PRIVILEGES;
```

#### b. Update Backend Configuration

Edit `bidwarsonline/src/main/resources/application.properties`:

```properties
spring.application.name=bidwarsonline

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/bidwars_online
spring.datasource.username=bidwars_user
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Server Configuration
server.port=8080

# JWT Configuration
jwt.secret=your-256-bit-secret-key-here-change-in-production
jwt.expiration=86400000

# CORS
cors.allowed.origins=http://localhost:3000
```

#### c. Build Backend

```bash
cd bidwarsonline
mvn clean install
```

### 2. Frontend Setup

```bash
cd web
npm install
```

### 3. Mobile Setup (Optional)

```bash
cd mobile
./gradlew build
```

## ▶️ Running the Application

### Terminal 1: Start Backend

```bash
cd bidwarsonline
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Terminal 2: Start Frontend

```bash
cd web
npm run dev
```

The frontend will start on `http://localhost:3000`

### Terminal 3: Start Mobile (Optional)

Open Android Studio and run the project on an emulator or physical device.

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstname": "John",
  "lastname": "Doe"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "email": "user@example.com",
      "firstname": "John",
      "lastname": "Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
  },
  "timestamp": "2026-04-12T10:00:00Z"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Game Endpoints

#### Hi-Lo: Start Game
```http
POST /api/games/hilo/bet
Authorization: Bearer <token>
Content-Type: application/json

{
  "betAmount": 100.00,
  "config": {}
}

Response: 200 OK
{
  "sessionId": "abc123",
  "currentCard": 7,
  "currentMultiplier": 1.0,
  "isBust": false,
  "isCorrect": false
}
```

#### Hi-Lo: Make Prediction
```http
POST /api/games/hilo/bet
Authorization: Bearer <token>

{
  "betAmount": 100.00,
  "config": {
    "sessionId": "abc123",
    "prediction": "HIGHER"
  }
}
```

#### Hi-Lo: Cash Out
```http
POST /api/games/hilo/bet
Authorization: Bearer <token>

{
  "betAmount": 100.00,
  "config": {
    "sessionId": "abc123",
    "cashOut": true
  }
}

Response: 200 OK
{
  "sessionId": "abc123",
  "finalPayout": 250.00,
  "currentMultiplier": 2.5,
  "isBust": false
}
```

#### Plinko: Drop Ball
```http
POST /api/games/plinko/bet
Authorization: Bearer <token>

{
  "betAmount": 50.00,
  "config": {
    "risk": "HIGH"
  }
}

Response: 200 OK
{
  "bucket": 8,
  "multiplier": 5.6,
  "payout": 280.00,
  "risk": "HIGH"
}
```

#### Mines: Start Game
```http
POST /api/games/mines/bet
Authorization: Bearer <token>

{
  "betAmount": 100.00,
  "config": {
    "minesCount": 5
  }
}

Response: 200 OK
{
  "sessionId": "xyz789",
  "minesCount": 5,
  "clickedTiles": [],
  "currentMultiplier": 1.0,
  "isBust": false,
  "isWin": false
}
```

#### Mines: Click Tile
```http
POST /api/games/mines/bet
Authorization: Bearer <token>

{
  "betAmount": 100.00,
  "config": {
    "sessionId": "xyz789",
    "tileIndex": 12
  }
}

Response: 200 OK (Gem Revealed)
{
  "sessionId": "xyz789",
  "clickedTiles": [12],
  "currentMultiplier": 1.25,
  "isBust": false,
  "isWin": false
}
```

#### Mines: Cash Out
```http
POST /api/games/mines/bet
Authorization: Bearer <token>

{
  "betAmount": 100.00,
  "config": {
    "sessionId": "xyz789",
    "cashOut": true
  }
}

Response: 200 OK
{
  "sessionId": "xyz789",
  "finalPayout": 156.25,
  "gridState": [false, false, true, false, ...],
  "isWin": true
}
```

### Wallet Endpoints

#### Get Balance
```http
GET /api/wallet/balance
Authorization: Bearer <token>

Response: 200 OK
{
  "balance": 1000.00,
  "currency": "USD"
}
```

## ✨ Features

### 🔐 Authentication
- [x] User registration with email validation
- [x] Login with JWT token generation
- [x] Secure password hashing (BCrypt)
- [x] Token-based authentication
- [x] Default wallet creation (100,000 balance)

### 💰 Wallet System
- [x] Real-time balance updates via WebSocket
- [x] Atomic transaction handling (@Transactional)
- [x] ACID-compliant wallet operations
- [x] Automatic wallet creation on registration
- [x] Balance deduction on bet placement
- [x] Instant payout crediting

### 🎮 Game Features

#### Hi-Lo
- [x] Session-based persistence
- [x] Card generation (2-14, where 11=J, 12=Q, 13=K, 14=A)
- [x] Higher/Lower prediction
- [x] Progressive multiplier (1.0x → 1.1x → 1.2x...)
- [x] Cash out at any time
- [x] Auto-save on page leave (beforeunload)
- [x] Session recovery on page refresh

#### Plinko
- [x] Risk level selection (LOW, MEDIUM, HIGH)
- [x] 16-bucket multiplier distribution
- [x] Ball drop simulation
- [x] Instant settlement
- [x] Provably fair trajectory calculation
- [x] Multipliers from 0.2x to 16x

#### Mines
- [x] 5×5 grid (25 tiles)
- [x] Configurable mines (1-24)
- [x] Combinatorial probability calculations
- [x] Progressive multipliers with 3% house edge
- [x] Session persistence
- [x] Cash out system
- [x] Auto-win when all gems revealed
- [x] Auto-save on page leave
- [x] Server-authoritative grid state

### 🔄 Real-time Features
- [x] WebSocket connection (STOMP/SockJS)
- [x] Live wallet balance updates
- [x] Game result notifications
- [x] Automatic reconnection handling

### 🎨 UI/UX
- [x] Modern dark theme
- [x] Responsive design (mobile, tablet, desktop)
- [x] Consistent styling across all games
- [x] Loading states and error handling
- [x] Smooth animations
- [x] Toast notifications

## 🎲 Game Mechanics

### Hi-Lo Mathematics
- **Base Probability:** 50% on each prediction
- **Multiplier Growth:** Linear increment (+0.1x per win)
- **No House Edge:** Pure probability-based
- **Current Pot:** `betAmount × currentMultiplier`

### Plinko Mathematics
- **16 Buckets:** Indexed 0-15
- **Risk Levels:**
  - **LOW:** Frequent small wins (0.5x-5.6x)
  - **MEDIUM:** Balanced distribution (0.3x-13x)
  - **HIGH:** High variance (0.2x-16x)
- **House Edge:** Built into multiplier distribution

### Mines Mathematics
- **Grid:** 5×5 = 25 tiles
- **Probability Formula:** 
  ```
  P(gem) = (tiles_remaining - mines) / tiles_remaining
  multiplier = (1 / probability) × 0.97
  ```
- **House Edge:** 3% (factor of 0.97)
- **Combinatorial Calculation:**
  ```java
  nCr = n! / (r! × (n-r)!)
  multiplier = C(25-clicked, gems-revealed) / C(25, totalGems) × 0.97
  ```

## 🧩 Frontend Components

### Pages

**Landing ([app/(navbar)/landing/page.tsx](web/app/(navbar)/landing/page.tsx))**
- Game cards display
- Featured games
- Navigation to game pages

**Hi-Lo ([app/(navbar)/hilo/page.tsx](web/app/(navbar)/hilo/page.tsx))**
- Card display
- Prediction buttons (Higher/Lower)
- Cash out button
- Current multiplier display
- WebSocket integration

**Plinko ([app/(navbar)/plinko/page.tsx](web/app/(navbar)/plinko/page.tsx))**
- Bet amount input
- Risk level selector
- Drop ball button
- Ball animation area
- Result multiplier display

**Mines ([app/(navbar)/mines/page.tsx](web/app/(navbar)/mines/page.tsx))**
- 5×5 grid of tiles
- Mine count slider
- Current multiplier display
- Gems revealed counter
- Cash out button

**Login ([app/login/page.tsx](web/app/login/page.tsx))**
- Email/password form
- Error handling
- Registration link

**Register ([app/register/page.tsx](web/app/register/page.tsx))**
- Email, firstname, lastname, password fields
- Form validation
- Login link

### API Modules

**Auth API ([lib/api/auth.ts](web/lib/api/auth.ts))**
- `login()` - User authentication
- `register()` - User registration
- `logout()` - Session cleanup

**Hi-Lo API ([lib/api/hilo.ts](web/lib/api/hilo.ts))**
- `placeHiloBet()` - Start/continue/cashout game

**Plinko API ([lib/api/plinko.ts](web/lib/api/plinko.ts))**
- `placePlinkoBet()` - Drop ball with risk level

**Mines API ([lib/api/mines.ts](web/lib/api/mines.ts))**
- `placeMinesBet()` - Start/click/cashout game

## ⚙️ Backend Architecture

### Services

**AuthService**
- User registration with wallet creation
- Login with JWT generation
- Password validation with BCrypt

**WalletService**
- Balance retrieval
- Atomic debit/credit operations
- Transaction history

**HiloService**
- Session creation and management
- Card generation (SecureRandom)
- Win/loss calculation
- Cash out processing
- Auto-cashout on session end

**PlinkoService**
- Ball trajectory simulation
- Bucket selection
- Multiplier lookup by risk level
- Instant payout calculation

**MinesService**
- Grid generation with Collections.shuffle
- Grid state as JSON (kept secret from client)
- Tile click validation
- Combinatorial multiplier calculation (MinesMathUtil)
- Progressive pot updates
- Auto-win detection
- Cash out processing

### Entities

**User**
- Basic authentication fields
- One-to-One with Wallet
- One-to-Many with BetRecord

**Wallet**
- Balance (BigDecimal for precision)
- Currency (default: USD)
- Last updated timestamp

**BetRecord**
- Game type (HILO, PLINKO, MINES)
- Bet amount, multiplier, payout
- Game data (JSON)
- Status (WIN, LOSS, CASHED_OUT)

**HiloSession**
- Current card, multiplier, pot
- Session status (ACTIVE, BUSTED, CASHED_OUT)
- User reference

**MinesSession**
- Grid state (TEXT column, JSON serialized)
- Clicked tiles (ElementCollection)
- Mines count, current multiplier, pot
- Session status

### Security

**JWT Authentication**
- Token generation with configurable expiration
- Token validation on protected endpoints
- User extraction from token

**Spring Security**
- CORS configuration for frontend
- Public endpoints: /auth/**, /ws/**
- Protected endpoints: /api/games/**, /wallet/**

**WebSocket Security**
- User-specific message destinations
- Session-based authentication
- Automatic cleanup on disconnect

## 🔒 Security Features

- **JWT-based authentication** with refresh tokens
- **BCrypt password hashing** with salt
- **CORS** restricted to frontend origin
- **Server-authoritative game logic** (no client-side game state)
- **Grid state encryption** (Mines grid never sent to client until game ends)
- **Session validation** (users can only access own sessions)
- **Atomic wallet transactions** prevent race conditions
- **Input validation** on all endpoints
- **Beforeunload handlers** prevent session orphaning

## 🌐 WebSocket Integration

### Configuration
- **Endpoint:** `/ws`
- **Protocol:** STOMP over SockJS
- **Topics:**
  - `/user/topic/wallet` - Balance updates
  - `/user/topic/game-results` - Game outcomes

### Frontend Usage
```typescript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const stompClient = new Client({
  webSocketFactory: () => socket,
  onConnect: () => {
    stompClient.subscribe('/user/topic/wallet', (message) => {
      const wallet = JSON.parse(message.body);
      setBalance(wallet.balance);
    });
  }
});
stompClient.activate();
```

### Backend Messaging
```java
@Autowired
private SimpMessagingTemplate messagingTemplate;

// Send wallet update
messagingTemplate.convertAndSendToUser(
  username,
  "/topic/wallet",
  walletResponse
);
```

## 🔧 Environment Variables

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bidwars_online
spring.datasource.username=root
spring.datasource.password=your_password

jwt.secret=your-secret-key-here
jwt.expiration=86400000

cors.allowed.origins=http://localhost:3000
```

### Frontend (Optional)
Create `.env.local` in `web/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure MySQL is running: `sudo systemctl status mysql`
- Check database credentials in `application.properties`
- Clear Maven cache: `mvn clean`
- Check port 8080 is not in use: `netstat -ano | findstr :8080`

### Frontend API calls failing
- Verify backend is running on port 8080
- Check CORS configuration allows `http://localhost:3000`
- Inspect browser console for error messages
- Ensure JWT token is being sent in requests

### WebSocket connection issues
- Verify WebSocket endpoint is `/ws`
- Check STOMP client configuration
- Ensure user is authenticated before subscribing
- Check firewall/proxy settings

### Database connection errors
- Verify MySQL service is running
- Test connection: `mysql -u root -p`
- Check user permissions: `SHOW GRANTS FOR 'bidwars_user'@'localhost';`
- Ensure database exists: `SHOW DATABASES;`

### Game session errors
- Clear browser localStorage
- Check session belongs to authenticated user
- Verify wallet has sufficient balance
- Check backend logs for validation errors

### Mines grid calculation issues
- Verify mines count is between 1-24
- Check MinesMathUtil for calculation errors
- Ensure gridState JSON is valid
- Verify clicked tiles don't exceed grid size

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [WebSocket STOMP Protocol](https://stomp.github.io/)
- [JWT Guide](https://jwt.io/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Kotlin Documentation](https://kotlinlang.org/docs/home.html)
- [Jetpack Compose](https://developer.android.com/jetpack/compose)

## 📊 Project Progress

See [TASK_CHECKLIST.md](docs/TASK_CHECKLIST.md) for detailed task tracking.

**Current Status:** ~45% Complete
- ✅ Authentication & User Management
- ✅ Wallet System
- ✅ All 3 Game Engines (Hi-Lo, Plinko, Mines)
- ✅ WebSocket Real-time Updates
- ✅ Frontend Game UIs
- 🔄 PayMongo Integration (Planned)
- 🔄 Admin Dashboard (Planned)
- ⬜ Mobile App (Not Started)

## 👥 Team

- **Course:** IT342 - System Integration and Architecture
- **Group:** G1
- **Developer:** Sanchez, Franz Raven
- **Version:** 0.2
- **Status:** In Development

---

*Last Updated: April 12, 2026*
