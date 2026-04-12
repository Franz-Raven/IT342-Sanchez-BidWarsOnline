# BidWars Online - Task Checklist

**Project Status:** In Development  
**Last Updated:** April 12, 2026

---

## 📋 MUST HAVE Features (MoSCoW Priority)

### ✅ Core Authentication & User Management
- [x] User Registration API (`/auth/register`)
- [x] User Login API (`/auth/login`)
- [x] JWT Token Authentication
- [x] Password hashing with bcrypt
- [x] User entity with role-based access
- [x] Default wallet creation (100,000 starting balance)
- [ ] User Profile API (`/users/profile`)
- [ ] Cloudinary profile picture upload
- [ ] Email validation and uniqueness checks
- [ ] Forgot Password flow

### ✅ Wallet System
- [x] Wallet entity (one-to-one with User)
- [x] Balance tracking (BigDecimal for precision)
- [x] Atomic transactions (@Transactional)
- [x] Real-time balance updates via WebSocket
- [ ] Transaction history API
- [ ] Get wallet balance endpoint
- [ ] Insufficient balance validation

### ✅ Game Logic - Hi-Lo
- [x] HiloSession entity with session persistence
- [x] HiloService with game logic
- [x] HiloController with REST endpoints
- [x] Card generation (2-14 values)
- [x] Higher/Lower prediction logic
- [x] Progressive multiplier system
- [x] Cash out functionality
- [x] Session status tracking (ACTIVE/BUSTED/CASHED_OUT)
- [x] BetRecord creation on completion
- [x] Frontend UI component
- [x] WebSocket integration for results
- [x] Beforeunload handler for auto-cashout
- [ ] Provably Fair hash generation

### ✅ Game Logic - Plinko
- [x] PlinkoService with game logic
- [x] PlinkoController with REST endpoints
- [x] Risk level system (LOW, MEDIUM, HIGH)
- [x] 16-bucket multiplier distribution
- [x] Ball drop simulation
- [x] Instant payout calculation
- [x] BetRecord creation
- [x] Frontend UI component with animations
- [x] WebSocket integration for results
- [ ] Matter.js physics integration (optional enhancement)
- [ ] Provably Fair hash generation

### ✅ Game Logic - Mines
- [x] MinesSession entity with grid persistence
- [x] MinesService with game logic
- [x] MinesController with REST endpoints
- [x] MinesMathUtil for probability calculations
- [x] 5×5 grid generation (25 tiles)
- [x] Configurable mines count (1-24)
- [x] Combinatorial probability multipliers
- [x] 3% house edge implementation
- [x] Progressive multiplier updates
- [x] Tile click validation
- [x] Auto-win when all gems revealed
- [x] Cash out functionality
- [x] Session status tracking
- [x] BetRecord creation on completion
- [x] Frontend 5×5 grid UI
- [x] Mine count slider
- [x] WebSocket integration for results
- [x] Beforeunload handler for auto-cashout
- [ ] Provably Fair seed generation

### ✅ Real-time Communication
- [x] WebSocket configuration (STOMP/SockJS)
- [x] Wallet balance topic (`/user/topic/wallet`)
- [x] Game results topic (`/user/topic/game-results`)
- [x] Frontend WebSocket client integration
- [ ] Message queue for high concurrency
- [ ] Connection error handling

### 🔄 Payment Integration (IN PROGRESS)
- [ ] PayMongo API integration
- [ ] QRPh payment method setup
- [ ] Deposit flow (Step 1: Amount selection)
- [ ] Deposit flow (Step 2: Payment method selection)
- [ ] Deposit flow (Step 3: QR code generation)
- [ ] PayMongo webhook handler
- [ ] Transaction entity creation
- [ ] Deposit confirmation UI
- [ ] Test mode simulation

### 🔄 Database Design (IN PROGRESS)
- [x] User table
- [x] Wallet table
- [x] BetRecord table
- [x] HiloSession table
- [x] MinesSession table
- [ ] Transaction table
- [ ] Announcement table
- [ ] Bonus table
- [ ] Database relationships (Foreign Keys)
- [ ] Indexes for performance optimization

### 🔄 Frontend - Web Application (IN PROGRESS)
- [x] Next.js 14 setup with TypeScript
- [x] Tailwind CSS configuration
- [x] Login page UI
- [x] Register page UI
- [x] Landing page layout
- [x] Hi-Lo game page
- [x] Plinko game page
- [x] Mines game page
- [x] Consistent styling (max-w-[100rem], gap-8)
- [x] Fetch API integration
- [x] JWT token storage (localStorage)
- [ ] Homepage/Dashboard with game cards
- [ ] Navigation component
- [ ] Sidebar component
- [ ] Transaction history page
- [ ] Deposit flow modals
- [ ] User profile page
- [ ] Announcement banner slider
- [ ] Mobile-responsive design
- [ ] Error handling and toast notifications

---

## 🎯 SHOULD HAVE Features

### ⬜ Transaction History
- [ ] Transaction entity with type enum
- [ ] Transaction repository
- [ ] Get transaction history API
- [ ] Frontend transaction history page
- [ ] Filtering by type (BET/DEPOSIT/WIN)
- [ ] Pagination support
- [ ] Date range filtering

### ⬜ Responsible Gaming
- [ ] Betting limits per game
- [ ] Daily loss limits
- [ ] Session time tracking
- [ ] Self-exclusion feature
- [ ] Responsible gaming settings page

### ⬜ Admin Dashboard
- [ ] Admin authentication and authorization
- [ ] Total volume statistics
- [ ] Total payouts tracking
- [ ] House edge monitoring
- [ ] Game breakdown analytics
- [ ] User management view
- [ ] Ban/Unban user functionality
- [ ] Payout tracker (WIN_CREDIT transactions)
- [ ] Failed PayMongo webhook logs
- [ ] Maintenance mode toggle
- [ ] Admin dashboard UI

### ⬜ Announcements System
- [ ] Announcement entity
- [ ] Announcement CRUD API
- [ ] Admin announcement editor
- [ ] Image upload for announcements
- [ ] Active/Inactive toggle
- [ ] Frontend banner slider
- [ ] Auto-rotation of announcements

---

## 💡 COULD HAVE Features

### ⬜ Daily Login Rewards
- [ ] Bonus entity
- [ ] Daily login tracking
- [ ] Bonus credit logic
- [ ] Claimed status tracking
- [ ] Expiration date handling
- [ ] Frontend bonus notification

### ⬜ Leaderboards
- [ ] Leaderboard calculation logic
- [ ] Top winners by game
- [ ] Top winners by volume
- [ ] Leaderboard API
- [ ] Frontend leaderboard page
- [ ] Real-time leaderboard updates

### ⬜ Provably Fair System
- [ ] Server-side seed generation
- [ ] Client-side seed input
- [ ] Hash computation (SHA-256)
- [ ] Seed reveal on game completion
- [ ] Verification tool UI
- [ ] Game result hash storage

---

## 🚫 WON'T HAVE (Out of Scope)

- [ ] Real-money payouts to bank accounts
- [ ] Multi-currency support (PHP only)
- [ ] Global chat feature
- [ ] Social features (friends, sharing)
- [ ] Multiple language support
- [ ] Email notifications

---

## 📱 Mobile Application (Android)

### ⬜ Foundation
- [ ] Kotlin/Jetpack Compose project setup
- [ ] Gradle configuration
- [ ] Retrofit service layer
- [ ] Room database for local storage
- [ ] JWT token management
- [ ] API base URL configuration

### ⬜ Authentication
- [ ] Login screen UI
- [ ] Register screen UI
- [ ] Form validation
- [ ] API integration
- [ ] Token persistence

### ⬜ Game Screens
- [ ] Homepage/Lobby UI
- [ ] Hi-Lo game screen
- [ ] Plinko game screen
- [ ] Mines game screen
- [ ] Touch-optimized controls
- [ ] Game animations (Lottie)

### ⬜ User Features
- [ ] Wallet display
- [ ] Deposit flow screens
- [ ] Transaction history screen
- [ ] Profile screen
- [ ] Settings screen

### ⬜ Deployment
- [ ] APK generation
- [ ] ProGuard configuration
- [ ] Testing on physical devices
- [ ] Play Store preparation (optional)

---

## 🚀 Deployment & DevOps

### ⬜ Backend Deployment
- [ ] Railway configuration
- [ ] Environment variables setup
- [ ] PostgreSQL database provisioning
- [ ] CORS configuration for production
- [ ] SSL/HTTPS setup
- [ ] Logging and monitoring
- [ ] Health check endpoints

### ⬜ Frontend Deployment
- [ ] Vercel configuration
- [ ] Environment variables setup
- [ ] Build optimization
- [ ] CDN configuration
- [ ] Domain setup
- [ ] Analytics integration (optional)

### ⬜ Testing
- [ ] Backend unit tests (JUnit)
- [ ] Service layer tests
- [ ] Controller integration tests
- [ ] Frontend component tests
- [ ] E2E testing (Playwright/Cypress)
- [ ] Load testing (concurrent users)
- [ ] Security testing (SQL injection, XSS)

---

## 🐛 Bug Fixes & Improvements

### ✅ Completed Fixes
- [x] Fixed MinesController to use PlaceBetRequest instead of BetRequest
- [x] Fixed BetRecord creation pattern (constructor instead of setters)
- [x] Fixed mines.ts API client (fetch pattern instead of non-existent api object)
- [x] Fixed HiloResponse getter methods (isBust, isCorrect)
- [x] Updated Mines UI styling to match other games
- [x] Changed default wallet balance from 0 to 100,000
- [x] Added beforeunload handler for Hi-Lo and Mines auto-cashout

### ⬜ Known Issues
- [ ] (Add any known bugs here)

### ⬜ Planned Improvements
- [ ] Add input debouncing for bet amount fields
- [ ] Optimize grid state JSON serialization
- [ ] Add loading states for all API calls
- [ ] Implement retry logic for failed WebSocket connections
- [ ] Add animation transitions between game states
- [ ] Improve error messages for better UX

---

## 📊 Progress Summary

**Overall Completion:** ~45%

- **Authentication & Users:** 70%
- **Wallet System:** 60%
- **Game Logic (Hi-Lo):** 95%
- **Game Logic (Plinko):** 95%
- **Game Logic (Mines):** 95%
- **Payment Integration:** 0%
- **Admin Dashboard:** 0%
- **Mobile App:** 0%
- **Frontend (Web):** 50%
- **Deployment:** 0%

---

## 🎯 Next Priorities

1. **Implement Transaction History** - Users need to see their betting history
2. **PayMongo QRPh Integration** - Enable real deposits (test mode)
3. **Admin Dashboard** - Monitor platform performance and user activity
4. **User Profile & Settings** - Complete user management features
5. **Announcements System** - Communicate with users about updates
6. **Production Deployment** - Get backend and frontend live
7. **Mobile App Development** - Start Android app implementation

---

## 📝 Notes

- All game mechanics are server-authoritative (client cannot cheat)
- Grid state in Mines is never sent to client until game ends
- Session-based games (Hi-Lo, Mines) persist across page refreshes
- WebSocket ensures real-time wallet updates without polling
- 3% house edge built into Mines multipliers
- Auto-cashout prevents orphaned sessions when users leave
- Default starting balance is 100,000 for testing purposes

---

**Legend:**
- ✅ Section has significant progress
- 🔄 Section is in progress
- ⬜ Section not started
- [x] Task completed
- [ ] Task pending
