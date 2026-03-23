This folder contains the application source code, organized by responsibility. The structure is designed to support a clean separation of concerns, especially for the data layer (offline-first, sync-ready).

## Folder Purposes

| Folder         | Responsibility                                                                 |
|----------------|--------------------------------------------------------------------------------|
| `app/`         | Expo Router screens and navigation layout.                                     |
| `components/`  | Reusable UI components (buttons, cards, etc.).                                 |
| `constants/`   | Static values, themes, and configuration constants.                            |
| `hooks/`       | Custom React hooks (e.g., useMovies, useWishlist).                             |
| `api/`         | External API clients (e.g., TMDB). Contains HTTP request logic.                |
| `config/`      | Centralized environment variables and app configuration.                       |
| `database/`    | Database initialization and connection (currently a placeholder).              |
| `repositories/`| Direct database CRUD operations. Will be added when SQLite is implemented.     |
| `services/`    | Business logic that orchestrates data from repositories and APIs.              |
| `types/`       | Shared TypeScript interfaces and types (e.g., Movie, User).                    |
| `mocks/`       | Mock data used during development (replaces real API/DB).                      |

## Data Flow (Planned)

1. **UI** → calls methods in `services/`.
2. **Services** → fetch data from `repositories/` (local DB) or `api/` (external).
3. **Repositories** → perform raw database queries.
4. **Database** → actual SQLite storage.

All data access is isolated; UI never talks directly to `api/`, `repositories/`, or `database/`.

## Environment Variables

We use Expo's `EXPO_PUBLIC_*` prefix for environment variables.  
Define them in a `.env` file at the project root (e.g., `EXPO_PUBLIC_TMDB_API_KEY=...`).  
Access them via `process.env.EXPO_PUBLIC_*` or import from `src/config/index.ts`.

## Notes

- Do **not** place business logic in components.
- Keep mock data until the real data source is fully integrated.
- All database-related code should live in `repositories/` and `database/`.