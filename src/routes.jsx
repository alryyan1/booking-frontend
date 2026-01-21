import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Sidebar from './components/Sidebar';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MonthlyOverview = lazy(() => import('./pages/MonthlyOverview'));
const CategorySelection = lazy(() => import('./pages/CategorySelection'));
const WeekSelection = lazy(() => import('./pages/WeekSelection'));
const DailyBookingTable = lazy(() => import('./pages/DailyBookingTable'));
const BookingsList = lazy(() => import('./pages/BookingsList'));
const CustomersList = lazy(() => import('./pages/CustomersList')); // Added CustomersList
const UsersList = lazy(() => import('./pages/UsersList'));
const ItemsList = lazy(() => import('./pages/ItemsList'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));
const AccessoriesList = lazy(() => import('./pages/AccessoriesList'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg animate-pulse">Loading page...</div>
  </div>
);

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen relative z-0">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <MonthlyOverview />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/month/:monthId',
        element: <CategorySelection />,
      },
      {
        path: '/month/:monthId/category/:categoryId',
        element: <WeekSelection />,
      },
      {
        path: '/month/:monthId/category/:categoryId/week/:weekNumber',
        element: <DailyBookingTable />,
      },
      {
        path: '/bookings',
        element: <BookingsList />,
      },
      {
        path: '/reports',
        element: <Reports />,
      },
      {
        path: '/customers',
        element: <CustomersList />,
      },
      {
        element: (
          <AdminRoute>
            <Outlet />
          </AdminRoute>
        ),
        children: [
          {
            path: '/users',
            element: <UsersList />,
          },
          {
            path: '/items',
            element: <ItemsList />,
          },
          {
            path: '/accessories',
            element: <AccessoriesList />,
          },
          {
            path: '/settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
