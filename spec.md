# 3D Asteroids Arcade Game

## Overview
A modern 3D arcade game inspired by the classic Asteroids, featuring enhanced graphics and gameplay mechanics. Players navigate a spaceship through asteroid fields, earning points by destroying asteroids and surviving as long as possible.

## Paywall Integration
- **IC Paywall**: Integrated paywall system for production deployment at `https://3d-asteroids-arcade-game-cho.caffeine.xyz`
- **Frontend Paywall Script**: Paywall script loaded in HTML head with `defer` attribute after critical content with backend ID `4d2uq-jaaaa-aaaab-adm4q-cai` and paywall ID `pw-10`
- **Access Control**: Game content protected behind paywall check using `window.paywallHandshake` with proper localStorage session verification and 30-second recheck intervals
- **Non-blocking Payment**: Payment flow does not trigger page reload and leverages 60-second localStorage grace period for revalidation
- **Session Persistence**: Paywall handshake correctly verifies existing payment sessions from localStorage to prevent false "Payment Required" messages
- **State Synchronization**: Maintains proper `hasAccess` state synchronization with backend without automatic re-renders or page reloads after payment confirmation
- **Script Initialization**: Paywall script executes only after main app initialization and does not trigger new sessions when already unlocked
- **Production URL Restriction**: Paywall functionality only active when accessed via production URL
- **Authentication Sequencing**: Internet Identity authentication must complete before invoking `window.paywallHandshake` to prevent race conditions
- **Proper Handshake Invocation**: `window.paywallHandshake` is properly awaited and invoked after authentication inside `App.tsx` to ensure paid users don't see "Payment Required" message
- **LocalStorage Caching**: Successful access checks are cached in `localStorage` with proper respect for the 60-second grace period provided by the paywall script
- **Fallback Handling**: Robust fallback handling in `window.paywallHandshake` callbacks to update UI state immediately when a valid access token is present
- **Domain Origin Verification**: Live domain origin matching (`https://3d-asteroids-arcade-game-cho.caffeine.xyz`) verified to prevent script auto-disabling with correct metadata configuration

## Social Media Integration
- **Open Graph Meta Tags**: HTML head includes Open Graph meta tags for rich link previews on social platforms
  - og:title: "Asteroids 3D Arcade Game"
  - og:description: "Blast asteroids, collect power-ups, and climb the galactic leaderboard in this modern 3D arcade classic!"
  - og:image: Uses absolute HTTPS URL `https://3jorm-yqaaa-aaaam-aaa6a-cai.icp0.io/link-preview.png` for proper social media accessibility
  - og:image:type: "image/png"
  - og:image:width: "1200"
  - og:image:height: "630"
  - og:type: "website"
  - og:url: Points to the deployed app's main link
- **Twitter Card Meta Tags**: HTML head includes Twitter Card meta tags for Twitter/X link previews
  - twitter:card: "summary_large_image"
  - twitter:title: "Asteroids 3D Arcade Game"
  - twitter:description: "Blast asteroids, collect power-ups, and climb the galactic leaderboard in this modern 3D arcade classic!"
  - twitter:image: Uses absolute HTTPS URL `https://3jorm-yqaaa-aaaam-aaa6a-cai.icp0.io/link-preview.png`
- **Preview Thumbnail**: Uses an optimized preview image with 1200x630 dimensions (1.91:1 aspect ratio) accessible at the specified absolute URL for optimal Open Graph compatibility across Facebook, Twitter, and LinkedIn
- **Meta Tag Validation**: All meta tags are properly formatted and validated according to Open Graph and Twitter Card validator standards with correct absolute URLs
- **Cross-Platform Compatibility**: Meta tags ensure proper link previews across Facebook, Twitter/X, Discord, and other social platforms

## Authentication & User Management
- Requires Internet Identity authentication before first-time play
- Players create a unique username upon initial authentication
- Backend stores player profiles including username, statistics, and high scores

## Main Menu
- Two primary options:
  - View Leaderboard
  - Play Game
- Navigation between menu sections
- **Background Rendering**: Main menu features a space background with proper texture loading and fallback system
- **Asset Loading**: Background texture (`generated/space-background.dim_1920x1080.png`) loads with error handling
- **Fallback System**: If texture loading fails, displays animated procedural space background with realistic starfield effects
- **Starfield Animation**: Very slow, subtle starfield with minimal twinkling effects, gentle particle movements, and subtle parallax drift for a calm, polished space environment
- **Visual Quality**: Significantly reduced sparkle intensity and minimized animation speed for a serene space environment appearance
- **Smooth Transitions**: Menu transitions to game or leaderboard only after background rendering completes
- **Cross-platform Optimization**: Background displays correctly on both desktop and mobile devices with maintained performance

## Player Profile System
- Unique username creation on first login
- Profile data storage including:
  - Username
  - Game statistics
  - Personal high scores
  - Survival time records

## Leaderboard
- Displays top 10 high scores with player name, score, and date achieved in descending order (highest scores first)
- Additional statistics:
  - Player with most wins
  - Player with longest survival time
- **Reliable Navigation**: "Back to Menu" button must be fully responsive and reliably return users to the main menu when clicked or tapped on all devices
- **Starfield Background**: Same calm, subtle starfield animation as main menu with minimal twinkling and slow motion
- **High Score Persistence**: Leaderboard correctly displays all submitted high scores with proper data persistence and retrieval
- **Real-time Updates**: Leaderboard refreshes and displays new high scores immediately after game completion and score submission

## 3D Game Mechanics
- **3D game** built with React Three Fiber
- Player ship starts centered with 3 lives
- **Enhanced spaceship design**: Enlarged spaceship model for better visibility and prominence in the scene
- **Updated spaceship geometry**: Spaceship features a cone shape with the flat bottom diameter increased by 50% while maintaining current proportions and metallic material
- **Metallic spaceship materials**: Modern metallic appearance with reflective highlights and subtle light interactions under scene lighting for a polished, contemporary look
- **Directional clarity**: Ship features clearly distinguishable front and back elements (bright cockpit/front highlights, darker exhaust/thruster effects at rear) consistent with the updated cone shape
- Modern 3D spaceship design with realistic asteroid models
- Explosion effects for collisions and destructions
- **Expanded game world**: Increased spatial bounds of the game world providing significantly more room for player maneuvering and exploration
- **Adjusted camera perspective**: Camera position and field of view adjusted to zoom out slightly, providing a wider view of the expanded game zone while maintaining proper perspective and scale
- **Object alignment**: All game objects (asteroids, bonuses, boundaries, stars) remain properly aligned and smoothly visible within the expanded scene
- **Performance optimization**: Balanced object visibility and draw distance for the larger world to maintain smooth gameplay performance
- **Infinite space environment**: Game environment appears as infinite open space without visible boundaries or walls, with seamless background rendering and lighting that creates the illusion of boundless space
- **Black space background**: Game background is pure black with subtle white stars, removing any purple tint or color overlay for a clean, classic space appearance
- **Realistic starfield background**: Very slow, subtle white starfield with minimal twinkling effects and gentle parallax drift that complements asteroids and ship lighting
- **Progressive difficulty curve**: 
  - Game starts with asteroid spawn rate of 1 asteroid every 2 to 5 seconds
  - Every 30 seconds of gameplay, asteroid spawn rate increases by approximately 0.4 asteroids per 2-5 second window
  - Asteroid speed scales smoothly alongside spawn rate increases for balanced gameplay
  - Smooth scaling maintains game balance and performance optimization
- **Performance optimization**: Visual enhancements maintain smooth gameplay performance across desktop and mobile devices
- Cross-platform controls optimized for both desktop and mobile devices

## Game Loading & Initialization
- **Asynchronous Asset Loading**: All game assets (models, textures, sounds) must be preloaded before game initialization
- **Loading State Management**: Display responsive loading animation or spinner with progress indication during asset loading and gameplay logic initialization
- **Error Handling**: Robust error handling for missing or failed asset imports with console logging and fallback to default placeholders
- **Authentication Dependency**: Game initialization only proceeds after Internet Identity authentication and profile verification succeed
- **Race Condition Prevention**: Proper state management to prevent conflicts between authentication and gameplay initialization
- **Immediate Rendering**: Game scene renders immediately after loading completes without hanging on loading screen

## Controls
### Desktop Controls
- **Left Arrow**: Rotate ship counterclockwise
- **Right Arrow**: Rotate ship clockwise
- **Up Arrow**: Accelerate ship forward in the direction of its nose
- **Down Arrow**: Slow down and reverse the ship
- **Space Bar (hold)**: Continuous shooting
- **Space Bar (double-tap)**: Drop bomb with proper double-tap detection and timing

### Mobile Controls
- **Tap left side of screen**: Rotate ship counterclockwise
- **Tap right side of screen**: Rotate ship clockwise
- **Up Arrow**: Accelerate ship forward in the direction of its nose
- **Down Arrow**: Slow down and reverse the ship
- **Space Bar (hold)**: Continuous shooting
- **Double-tap anywhere on screen**: Drop bomb with responsive double-touch detection

### Physics & Response
- Maintains existing momentum and acceleration physics
- Optimized rotation speed and response for smoother, more intuitive control feel
- Smooth control transitions between keyboard and touch inputs

## Bomb Mechanics
- **Bomb Activation**: Double-tap space bar on desktop or double-tap screen on mobile to deploy bomb
- **Strict Cooldown Enforcement**: Bombs can ONLY be detonated when the cooldown timer is completely finished and fully charged - all activation attempts during cooldown are completely ignored and have no effect
- **Explosion Effect**: Large explosion effect that destroys all asteroids within a significant radius around the bomb detonation point
- **Point System**: Player receives appropriate points for all asteroids destroyed by bomb explosion
- **Cooldown System**: Bombs have a cooldown period to prevent spamming with absolute enforcement preventing any premature detonation
- **HUD Indicator**: Visual indicator accurately shows real-time bomb cooldown status (available/cooling down) with precise cooldown timer reflection
- **Bomb Collection**: Collecting bomb bonus items increases bomb count or re-enables bomb use
- **Input Responsiveness**: Reliable double-tap detection for both desktop keyboard and mobile touch inputs with mandatory cooldown validation that blocks all premature attempts

## Gameplay Features
- **Bonus Items**:
  - Faster shooting rate
  - Larger bombs
  - Extra life
  - Ship repairs
- **Point System**:
  - Points for destroying asteroids (scaled by damage dealt)
  - Points for survival time
  - Bonus points for damage-free streaks
  - Points for asteroids destroyed by bomb explosions

## Game End & Scoring
- Game ends when all 3 lives are lost
- Final score comparison against leaderboard
- Automatic leaderboard insertion if score qualifies for top 10
- Post-game options to start new game or view leaderboard
- **Score Submission**: Game results are reliably submitted to backend with proper error handling and confirmation
- **High Score Updates**: Player's personal high score is correctly updated in their profile when a new high score is achieved

## Score Submission System
- **Fixed AJAX Calls**: Frontend API hook (`useSubmitGameResults`) uses correct HTTP method and payload encoding compatible with Motoko backend
- **Method Type Correction**: Uses proper `update` method type for score submission instead of `query` to ensure data persistence
- **Minimal Payload Encoding**: Optimized payload structure with minimal data encoding to prevent serialization errors
- **Error Handling & Retry**: Frontend implements proper error handling with single retry attempt for transient network or backend serialization errors
- **Network Error Recovery**: Handles `net::ERR_FAILED` errors gracefully with user feedback and retry mechanism
- **Submission Confirmation**: Provides clear feedback to users on successful score submission with immediate leaderboard updates

## Backend Data Storage
- Player profiles (username, authentication data)
- High scores and leaderboard data
- Player statistics (wins, survival times, total games played)
- Game completion records with timestamps
- **Profile High Scores**: Each player profile stores their personal high score with proper persistence
- **Leaderboard Entries**: Leaderboard array maintains all qualifying high score entries with correct sorting

## Backend Operations
- User authentication and profile creation
- Score submission and leaderboard updates with proper descending order sorting
- Statistics calculation and retrieval
- Leaderboard data management and ranking
- **CORS Configuration**: Backend configured with proper CORS headers including `Access-Control-Allow-Origin: https://3d-asteroids-arcade-game-cho.caffeine.xyz`, `Access-Control-Allow-Methods: GET, POST, OPTIONS`, and `Access-Control-Allow-Headers: Content-Type, Authorization` for all responses to support paywall functionality
- **Paywall Enforcement**: Backend validates paywall access for sensitive operations including profile registration and game result submission
- **Optimized submitGameResults Function**: 
  - Uses lightweight in-place operations for leaderboard updates to prevent memory exhaustion
  - Implements efficient conditional insertion without unnecessary array concatenation or re-sorting
  - Performs minimal data processing with optimized memory usage patterns
  - Handles score validation and persistence with resource-efficient algorithms
  - Prevents ERR_INSUFFICIENT_RESOURCES errors through streamlined data operations
  - Uses direct map updates and targeted array modifications for better performance
- **Data Consistency**: Ensures profiles map and leaderboard array remain synchronized when high scores are updated
- **Score Validation**: Validates submitted scores before updating backend data structures with proper error responses
- **Leaderboard Maintenance**: Maintains top 10 leaderboard entries with efficient sorting and duplicate handling using memory-optimized algorithms
- **Immediate Visibility**: Successful score submissions are immediately visible in `getTopScores` query results without delays

## Language
- Application content language: English
