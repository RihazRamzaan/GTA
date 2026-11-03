import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import RequireAuth from '../components/common/RequireAuth.jsx';
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

const team = (page) => <RequireAuth role="team">{page}</RequireAuth>;
const admin = (page) => <RequireAuth role="admin">{page}</RequireAuth>;

export const router = createBrowserRouter([{ path: '/', element: <App />, children: [
  { index: true, element: <Home /> }, { path: 'register', element: <Register /> }, { path: 'login', element: <Login /> },
  { path: 'team', element: team(<TeamDashboard />) }, { path: 'team/payment', element: team(<PaymentPage />) }, { path: 'team/submission', element: team(<SubmissionPage />) },
  { path: 'admin/login', element: <AdminLogin /> }, { path: 'admin', element: admin(<AdminDashboard />) }, { path: 'admin/agenda', element: admin(<AgendaPage />) }, { path: 'admin/payments', element: admin(<PaymentsPage />) }, { path: 'admin/submissions', element: admin(<SubmissionsPage />) },
  { path: '*', element: <p>Page not found.</p> },
]}]);
