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
  Eye,
  Headphones,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  ShieldCheck,
  Send,
  ChevronRight,
  AlertCircle,
  CheckCircle2
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

const SupportCard = ({
  icon,
  title,
  description,
  children
}) => (
  <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-200">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
          {icon}
        </div>

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

const Support = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [menu, setMenu] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [data, setData] =
    useState(null);

  const [expandedFaq, setExpandedFaq] =
    useState(null);

  const [sending, setSending] =
    useState(false);

  const [messageSent, setMessageSent] =
    useState(false);

  const menuRef = useRef(null);

  const [form, setForm] =
    useState({
      subject: "",
      message: ""
    });

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

  useEffect(() => {
    const loadSupportData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            localStorage.getItem(
              "token"
            );

          const response =
            await fetch(
              `${API_BASE_URL}/api/owner/dashboard`,
              {
                headers: {
                  Accept:
                    "application/json",
                  ...(token
                    ? {
                        Authorization: `Bearer ${token}`
                      }
                    : {})
                }
              }
            );

          if (!response.ok) {
            throw new Error(
              `Unable to load support data (${response.status})`
            );
          }

          const result =
            await response.json();

          setData(result);
        } catch (err) {
          console.error(
            "Failed to load support data:",
            err
          );

          setError(
            "Unable to load your support information. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };

    loadSupportData();
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

  const location = [
    hostel.area,
    hostel.city,
    hostel.state
  ]
    .filter(Boolean)
    .join(", ");

  const faqItems = [
    {
      question:
        "How do I update my hostel information?",
      answer:
        "Open Hostel Profile from the left panel. You can review and update the hostel information available to your account."
    },
    {
      question:
        "How do I manage my rooms?",
      answer:
        "Open Rooms from the My Hostel section. You can review your available room types, pricing and room information from there."
    },
    {
      question:
        "How does hostel approval work?",
      answer:
        "After submitting your hostel details, the hostel remains pending until the admin reviews your submission. If owner verification is required, the admin will initiate the verification process."
    },
    {
      question:
        "How do I verify my owner email?",
      answer:
        "Owner email verification is completed through the OTP verification process when the admin sends the verification OTP to your registered email address."
    },
    {
      question:
        "What should I do if I find an issue?",
      answer:
        "Open the Issues page from the Discovery section and review the issues associated with your hostel."
    }
  ];

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !form.subject.trim() ||
        !form.message.trim()
      ) {
        return;
      }

      /*
       * No support/ticket backend endpoint
       * has been provided yet.
       *
       * Therefore this page does not pretend
       * to submit a ticket to the backend.
       */

      setSending(true);
      setMessageSent(false);

      try {
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 500)
        );

        setMessageSent(true);

        setForm({
          subject: "",
          message: ""
        });
      } finally {
        setSending(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-7 h-7 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />

          <p className="text-sm">
            Loading support...
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

      {/* ================= SIDEBAR ================= */}

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
            icon={
              <Images size={18} />
            }
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
            icon={
              <Star size={18} />
            }
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
            onClick={() =>
              nav("/owner/settings")
            }
          />

          {/* SUPPORT UNDER SETTINGS */}

          <SidebarItem
            icon={
              <Headphones size={18} />
            }
            label="Support"
            active
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

      {/* ================= MAIN ================= */}

      <main className="lg:ml-[250px] h-screen flex flex-col overflow-hidden">

        {/* ================= HEADER ================= */}

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

            <button
              className="relative w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center"
            >
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

        {/* ================= CONTENT ================= */}

        <div className="flex-1 overflow-y-auto">
        <div className="p-5 lg:p-8 max-w-[1200px] mx-auto">

          {/* BREADCRUMB */}

          <div className="mb-6">

            <div className="flex items-center gap-2 text-xs text-slate-500">

              <span>
                Account
              </span>

              <span className="text-slate-300">
                /
              </span>

              <span className="text-slate-700 font-medium">
                Support
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight mt-2">
              Support
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Get help with your hostel, account and owner portal.
            </p>

          </div>

          {/* ERROR */}

          {error ? (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex gap-3">

              <AlertCircle
                size={18}
                className="text-rose-600 shrink-0"
              />

              <p className="text-sm text-rose-800">
                {error}
              </p>

            </div>
          ) : null}

          {/* ================= SUPPORT OPTIONS ================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

            <button
              type="button"
              className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-blue-300 hover:shadow-sm transition"
            >

              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageCircle size={20} />
              </div>

              <h3 className="font-semibold text-slate-800 mt-4">
                Contact Support
              </h3>

              <p className="text-xs text-slate-500 mt-1 leading-5">
                Send a message to the FindMyHostel support team.
              </p>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                Get help
                <ChevronRight size={14} />
              </div>

            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    "faq-section"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth"
                  })
              }
              className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-blue-300 hover:shadow-sm transition"
            >

              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HelpCircle size={20} />
              </div>

              <h3 className="font-semibold text-slate-800 mt-4">
                Frequently Asked Questions
              </h3>

              <p className="text-xs text-slate-500 mt-1 leading-5">
                Find answers to common owner portal questions.
              </p>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                View FAQs
                <ChevronRight size={14} />
              </div>

            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    "support-form"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth"
                  })
              }
              className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-blue-300 hover:shadow-sm transition"
            >

              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <FileText size={20} />
              </div>

              <h3 className="font-semibold text-slate-800 mt-4">
                Submit a Request
              </h3>

              <p className="text-xs text-slate-500 mt-1 leading-5">
                Describe the problem you are facing.
              </p>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4">
                Submit request
                <ChevronRight size={14} />
              </div>

            </button>

          </div>

          {/* ================= FAQ ================= */}

          <div
            id="faq-section"
            className="mb-5"
          >

            <SupportCard
              title="Frequently Asked Questions"
              description="Quick answers to common owner portal questions."
              icon={
                <HelpCircle size={18} />
              }
            >

              <div className="divide-y divide-slate-100">

                {faqItems.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="py-1"
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedFaq(
                            expandedFaq ===
                              index
                              ? null
                              : index
                          )
                        }
                        className="w-full flex items-center justify-between gap-4 py-4 text-left"
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                            <HelpCircle
                              size={16}
                            />
                          </div>

                          <span className="text-sm font-medium text-slate-800">
                            {item.question}
                          </span>

                        </div>

                        <ChevronDown
                          size={17}
                          className={`text-slate-400 transition-transform ${
                            expandedFaq ===
                            index
                              ? "rotate-180"
                              : ""
                          }`}
                        />

                      </button>

                      {expandedFaq ===
                      index ? (
                        <div className="pb-4 pl-11 pr-8">

                          <p className="text-xs text-slate-500 leading-6">
                            {item.answer}
                          </p>

                        </div>
                      ) : null}

                    </div>
                  )
                )}

              </div>

            </SupportCard>

          </div>

          {/* ================= CONTACT SUPPORT ================= */}

          <div
            id="support-form"
            className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5"
          >

            <SupportCard
              title="Contact Support"
              description="Describe your issue and provide enough information for the support team to understand it."
              icon={
                <Headphones size={18} />
              }
            >

              {messageSent ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">

                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2
                        size={18}
                      />
                    </div>

                    <div>

                      <h3 className="text-sm font-semibold text-emerald-800">
                        Request prepared
                      </h3>

                      <p className="text-xs text-emerald-700 mt-1 leading-5">
                        Your support request has been prepared successfully.
                      </p>

                      <p className="text-[11px] text-emerald-600 mt-2">
                        A backend support/ticket endpoint is not connected to this page yet.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setMessageSent(
                        false
                      )
                    }
                    className="mt-4 h-9 px-4 rounded-lg bg-white border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    Send another request
                  </button>

                </div>
              ) : (
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-5"
                >

                  <div>

                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Subject
                    </label>

                    <input
                      type="text"
                      value={
                        form.subject
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subject:
                            e.target.value
                        })
                      }
                      placeholder="What do you need help with?"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <div>

                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Message
                    </label>

                    <textarea
                      value={
                        form.message
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          message:
                            e.target.value
                        })
                      }
                      rows={6}
                      placeholder="Describe the problem you are facing..."
                      className="w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <div className="flex items-center justify-between gap-4">

                    <p className="text-[11px] text-slate-400">
                      Please do not include passwords or other sensitive account information.
                    </p>

                    <button
                      type="submit"
                      disabled={
                        sending ||
                        !form.subject.trim() ||
                        !form.message.trim()
                      }
                      className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >

                      <Send size={14} />

                      {sending
                        ? "Preparing..."
                        : "Submit Request"}

                    </button>

                  </div>

                </form>
              )}

            </SupportCard>

            {/* ================= HELP INFORMATION ================= */}

            <div className="space-y-5">

              <SupportCard
                title="Your Account"
                description="Current owner portal information."
                icon={
                  <ShieldCheck size={18} />
                }
              >

                <div className="space-y-4">

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Owner
                    </p>

                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {ownerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Hostel
                    </p>

                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {hostelName}
                    </p>
                  </div>

                  {location ? (
                    <div>
                      <p className="text-[11px] text-slate-400">
                        Location
                      </p>

                      <p className="text-xs text-slate-600 mt-1">
                        {location}
                      </p>
                    </div>
                  ) : null}

                </div>

              </SupportCard>

              <SupportCard
                title="Useful Pages"
                description="Quick access to owner portal sections."
                icon={
                  <FileText size={18} />
                }
              >

                <div className="space-y-1">

                  <button
                    type="button"
                    onClick={() =>
                      nav(
                        "/owner/hostel"
                      )
                    }
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left"
                  >

                    <span className="text-xs font-medium text-slate-700">
                      Hostel Profile
                    </span>

                    <ChevronRight
                      size={15}
                      className="text-slate-400"
                    />

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      nav(
                        "/owner/rooms"
                      )
                    }
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left"
                  >

                    <span className="text-xs font-medium text-slate-700">
                      Rooms
                    </span>

                    <ChevronRight
                      size={15}
                      className="text-slate-400"
                    />

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      nav(
                        "/owner/issues"
                      )
                    }
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left"
                  >

                    <span className="text-xs font-medium text-slate-700">
                      Issues
                    </span>

                    <ChevronRight
                      size={15}
                      className="text-slate-400"
                    />

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      nav(
                        "/owner/settings"
                      )
                    }
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left"
                  >

                    <span className="text-xs font-medium text-slate-700">
                      Settings
                    </span>

                    <ChevronRight
                      size={15}
                      className="text-slate-400"
                    />

                  </button>

                </div>

              </SupportCard>

            </div>

          </div>

        </div>
        </div>

      </main>

    </div>
  );
};

export default Support;