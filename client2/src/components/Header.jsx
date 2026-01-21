import { useNavigate } from "react-router-dom";

import { useNillion } from "../hooks/useNillion";

function Header() {
  const navigate = useNavigate();
  const { logout } = useNillion();

  const handleLogout = () => {
    logout();
    navigate("/")
  };

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
          Nillion + MetaMask Demo
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Home
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header;
