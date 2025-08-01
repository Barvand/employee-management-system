// /src/components/PrivateRoute.tsx
import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Account } from "appwrite";
import { client } from "/appwriteConfig.js";
const account = new Account(client);

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get();
        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Auth error:", error.message);
        }
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return <p className="text-center mt-10">Checking session...</p>;
  }

  return <>{children}</>;
};

export default PrivateRoute;
