import { useCallback, useEffect, useState } from "react";
import { getUsers } from "../../../api/auth";

export const useUsersData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUsers();
      const userList = response?.data?.data ?? [];
      setUsers(userList);
    } catch {
      setError("Unable to load users. Please refresh and try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      loadUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [loadUsers]);

  return {
    users,
    setUsers,
    loading,
    error,
    reloadUsers: loadUsers,
  };
};
