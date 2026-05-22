# Vaultgy

Vaultgy is a video game catalog project focused almost entirely on the backend. The frontend is a lightweight interface used only to validate the main user flow in a simple way; most of the business logic lives in the backend.

The project lets you:

- Browse the full video game catalog.
- Search games by title or genre.
- Create an account and sign in with JWT stored in cookies.
- Add games to a wishlist and library.
- Leave ratings and reviews for games that are already in the library.
- Edit part of the authenticated user profile and password.
- Use admin CRUDs for users, games, libraries, wishlists, and reviews.
- Test admin endpoints through Swagger, Postman, or Thunder Client.

## Project Structure

- `backend/`: NestJS API with Prisma and PostgreSQL.
- `frontend/`: React + Vite interface for the main user-facing flows.

## Prerequisites

- Node.js 20 or newer.
- pnpm.
- PostgreSQL.

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd Vaultgy
cd backend
pnpm install
cd ../frontend
pnpm install
```

### 2. Configure backend environment variables

Create a `backend/.env` file with at least these values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/vaultgy"
JWT_SECRET="super-secret-change-me"
```

Notes:
- `DATABASE_URL` must point to a real PostgreSQL database.
- `JWT_SECRET` is required for authentication.
- `PORT` and `FRONTEND_URL` are optional. The backend already uses default values in code: port `3000` and frontend origin `http://localhost:5173`.
- You only need to set `PORT` or `FRONTEND_URL` if you want to override those defaults.

### 3. Configure frontend environment variables

The frontend works with the backend default URL out of the box. If you want to override it, create `frontend/.env`:

```env
VITE_API_URL="http://localhost:3000"
```

## Seed Data

The backend includes Prisma migrations and demo seed data.

```bash
cd backend
pnpm prisma generate
pnpm db:seed
```

If your database is empty and still needs the schema applied before seeding, run the appropriate Prisma migration command for your environment first.

## How to Run

### Backend

```bash
cd backend
pnpm start:dev
```

### Frontend

```bash
cd frontend
pnpm dev
```

Useful URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

## How to Use the App

1. Open the frontend.
2. Register or sign in.
3. Browse the game catalog.
4. Add games to your library or wishlist.
5. If a game is in your library, you can review and rate it.
6. In the profile area, you can update your name, email, and password.

## Administration

The frontend does not include an admin panel.

Admin CRUDs are intended to be used through:

- Swagger at `http://localhost:3000/docs`
- Postman
- Thunder Client

Swagger is configured with cookie-based authentication using `auth_token`, so you can log in through the API and then test protected routes.

## Demo Data

The backend seed creates 15 games and 3 demo users.

### Seed Users

- Admin
  - Email: `admin@vaultgy.local`
  - Password: `Admin123!@#`
- Demo user 1
  - Email: `alice@vaultgy.local`
  - Password: `User123!@#`
- Demo user 2
  - Email: `bob@vaultgy.local`
  - Password: `User123!@#`

### Seed Content

- 15 popular video games for testing catalog, details, library, wishlist, and reviews.
- The games are ready for the main user flow.

## How to Run Tests

### Unit Tests

```bash
cd backend
pnpm test
```

### Integration / E2E Tests

```bash
cd backend
pnpm test:e2e
```

## Technical Summary

- Backend: NestJS, Prisma, PostgreSQL, JWT in cookies.
- Frontend: React + Vite, used as a simple client to validate the main flow.
- Swagger: available for testing protected routes and documenting the API.

If you want to start the project from scratch, the recommended order is:

1. Configure `backend/.env`.
2. Install dependencies in `backend` and `frontend`.
3. Run `pnpm prisma generate` and `pnpm db:seed` in `backend`.
4. Start the backend with `pnpm start:dev`.
5. Start the frontend with `pnpm dev`.
6. Open `http://localhost:5173` or `http://localhost:3000/docs` depending on what you want to test.
