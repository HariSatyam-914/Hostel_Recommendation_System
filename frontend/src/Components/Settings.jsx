import React, {
  useEffect,
  useRef,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Images,
  MessageSquare,
  Star,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  UserCircle,
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  LockKeyhole,
  Mail,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  Save,
  KeyRound,
  BellRing,
  ClipboardCheck,
  Headphones
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

const arr = (v) =>
  Array.isArray(v) ? v : [];

const first = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const SidebarLabel = ({ label }) => (
  <p className="px-3 mb-2 mt-5 text-[10px] font-bold tracking-[0.14em] text-slate-400">
    {label}
  </p>
);

const SidebarItem = ({
  icon,
  label,
  active,
  badge,
  onClick
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition ${
      active
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    <span
      className={
        active
          ? "text-blue-600"
          : "text-slate-500"
      }
    >
      {icon}
    </span>

    <span className="flex-1 text-left">
      {label}
    </span>

    {badge ? (
      <span className="min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
        {badge}
      </span>
    ) : null}
  </button>
);

const SettingCard = ({
  title,
  description,
  icon,
  children
}) => (
  <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-200">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
        ) : null}

        <div>
          <h3 className="font-semibold text-base text-slate-800">
            {title}
          </h3>

          {description ? (
            <p className="text-xs text-slate-500 mt-1">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>

    <div className="p-5">
      {children}
    </div>
  </section>
);

const SettingRow = ({
  icon,
  title,
  description,
  children
}) => (
  <div className="flex items-center justify-between gap-5 py-4 border-b border-slate-100 last:border-b-0">
    <div className="flex items-center gap-3 min-w-0">
      {icon ? (
        <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
      ) : null}

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        {description ? (
          <p className="text-xs text-slate-500 mt-0.5">
            {description}
          </p>
        ) : null}
      </div>
    </div>

    <div className="shrink-0">
      {children}
    </div>
  </div>
);

const StatusBadge = ({
  verified,
  label
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
      verified
        ? "bg-emerald-50 text-emerald-700"
        : "bg-amber-50 text-amber-700"
    }`}
  >
    {verified ? (
      <CheckCircle2 size={13} />
    ) : (
      <AlertTriangle size={13} />
    )}

    {label}
  </span>
);

const Toggle = ({
  checked,
  onChange
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() =>
      onChange(!checked)
    }
    className={`relative w-11 h-6 rounded-full transition ${
      checked
        ? "bg-blue-600"
        : "bg-slate-300"
    }`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition ${
        checked
          ? "left-[22px]"
          : "left-0.5"
      }`}
    />
  </button>
);

const Settings = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [menu, setMenu] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [data, setData] =
    useState(null);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [profileEdit, setProfileEdit] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [savingNotifications, setSavingNotifications] =
    useState(false);

  const [deletingAccount, setDeletingAccount] =
    useState(false);

  const [notifications, setNotifications] =
    useState({
      enquiries: true,
      issues: true,
      reviews: true,
      approvals: true
    });

  const [profile, setProfile] =
    useState({
      name: "",
      email: "",
      phone: ""
    });

  const [passwordData, setPasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const nav = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const logout = () => {
    [
      "token",
      "jwtToken",
      "accessToken",
      "user",
      "userData",
      "role",
      "admin",
      "hostelId"
    ].forEach((key) =>
      localStorage.removeItem(key)
    );

    [
      "token",
      "jwtToken",
      "accessToken",
      "user",
      "userData",
      "role"
    ].forEach((key) =>
      sessionStorage.removeItem(key)
    );

    navigate("/");
  };

  /* =========================================================
     LOAD SETTINGS DATA
     ========================================================= */
  useEffect(() => {
    const loadSettingsData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            localStorage.getItem(
              "token"
            );

          const authHeaders = {
            Accept: "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`
                }
              : {})
          };

          const response = await fetch(
            `${API_BASE_URL}/api/owner/dashboard`,
            {
              headers: authHeaders
            }
          );

          if (!response.ok) {
            throw new Error(
              `Unable to load settings data (${response.status})`
            );
          }

          const result =
            await response.json();

          setData(result);

          const owner =
            result?.owner ||
            result?.data?.owner ||
            {};

          setProfile({
            name:
              first(
                owner.name,
                owner.fullName,
                owner.ownerName,
                owner.username
              ) || "",
            email:
              first(
                owner.email,
                owner.emailAddress
              ) || "",
            phone:
              first(
                owner.phone,
                owner.phoneNumber,
                owner.mobile,
                owner.mobileNumber
              ) || ""
          });

          /* ---------------------------------------------------
             LOAD NOTIFICATION PREFERENCES (if available)
             --------------------------------------------------- */
          try {
            const notifRes = await fetch(
              `${API_BASE_URL}/api/owner/settings/notifications`,
              { headers: authHeaders }
            );

            if (notifRes.ok) {
              const notifData =
                await notifRes.json();

              const source =
                notifData?.data ||
                notifData ||
                {};

              setNotifications({
                enquiries:
                  source.enquiries ?? true,
                issues:
                  source.issues ?? true,
                reviews:
                  source.reviews ?? true,
                approvals:
                  source.approvals ?? true
              });
            }
          } catch (notifErr) {
            console.warn(
              "Notification preferences not available from backend:",
              notifErr
            );
          }
        } catch (err) {
          console.error(
            "Failed to load settings:",
            err
          );

          setError(
            "Unable to load settings data. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };

    loadSettingsData();
  }, []);

  const owner =
    data?.owner ||
    data?.data?.owner ||
    {};

  const hostel =
    data?.hostel ||
    data?.data?.hostel ||
    {};

  const ownerName =
    first(
      profile.name,
      owner.name,
      owner.fullName,
      owner.ownerName,
      owner.username
    ) || "Hostel Owner";

  const hostelName =
    first(
      hostel.name,
      hostel.hostelName
    ) || "Your Hostel";

  const hostelId =
    first(
      hostel.hostelId,
      hostel.id,
      data?.hostelId,
      data?.data?.hostelId
    );

  const hostelStatus =
    first(
      hostel.status,
      data?.status,
      data?.data?.status
    ) || "—";

  const emailVerified =
    first(
      owner.emailVerified,
      owner.emailVerifiedStatus,
      owner.emailVerificationStatus,
      data?.emailVerified,
      data?.data?.emailVerified
    );

  const location = [
    hostel.area,
    hostel.city,
    hostel.state
  ]
    .filter(Boolean)
    .join(", ");

  /* =========================================================
     SAVE PROFILE (real API)
     ========================================================= */
  const handleProfileSave =
    async () => {
      if (!profile.name.trim()) {
        setError("Owner name cannot be empty.");
        return;
      }

      try {
        setSavingProfile(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/owner/profile`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`
                  }
                : {})
            },
            body: JSON.stringify({
              name: profile.name.trim(),
              phone: profile.phone.trim()
            })
          }
        );

        const responseText =
          await response.text();

        let result = null;

        try {
          result = responseText
            ? JSON.parse(responseText)
            : null;
        } catch {
          result = responseText;
        }

        if (!response.ok) {
          throw new Error(
            (typeof result === "string"
              ? result
              : result?.message ||
                result?.error) ||
              `Unable to save profile (${response.status})`
          );
        }

        setProfileEdit(false);
        setSuccessMessage(
          "Owner profile updated successfully."
        );
      } catch (err) {
        console.error(
          "Failed to save profile:",
          err
        );

        setError(
          err?.message ||
            "Unable to save profile. Please try again."
        );
      } finally {
        setSavingProfile(false);
      }
    };

  /* =========================================================
     CHANGE PASSWORD (real API)
     ========================================================= */
  const handlePasswordChange =
    async (event) => {
      event.preventDefault();

      setPasswordError("");

      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        setPasswordError(
          "Please fill in all password fields."
        );
        return;
      }

      if (
        passwordData.newPassword !==
        passwordData.confirmPassword
      ) {
        setPasswordError(
          "New passwords do not match."
        );
        return;
      }

      if (
        passwordData.newPassword.length < 6
      ) {
        setPasswordError(
          "New password must be at least 6 characters."
        );
        return;
      }

      try {
        setSavingPassword(true);

        const token =
          localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/owner/profile/password`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`
                  }
                : {})
            },
            body: JSON.stringify({
              currentPassword:
                passwordData.currentPassword,
              newPassword:
                passwordData.newPassword
            })
          }
        );

        const responseText =
          await response.text();

        let result = null;

        try {
          result = responseText
            ? JSON.parse(responseText)
            : null;
        } catch {
          result = responseText;
        }

        if (!response.ok) {
          throw new Error(
            (typeof result === "string"
              ? result
              : result?.message ||
                result?.error) ||
              `Unable to change password (${response.status})`
          );
        }

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });

        setShowPasswordModal(false);
        setSuccessMessage(
          "Password updated successfully."
        );
      } catch (err) {
        console.error(
          "Failed to change password:",
          err
        );

        setPasswordError(
          err?.message ||
            "Unable to change password. Please try again."
        );
      } finally {
        setSavingPassword(false);
      }
    };

  /* =========================================================
     NOTIFICATION PREFERENCES (save to backend)
     ========================================================= */
  const toggleNotification =
    async (key) => {
      const next = {
        ...notifications,
        [key]: !notifications[key]
      };

      setNotifications(next);
      setSavingNotifications(true);
      setError("");

      try {
        const token =
          localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/owner/settings/notifications`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`
                  }
                : {})
            },
            body: JSON.stringify(next)
          }
        );

        if (!response.ok) {
          const responseText =
            await response.text();

          let result = null;

          try {
            result = responseText
              ? JSON.parse(responseText)
              : null;
          } catch {
            result = responseText;
          }

          throw new Error(
            (typeof result === "string"
              ? result
              : result?.message ||
                result?.error) ||
              `Unable to save notification preferences (${response.status})`
          );
        }
      } catch (err) {
        console.error(
          "Failed to save notification preferences:",
          err
        );

        /* Roll back the UI toggle */
        setNotifications(
          notifications
        );

        setError(
          err?.message ||
            "Unable to save notification preferences."
        );
      } finally {
        setSavingNotifications(false);
      }
    };

  /* =========================================================
     DELETE ACCOUNT (real API)
     ========================================================= */
  const handleDeleteAccount =
    async () => {
      try {
        setDeletingAccount(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/owner/account`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`
                  }
                : {})
            }
          }
        );

        const responseText =
          await response.text();

        let result = null;

        try {
          result = responseText
            ? JSON.parse(responseText)
            : null;
        } catch {
          result = responseText;
        }

        if (!response.ok) {
          throw new Error(
            (typeof result === "string"
              ? result
              : result?.message ||
                result?.error) ||
              `Unable to delete account (${response.status})`
          );
        }

        setShowDeleteModal(false);

        /* Clear all auth data and redirect */
        logout();
      } catch (err) {
        console.error(
          "Failed to delete account:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete account. Please try again."
        );

        setShowDeleteModal(false);
      } finally {
        setDeletingAccount(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-7 h-7 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />

          <p className="text-sm">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[250px] border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="h-[72px] flex items-center px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-blue-700 leading-none">
                FindMyHostel
              </h1>

              <p className="text-[10px] font-semibold tracking-wider text-slate-500 mt-1">
                OWNER PORTAL
              </p>
            </div>
          </div>

          <button
            className="ml-auto lg:hidden p-2 text-slate-500"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 py-5 overflow-y-auto h-[calc(100vh-72px)]">
          <SidebarLabel label="MAIN" />

          <SidebarItem
            icon={
              <LayoutDashboard size={18} />
            }
            label="Dashboard"
            onClick={() =>
              nav("/owner/dashboard")
            }
          />

          <SidebarLabel label="MY HOSTEL" />

          <SidebarItem
            icon={
              <Building2 size={18} />
            }
            label="Hostel Profile"
            onClick={() =>
              nav("/owner/hostel")
            }
          />

          <SidebarItem
            icon={
              <BedDouble size={18} />
            }
            label="Rooms"
            onClick={() =>
              nav("/owner/rooms")
            }
          />

          <SidebarItem
            icon={
              <SettingsIcon size={18} />
            }
            label="Amenities"
            onClick={() =>
              nav("/owner/amenities")
            }
          />

          <SidebarItem
            icon={<Images size={18} />}
            label="Photos"
            onClick={() =>
              nav("/owner/photos")
            }
          />

          <SidebarLabel label="DISCOVERY" />

          <SidebarItem
            icon={
              <MessageSquare size={18} />
            }
            label="Issues"
            onClick={() =>
              nav("/owner/issues")
            }
          />

          <SidebarItem
            icon={<Star size={18} />}
            label="Reviews"
            onClick={() =>
              nav("/owner/reviews")
            }
          />

          <SidebarLabel label="INSIGHTS" />

          <SidebarItem
            icon={
              <BarChart3 size={18} />
            }
            label="Analytics"
            onClick={() =>
              nav("/owner/analytics")
            }
          />

          <SidebarLabel label="ACCOUNT" />

          <SidebarItem
            icon={
              <SettingsIcon size={18} />
            }
            label="Settings"
            active
            onClick={() =>
              nav("/owner/settings")
            }
          />

          {/* Support added under Settings */}
          <SidebarItem
            icon={
              <Headphones size={18} />
            }
            label="Support"
            onClick={() =>
              nav("/owner/support")
            }
          />

          <div className="mt-8 pt-5 border-t border-slate-100">
            <button
              onClick={() =>
                nav("/hostel")
              }
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              View Public Listing
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-[250px] h-screen flex flex-col overflow-hidden">
        <header className="h-[72px] flex-shrink-0 bg-white border-b border-slate-200 px-5 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Hostel Owner Portal
              </p>

              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-sm font-semibold text-slate-800">
                  {hostelName}
                </h2>

                {location ? (
                  <>
                    <span className="text-slate-300">
                      /
                    </span>

                    <span className="text-xs text-slate-500">
                      {location}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center">
              <Bell size={18} />
            </button>

            <div
              className="relative"
              ref={menuRef}
            >
              <button
                onClick={() =>
                  setMenu(
                    (value) => !value
                  )
                }
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                  <UserCircle size={20} />
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800">
                    {ownerName}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Hostel Owner
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className="text-slate-400"
                />
              </button>

              {menu ? (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() =>
                      nav(
                        "/owner/settings"
                      )
                    }
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                  >
                    Account Settings
                  </button>

                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 border-t text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-[1200px] mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>My Hostel</span>

                <span className="text-slate-300">
                  /
                </span>

                <span className="text-slate-700 font-medium">
                  Settings
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight mt-2">
                Settings
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage your account, hostel preferences and security.
              </p>
            </div>

            {successMessage ? (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex gap-3">
                <CheckCircle2
                  size={18}
                  className="text-emerald-600 shrink-0"
                />

                <p className="text-sm text-emerald-800">
                  {successMessage}
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex gap-3">
                <AlertTriangle
                  size={18}
                  className="text-rose-600 shrink-0"
                />

                <p className="text-sm text-rose-800">
                  {error}
                </p>
              </div>
            ) : null}

            <div className="space-y-5">
              <SettingCard
                title="Account Settings"
                description="Manage your personal owner profile information."
                icon={<User size={18} />}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <UserCircle size={42} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {profileEdit ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Name
                          </label>

                          <input
                            type="text"
                            value={
                              profile.name
                            }
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                name: e.target
                                  .value
                              })
                            }
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Phone
                          </label>

                          <input
                            type="text"
                            value={
                              profile.phone
                            }
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                phone: e.target
                                  .value
                              })
                            }
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Email
                          </label>

                          <input
                            type="email"
                            value={
                              profile.email
                            }
                            readOnly
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 outline-none"
                          />

                          <p className="text-[11px] text-slate-400 mt-1.5">
                            Email changes should be handled through email verification.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {ownerName}
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 mt-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail size={14} />
                            <span>
                              {profile.email ||
                                "Email not available"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone size={14} />
                            <span>
                              {profile.phone ||
                                "Phone not available"}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {profileEdit ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setProfileEdit(
                              false
                            )
                          }
                          className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleProfileSave
                          }
                          disabled={
                            savingProfile
                          }
                          className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-60"
                        >
                          <Save size={14} />

                          {savingProfile
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setProfileEdit(
                            true
                          )
                        }
                        className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                title="Hostel Account"
                description="Information and verification status for your hostel."
                icon={<Building2 size={18} />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div className="py-4 border-b border-slate-100">
                    <p className="text-xs text-slate-500">
                      Hostel Name
                    </p>

                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {hostelName}
                    </p>
                  </div>

                  <div className="py-4 border-b border-slate-100">
                    <p className="text-xs text-slate-500">
                      Status
                    </p>

                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                        {String(
                          hostelStatus
                        ).replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="py-4 border-b border-slate-100">
                    <p className="text-xs text-slate-500">
                      Hostel ID
                    </p>

                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {hostelId ||
                        "—"}
                    </p>
                  </div>

                  <div className="py-4 border-b border-slate-100">
                    <p className="text-xs text-slate-500">
                      Owner Verification
                    </p>

                    <div className="mt-1">
                      {emailVerified ===
                      true ? (
                        <StatusBadge
                          verified
                          label="Verified"
                        />
                      ) : emailVerified ===
                        false ? (
                        <StatusBadge
                          verified={false}
                          label="Not Verified"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">
                          Verification status unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() =>
                      nav("/owner/hostel")
                    }
                    className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2"
                  >
                    <Eye size={14} />
                    View Hostel Profile
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      nav(
                        "/owner/hostel"
                      )
                    }
                    className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit Hostel Details
                  </button>
                </div>
              </SettingCard>

              <SettingCard
                title="Security"
                description="Manage your account security and authentication."
                icon={<ShieldCheck size={18} />}
              >
                <div>
                  <SettingRow
                    icon={<Mail size={17} />}
                    title="Email Address"
                    description={
                      profile.email ||
                      "Email address not available"
                    }
                  >
                    {emailVerified ===
                    true ? (
                      <StatusBadge
                        verified
                        label="Verified"
                      />
                    ) : (
                      <StatusBadge
                        verified={false}
                        label="Not Verified"
                      />
                    )}
                  </SettingRow>

                  <SettingRow
                    icon={
                      <LockKeyhole size={17} />
                    }
                    title="Password"
                    description="Change the password used to sign in."
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordModal(
                          true
                        )
                      }
                      className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <KeyRound
                        size={14}
                      />
                      Change
                    </button>
                  </SettingRow>

                  <SettingRow
                    icon={
                      <ShieldCheck size={17} />
                    }
                    title="Login Security"
                    description="Your account is protected by authenticated owner access."
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2
                        size={14}
                      />
                      Active
                    </span>
                  </SettingRow>
                </div>
              </SettingCard>

              <SettingCard
                title="Notifications"
                description="Choose which owner portal updates you want to receive."
                icon={<BellRing size={18} />}
              >
                <div>
                  <SettingRow
                    icon={
                      <MessageSquare
                        size={17}
                      />
                    }
                    title="New Enquiries"
                    description="Receive notifications when a new enquiry is submitted."
                  >
                    <Toggle
                      checked={
                        notifications.enquiries
                      }
                      onChange={() =>
                        toggleNotification(
                          "enquiries"
                        )
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    icon={
                      <AlertTriangle
                        size={17}
                      />
                    }
                    title="Issue Updates"
                    description="Receive updates when hostel issues are created or changed."
                  >
                    <Toggle
                      checked={
                        notifications.issues
                      }
                      onChange={() =>
                        toggleNotification(
                          "issues"
                        )
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    icon={
                      <Star size={17} />
                    }
                    title="New Reviews"
                    description="Receive notifications when users submit reviews."
                  >
                    <Toggle
                      checked={
                        notifications.reviews
                      }
                      onChange={() =>
                        toggleNotification(
                          "reviews"
                        )
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    icon={
                      <ClipboardCheck
                        size={17}
                      />
                    }
                    title="Approval Updates"
                    description="Receive important updates about hostel approval and verification."
                  >
                    <Toggle
                      checked={
                        notifications.approvals
                      }
                      onChange={() =>
                        toggleNotification(
                          "approvals"
                        )
                      }
                    />
                  </SettingRow>
                </div>
              </SettingCard>

              <section className="bg-white border border-rose-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/40">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertTriangle
                        size={18}
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-base text-rose-800">
                        Danger Zone
                      </h3>

                      <p className="text-xs text-rose-600 mt-1">
                        These actions affect your account access and should be used carefully.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Log out from this device
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        End your current owner session.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={logout}
                      className="h-9 px-4 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>

                  <div className="border-t border-slate-100 my-3" />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Delete account
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Permanently remove your owner account and associated data.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowDeleteModal(
                          true
                        )
                      }
                      className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {showPasswordModal ? (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-5">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Change Password
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Enter your current password and choose a new one.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPasswordModal(
                    false
                  )
                }
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                handlePasswordChange
              }
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Current Password
                </label>

                <input
                  type="password"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword:
                        e.target.value
                    })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  New Password
                </label>

                <input
                  type="password"
                  value={
                    passwordData.newPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword:
                        e.target.value
                    })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword:
                        e.target.value
                    })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {passwordError ? (
                <p className="text-xs text-rose-600">
                  {passwordError}
                </p>
              ) : passwordData.confirmPassword &&
                passwordData.newPassword !==
                  passwordData.confirmPassword ? (
                <p className="text-xs text-rose-600">
                  New passwords do not match.
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordModal(
                      false
                    )
                  }
                  className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingPassword ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword ||
                    passwordData.newPassword !==
                      passwordData.confirmPassword
                  }
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showDeleteModal ? (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-5">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200">
            <div className="p-5">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 size={21} />
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mt-4">
                Delete Account?
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                This action is permanent. Your owner account and associated hostel data may be removed and cannot be recovered.
              </p>

              <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs text-rose-700">
                  Deleting your account will remove your access to the owner portal.
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                  className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleDeleteAccount
                  }
                  disabled={deletingAccount}
                  className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {deletingAccount
                    ? "Deleting..."
                    : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Settings;