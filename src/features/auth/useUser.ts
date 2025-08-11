import { useEffect, useState } from "react";
import { account } from "../../appwriteConfig";

export function useUser() {
  const [user, setUser] = useState<null | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    account
      .get()
      .then((u) => mounted && setUser(u))
      .catch(() => mounted && setUser(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    await account.deleteSession("current");
    // your router may vary
    window.location.href = "/login";
  }

  return { user, loading, logout };
}
