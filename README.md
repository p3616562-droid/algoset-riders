# Riders Tracker

A lightweight, mobile-friendly web app for riders to submit daily reports and for admins to view, filter, and export data.

## Features
- ✅ **Rider Form**: Submit daily trips and incidents
- ✅ **Admin Dashboard**: View all submissions with filters
- ✅ **PDF & CSV Export**: Download reports instantly
- ✅ **Mobile Responsive**: Works great on all devices
- ✅ **SQLite Database**: Fast, lightweight, file-based
- ✅ **Simple Login**: Password-protected admin access

## Stack
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: Vanilla HTML/CSS/JS (no frameworks)
- **Export**: html2pdf.js (lightweight client-side PDF generation)

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Environment Variables
Edit `.env`:
```
ADMIN_PASSWORD=admin123
PORT=3000
NODE_ENV=development
```

### Run
```bash
npm start
```

Server starts on `http://localhost:3000`

- **Rider Form**: `http://localhost:3000/rider`
- **Admin Dashboard**: `http://localhost:3000/admin` (password required)

## File Structure
```
.
├── server.js           # Express app + API routes
├── package.json        # Dependencies
├── .env               # Config
├── db.sqlite          # SQLite database (created on first run)
└── public/
    ├── rider.html     # Rider submission form
    └── admin.html     # Admin dashboard + login
```

## API Endpoints

### Rider
- `POST /api/entries` - Submit a new entry
- `GET /rider` - Rider form page

### Admin (requires session)
- `POST /api/login` - Login with password
- `POST /api/logout` - Logout
- `GET /api/check-auth` - Check if logged in
- `GET /api/entries` - Get entries (with optional filters: `?startDate=...&endDate=...&rider=...`)
- `GET /api/riders` - Get list of all rider names
- `GET /admin` - Admin dashboard page

## Customization

### Change admin password
Edit `.env` and change `ADMIN_PASSWORD`.

### Add new fields to the form
1. Update the database schema in `server.js` (add column to `CREATE TABLE`)
2. Add input field to `public/rider.html`
3. Update POST handler in `server.js`
4. Add column to table in `public/admin.html`

### Deployment
- Use a `.gitignore` to exclude `db.sqlite`, `node_modules`, `.env` (use env secrets on production)
- Deploy to Heroku, Railway, Vercel (Node.js), or any server with Node.js support
- For production, change `ADMIN_PASSWORD` to a strong value

## Notes
- Database is auto-created on first run
- No external APIs or complex dependencies
- Works offline (once server is running) for form submissions
- Lightweight: ~5MB total with node_modules

---

Built for simplicity and performance. 🚀
