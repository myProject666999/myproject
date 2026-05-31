import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex max-w-7xl mx-auto pt-4">
        <aside className="w-64 hidden lg:block px-4">
          <Sidebar />
        </aside>
        <main className="flex-1 px-4 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
