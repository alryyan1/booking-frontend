# Frontend Setup Instructions

## Quick Start

1. **Create `.env` file** in the `booking-frontend` directory:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

4. **Login** with:
   - Email: `admin@booking.com`
   - Password: `password`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

- `src/pages/` - Main page components
- `src/components/` - Reusable components
- `src/services/` - API service layer
- `src/context/` - React Context providers
- `src/utils/` - Utility functions

## Features

- Monthly overview with 12 month cards
- Category selection (Traditional Attire, Evening Dresses, Wedding Dresses)
- Week selection with date ranges
- Daily booking table with time slots
- Booking CRUD operations
- Search and filter functionality

