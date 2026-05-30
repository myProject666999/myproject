import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import CreatorHome from "@/pages/CreatorHome";
import MembershipTiers from "@/pages/MembershipTiers";
import ContentFeed from "@/pages/ContentFeed";
import MySubscriptions from "@/pages/MySubscriptions";
import CreatorDashboard from "@/pages/CreatorDashboard";
import Settings from "@/pages/Settings";
import { useUserStore } from "@/store/useUserStore";
import Layout from "@/components/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/:creatorId"
        element={
          <ProtectedRoute>
            <CreatorHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/:creatorId/tiers"
        element={
          <ProtectedRoute>
            <MembershipTiers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/:creatorId/feed"
        element={
          <ProtectedRoute>
            <ContentFeed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my/subscriptions"
        element={
          <ProtectedRoute>
            <MySubscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CreatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
