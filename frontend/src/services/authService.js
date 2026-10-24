import api from "../api/axiosConfig";


/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  return await api.post(
    "/api/auth/register",
    userData
  );
};


/**
 * Login user
 */
export const loginUser = async (loginData) => {
  return await api.post(
    "/api/auth/login",
    loginData
  );
};


/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};


/**
 * Get logged-in user
 */
export const getCurrentUser = () => {

  const user =
    localStorage.getItem("user");

  return user
    ? JSON.parse(user)
    : null;
};


/**
 * Get JWT token
 */
export const getToken = () => {
  return localStorage.getItem("token");
};


/**
 * Check authentication
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};


/**
 * Get logged-in owner's hostel approval status
 */
export const getOwnerHostelStatus = async () => {
  return await api.get(
    "/api/owner/hostels/status"
  );
};


/**
 * Verify registration OTP
 */
export const verifyRegistrationOtp = async (data) => {

  return await api.post(
    "/api/auth/verify-registration-otp",
    data
  );
};


/**
 * Resend registration OTP
 */
export const resendRegistrationOtp = async ({ email }) => {

  return await api.post(
    "/api/auth/resend-registration-otp",
    {
      email,
      purpose: "REGISTRATION",
    }
  );
};


/**
 * Verify login OTP
 *
 * Kept for backward compatibility.
 */
export const verifyLoginOtp = async (data) => {

  return await api.post(
    "/api/auth/verify-login-otp",
    data
  );
};


/**
 * Resend login OTP
 *
 * Kept for backward compatibility.
 */
export const resendLoginOtp = async (email) => {

  return await api.post(
    "/api/auth/resend-login-otp",
    {
      email,
      purpose: "LOGIN",
    }
  );
};


/**
 * Exchange short-lived Google OAuth login code.
 */
export const exchangeOAuthCode = async (code) => {

  return await api.post(
    "/api/auth/oauth2/exchange",
    {
      code,
    }
  );
};


/**
 * Complete new Google account registration.
 *
 * Google provides the identity.
 * FindMyHostel collects the mandatory phone number.
 */
export const completeGoogleProfile = async ({
  code,
  phoneNo,
}) => {

  return await api.post(
    "/api/auth/oauth2/complete-profile",
    {
      code,
      phoneNo,
    }
  );
};