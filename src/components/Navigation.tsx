import { useAuth } from "./utils/authProvider";
import { useNavigate } from "react-router-dom";

function Navigation() {
  const { user, setUser, account } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null); // update context immediately
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="custom-nav flex justify-between items-center p-4 bg-gray-100">
      <div>
        <h1 className="text-5xl font-bold">TOTALENTREPRENOR AS - </h1>
        <h2 className="text-5xl font-bold">TIME TRACKER</h2>
      </div>
      {user && (
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      )}
    </nav>
  );
}

export default Navigation;
