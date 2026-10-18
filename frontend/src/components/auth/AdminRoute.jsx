import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getProfile } from "../../services/profileService.js";

const AdminRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      if (!isAuthenticated) {
        setStatus("unauthenticated");
        return;
      }

      try {
        const response = await getProfile();
        const user = response?.user ?? response;

        if (isMounted) {
          setStatus(user?.role === "admin" ? "authorized" : "denied");
        }
      } catch {
        if (isMounted) {
          setStatus("denied");
        }
      }
    };

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted">Checking admin access...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
