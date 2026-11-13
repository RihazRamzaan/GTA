import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function App() {
  const { pathname } = useLocation();
  const isPublicFlow = pathname === '/' || pathname === '/register' || pathname === '/login';
  if (isPublicFlow) return <div className="app-shell"><main><Outlet /></main></div>;
  return <div className="app-shell"><Navbar /><main className="page-content"><Outlet /></main><Footer /></div>;
}
