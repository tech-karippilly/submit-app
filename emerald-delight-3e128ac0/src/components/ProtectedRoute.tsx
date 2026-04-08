import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const token = localStorage.getItem("accessToken");

  if (!isAuthenticated || !token) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
