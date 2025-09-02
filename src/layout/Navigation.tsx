import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav className="custom-nav flex justify-between items-center p-4 bg-gray-100">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          TOTALENTREPRENØR AS -{" "}
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold">TIME TRACKER</h2>
      </div>
      <ul className="flex space-x-4">
        <Link
          to="employee-dashboard"
          className="text-sm text-yellow-400 hover:underline cursor-pointer"
        >
          Employee dashboard
        </Link>
        <Link
          to="admin-dashboard"
          className="text-sm text-yellow-400 hover:underline cursor-pointer"
        >
          Admin dashboard
        </Link>
      </ul>
    </nav>
  );
}

export default Navigation;
