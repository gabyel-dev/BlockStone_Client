import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getOnlineUsers } from "../../../api/auth";

const POLL_MS = 20 * 1000;

const normalizeIds = (ids) =>
  [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id)))].sort();

const areIdListsEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};

export const useOnlineUsers = ({ enabled = false } = {}) => {
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const isPollingRef = useRef(false);

  const loadOnlineUsers = useCallback(async () => {
    if (!enabled || isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;

    try {
      const response = await getOnlineUsers();
      const userIds = normalizeIds(response?.data?.data?.onlineUserIds ?? []);

      setOnlineUserIds((previousIds) => {
        const previousNormalized = normalizeIds(previousIds);
        return areIdListsEqual(previousNormalized, userIds)
          ? previousIds
          : userIds;
      });
    } catch {
      // Keep this silent so polling failures do not interrupt user management actions.
      setOnlineUserIds((previousIds) =>
        previousIds.length === 0 ? previousIds : [],
      );
    } finally {
      isPollingRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setOnlineUserIds((previousIds) =>
        previousIds.length === 0 ? previousIds : [],
      );
      return;
    }

    const initialPollId = setTimeout(() => {
      loadOnlineUsers();
    }, 0);

    const intervalId = setInterval(() => {
      loadOnlineUsers();
    }, POLL_MS);

    return () => {
      clearTimeout(initialPollId);
      clearInterval(intervalId);
      isPollingRef.current = false;
    };
  }, [enabled, loadOnlineUsers]);

  const onlineUserIdSet = useMemo(() => {
    if (!enabled) {
      return new Set();
    }

    return new Set(onlineUserIds.map((id) => String(id)));
  }, [enabled, onlineUserIds]);

  const isUserOnline = useCallback(
    (userId) => onlineUserIdSet.has(String(userId || "")),
    [onlineUserIdSet],
  );

  return {
    onlineCount: onlineUserIdSet.size,
    isUserOnline,
  };
};
