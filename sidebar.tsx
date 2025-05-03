import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Star, LogOut } from 'lucide-react'; // Icons
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login'); // Redirect after logout
  };

  const navItems = [
    { href: '/', label: 'Meus Baralhos', icon: Layers },
    { href: '/review', label: 'Revisar Tudo', icon: Star },
    // Add more links here if needed (e.g., Settings, Profile)
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-sidebar text-sidebar-foreground p-4 flex flex-col">
      <div className="mb-6">
        {/* Placeholder for Logo or App Name */}
        <h2 className="text-2xl font-semibold text-center text-sidebar-primary">Anki Clone</h2>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || (item.href === '/review' && location.pathname.startsWith('/review'));
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

