import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Pages
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import DeckPage from '@/pages/DeckPage';
import ReviewPage from '@/pages/ReviewPage';

// Layout Components (assuming a simple sidebar layout)
import { Sidebar } from '@/components/ui/sidebar'; // Assuming this exists or will be created
import { Toaster } from '@/components/ui/toaster'; // For notifications

// Protected Route Component
const ProtectedRoute = ({ session }: { session: Session | null }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />; // Renders child routes if authenticated
};

// Main Layout Component
const MainLayout = ({ session }: { session: Session | null }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <Outlet />; // Render only the login page content without layout
  }

  return (
    <div className="flex h-screen bg-background">
      {session && <Sidebar />} {/* Show sidebar only if logged in and not on login page */}
      <main className="flex-1 overflow-y-auto">
        {/* Header could be added here or within pages */}
        <Outlet /> {/* Renders the matched page component */}
      </main>
      <Toaster /> {/* Add toaster for notifications */}
    </div>
  );
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Carregando...</div>; // Or a proper loading spinner
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout session={session} />}>
          {/* Public Route */}
          <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute session={session} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/decks/:deckId" element={<DeckPage />} />
            <Route path="/review" element={<ReviewPage />} /> {/* Review all */}
            <Route path="/review/:deckId" element={<ReviewPage />} /> {/* Review specific deck */}
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

