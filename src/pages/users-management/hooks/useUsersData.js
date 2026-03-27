import { useEffect, useState } from "react";
import { getUsers } from "../../../api/auth";

export const useUsersData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUsers();
        const userList = response?.data?.data ?? [];

        if (isMounted) {
          setUsers(userList);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load users. Please refresh and try again.");
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    users,
    loading,
    error,
  };
};
