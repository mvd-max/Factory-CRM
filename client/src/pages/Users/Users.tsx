import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Users.css";

interface User {
  id: number;
  full_name: string;
  username: string;
  password: string;
  role: string;
  status: string;
}

export default function Users() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentRole = currentUser.role;
  const currentUserId = Number(currentUser.id);

  // ================= ADMIN CHECK =================

  useEffect(() => {
    if (currentRole !== "admin") {
      alert("❌ Admin access required");
      navigate("/dashboard");
    }
  }, [currentRole, navigate]);

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<number[]>([]);

  const togglePassword = (id: number) => {
    setVisiblePasswords((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    );
  };

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    password: "",
    role: "staff",
    status: "Active",
  });

  // ================= SUMMARY =================

  const totalUsers = users.length;

  const totalAdmins = users.filter(
    (u) => u.role === "admin"
  ).length;

  const totalStaff = users.filter(
    (u) =>
      u.role === "staff" ||
      u.role === "inventory_manager"
  ).length;

  const activeUsers = users.filter(
    (u) => u.status === "Active"
  ).length;

  // ================= RESET FORM =================

  const resetForm = () => {
    setForm({
      full_name: "",
      username: "",
      password: "",
      role: "staff",
      status: "Active",
    });

    setEditingId(null);
  };

  // ================= LOAD USERS =================

  const loadUsers = async () => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const res = await fetch(
        "https://stellan-erp-api.onrender.com/users",
        {
          headers: {
            "x-user-role": currentUser.role,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load users"
        );
      }

      setUsers(data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load users");
    }
  };

  useEffect(() => {
    if (currentRole === "admin") {
      loadUsers();
    }
  }, [currentRole]);

  // ================= SEARCH =================

  const filteredUsers = users.filter((user) =>
    `${user.full_name} ${user.username} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
    // ================= EDIT USER =================

  const editUser = (user: User) => {
    setEditingId(user.id);

    setForm({
      full_name: user.full_name,
      username: user.username,
      password: user.password,
      role: user.role,
      status: user.status,
    });

    setShowModal(true);
  };

  // ================= DELETE USER =================

  const deleteUser = async (id: number) => {

    // Prevent self delete
    if (id === currentUserId) {
      alert("❌ You cannot delete your own account.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const res = await fetch(
        `https://stellan-erp-api.onrender.com/users/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-role": currentUser.role,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      alert("✅ User Deleted Successfully");

      loadUsers();

    } catch (err) {
      console.error(err);
      alert("❌ Server Error");
    }
  };

  // ================= SAVE USER =================

  const saveUser = async () => {

    if (
      !form.full_name.trim() ||
      !form.username.trim() ||
      !form.password.trim()
    ) {
      alert("⚠️ Please fill all fields");
      return;
    }

    try {

      const url =
        editingId === null
          ? "https://stellan-erp-api.onrender.com/users"
          : `https://stellan-erp-api.onrender.com/users/${editingId}`;

      const method =
        editingId === null
          ? "POST"
          : "PUT";

      const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentUser.role,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            data.message ||
            "Failed to save user"
        );
        return;
      }

      alert(
        editingId === null
          ? "✅ User Added Successfully"
          : "✅ User Updated Successfully"
      );

      await loadUsers();

      resetForm();
      setShowModal(false);

    } catch (err) {
      console.error(err);
      alert("❌ Server Error");
    }
  };

  // ================= NON ADMIN =================

  if (currentRole !== "admin") {
    return null;
  }

  // ================= UI =================

  return (
    <div style={{ padding: "30px" }}>
            {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#111827",
            }}
          >
            👥 User Management
          </h1>

          <p
            style={{
              color: "#6B7280",
              marginTop: "8px",
            }}
          >
            Manage Admin & Inventory Manager Accounts.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            background: "#2563EB",
            color: "#fff",
            border: "none",
            padding: "12px 22px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow:
              "0 8px 18px rgba(37,99,235,.25)",
          }}
        >
          ➕ Add User
        </button>
      </div>

      {/* ================= SUMMARY ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={cardStyle}>
          <div style={{ fontSize: 34 }}>👥</div>
          <h4>Total Users</h4>
          <h2>{totalUsers}</h2>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 34 }}>🛡️</div>
          <h4>Admins</h4>
          <h2>{totalAdmins}</h2>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 34 }}>📦</div>
          <h4>Inventory</h4>
          <h2>{totalStaff}</h2>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 34 }}>✅</div>
          <h4>Active</h4>
          <h2>{activeUsers}</h2>
        </div>
      </div>

      {/* ================= SEARCH ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search User..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "320px",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #D1D5DB",
            outline: "none",
          }}
        />

        <strong>
          Total : {filteredUsers.length}
        </strong>
      </div>

      {/* ================= TABLE ================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow:
            "0 8px 20px rgba(0,0,0,.06)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: "#F8FAFC",
            }}
          >
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Full Name</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Password</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  No Users Found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderTop:
                      "1px solid #E5E7EB",
                  }}
                >
                  <td style={tdStyle}>
                    {user.id}
                  </td>

                  <td style={tdStyle}>
                    {user.full_name}
                  </td>

                  <td style={tdStyle}>
                    {user.username}
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          minWidth: "80px",
                        }}
                      >
                        {visiblePasswords.includes(user.id)
                          ? user.password
                          : "••••••••"}
                      </span>

                      <button
                        onClick={() =>
                          togglePassword(user.id)
                        }
                        style={{
                          background: "#F3F4F6",
                          border: "1px solid #D1D5DB",
                          borderRadius: "6px",
                          padding: "5px 8px",
                          cursor: "pointer",
                        }}
                        title={
                          visiblePasswords.includes(user.id)
                            ? "Hide Password"
                            : "Show Password"
                        }
                      >
                        {visiblePasswords.includes(user.id)
                          ? "🙈"
                          : "👁️"}
                      </button>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background:
                          user.role === "admin"
                            ? "#DBEAFE"
                            : "#DCFCE7",
                        color:
                          user.role === "admin"
                            ? "#1D4ED8"
                            : "#15803D",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      {user.role === "admin"
                        ? "🛡️ Admin"
                        : "📦 Inventory"}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background:
                          user.status === "Active"
                            ? "#DCFCE7"
                            : "#FEE2E2",
                        color:
                          user.status === "Active"
                            ? "#166534"
                            : "#991B1B",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() =>
                          editUser(user)
                        }
                        style={{
                          background: "#2563EB",
                          color: "#fff",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteUser(user.id)
                        }
                        disabled={
                          user.id === currentUserId
                        }
                        style={{
                          background:
                            user.id === currentUserId
                              ? "#9CA3AF"
                              : "#DC2626",
                          color: "#fff",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          cursor:
                            user.id === currentUserId
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
          {/* ================= MODAL ================= */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>
              {editingId !== null
                ? "Edit User"
                : "Add User"}
            </h2>

            <input
              placeholder="Full Name"
              value={form.full_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  full_name: e.target.value,
                })
              }
            />

            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />

            <select
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value,
                })
              }
            >
              <option value="admin">
                Admin
              </option>

              <option value="staff">
                Staff
              </option>
            </select>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

            <div className="modal-buttons">

              <button
                className="save-btn"
                onClick={saveUser}
              >
                💾 Save
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================

const cardStyle = {
  background: "#fff",
  padding: "22px",
  borderRadius: "16px",
  boxShadow:
    "0 8px 18px rgba(0,0,0,.06)",
};

const thStyle = {
  padding: "15px",
  textAlign: "left" as const,
};

const tdStyle = {
  padding: "15px",
};