import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axiosConfig";

function OwnerHostelRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [emailVerificationStatus, setEmailVerificationStatus] =
        useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const checkOwnerHostelStatus = async () => {
            try {
                console.log(
                    "========== OWNER ROUTE STATUS CHECK =========="
                );

                const response = await api.get(
                    "/api/owner/hostels/status"
                );

                console.log(
                    "Owner hostel status:",
                    response.data
                );

                const ownerStatus = response.data?.status;
                const ownerEmailStatus =
                    response.data?.emailVerificationStatus;

                console.log(
                    "Approval status:",
                    ownerStatus
                );

                console.log(
                    "Email verification status:",
                    ownerEmailStatus
                );

                setStatus(ownerStatus);
                setEmailVerificationStatus(ownerEmailStatus);

            } catch (error) {
                console.error(
                    "Failed to check owner hostel status:",
                    error
                );

                setError(true);

            } finally {
                setLoading(false);
            }
        };

        checkOwnerHostelStatus();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-slate-500">
                    Checking hostel status...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-slate-900">
                        Unable to verify hostel status
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Please refresh the page or login again.
                    </p>
                </div>
            </div>
        );
    }

    /*
     * ============================================================
     * DRAFT / NO HOSTEL / REJECTED
     * ============================================================
     *
     * Allow the owner to continue AddHostelDetails.
     *
     * REJECTED is treated the same as DRAFT here:
     * the owner must be able to open the Add Hostel form
     * to submit a NEW application.
     *
     * AddHostelDetails itself is responsible for showing a
     * blank form and NOT reusing the old rejected hostel data.
     */
    if (
        !status ||
        status === "DRAFT" ||
        status === "REJECTED"
    ) {
        return children;
    }

    /*
     * ============================================================
     * PENDING
     * ============================================================
     *
     * Owner submitted the hostel.
     *
     * Admin has NOT requested email verification yet.
     *
     * Owner MUST remain on Approval Pending.
     */
    if (status === "PENDING") {
        return (
            <Navigate
                to="/owner/approval-pending"
                replace
            />
        );
    }

    /*
     * ============================================================
     * OWNER VERIFICATION PENDING
     * ============================================================
     *
     * This status alone is NOT enough to open the OTP page.
     *
     * The owner can enter email verification ONLY when:
     *
     * approval status       = OWNER_VERIFICATION_PENDING
     * email verification    = OTP_SENT
     *
     * Otherwise keep owner on Approval Pending.
     */
    if (status === "OWNER_VERIFICATION_PENDING") {

        if (emailVerificationStatus === "OTP_SENT") {
            return (
                <Navigate
                    to="/owner/email-verification"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/owner/approval-pending"
                replace
            />
        );
    }

    /*
     * ============================================================
     * APPROVED
     * ============================================================
     */
    if (status === "APPROVED") {
        return (
            <Navigate
                to="/owner/dashboard"
                replace
            />
        );
    }

    /*
     * ============================================================
     * SUSPENDED
     * ============================================================
     */
    if (status === "SUSPENDED") {
        return (
            <Navigate
                to="/owner/approval-pending"
                replace
            />
        );
    }

    /*
     * ============================================================
     * FALLBACK
     * ============================================================
     *
     * Unknown state → allow the normal component instead of
     * creating an accidental redirect loop.
     */
    return children;
}

export default OwnerHostelRoute;