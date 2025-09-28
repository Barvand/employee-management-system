type LoginFormProps = {
  handleRegisterg: (e: React.FormEvent<HTMLFormElement>) => void; // or React.FormEventHandler<HTMLFormElement>
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  error?: string | null;
  name: string; 
  setName: React.Dispatch<React.SetStateAction<string>>;
};

function RegisterForm({
  handleRegister,
  email,
  setEmail,
  setName,
  password,
  setPassword,
  error,
}: LoginFormProps) {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Log In
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
  <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
