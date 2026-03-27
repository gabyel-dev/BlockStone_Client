export const buildUserStats = (users = []) => {
  const admins = users.filter(
    (entry) => String(entry?.role || "").toLowerCase() === "admin",
  ).length;
  const regularUsers = users.filter(
    (entry) => String(entry?.role || "").toLowerCase() !== "admin",
  ).length;

  return {
    total: users.length,
    admins,
    users: regularUsers,
  };
};

export const filterUsers = ({ users = [], roleFilter = "all", searchText = "" }) => {
  const query = searchText.trim().toLowerCase();

  return users.filter((entry) => {
    const role = String(entry?.role || "").toLowerCase();
    const isAdmin = role === "admin";
    const roleMatches =
      roleFilter === "all" ||
      (roleFilter === "admin" && isAdmin) ||
      (roleFilter === "user" && !isAdmin);

    const fullName = `${entry?.first_name || ""} ${entry?.last_name || ""}`
      .trim()
      .toLowerCase();
    const username = String(entry?.username || "").toLowerCase();
    const email = String(entry?.email || "").toLowerCase();

    const searchMatches =
      query.length === 0 ||
      fullName.includes(query) ||
      username.includes(query) ||
      email.includes(query);

    return roleMatches && searchMatches;
  });
};
