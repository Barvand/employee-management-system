import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

type Props = { children?: React.ReactNode };

export default function PrivateRoute({ children }: Props) {
  const { currentUser } = useAuth();
  console.log(currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  // works with either <PrivateRoute><Page/></PrivateRoute> or <Route element={<PrivateRoute/>} />
  return children ? <>{children}</> : <Outlet />;
}
