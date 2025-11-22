# Workout Tracker App: Architecture & Plan

This document outlines the complete architectural plan for the Flutter-based Workout Tracker application. It follows a Clean Architecture approach to ensure modularity, scalability, and maintainability.

## 1. App Goals & Overview

The primary goal of this app is to provide a comprehensive and intuitive platform for users to create, track, and analyze their workouts. It aims to motivate users by incorporating social features like leaderboards and streaks, while also providing practical tools like preset plans and embedded instructional videos.

- **Target Audience:** Gym enthusiasts, home-workout practitioners, and individuals seeking a structured approach to fitness.
- **Core Value:** To be an all-in-one workout companion that is both powerful for advanced users and simple for beginners.

---

## 2. High-Level Architecture: Flutter Clean Architecture

We will use a **feature-first, layered architecture** based on the principles of Clean Architecture. This separates the application into three distinct layers, ensuring that business logic is independent of UI and data sources.

**Core Principles:**
- **Separation of Concerns:** Each layer has a specific responsibility.
- **Dependency Rule:** Dependencies flow inwards. The UI (Presentation) depends on the business logic (Domain), and the data implementation (Data) also depends on the business logic (Domain). The Domain layer is completely independent.

**Layers:**
1.  **Presentation (UI Layer):** Responsible for rendering the UI and handling user input. It contains widgets, pages, and state management logic (Blocs). It knows nothing about the origin of the data (e.g., API, local DB).
2.  **Domain (Business Logic Layer):** The core of the application. It contains the business rules, entities (plain Dart objects), and repository contracts (interfaces). It has no dependencies on Flutter or any specific packages.
3.  **Data (Data Access Layer):** Implements the repository contracts defined in the Domain layer. It is responsible for fetching data from various sources (Firebase, local cache, external APIs) and converting it into domain entities.

```
+------------------+      +------------------+      +----------------+
|   Presentation   |----->|      Domain      |<-----|      Data      |
| (Flutter, Bloc)  |      |  (Pure Dart)     |      | (Firebase, API)|
+------------------+      +------------------+      +----------------+
      (UI Logic)           (Business Logic)        (Data Sources)
```

---

## 3. Detailed Folder Structure

The project will be organized by features to promote modularity. A `core` directory will contain shared logic, services, and widgets.

```
lib/
├── core/
│   ├── config/
│   │   ├── app_theme.dart       # ThemeData for light/dark modes
│   │   └── router.dart          # GoRouter configuration
│   ├── di/
│   │   └── service_locator.dart   # Dependency injection setup (GetIt)
│   ├── error/
│   │   ├── exceptions.dart      # Custom exception types
│   │   └── failures.dart        # Failure classes for use cases
│   ├── services/
│   │   ├── music_service.dart   # Interface for music integration
│   │   ├── notification_service.dart # Local notifications
│   │   └── cache_service.dart   # Offline data caching
│   ├── usecases/
│   │   └── usecase.dart         # Base use case class
│   └── widgets/
│       ├── custom_button.dart   # Reusable buttons
│       ├── loading_indicator.dart # Consistent loading widget
│       └── video_player.dart    # Inline video player
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/       # Firebase auth logic
│   │   │   ├── models/          # User model for Firebase
│   │   │   └── repositories/    # Auth repository implementation
│   │   ├── domain/
│   │   │   ├── entities/        # User entity
│   │   │   ├── repositories/    # Auth repository interface
│   │   │   └── usecases/        # e.g., SignIn, SignUp, GetCurrentUser
│   │   └── presentation/
│   │       ├── bloc/            # AuthBloc for state management
│   │       ├── pages/           # Login, Register, Splash screens
│   │       └── widgets/         # Email/password fields
│   │
│   ├── workout/
│   │   ├── data/
│   │   │   ├── datasources/       # Firestore/Storage logic for workouts
│   │   │   ├── models/          # WorkoutPlanModel, ExerciseModel
│   │   │   └── repositories/    # Implementation
│   │   ├── domain/
│   │   │   ├── entities/        # WorkoutPlan, Exercise, WorkoutSet
│   │   │   ├── repositories/    # Interfaces
│   │   │   └── usecases/        # e.g., GetWorkoutPlan, StartSession
│   │   └── presentation/
│   │       ├── bloc/            # WorkoutBloc, SessionBloc
│   │       ├── pages/           # PlanListScreen, SessionScreen
│   │       └── widgets/         # ExerciseCard, SetTrackerButton
│   │
│   ├── profile/
│   │   # (Similar structure for user profile, stats, streaks)
│   │
│   └── leaderboard/
│       # (Similar structure for displaying leaderboards)
│
└── main.dart                     # App entry point
```

---

## 4. UI/UX Structure

**Screens:**
- **Splash Screen:** Checks auth state and navigates accordingly.
- **Onboarding/Login/Register:** Standard authentication flow.
- **Home Screen:** Dashboard showing current streak, daily summary, and quick access to start a workout.
- **Workout Plans Screen:** Lists all available preset and custom workout plans.
- **Workout Detail Screen:** Shows the exercises, sets, and reps for a selected plan.
- **Workout Session Screen:** The active workout screen with the set tracker, embedded video, and music controls.
- **Profile Screen:** Displays user stats, workout history, and settings (e.g., theme toggle).
- **Leaderboard Screen:** Tabs for global and friends leaderboards.

**Reusable Widgets:**
- `StatCard`: A card to display a key metric (e.g., "Total Workouts", "Current Streak").
- `WorkoutPlanCard`: A card for the workout plan list.
- `ExerciseTile`: A list tile for an exercise within a session.
- `SetTrackerButton`: The main interactive button in a workout session to log a completed set.
- `EmbeddedVideoPlayer`: A widget to play workout videos from Firebase Storage.
- `AppProgressChart`: A line or bar chart for visualizing user progress.

---

## 5. Firebase & Data Models

### Firestore Collections:
- **`users/{userId}`**
  - `email`: String
  - `displayName`: String
  - `profileImageUrl`: String
  - `currentStreak`: Int
  - `longestStreak`: Int
  - `friends`: List<String> (User IDs)
  - `createdAt`: Timestamp
- **`workout_plans/{planId}`**
  - `name`: String
  - `description`: String
  - `type`: String (`Preset`, `Custom`)
  - `creatorId`: String (`system` or `userId`)
  - `exercises`: List<Map> `[{ exerciseId, sets, reps, restTime }]`
- **`exercises/{exerciseId}`**
  - `name`: String
  _ `description`: String
  - `videoUrl`: String (Path to Firebase Storage)
  - `targetMuscles`: List<String>
- **`workout_sessions/{sessionId}`**
  - `userId`: String
  - `planId`: String
  - `startedAt`: Timestamp
  - `completedAt`: Timestamp
  - `performance`: List<Map> `[{ exerciseId, setsCompleted, repsAchieved }]`
- **`leaderboards/global_streak`**
  - `top_users`: List<Map> `[{ userId, displayName, streak }]`

### Firebase Storage:
- `/workout_media/{exerciseId}.mp4`: Stores the instructional videos/GIFs.

### Cloud Functions:
- **`updateGlobalLeaderboard`:** A scheduled function (e.g., daily) that aggregates streak data from all users.
- **`sendStreakWarning`:** A scheduled function that checks for users who are about to lose their streak and sends a push notification.

### Firestore Security Rules:
- Users can only read/write their own `users` and `workout_sessions` documents.
- `workout_plans` and `exercises` are readable by all authenticated users but only writable by admins (for presets) or the user who created them (for custom plans).
- Leaderboard data is publicly readable but only writable by Cloud Functions.

---

## 6. State Management

We will use **BLoC (`flutter_bloc`)** for state management.
- **Why BLoC?** It strictly separates business logic from the UI, is highly testable, and scales well for complex applications. Its event-driven nature fits perfectly with handling user interactions and asynchronous data flows from Firebase.
- **Implementation:** Each feature will have its own `Bloc`. For example, `AuthBloc` will manage login state, and `WorkoutSessionBloc` will manage the state of an active workout.

---

## 7. Navigation

We will use the **`go_router`** package.
- **Why go_router?** It provides a declarative, URL-based API that is perfect for handling deep linking, authentication redirects, and complex navigation flows.
- **Structure:** A central `router.dart` file in `lib/core/config/` will define all app routes and a `redirect` logic block to handle authentication.

---

## 8. Third-Party Packages

- **State Management:** `flutter_bloc`, `provider` (for DI with BLoC)
- **Value Equality:** `equatable`
- **Navigation:** `go_router`
- **Firebase:** `firebase_core`, `firebase_auth`, `cloud_firestore`, `firebase_storage`, `cloud_functions`, `firebase_analytics`, `firebase_crashlytics`
- **DI:** `get_it`, `injectable` (for compile-time dependency injection)
- **Data Models:** `freezed` (for immutable, serializable models)
- **Local Cache:** `hive` or `isar` (for offline support)
- **UI & General:**
  - `cached_network_image`: For profile pictures.
  - `video_player`: For workout videos.
  - `fl_chart`: For progress analytics.
  - `flutter_local_notifications`: For reminders.
  - `just_audio` / `spotify_sdk`: For music integration.
- **Build Tools:** `build_runner`

---

## 9. Scalability & Security

- **Scalability:** The feature-first architecture allows development teams to work on different features in parallel. Firestore and Cloud Functions are serverless and scale automatically. Caching strategies will reduce the load on Firebase for frequently accessed data.
- **Security:**
  - **Firebase Auth:** Handles user authentication securely.
  - **Firestore Rules:** Enforce strict data access policies on the server side.
  - **Firebase App Check:** Protects backend resources from abuse.
  - **Environment Variables:** No sensitive keys will be hardcoded in the client application.

This plan provides a solid foundation for building a robust and feature-rich workout tracker. The next step is to begin implementing the `core` setup and the `auth` feature.
