import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Home from '../pages/Home.jsx';
import Register from '../pages/Register.jsx';
import Login from '../pages/Login.jsx';
import TeamDashboard from '../pages/team/TeamDashboard.jsx';
import PaymentPage from '../pages/team/PaymentPage.jsx';
import SubmissionPage from '../pages/team/SubmissionPage.jsx';
import AdminLogin from '../pages/admin/AdminLogin.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AgendaPage from '../pages/admin/AgendaPage.jsx';
import PaymentsPage from '../pages/admin/PaymentsPage.jsx';
import SubmissionsPage from '../pages/admin/SubmissionsPage.jsx';
import TeamsPage from '../pages/admin/TeamsPage.jsx';

export const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: <Home /> }, { path: 'register', element: <Register /> }, { path: 'login', element: <Login /> },
  { path: 'team', element: <TeamDashboard /> }, { path: 'team/payment', element: <PaymentPage /> }, { path: 'team/submission', element: <SubmissionPage /> },
  { path: 'admin/login', element: <AdminLogin /> }, { path: 'admin', element: <AdminDashboard /> }, { path: 'admin/agenda', element: <AgendaPage /> }, { path: 'admin/teams', element: <TeamsPage /> }, { path: 'admin/payments', element: <PaymentsPage /> }, { path: 'admin/submissions', element: <SubmissionsPage /> },
  { path: '*', element: <p>Page not found.</p> },
]}]);

