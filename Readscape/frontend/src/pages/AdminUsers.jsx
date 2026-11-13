import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [updatingSuspensionId, setUpdatingSuspensionId] = useState(null);
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const data = await api(
          `/admin/users?search=${encodeURIComponent(submittedSearch)}`
        );

        if (!cancelled) {
          setUsers(data.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load users.");
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [submittedSearch]);



async function handleChangeRole(user, newRole) {
  if (user.role === newRole || updatingUserId !== null) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to change @${user.username}'s role ` +
    `from "${user.role}" to "${newRole}"?`
  );

  if (!confirmed) return;

  setUpdatingUserId(user.id);
  setActionError("");

  try {
    const data = await api(
      `/admin/users/${encodeURIComponent(user.id)}/role`,
      {
        method: "PATCH",
        body: JSON.stringify({ role: newRole })
      }
    );

    setUsers(previousUsers =>
      previousUsers.map(item =>
        String(item.id) === String(user.id)
          ? { ...item, role: data.user.role }
          : item
      )
    );
  } catch (err) {
    setActionError(err.message || "Could not update user role.");
  } finally {
    setUpdatingUserId(null);
  }
}


async function handleChangeSuspension(user) {
  if (
    user.role === "admin" ||
    updatingSuspensionId !== null ||
    updatingUserId !== null
  ) {
    return;
  }

  const suspend = !user.is_suspended;

  const confirmed = window.confirm(
    suspend
      ? `Are you sure you want to suspend @${user.username}?\n\n` +
        "They will lose access to Readscape until reactivated."
      : `Are you sure you want to reactivate @${user.username}?`
  );

  if (!confirmed) return;

  setUpdatingSuspensionId(user.id);
  setActionError("");
  setActionNotice("");

  try {
    const data = await api(
      `/admin/users/${encodeURIComponent(user.id)}/suspension`,
      {
        method: "PATCH",
        body: JSON.stringify({ suspended: suspend })
      }
    );

    setUsers(previousUsers =>
      previousUsers.map(item =>
        String(item.id) === String(user.id)
          ? {
              ...item,
              is_suspended: data.user.is_suspended
            }
          : item
      )
    );

    setActionNotice(data.message);
  } catch (err) {
    setActionError(
      err.message || "Could not update account status."
    );
  } finally {
    setUpdatingSuspensionId(null);
  }
}


  function handleSearch(event) {
    event.preventDefault();
    setSubmittedSearch(search.trim());
  }

  return (
    <main className="role-page">
      <div className="role-topbar">
        <Link to="/admin">Readscape Admin</Link>
        <span>USER MANAGEMENT</span>
      </div>

      <header className="role-header">
        <p className="small-label">ADMINISTRATION</p>
        <h1>User management.</h1>
        <p>
          Search registered accounts and review account
          roles, reading activity, and registration dates.
        </p>

        <Link to="/admin" className="clubs-back-link">
          ← Back to Admin Dashboard
        </Link>
      </header>

      <section className="role-section">
        <h2>Registered users</h2>

        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}
        >
          <input
            type="search"
            value={search}
            maxLength={100}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search name, username, or email"
            aria-label="Search users"
            style={{
              flex: "1 1 250px",
              padding: "12px",
              border: "1px solid #e6e6e2",
              borderRadius: "10px",
              fontSize: "15px"
            }}
          />

          <button
            type="submit"
            className="clubs-create-button"
            disabled={loading}
          >
            Search
          </button>

          <button
            type="button"
            className="club-leave-button"
            onClick={() => {
              setSearch("");
              setSubmittedSearch("");
            }}
            disabled={loading}
          >
            Clear
          </button>
        </form>

        {actionError && (
  <p role="alert" style={{ color: "#a43e3e" }}>
    {actionError}
  </p>
)}

{actionNotice && (
  <p role="status" style={{ color: "#285c44" }}>
    {actionNotice}
  </p>
)}

        {loading && (
          <p role="status">Loading registered users...</p>
        )}

        {error && (
          <div role="alert">
            <p style={{ color: "#a43e3e" }}>{error}</p>
            <Link to="/admin">Back to Admin Dashboard</Link>
          </div>
        )}

        {!loading && !error && (
          <>
            <p style={{ marginBottom: "18px", color: "#777" }}>
              Showing {users.length} user
              {users.length === 1 ? "" : "s"}
              {submittedSearch
                ? ` matching "${submittedSearch}"`
                : ""}
              {" "}(maximum 50 results)
            </p>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left"
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Username",
                      "Email",
                      "Role",
                      "Status",
                      "Books",
                      "Clubs",
                      "Registered",
                      "Actions"
                    ].map(heading => (
                      <th
                        key={heading}
                        style={{
                          padding: "14px 12px",
                          borderBottom: "2px solid #ddd",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td style={{ padding: "14px 12px" }}>
                        {user.name}
                      </td>


<td style={{ padding: "14px 12px" }}>
  <span
    className="club-joined-label"
    style={{
      color: user.is_suspended ? "#a43e3e" : "#285c44"
    }}
  >
    {user.is_suspended ? "Suspended" : "Active"}
  </span>
</td>


                      <td style={{ padding: "14px 12px" }}>
                        @{user.username}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {user.email}
                      </td>

                      
<td style={{ padding: "14px 12px" }}>
  <select
    value={user.role}
    disabled={updatingUserId !== null}
    onChange={event =>
      handleChangeRole(user, event.target.value)
    }
    aria-label={`Change role for ${user.username}`}
    style={{
      padding: "8px",
      border: "1px solid #e6e6e2",
      borderRadius: "8px",
      background: "#fff"
    }}
  >
    <option value="user">User</option>
    <option value="moderator">Moderator</option>
    <option value="admin">Admin</option>
  </select>
</td>


                      <td style={{ padding: "14px 12px" }}>
                        {user.books_tracked}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {user.clubs_joined}
                      </td>

                      <td
                        style={{
                          padding: "14px 12px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </td>


<td style={{ padding: "14px 12px" }}>
  {user.role === "admin" ? (
    <span className="role-planned">
      Protected
    </span>
  ) : (
    <button
      type="button"
      className={
        user.is_suspended
          ? "clubs-create-button"
          : "club-leave-button"
      }
      disabled={
        updatingSuspensionId !== null ||
        updatingUserId !== null
      }
      onClick={() => handleChangeSuspension(user)}
      style={{ whiteSpace: "nowrap" }}
    >
      {updatingSuspensionId === user.id
        ? "Updating..."
        : user.is_suspended
          ? "Reactivate"
          : "Suspend"}
    </button>
  )}
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <p style={{ marginTop: "24px" }}>
                No users found. Try a different search.
              </p>
            )}
          </>
        )}
      </section>

      <p className="role-disclaimer">
        User information is retrieved from Readscape's
        PostgreSQL database. This page is currently
        read-only.
      </p>
    </main>
  );
}

export default AdminUsers;
