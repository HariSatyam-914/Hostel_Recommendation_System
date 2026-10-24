import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

function OwnerApprovalPendingRoute({ children }) {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [emailVerificationStatus, setEmailVerificationStatus] = useState(null);
    const [hostelId, setHostelId] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {

        const checkStatus = async () => {

            try {

                console.log(
                    "========== OWNER PENDING ROUTE CHECK =========="
                );

                // =====================================================
                // 1. GET HOSTEL APPROVAL STATUS
                // =====================================================

                const statusResponse = await api.get(
                    "/api/owner/hostels/status"
                );

                console.log(
                    "OWNER HOSTEL STATUS:",
                    statusResponse.data
                );

                const ownerStatus =
                    statusResponse.data?.status;

                const ownerHostelId =
                    statusResponse.data?.hostelId;

                console.log(
                    "Hostel ID:",
                    ownerHostelId
                );

                console.log(
                    "Approval status:",
                    ownerStatus
                );

                setStatus(ownerStatus);
                setHostelId(ownerHostelId);


                // =====================================================
                // 2. GET OWNER EMAIL VERIFICATION STATUS
                // =====================================================

                let emailStatus = null;

                if (ownerHostelId) {

                    const verificationResponse = await api.get(
                        `/api/owner/hostels/${ownerHostelId}/email-verification-status`
                    );

                    console.log(
                        "OWNER EMAIL VERIFICATION RESPONSE:",
                        verificationResponse.data
                    );

                    emailStatus =
                        verificationResponse.data
                            ?.emailVerificationStatus;

                    console.log(
                        "Email verification status:",
                        emailStatus
                    );

                    setEmailVerificationStatus(emailStatus);
                }


                // =====================================================
                // 3. ADMIN HAS SENT OTP
                // =====================================================
                //
                // THIS MUST HAVE HIGHER PRIORITY THAN PENDING.
                //
                // Expected state:
                //
                // approvalStatus = PENDING
                // emailStatus    = OTP_SENT
                //
                // Therefore:
                //
                // /owner/email-verification/:hostelId
                //

                if (emailStatus === "OTP_SENT") {

                    console.log(
                        "================================================="
                    );

                    console.log(
                        "✅ ADMIN HAS SENT OTP"
                    );

                    console.log(
                        "➡️ Redirecting owner to email verification page"
                    );

                    console.log(
                        "Hostel ID:",
                        ownerHostelId
                    );

                    console.log(
                        "================================================="
                    );

                    if (ownerHostelId) {

                        navigate(
                            `/owner/email-verification/${ownerHostelId}`,
                            {
                                replace: true
                            }
                        );

                        return;
                    }
                }


                // =====================================================
                // 4. ALREADY VERIFIED + HOSTEL STILL PENDING
                // =====================================================

                if (
                    emailStatus === "VERIFIED" &&
                    ownerStatus === "PENDING"
                ) {

                    console.log(
                        "✅ OWNER EMAIL VERIFIED"
                    );

                    console.log(
                        "⏳ HOSTEL STILL PENDING ADMIN APPROVAL"
                    );

                    setLoading(false);

                    return;
                }


                // =====================================================
                // 5. HOSTEL APPROVED
                // =====================================================

                if (ownerStatus === "APPROVED") {

                    console.log(
                        "✅ HOSTEL APPROVED"
                    );

                    setLoading(false);

                    return;
                }


                // =====================================================
                // 6. NORMAL PENDING
                // =====================================================

                if (ownerStatus === "PENDING") {

                    console.log(
                        "⏳ HOSTEL APPROVAL PENDING"
                    );

                    setLoading(false);

                    return;
                }


                // =====================================================
                // 7. DRAFT / NO HOSTEL
                // =====================================================

                if (
                    ownerStatus === "DRAFT" ||
                    ownerStatus === null
                ) {

                    setLoading(false);

                    return;
                }


                // =====================================================
                // 8. REJECTED
                // =====================================================

                if (ownerStatus === "REJECTED") {

                    setLoading(false);

                    return;
                }


                // =====================================================
                // 9. SUSPENDED
                // =====================================================

                if (ownerStatus === "SUSPENDED") {

                    setLoading(false);

                    return;
                }


                setLoading(false);

            } catch (error) {

                console.error(
                    "❌ Failed to check owner status:",
                    error
                );

                console.error(
                    "Response:",
                    error.response?.data
                );

                setError(true);
                setLoading(false);
            }
        };


        checkStatus();

    }, [navigate]);


    // =============================================================
    // LOADING
    // =============================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-white flex items-center justify-center">

                <p className="text-slate-500">
                    Checking approval status...
                </p>

            </div>
        );
    }


    // =============================================================
    // ERROR
    // =============================================================

    if (error) {

        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">

                <div className="text-center">

                    <h1 className="text-xl font-semibold text-slate-900">
                        Unable to verify approval status
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Please refresh the page or login again.
                    </p>

                </div>

            </div>
        );
    }


    // =============================================================
    // APPROVED
    // =============================================================

    if (status === "APPROVED") {

        return (
            <Navigate
                to="/owner/dashboard"
                replace
            />
        );
    }


    // =============================================================
    // DRAFT
    // =============================================================

    if (
        status === "DRAFT" ||
        status === null
    ) {

        return (
            <Navigate
                to="/owner/add-hostel"
                replace
            />
        );
    }


    // =============================================================
    // REJECTED
    // =============================================================

    if (status === "REJECTED") {

        return (
            <Navigate
                to="/owner/add-hostel"
                replace
            />
        );
    }


    // =============================================================
    // PENDING
    // =============================================================
    //
    // OTP_SENT was already handled above.
    //
    // Therefore this means:
    //
    // NOT_REQUESTED + PENDING
    //
    // OR
    //
    // VERIFIED + PENDING
    //
    // Both should show Approval Pending.
    //

    if (status === "PENDING") {

        return children;
    }


    // =============================================================
    // SUSPENDED
    // =============================================================

    if (status === "SUSPENDED") {

        return children;
    }


    return children;
}

export default OwnerApprovalPendingRoute;