import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Mail, ShieldCheck, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8080";

const OwnerEmailVerification = () => {
  const { hostelId: routeHostelId } = useParams();
  const [hostelId, setHostelId] = useState(routeHostelId || null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 🔥 NEW: Track whether OTP was actually requested by admin
  const [otpRequested, setOtpRequested] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const token = localStorage.getItem("token");

  const getAuthHeaders = () => {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ============================================================
  // MASK EMAIL
  // ============================================================
  const maskEmail = (emailAddress) => {
    if (!emailAddress || !emailAddress.includes("@")) {
      return emailAddress;
    }
    const [username, domain] = emailAddress.split("@");
    if (username.length <= 2) {
      return `${username[0] || ""}***@${domain}`;
    }
    return `${username.substring(0, 2)}***@${domain}`;
  };


  // Add this check at the beginning of the component
useEffect(() => {
  const checkOtpRequested = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/owner/hostels/${hostelId}/email-verification-status`,
        { headers: getAuthHeaders() }
      );
      
      const status = response.data?.emailVerificationStatus;
      
      // 🔥 CRITICAL: Only show OTP page if admin requested it
      if (status !== "OTP_SENT") {
        toast.error("Email verification has not been requested by admin yet.");
        navigate("/owner/approval-pending", { replace: true });
        return;
      }
      
      // Proceed with showing OTP page
      setOtpSent(true);
      setEmail(response.data?.email);
      
    } catch (error) {
      console.error("Error checking OTP status:", error);
      toast.error("Unable to verify OTP request status.");
      navigate("/owner/dashboard", { replace: true });
    }
  };
  
  checkOtpRequested();
}, [hostelId]);


  // ============================================================
  // GET VERIFICATION STATUS
  // ============================================================
  const fetchVerificationStatus = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/owner/hostels/${id}/email-verification-status`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = response.data;
      console.log("Email verification status:", data);

      if (data.email) {
        setEmail(data.email);
      }

      const status = data.emailVerificationStatus;
      setVerificationStatus(status);

      // ============================================================
      // 🔥 CRITICAL GATING: Only show OTP page if admin requested it
      // ============================================================
      if (status === "VERIFIED") {
        // Already verified - go to review status
        navigate(`/owner/review-status/${id}`, { replace: true });
        return;
      }

      if (status === "OTP_SENT") {
        // ✅ Admin requested OTP - show verification page
        setOtpRequested(true);
        setOtpSent(true);
        if (data.remainingSeconds) {
          setTimeLeft(data.remainingSeconds);
        }
        return;
      }

      // ❌ NOT_REQUESTED or any other status - OTP not requested by admin
      setOtpRequested(false);
      setOtpSent(false);

    } catch (error) {
      console.error("Error fetching email verification status:", error);
      toast.error(
        error.response?.data?.message ||
        "Unable to load email verification details."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SEND OTP (Called by admin, not owner - but keeping for completeness)
  // ============================================================
  const sendOtp = async () => {
    try {
      setResending(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/owner/hostels/${hostelId}/send-email-otp`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      console.log("Send OTP response:", response.data);
      setOtpSent(true);
      setOtpRequested(true);
      setTimeLeft(5 * 60);
      setResendCooldown(60);
      setOtp("");
      toast.success("OTP sent successfully to your registered email.");
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(
        error.response?.data?.message || "Unable to send OTP."
      );
    } finally {
      setResending(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================
  const resendOtp = async () => {
    if (resendCooldown > 0) {
      return;
    }

    try {
      setResending(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/owner/hostels/${hostelId}/resend-email-otp`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      console.log("Resend OTP response:", response.data);
      setOtp("");
      setOtpSent(true);
      setOtpRequested(true);
      setTimeLeft(5 * 60);
      setResendCooldown(60);
      toast.success("A new OTP has been sent to your email.");
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(
        error.response?.data?.message || "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setVerifying(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/owner/hostels/${hostelId}/verify-email-otp`,
        {
          otp: otp,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      console.log("Verify OTP response:", response.data);

      if (
        response.data.success &&
        response.data.emailVerificationStatus === "VERIFIED"
      ) {
        toast.success("Email verified successfully!");
        navigate(`/owner/review-status/${hostelId}`, {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      const message =
        error.response?.data?.message || "Invalid or expired OTP.";
      toast.error(message);
      setOtp("");
    } finally {
      setVerifying(false);
    }
  };

  // ============================================================
  // INITIAL LOAD - 🔥 FIXED: Check if OTP was requested by admin
  // ============================================================
  useEffect(() => {
    const initializeVerification = async () => {
      try {
        setLoading(true);
        console.log("========== OWNER EMAIL VERIFICATION INIT ==========");

        // If hostel ID came from URL, use it
        if (routeHostelId) {
          setHostelId(routeHostelId);
          await fetchVerificationStatus(routeHostelId);
          return;
        }

        // Otherwise get hostel ID from owner status
        const statusResponse = await axios.get(
          `${API_BASE_URL}/api/owner/hostels/status`,
          {
            headers: getAuthHeaders(),
          }
        );

        console.log("Owner status:", statusResponse.data);

        const status = statusResponse.data?.status;
        const backendHostelId = statusResponse.data?.hostelId;

        if (!backendHostelId) {
          toast.error("Hostel ID could not be determined.");
          navigate("/owner/add-hostel", { replace: true });
          return;
        }

        setHostelId(backendHostelId);

        // ============================================================
        // 🔥 CRITICAL: First fetch verification status to check if OTP was requested
        // ============================================================
        await fetchVerificationStatus(backendHostelId);

        // ============================================================
        // 🔥 FIX: Don't use OWNER_VERIFICATION_PENDING to show OTP page
        // The OTP page should ONLY show when emailVerificationStatus === OTP_SENT
        // ============================================================

      } catch (error) {
        console.error("Failed to initialize email verification:", error);
        toast.error(
          error.response?.data?.message || "Unable to load verification details."
        );
      } finally {
        setLoading(false);
      }
    };

    initializeVerification();
  }, [routeHostelId]);

  // ============================================================
  // OTP TIMER
  // ============================================================
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ============================================================
  // RESEND COOLDOWN TIMER
  // ============================================================
  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setResendCooldown((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ============================================================
  // FORMAT TIMER
  // ============================================================
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // ============================================================
  // OTP INPUT
  // ============================================================
  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  // ============================================================
  // ENTER KEY
  // ============================================================
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      verifyOtp();
    }
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification details...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // 🔥 NEW: Show message if OTP was NOT requested by admin
  // ============================================================
  if (!otpRequested && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={34} className="text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Verification Not Available
            </h1>
            <p className="text-gray-500 mt-3">
              Email verification has not been requested by the admin yet.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Please wait for the admin to review your hostel and request verification.
            </p>
            <button
              type="button"
              onClick={() => navigate("/owner/dashboard", { replace: true })}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI - Only shown when OTP was requested
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <ShieldCheck size={34} className="text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Verify Your Email
          </h1>
          <p className="text-gray-500 text-center mt-2">
            Please verify your registered email address
            to continue to your hostel dashboard.
          </p>

          {/* Email */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Registered Email</p>
                <p className="font-medium text-gray-800">{maskEmail(email)}</p>
              </div>
            </div>
          </div>

          {/* Send OTP (should not be used by owner, but keeping for edge cases) */}
          {!otpSent && (
            <button
              type="button"
              onClick={sendOtp}
              disabled={resending}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Send OTP
                </>
              )}
            </button>
          )}

          {/* OTP Section */}
          {otpSent && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter 6-digit OTP"
                className="w-full text-center tracking-[0.5em] text-xl font-semibold border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Timer */}
              <div className="text-center mt-3">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-500">
                    OTP expires in{" "}
                    <span className="font-semibold text-gray-800">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">
                    OTP has expired.
                  </p>
                )}
              </div>

              {/* Verify */}
              <button
                type="button"
                onClick={verifyOtp}
                disabled={
                  verifying ||
                  otp.length !== 6 ||
                  timeLeft <= 0
                }
                className="w-full mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Resend */}
              <div className="text-center mt-5">
                <p className="text-sm text-gray-500">
                  Didn't receive the OTP?
                </p>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={
                    resending ||
                    resendCooldown > 0
                  }
                  className="mt-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium text-sm flex items-center justify-center gap-2 mx-auto"
                >
                  <RefreshCw
                    size={16}
                    className={resending ? "animate-spin" : ""}
                  />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          {/* Security message */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Never share your OTP with anyone.
              FindMyHostel will never ask for your
              OTP over phone or chat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerEmailVerification;