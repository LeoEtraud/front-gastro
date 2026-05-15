import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/types/api";
import { isStaffRole } from "@/lib/permissions";

interface PrivateRouteProps {
  allowedRoles?: Role[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = isStaffRole(user.role) ? "/teacher/dashboard" : "/student/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
