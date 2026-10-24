import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Clock,
  Building2,
  ShieldCheck,
  BarChart3,
  FileText,
  Users,
  Settings,
  History,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Moon,
  Calendar,
  RefreshCw,
  Building,
  Menu,
  MessageSquareWarning,
  Gem,
  Filter,
  Eye,
  MapPin,
  User,
  Flag,
  Ban,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Database,
  ChevronDown,
} from "lucide-react";

const HostelRequest = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  // const [openMenu, setOpenMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [error, setError] = useState("");

  // ============================================================
  // PAGINATION - 10 HOSTEL REQUESTS PER PAGE
  // ============================================================
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // ===================== LOGOUT FUNCTION =====================
  const handleLogout = () => {
    // Remove authentication/token data
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userData");
    localStorage.removeItem("role");
    localStorage.removeItem("admin");

    // Remove session authentication data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("admin");

    // Close profile menu
    setProfileMenuOpen(false);

    // Redirect to login page
    navigate("/", { replace: true });
  };

  const totalHostels = hostels.length;

  const approvedCount = hostels.filter(
    (hostel) => hostel.approvalStatus === "APPROVED"
  ).length;

  const pendingCount = hostels.filter(
    (hostel) => hostel.approvalStatus === "PENDING"
  ).length;

  const flaggedCount = hostels.filter(
    (hostel) => hostel.approvalStatus === "FLAGGED"
  ).length;

  const rejectedCount = hostels.filter(
    (hostel) => hostel.approvalStatus === "REJECTED"
  ).length;

  // ===================== CLOSE PROFILE MENU =====================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================================
  // FETCH HOSTEL REQUESTS
  // ============================================================
  const fetchHostels = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:8080/api/admin/hostels",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHostels(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch hostel requests:", error);
      setError("Failed to load hostel requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  // ============================================================
  // NAVIGATION ITEM
  // ============================================================
  const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 ${
          active ? "text-white" : "text-slate-500"
        }`}
      />
      {sidebarOpen && <span>{label}</span>}
    </button>
  );

  // ============================================================
  // STATUS BADGE
  // ============================================================
  const StatusBadge = ({ status }) => {
    const config = {
      APPROVED: {
        icon: CheckCircle2,
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Approved",
      },
      PENDING: {
        icon: AlertCircle,
        classes: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Pending Review",
      },
      REJECTED: {
        icon: XCircle,
        classes: "bg-rose-50 text-rose-700 border-rose-200",
        label: "Rejected",
      },
      FLAGGED: {
        icon: Flag,
        classes: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Flagged",
      },
      SUSPENDED: {
        icon: Ban,
        classes: "bg-slate-100 text-slate-700 border-slate-200",
        label: "Suspended",
      },
    };

    const item = config[status];

    if (!item) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold">
          Unknown
        </span>
      );
    }

    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${item.classes}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {item.label}
      </span>
    );
  };

  // ============================================================
  // FILTERING
  // ============================================================
  const filteredHostels = hostels.filter((hostel) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      hostel.hostelName?.toLowerCase().includes(search) ||
      hostel.city?.toLowerCase().includes(search) ||
      hostel.locality?.toLowerCase().includes(search) ||
      hostel.ownerName?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All Status" ||
      hostel.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // PAGINATION CALCULATION
  // ============================================================
  const totalPages = Math.max(
    1,
    Math.ceil(filteredHostels.length / ITEMS_PER_PAGE)
  );

  // Keep current page valid when filtering or data changes.
  useEffect(() => {
    setCurrentPage((previousPage) =>
      Math.min(Math.max(previousPage, 1), totalPages)
    );
  }, [totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHostels = filteredHostels.slice(startIndex, endIndex);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safePage);
  };

  // ============================================================
  // REFRESH
  // ============================================================
  const handleRefresh = async () => {
    await fetchHostels();
    setCurrentPage(1);
  };

  // ============================================================
  // SUMMARY CARD
  // ============================================================
  const SummaryCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconBg,
    iconColor,
  }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs text-slate-400 font-medium">—</span>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">
          {value ?? "—"}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {subtitle || "Data unavailable"}
        </p>
      </div>
    </div>
  );

  // ============================================================
  // EMPTY TABLE STATE
  // ============================================================
  const EmptyState = () => (
    <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Database className="w-7 h-7" />
      </div>

      <h4 className="text-sm font-semibold text-slate-800">
        No hostel data available
      </h4>

      <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
        Hostel records will appear here once they are available from the backend.
      </p>

      {error && (
        <p className="text-xs text-rose-500 mt-3 max-w-sm leading-relaxed">
          {error}
        </p>
      )}

      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className="mt-5 flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
      >
        <RefreshCw
          className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
        />
        Refresh Data
      </button>
    </div>
  );

  // ============================================================
  // RETURN
  // ============================================================
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">
      {/* ======================================================== */}
      {/* SIDEBAR                                                  */}
      {/* ======================================================== */}

      <aside
        className={`fixed top-0 left-0 h-screen ${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-white border-r border-slate-200 flex flex-col justify-between z-30`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Building className="w-6 h-6" />
            </div>

            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-slate-900 leading-none text-xl tracking-tight">
                  HostelHub
                </h1>
                <span className="text-xs text-slate-400 font-medium">
                  Admin Console
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Dashboard */}
            <div>
              <NavItem
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => navigate("/admin/dashboard")}
              />
            </div>

            {/* Management */}
            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  Management
                </p>
              )}

              <nav className="space-y-1">
                <NavItem
                  icon={Building2}
                  label="Hostel Requests"
                  active
                  onClick={() => navigate("/admin/hostel-management")}
                />

                <NavItem
                  icon={Clock}
                  label="Pending Approvals"
                  onClick={() => navigate("/admin/pending-approvals/:hostel-id")}
                />

                <NavItem
                  icon={RefreshCw}
                  label="Reupload Review"
                  onClick={() => navigate("/admin/reupload")}
                />

                <NavItem
                  icon={MessageSquareWarning}
                  label="User Issues"
                />

                <NavItem
                  icon={ShieldCheck}
                  label="Owner Verification"
                />
              </nav>
            </div>

            {/* Analytics */}
            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  Analytics & Reports
                </p>
              )}

              <nav className="space-y-1">
                <NavItem icon={BarChart3} label="Analytics" />
                <NavItem icon={Gem} label="Subscription" />
                <NavItem icon={FileText} label="Reports" />
              </nav>
            </div>

            {/* System */}
            <div>
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                  System
                </p>
              )}

              <nav className="space-y-1">
                <NavItem icon={Users} label="Users" />
                <NavItem icon={Settings} label="System Settings" />
                <NavItem icon={History} label="Audit Logs" />
              </nav>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {sidebarOpen && (
            <button className="w-full py-2.5 px-3 border border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              Generate Reports
            </button>
          )}

          <NavItem icon={HelpCircle} label="Help Center" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <LogOut className="w-5 h-5 shrink-0 text-slate-500" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT                                              */}
      {/* ======================================================== */}

      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* ====================================================== */}
        {/* TOP NAVBAR                                             */}
        {/* ====================================================== */}

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Search hostel, owner, location..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-slate-200 bg-white rounded text-xs text-slate-400 font-mono">
                ⌘ K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">
              <Bell className="w-6 h-6" />
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">
              <Moon className="w-6 h-6" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <div ref={profileMenuRef} className="relative">
              {/* Admin Profile */}
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 pl-2 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-slate-50 transition"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  A
                </div>

                <div className="text-left hidden md:block leading-tight">
                  <p className="text-sm font-semibold text-slate-800">
                    Admin User
                  </p>
                  <p className="text-xs text-slate-400">Super Admin</p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 hidden md:block transition-transform ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        A
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          Admin User
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          Super Admin
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ====================================================== */}
        {/* PAGE CONTENT                                            */}
        {/* ====================================================== */}

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PAGE HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Hostel Requests
                </h2>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Manage, review and monitor registered hostels.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Current Data</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 transition disabled:opacity-70"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard
              title="Total Hostels"
              value={totalHostels}
              subtitle="Data unavailable"
              icon={Building2}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />

            <SummaryCard
              title="Approved"
              value={approvedCount}
              subtitle="Data unavailable"
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />

            <SummaryCard
              title="Pending Review"
              value={pendingCount}
              subtitle="Data unavailable"
              icon={Clock}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />

            <SummaryCard
              title="Flagged"
              value={flaggedCount}
              subtitle="Data unavailable"
              icon={Flag}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            />

            <SummaryCard
              title="Rejected"
              value={rejectedCount}
              subtitle="Data unavailable"
              icon={XCircle}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
            />
          </div>

          {/* TABLE CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* TABLE HEADER */}
            <div className="p-5 border-b border-slate-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    All Hostels
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hostel records retrieved from the platform.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search hostels..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-56 pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="appearance-none pl-9 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option>All Status</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="FLAGGED">Flagged</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>

                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* More Filters */}
                  <button
                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                    title="More filters"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && filteredHostels.length > 0 && (
              <div className="px-5 pt-4">
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-600">
                  {error}
                </div>
              </div>
            )}

            {/* TABLE */}
            {filteredHostels.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Hostel
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Contact No
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Hostel Type
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedHostels.map((hostel, index) => (
                      <tr
                        key={
                          hostel.hostelId ??
                          `hostel-${startIndex + index}`
                        }
                        className="border-b border-slate-100 hover:bg-slate-50/70 transition"
                      >
                        {/* Hostel */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {hostel.hostelName || "Unnamed Hostel"}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                ID: {hostel.hostelId ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {hostel.locality
                              ? `${hostel.locality}, ${hostel.city}`
                              : hostel.city || "—"}
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-sm text-slate-700">
                              {hostel.ownerName || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Contact No */}
                        <td className="px-5 py-4 text-center">
                          <div className="text-sm text-slate-600">
                            {hostel.ownerPhone ?? "—"}
                          </div>
                        </td>

                        {/* Hostel Type */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-slate-700">
                            {hostel.hostelType ?? "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={hostel.approvalStatus} />
                        </td>

                        {/* Submitted */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-500">
                            {hostel.submittedAt || "—"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/pending-approvals/${hostel.hostelId}`
                                )
                              }
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="View Hostel Approval"
                            >
                              <Eye className="w-4 h-4 text-center" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState />
            )}

            {/* ================================================== */}
            {/* PAGINATION                                          */}
            {/* ================================================== */}
            {filteredHostels.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {startIndex + 1}
                  </span>
                  {" "}-{" "}
                  <span className="font-semibold text-slate-600">
                    {Math.min(endIndex, filteredHostels.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-600">
                    {filteredHostels.length}
                  </span>{" "}
                  records
                </p>

                <div className="flex items-center gap-1">
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HostelRequest;
