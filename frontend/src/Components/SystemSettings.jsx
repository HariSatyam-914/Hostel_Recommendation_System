import React, { useState } from "react";
import {
  Settings,
  Globe,
  Bell,
  ShieldCheck,
  Users,
  Building2,
  Mail,
  Image,
  Database,
  Save,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Clock,
  MessageSquare,
  BarChart3,
  CreditCard,
  FileText,
  HelpCircle,
  UserCircle,
  ChevronDown,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Activity,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const SystemSettings = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    // General
    platformName: "HostelHub",
    supportEmail: "support@hostelhub.com",
    supportPhone: "+91 98765 43210",
    defaultCity: "Hyderabad",
    timezone: "Asia/Kolkata",
    currency: "INR",

    // Notifications
    ownerRegistrationNotification: true,
    hostelApprovalNotification: true,
    hostelApprovedNotification: true,
    hostelRejectedNotification: true,
    otpNotification: true,
    passwordResetNotification: true,
    adminApprovalNotification: true,
    adminRejectedNotification: true,
    ownerVerificationNotification: true,
    pushNotifications: false,

    // Security
    adminSessionTimeout: "30",
    ownerSessionTimeout: "60",
    passwordMinLength: "8",
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    maxFailedAttempts: "5",
    accountLockDuration: "15",
    adminTwoFactor: false,

    // Users
    allowOwnerRegistration: true,
    allowUserRegistration: true,
    emailVerificationRequired: true,
    allowAccountDeletion: false,

    // Approval
    hostelApprovalRequired: true,
    ownerEmailVerificationRequired: true,
    allowEditingAfterSubmit: false,
    autoPublishAfterApproval: false,
    requireHostelPhotos: true,
    requireRoomInformation: true,
    requireOwnerVerification: true,
    requireLocationVerification: true,

    // Email & OTP
    senderName: "HostelHub Admin",
    senderEmail: "noreply@hostelhub.com",
    otpLength: "6",
    otpExpiry: "5",
    otpResendCooldown: "60",
    otpMaxAttempts: "5",

    // Moderation
    requireHostelPhotoVerification: true,
    requireAmenityPhotoVerification: true,
    requireRoomPhotoVerification: true,
    allowOwnerResubmit: true,
    requireRejectionReason: true,

    // Backup
    automaticBackup: true,
    backupFrequency: "Daily",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    console.log("System Settings:", settings);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* =========================================================
     ADMIN SIDEBAR NAVIGATION
     ========================================================= */

  const managementItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      label: "Hostel Requests",
      icon: Building2,
      path: "/admin/hostel-management",
    },
    {
      label: "Pending Approvals",
      icon: Clock,
      path: "/admin/pending-approvals",
    },
    {
      label: "User Issues",
      icon: MessageSquare,
      path: "/admin/user-issues",
    },
    {
      label: "Owner Verification",
      icon: ShieldCheck,
      path: "/admin/owner-verification",
    },
  ];

  const analyticsItems = [
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      label: "Subscription",
      icon: CreditCard,
      path: "/admin/subscription",
    },
    {
      label: "Reports",
      icon: FileText,
      path: "/admin/reports",
    },
  ];

  const systemItems = [
    {
      label: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      label: "System Settings",
      icon: Settings,
      path: "/admin/settings",
      active: true,
    },
    {
      label: "Audit Logs",
      icon: Activity,
      path: "/admin/audit-logs",
      active: false,
    },
  ];

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    setProfileOpen(false);

    if (path) {
      navigate(path);
    }
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <button
        key={item.label}
        type="button"
        onClick={() => handleNavigation(item.path)}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
          item.active
            ? "bg-[#2161F5] text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <Icon
          size={17}
          strokeWidth={1.8}
          className={
            item.active
              ? "text-white"
              : "text-gray-500 group-hover:text-gray-800"
          }
        />

        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const menuItems = [
    {
      id: "general",
      label: "General",
      icon: Globe,
      description: "Basic platform settings",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Notification preferences",
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldCheck,
      description: "Security and login rules",
    },
    {
      id: "users",
      label: "Users & Roles",
      icon: Users,
      description: "Registration and access",
    },
    {
      id: "approval",
      label: "Hostel Approval",
      icon: Building2,
      description: "Approval workflow",
    },
    {
      id: "email",
      label: "Email & OTP",
      icon: Mail,
      description: "Email and verification",
    },
    {
      id: "moderation",
      label: "Moderation",
      icon: Image,
      description: "Content verification",
    },
    {
      id: "backup",
      label: "Backup & Data",
      icon: Database,
      description: "Backup and data management",
    },
  ];

  const renderSectionHeader = (title, description) => (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );

  const renderInput = ({
    label,
    value,
    onChange,
    placeholder = "",
    type = "text",
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );

  const renderSelect = ({ label, value, onChange, options }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-indigo-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  const SettingToggle = ({
    title,
    description,
    value,
    onChange,
  }) => (
    <div className="flex items-center justify-between gap-5 rounded-lg border border-gray-200 bg-white px-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>

        {description && (
          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>

      <Toggle checked={value} onChange={onChange} />
    </div>
  );

  const renderGeneral = () => (
    <div>
      {renderSectionHeader(
        "General Settings",
        "Manage the basic configuration of your hostel platform."
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {renderInput({
          label: "Platform Name",
          value: settings.platformName,
          onChange: (value) =>
            handleChange("platformName", value),
        })}

        {renderInput({
          label: "Support Email",
          value: settings.supportEmail,
          onChange: (value) =>
            handleChange("supportEmail", value),
          type: "email",
        })}

        {renderInput({
          label: "Support Phone",
          value: settings.supportPhone,
          onChange: (value) =>
            handleChange("supportPhone", value),
        })}

        {renderInput({
          label: "Default City",
          value: settings.defaultCity,
          onChange: (value) =>
            handleChange("defaultCity", value),
        })}

        {renderSelect({
          label: "Time Zone",
          value: settings.timezone,
          onChange: (value) =>
            handleChange("timezone", value),
          options: [
            {
              value: "Asia/Kolkata",
              label: "India Standard Time",
            },
            {
              value: "Asia/Dubai",
              label: "Gulf Standard Time",
            },
            {
              value: "Asia/Singapore",
              label: "Singapore Time",
            },
          ],
        })}

        {renderSelect({
          label: "Currency",
          value: settings.currency,
          onChange: (value) =>
            handleChange("currency", value),
          options: [
            {
              value: "INR",
              label: "Indian Rupee (₹)",
            },
            {
              value: "USD",
              label: "US Dollar ($)",
            },
            {
              value: "EUR",
              label: "Euro (€)",
            },
          ],
        })}
      </div>

      <div className="mt-7">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Platform Access
        </h3>

        <div className="space-y-3">
          <SettingToggle
            title="Maintenance Mode"
            description="Temporarily disable access to the platform."
            value={false}
            onChange={() => {}}
          />

          <SettingToggle
            title="Allow Owner Registration"
            description="Allow new hostel owners to create accounts."
            value={settings.allowOwnerRegistration}
            onChange={(value) =>
              handleChange("allowOwnerRegistration", value)
            }
          />

          <SettingToggle
            title="Allow User Registration"
            description="Allow new students and professionals to register."
            value={settings.allowUserRegistration}
            onChange={(value) =>
              handleChange("allowUserRegistration", value)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div>
      {renderSectionHeader(
        "Notification Settings",
        "Control which notifications are sent to users, owners and administrators."
      )}

      <div className="space-y-3">
        <SettingToggle
          title="Owner Registration"
          description="Notify administrators when a new owner registers."
          value={settings.ownerRegistrationNotification}
          onChange={(value) =>
            handleChange(
              "ownerRegistrationNotification",
              value
            )
          }
        />

        <SettingToggle
          title="Hostel Submitted for Approval"
          description="Notify admins when an owner submits a hostel."
          value={settings.hostelApprovalNotification}
          onChange={(value) =>
            handleChange(
              "hostelApprovalNotification",
              value
            )
          }
        />

        <SettingToggle
          title="Hostel Approved"
          description="Notify owners when their hostel is approved."
          value={settings.hostelApprovedNotification}
          onChange={(value) =>
            handleChange(
              "hostelApprovedNotification",
              value
            )
          }
        />

        <SettingToggle
          title="Hostel Rejected"
          description="Notify owners when a hostel is rejected."
          value={settings.hostelRejectedNotification}
          onChange={(value) =>
            handleChange(
              "hostelRejectedNotification",
              value
            )
          }
        />

        <SettingToggle
          title="Owner Email OTP"
          description="Send OTP notifications for owner email verification."
          value={settings.otpNotification}
          onChange={(value) =>
            handleChange("otpNotification", value)
          }
        />

        <SettingToggle
          title="Password Reset"
          description="Send email notifications during password reset."
          value={settings.passwordResetNotification}
          onChange={(value) =>
            handleChange(
              "passwordResetNotification",
              value
            )
          }
        />

        <SettingToggle
          title="Push Notifications"
          description="Enable browser or application push notifications."
          value={settings.pushNotifications}
          onChange={(value) =>
            handleChange("pushNotifications", value)
          }
        />
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div>
      {renderSectionHeader(
        "Security Settings",
        "Configure login protection, passwords and session security."
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {renderSelect({
          label: "Admin Session Timeout",
          value: settings.adminSessionTimeout,
          onChange: (value) =>
            handleChange("adminSessionTimeout", value),
          options: [
            {
              value: "15",
              label: "15 Minutes",
            },
            {
              value: "30",
              label: "30 Minutes",
            },
            {
              value: "60",
              label: "1 Hour",
            },
            {
              value: "120",
              label: "2 Hours",
            },
          ],
        })}

        {renderSelect({
          label: "Owner Session Timeout",
          value: settings.ownerSessionTimeout,
          onChange: (value) =>
            handleChange("ownerSessionTimeout", value),
          options: [
            {
              value: "30",
              label: "30 Minutes",
            },
            {
              value: "60",
              label: "1 Hour",
            },
            {
              value: "120",
              label: "2 Hours",
            },
            {
              value: "240",
              label: "4 Hours",
            },
          ],
        })}

        {renderInput({
          label: "Minimum Password Length",
          value: settings.passwordMinLength,
          onChange: (value) =>
            handleChange("passwordMinLength", value),
          type: "number",
        })}

        {renderInput({
          label: "Maximum Failed Login Attempts",
          value: settings.maxFailedAttempts,
          onChange: (value) =>
            handleChange("maxFailedAttempts", value),
          type: "number",
        })}

        {renderInput({
          label: "Account Lock Duration (minutes)",
          value: settings.accountLockDuration,
          onChange: (value) =>
            handleChange("accountLockDuration", value),
          type: "number",
        })}
      </div>

      <div className="mt-7 space-y-3">
        <SettingToggle
          title="Require Uppercase Character"
          description="Passwords must contain at least one uppercase letter."
          value={settings.requireUppercase}
          onChange={(value) =>
            handleChange("requireUppercase", value)
          }
        />

        <SettingToggle
          title="Require Number"
          description="Passwords must contain at least one number."
          value={settings.requireNumber}
          onChange={(value) =>
            handleChange("requireNumber", value)
          }
        />

        <SettingToggle
          title="Require Special Character"
          description="Passwords must contain at least one special character."
          value={settings.requireSpecialChar}
          onChange={(value) =>
            handleChange("requireSpecialChar", value)
          }
        />

        <SettingToggle
          title="Admin Two-Factor Authentication"
          description="Require additional verification when admins log in."
          value={settings.adminTwoFactor}
          onChange={(value) =>
            handleChange("adminTwoFactor", value)
          }
        />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      {renderSectionHeader(
        "Users & Roles",
        "Manage account registration and verification rules."
      )}

      <div className="space-y-3">
        <SettingToggle
          title="Allow User Registration"
          description="Allow students and professionals to create accounts."
          value={settings.allowUserRegistration}
          onChange={(value) =>
            handleChange("allowUserRegistration", value)
          }
        />

        <SettingToggle
          title="Allow Owner Registration"
          description="Allow owners to register and list hostels."
          value={settings.allowOwnerRegistration}
          onChange={(value) =>
            handleChange("allowOwnerRegistration", value)
          }
        />

        <SettingToggle
          title="Email Verification Required"
          description="Require users to verify their email address."
          value={settings.emailVerificationRequired}
          onChange={(value) =>
            handleChange(
              "emailVerificationRequired",
              value
            )
          }
        />

        <SettingToggle
          title="Allow Account Deletion"
          description="Allow users to permanently delete their accounts."
          value={settings.allowAccountDeletion}
          onChange={(value) =>
            handleChange("allowAccountDeletion", value)
          }
        />
      </div>
    </div>
  );

  const renderApproval = () => (
    <div>
      {renderSectionHeader(
        "Hostel Approval",
        "Configure the workflow used for reviewing hostel listings."
      )}

      <div className="space-y-3">
        <SettingToggle
          title="Admin Approval Required"
          description="Every hostel must be reviewed by an administrator."
          value={settings.hostelApprovalRequired}
          onChange={(value) =>
            handleChange("hostelApprovalRequired", value)
          }
        />

        <SettingToggle
          title="Owner Email Verification Required"
          description="Owner must verify their email before publishing."
          value={settings.ownerEmailVerificationRequired}
          onChange={(value) =>
            handleChange(
              "ownerEmailVerificationRequired",
              value
            )
          }
        />

        <SettingToggle
          title="Require Hostel Photos"
          description="A hostel must contain approved photos."
          value={settings.requireHostelPhotos}
          onChange={(value) =>
            handleChange("requireHostelPhotos", value)
          }
        />

        <SettingToggle
          title="Require Room Information"
          description="Room information must be completed before approval."
          value={settings.requireRoomInformation}
          onChange={(value) =>
            handleChange(
              "requireRoomInformation",
              value
            )
          }
        />

        <SettingToggle
          title="Require Owner Verification"
          description="Owner identity or contact verification is required."
          value={settings.requireOwnerVerification}
          onChange={(value) =>
            handleChange(
              "requireOwnerVerification",
              value
            )
          }
        />

        <SettingToggle
          title="Require Location Verification"
          description="Hostel location must be verified during review."
          value={settings.requireLocationVerification}
          onChange={(value) =>
            handleChange(
              "requireLocationVerification",
              value
            )
          }
        />

        <SettingToggle
          title="Allow Editing After Submission"
          description="Allow owners to edit hostel details while pending."
          value={settings.allowEditingAfterSubmit}
          onChange={(value) =>
            handleChange(
              "allowEditingAfterSubmit",
              value
            )
          }
        />

        <SettingToggle
          title="Auto Publish After Approval"
          description="Automatically publish the hostel after admin approval."
          value={settings.autoPublishAfterApproval}
          onChange={(value) =>
            handleChange(
              "autoPublishAfterApproval",
              value
            )
          }
        />
      </div>

      <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
        <p className="text-sm font-semibold text-indigo-900">
          Approval Workflow
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-700">
          {[
            "DRAFT",
            "PENDING",
            "ADMIN REVIEW",
            "APPROVED",
            "EMAIL VERIFIED",
            "PUBLISHED",
          ].map((item, index) => (
            <React.Fragment key={item}>
              <div className="rounded-md bg-white px-3 py-2 shadow-sm">
                {item}
              </div>

              {index < 5 && (
                <ChevronRight
                  size={15}
                  className="text-gray-400"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div>
      {renderSectionHeader(
        "Email & OTP",
        "Configure owner verification and system email settings."
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {renderInput({
          label: "Sender Name",
          value: settings.senderName,
          onChange: (value) =>
            handleChange("senderName", value),
        })}

        {renderInput({
          label: "Sender Email",
          value: settings.senderEmail,
          onChange: (value) =>
            handleChange("senderEmail", value),
          type: "email",
        })}

        {renderInput({
          label: "OTP Length",
          value: settings.otpLength,
          onChange: (value) =>
            handleChange("otpLength", value),
          type: "number",
        })}

        {renderInput({
          label: "OTP Expiry (minutes)",
          value: settings.otpExpiry,
          onChange: (value) =>
            handleChange("otpExpiry", value),
          type: "number",
        })}

        {renderInput({
          label: "Resend Cooldown (seconds)",
          value: settings.otpResendCooldown,
          onChange: (value) =>
            handleChange("otpResendCooldown", value),
          type: "number",
        })}

        {renderInput({
          label: "Maximum OTP Attempts",
          value: settings.otpMaxAttempts,
          onChange: (value) =>
            handleChange("otpMaxAttempts", value),
          type: "number",
        })}
      </div>
    </div>
  );

  const renderModeration = () => (
    <div>
      {renderSectionHeader(
        "Moderation",
        "Control photo verification and content review requirements."
      )}

      <div className="space-y-3">
        <SettingToggle
          title="Hostel Photo Verification"
          description="Every hostel photo must be reviewed by an admin."
          value={settings.requireHostelPhotoVerification}
          onChange={(value) =>
            handleChange(
              "requireHostelPhotoVerification",
              value
            )
          }
        />

        <SettingToggle
          title="Amenity Photo Verification"
          description="Amenity photos require admin approval."
          value={settings.requireAmenityPhotoVerification}
          onChange={(value) =>
            handleChange(
              "requireAmenityPhotoVerification",
              value
            )
          }
        />

        <SettingToggle
          title="Room Photo Verification"
          description="Room photos require admin approval."
          value={settings.requireRoomPhotoVerification}
          onChange={(value) =>
            handleChange(
              "requireRoomPhotoVerification",
              value
            )
          }
        />

        <SettingToggle
          title="Allow Owner Resubmission"
          description="Owners can resubmit rejected hostel information."
          value={settings.allowOwnerResubmit}
          onChange={(value) =>
            handleChange(
              "allowOwnerResubmit",
              value
            )
          }
        />

        <SettingToggle
          title="Require Rejection Reason"
          description="Admins must provide a reason when rejecting content."
          value={settings.requireRejectionReason}
          onChange={(value) =>
            handleChange(
              "requireRejectionReason",
              value
            )
          }
        />
      </div>
    </div>
  );

  const renderBackup = () => (
    <div>
      {renderSectionHeader(
        "Backup & Data",
        "Manage database backups and important system data."
      )}

      <div className="space-y-4">
        <SettingToggle
          title="Automatic Database Backup"
          description="Automatically create database backups."
          value={settings.automaticBackup}
          onChange={(value) =>
            handleChange("automaticBackup", value)
          }
        />

        {renderSelect({
          label: "Backup Frequency",
          value: settings.backupFrequency,
          onChange: (value) =>
            handleChange("backupFrequency", value),
          options: [
            {
              value: "Hourly",
              label: "Every Hour",
            },
            {
              value: "Daily",
              label: "Daily",
            },
            {
              value: "Weekly",
              label: "Weekly",
            },
            {
              value: "Monthly",
              label: "Monthly",
            },
          ],
        })}

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <Database
              size={18}
              className="mt-0.5 text-gray-500"
            />

            <div>
              <p className="text-sm font-medium text-gray-800">
                Last Backup
              </p>

              <p className="mt-1 text-xs text-gray-500">
                September 7, 2026 · 02:00 AM
              </p>
            </div>

            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
              <CheckCircle2 size={13} />
              Successful
            </span>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Backup Now
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneral();

      case "notifications":
        return renderNotifications();

      case "security":
        return renderSecurity();

      case "users":
        return renderUsers();

      case "approval":
        return renderApproval();

      case "email":
        return renderEmail();

      case "moderation":
        return renderModeration();

      case "backup":
        return renderBackup();

      default:
        return renderGeneral();
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-gray-900">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          LEFT ADMIN SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}

        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2161F5] text-white shadow-sm">
              <Building2 size={18} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-gray-900">
                HostelHub
              </p>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Admin Portal
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* =================================================
            FIX:
            Navigation area is independently scrollable.
            Audit Logs remains visible/accessible.
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">

          {/* Management */}

          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
            Management
          </p>

          <div className="space-y-1">
            {managementItems.map(renderNavItem)}
          </div>

          {/* Analytics */}

          <p className="mb-2 mt-7 px-2 text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
            Analytics & Reports
          </p>

          <div className="space-y-1">
            {analyticsItems.map(renderNavItem)}
          </div>

          {/* System */}

          <p className="mb-2 mt-7 px-2 text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
            System
          </p>

          <div className="space-y-1">
            {systemItems.map(renderNavItem)}
          </div>

        </div>

        {/* Bottom navigation */}

        <div className="shrink-0 border-t border-gray-100 bg-white p-3">

          <button
            onClick={() =>
              handleNavigation("/admin/reports")
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <FileText size={17} />
            Generate Reports
          </button>

          <button
            onClick={() =>
              handleNavigation("/admin/user-issues")
            }
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <HelpCircle size={17} />
            Help Center
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("adminToken");
              navigate("");
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="lg:pl-[240px]">

        {/* =====================================================
            ADMIN HEADER
        ===================================================== */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900">
                  System Settings
                </h1>

                <span className="hidden rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 sm:inline-flex">
                  ADMIN
                </span>
              </div>

              <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">
                Manage platform configuration and administrative preferences
              </p>
            </div>

          </div>

          {/* Header right */}

          <div className="flex items-center gap-2">

            <button
              type="button"
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-50"
            >
              <Bell size={18} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <UserCircle size={18} />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-gray-800">
                    Admin User
                  </p>

                  <p className="text-xs text-gray-400">
                    Super Admin
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className="text-gray-400"
                />

              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/admin/settings")
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Settings size={15} />
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <ExternalLink size={15} />
                    View Website
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("adminToken");
                      navigate("");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* =====================================================
            EXISTING SYSTEM SETTINGS PAGE
        ===================================================== */}

        <main className="min-h-screen bg-gray-50 p-4 md:p-6">

          {/* Page Header */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Settings
                  size={20}
                  className="text-indigo-600"
                />

                <h1 className="text-xl font-semibold text-gray-900">
                  System Settings
                </h1>

              </div>

              <p className="mt-1 text-sm text-gray-500">
                Manage platform configuration and administrative preferences.
              </p>

            </div>

            <div className="flex items-center gap-2">

              {saved && (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 size={16} />
                  Settings saved
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                <Save size={16} />
                Save Changes
              </button>

            </div>
          </div>

          {/* Main Layout */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">

            {/* Existing Configuration Left Panel */}

            <aside className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">

              <div className="mb-2 px-3 py-2">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Configuration
                </p>

              </div>

              <nav className="space-y-1">

                {menuItems.map((item) => {

                  const Icon = item.icon;

                  const active =
                    activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setActiveTab(item.id)
                      }
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-medium">
                          {item.label}
                        </p>

                        <p
                          className={`mt-0.5 truncate text-xs ${
                            active
                              ? "text-indigo-500"
                              : "text-gray-400"
                          }`}
                        >
                          {item.description}
                        </p>

                      </div>

                    </button>
                  );
                })}

              </nav>

            </aside>

            {/* Right Content */}

            <main className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">

              <div className="p-5 md:p-6">
                {renderContent()}
              </div>

              {/* Bottom Save Bar */}

              <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle size={15} />
                  Changes are applied after saving.
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  <Save size={16} />
                  Save Changes
                </button>

              </div>

            </main>

          </div>

        </main>

      </div>
    </div>
  );
};

export default SystemSettings;