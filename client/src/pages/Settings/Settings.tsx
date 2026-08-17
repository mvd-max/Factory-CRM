import { useEffect, useState } from "react";
import "./Settings.css";

type Settings = {
  companyName: string;
  gstNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
};

export default function Settings() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [form, setForm] = useState<Settings>({
    companyName: "",
    gstNumber: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  // ================= PASSWORD =================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ================= LOAD SETTINGS =================

  useEffect(() => {
    fetch("https://stellan-erp-api.onrender.com/settings", {
      headers: {
        "x-user-role": user.role,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          companyName: data.companyName || "",
          gstNumber: data.gstNumber || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          logo: data.logo || "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to load settings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ================= INPUT CHANGE =================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SAVE COMPANY SETTINGS =================

  const saveSettings = async () => {
    try {
      setSaving(true);

      const res = await fetch(
        "https://stellan-erp-api.onrender.com/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": user.role,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(
          "✅ Company Settings Updated Successfully"
        );
      } else {
        alert(
          data.error ||
            "❌ Failed to update settings"
        );
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server Connection Error");
    } finally {
      setSaving(false);
    }
  };

  // ================= CHANGE PASSWORD =================

  const changePassword = async () => {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("❌ Please fill all password fields");
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "❌ New password must be at least 6 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("❌ New passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await fetch(
        "https://stellan-erp-api.onrender.com/users/password-change",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": user.role,
          },
          body: JSON.stringify({
            username: user.username,
            currentPassword: currentPassword,
            newPassword: newPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("✅ Password Changed Successfully");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(
          data.error ||
            "❌ Failed to change password"
        );
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server Connection Error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ================= DATABASE BACKUP =================

  const downloadBackup = async () => {
    try {
      setBackupLoading(true);

      const res = await fetch(
        "https://stellan-erp-api.onrender.com/backup/download",
        {
          method: "GET",
          headers: {
            "x-user-role": user.role,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();

        alert(
          data.error ||
            "❌ Failed to download backup"
        );

        return;
      }

      const blob = await res.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "STELLAN_ERP_Database_Backup.db";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      alert(
        "✅ Database Backup Downloaded Successfully"
      );
    } catch (err) {
      console.error(err);

      alert(
        "❌ Server Connection Error"
      );
    } finally {
      setBackupLoading(false);
    }
  };

  // ================= LOADING =================

  if (loading) {
    return <h2>Loading...</h2>;
  }

  // ================= UI =================

  return (
    <div className="settings-page">

      <h1>⚙️ Settings</h1>

      {/* ================= COMPANY PROFILE ================= */}

      <div className="settings-card">

        <h2>🏢 Company Profile</h2>

        <p
          style={{
            color: "#6B7280",
            marginBottom: "25px",
          }}
        >
          Manage your company information.
        </p>

        <div className="form-group">
          <label>Company Name</label>

          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>GST Number</label>

          <input
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Website</label>

          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://www.example.com"
          />
        </div>

        <div className="form-group">
          <label>Address</label>

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Company Logo URL</label>

          <input
            name="logo"
            value={form.logo}
            onChange={handleChange}
            placeholder="/stellan-logo.png"
          />
        </div>

        {form.logo && (
          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <img
              src={form.logo}
              alt="Company Logo"
              style={{
                width: "120px",
                maxHeight: "80px",
                objectFit: "contain",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "10px",
              }}
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          </div>
        )}

        <button
          className="save-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "💾 Save Company Settings"}
        </button>

      </div>

      {/* ================= SECURITY ================= */}

      {user.role === "admin" && (
        <div
          className="settings-card"
          style={{
            marginTop: "25px",
          }}
        >

          <h2>🔐 Security</h2>

          <p
            style={{
              color: "#6B7280",
              marginBottom: "25px",
            }}
          >
            Change your admin account password.
          </p>

          <div className="form-group">
            <label>Username</label>

            <input
              value={user.username || ""}
              readOnly
              style={{
                background: "#F3F4F6",
              }}
            />
          </div>

          <div className="form-group">
            <label>Current Password</label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              placeholder="Enter current password"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Re-enter new password"
            />
          </div>

          <button
            onClick={changePassword}
            disabled={passwordLoading}
            style={{
              background: "#7C3AED",
              color: "#FFFFFF",
              border: "none",
              padding: "13px 22px",
              borderRadius: "10px",
              cursor: passwordLoading
                ? "not-allowed"
                : "pointer",
              fontSize: "15px",
              fontWeight: "bold",
              opacity: passwordLoading
                ? 0.7
                : 1,
            }}
          >
            {passwordLoading
              ? "Changing..."
              : "🔐 Change Password"}
          </button>

        </div>
      )}

      {/* ================= DATABASE BACKUP ================= */}

      {user.role === "admin" && (
        <div
          className="settings-card"
          style={{
            marginTop: "25px",
          }}
        >

          <h2>🗄️ Database Backup</h2>

          <p
            style={{
              color: "#6B7280",
              marginBottom: "20px",
            }}
          >
            Download a complete backup of your
            STELLAN ERP database.
          </p>

          <button
            onClick={downloadBackup}
            disabled={backupLoading}
            style={{
              background: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              padding: "14px 22px",
              borderRadius: "10px",
              cursor: backupLoading
                ? "not-allowed"
                : "pointer",
              fontSize: "15px",
              fontWeight: "bold",
              opacity: backupLoading
                ? 0.7
                : 1,
              boxShadow:
                "0 8px 18px rgba(37,99,235,.25)",
            }}
          >
            {backupLoading
              ? "⏳ Creating Backup..."
              : "📥 Download Database Backup"}
          </button>

          <p
            style={{
              marginTop: "15px",
              fontSize: "13px",
              color: "#6B7280",
            }}
          >
            ⚠️ Keep the downloaded backup file
            in a safe location.
          </p>

        </div>
      )}

    </div>
  );
}