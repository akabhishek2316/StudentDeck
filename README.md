# StudentDeck

A full-stack web app I built for a campus community — students can buy and sell stuff, share notes and study material, post lost & found items, check out campus events, and message each other. Basically one place for the everyday things students end up doing across five different WhatsApp groups.

## Why I built this

Every campus has the same scattered mess: a marketplace group on WhatsApp, a lost-and-found post buried in some Instagram story, notes shared in a random Google Drive link nobody can find later. I wanted to put all of that in one actual app instead.

## What it does

- **Marketplace** — post items to sell or give away, with images, price, and condition. Edit or take down your own listings anytime.
- **Academic Resources** — upload and browse notes, previous year papers, assignments, and study material. Save the ones you'll need later.
- **Events** — post and browse campus events with date, time, location, and a registration link.
- **Lost & Found** — report something lost or found, with a photo and contact info.
- **Messages** — DM other students directly, including image and file attachments.
- **Saved items** — bookmark marketplace listings or academic resources to come back to later.
- **Profile** — including a proper image cropper for profile pictures (Cloudinary-backed).

Every edit/delete action checks that you actually own the thing you're trying to change — you can't delete someone else's listing just by guessing a URL.

## Tech stack

**Frontend:** React + Vite, React Router, plain CSS
**Backend:** Node.js + Express
**Database:** MongoDB with Mongoose
**Auth:** JWT + bcrypt for password hashing
**File/image storage:** Cloudinary

## Project structure

    client/
      src/
        api.js              - All backend API calls in one place
        App.jsx             - Routes
        layouts/
          MainLayout.jsx    - Navbar + page content + footer
        components/         - Reusable UI (Navbar, Footer, BackButton, FeatureCard, etc.)
        pages/               - One file per page (Marketplace, LostFound, Events, etc.)
    server/
      config/db.js           - MongoDB connection
      controllers/           - Route logic per feature
      middleware/             - Auth middleware
      models/                 - Mongoose schemas
      routes/                 - Express routes
      utils/seed.js           - Seeds demo users + sample data for each section

## Getting started

1. Clone the repo and install dependencies in both `client/` and `server/` (`npm install` in each folder).
2. Copy `.env.example` to `.env` in both folders and fill in your own MongoDB URI, JWT secret, and Cloudinary keys.
3. Run the backend: `cd server && npm start`
4. Run the frontend: `cd client && npm run dev`

## Live demo


