// App.tsx or App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./layout/Navigation";
import Login from "./pages/Login";
import ProjectDetails from "./components/ProjectDetails";
import PrivateRoute from "./app/PrivateRoute";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/RegisterPage";

function App() {
  return (
    <Router>
      <div className="">
        <Navigation />
        <main className="container mx-auto py-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register/>} />

            {/* Example: Protected route with a form */}
            <Route
              path="admin/projects/:id"
              element={
                <PrivateRoute>
                  <ProjectDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <PrivateRoute>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Default route */}
            <Route
              path="/"
              element={<PrivateRoute>{<AdminDashboard />}</PrivateRoute>}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
