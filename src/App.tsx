// App.tsx or App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./layout/Navigation";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./components/ProjectDetails";
import PrivateRoute from "./app/PrivateRoute";
import EmployeeDashboard from "./pages/EmployeeDashboard";

// const query = useQuery({
//   queryKey: [posts],
//   queryFn:
// })

function App() {
  return (
    <Router>
      <div className="">
        <Navigation />
        <main className="container mx-auto py-4">
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={<PrivateRoute>{<Dashboard />}</PrivateRoute>}
            />

            {/* Example: Protected route with a form */}
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <ProjectDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-portal"
              element={
                <PrivateRoute>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />

            {/* Default route */}
            <Route
              path="/"
              element={<PrivateRoute>{<Dashboard />}</PrivateRoute>}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
