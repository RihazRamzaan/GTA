import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function App() {
  const { pathname } = useLocation();
  const isDockFlow = !pathname.startsWith('/admin');
  if (isDockFlow) return <div className="app-shell min-h-screen bg-[#070714] text-[#f6f4fc]"><main className="flex-1 w-full bg-[#070714]"><Outlet /></main></div>;
  return <div className="app-shell min-h-screen bg-[#070714] text-[#f6f4fc]"><Navbar /><main className="page-content bg-[#070714]"><Outlet /></main><Footer /></div>;
}
