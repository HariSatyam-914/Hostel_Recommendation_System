import React, { useEffect, useState } from "react";
import {
    FiCheck,
    FiCreditCard,
    FiCalendar,
    FiClock,
    FiAlertCircle,
    FiArrowRight,
    FiRefreshCw,
    FiXCircle,
} from "react-icons/fi";

import {
    getSubscriptionData,
    upgradeSubscription,
    cancelSubscription,
} from "../services/subscriptionService";


function Subscriptions({ user }) {

    const [subscriptionData, setSubscriptionData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [selectedPlan, setSelectedPlan] =
        useState(null);

    const [actionLoading, setActionLoading] =
        useState(false);


    /*
     * ============================================================
     * LOAD SUBSCRIPTION DATA
     * ============================================================
     */

    useEffect(() => {

        const loadSubscriptionData = async () => {

            try {

                setLoading(true);

                const data =
                    await getSubscriptionData(user?.id);

                setSubscriptionData(data);

            } catch (error) {

                console.error(
                    "Failed to load subscription:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };


        loadSubscriptionData();

    }, [user?.id]);


    /*
     * ============================================================
     * UPGRADE PLAN
     * ============================================================
     */

    const handleUpgrade = async (plan) => {

        const confirmed = window.confirm(
            `Do you want to upgrade to ${plan.name}?`
        );

        if (!confirmed) return;


        try {

            setActionLoading(true);

            setSelectedPlan(plan.id);


            const result =
                await upgradeSubscription(
                    user?.id,
                    plan.id
                );


            if (result.success) {

                alert(result.message);

                /*
                 * Reload subscription information.
                 *
                 * Later this will fetch the updated
                 * information directly from Spring Boot.
                 */

                const updatedData =
                    await getSubscriptionData(user?.id);

                setSubscriptionData(updatedData);

            }

        } catch (error) {

            console.error(
                "Upgrade failed:",
                error
            );

        } finally {

            setActionLoading(false);

            setSelectedPlan(null);

        }
    };


    /*
     * ============================================================
     * CANCEL SUBSCRIPTION
     * ============================================================
     */

    const handleCancel = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to cancel your subscription?"
        );

        if (!confirmed) return;


        try {

            setActionLoading(true);


            const result =
                await cancelSubscription(user?.id);


            if (result.success) {

                alert(result.message);


                const updatedData =
                    await getSubscriptionData(user?.id);

                setSubscriptionData(updatedData);

            }

        } catch (error) {

            console.error(
                "Cancellation failed:",
                error
            );

        } finally {

            setActionLoading(false);

        }
    };


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {

        return (

            <div className="flex min-h-[500px] items-center justify-center">

                <div className="flex flex-col items-center gap-4">

                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>

                    <p className="text-sm text-gray-500">
                        Loading subscription details...
                    </p>

                </div>

            </div>

        );

    }


    if (!subscriptionData) {

        return (

            <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">

                <FiAlertCircle
                    className="mx-auto mb-3 text-red-500"
                    size={30}
                />

                <p className="font-semibold text-gray-800">
                    Unable to load subscription information.
                </p>

            </div>

        );

    }


    const {
        hasSubscription,
        subscription,
        plans,
    } = subscriptionData;


    return (

        <div className="w-full">


            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="mb-8">

                <div className="mb-2 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>

                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                        Membership
                    </span>

                </div>


                <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                    Subscriptions
                </h1>


                <p className="mt-2 text-sm text-gray-500 md:text-base">
                    Choose a plan that suits your hostel searching experience.
                </p>

            </div>


            {/* =====================================================
                NO ACTIVE SUBSCRIPTION
            ====================================================== */}

            {!hasSubscription && (

                <div className="relative mb-10 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-center text-white shadow-xl md:p-12">

                    {/* Decorative elements */}

                    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10"></div>

                    <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-white/5"></div>


                    <div className="relative">

                        {/* Icon */}

                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">

                            <FiCreditCard size={30} />

                        </div>


                        <h2 className="text-2xl font-bold md:text-3xl">
                            No Active Subscription
                        </h2>


                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">

                            Currently you have not upgraded to any plan.
                            For a better experience, choose the plan
                            that suits you and get upgraded.

                        </p>


                        <button
                            onClick={() => {

                                document
                                    .getElementById("available-plans")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    });

                            }}
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            View Available Plans

                            <FiArrowRight size={16} />

                        </button>

                    </div>

                </div>

            )}


            {/* =====================================================
                CURRENT SUBSCRIPTION
            ====================================================== */}

            {hasSubscription && subscription && (

                <div className="mb-10 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">


                        <div>

                            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">

                                <span className="h-2 w-2 rounded-full bg-green-500"></span>

                                Active Plan

                            </span>


                            <h2 className="mt-4 text-2xl font-bold text-gray-900">
                                {subscription.planName}
                            </h2>


                            <p className="mt-1 text-sm text-gray-500">
                                {subscription.description}
                            </p>

                        </div>


                        <div className="text-left md:text-right">

                            <p className="text-3xl font-bold text-blue-700">
                                ₹{subscription.price}
                            </p>

                            <p className="text-sm text-gray-400">
                                / month
                            </p>

                        </div>

                    </div>


                    {/* Subscription details */}

                    <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">


                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FiCalendar />
                            </div>

                            <div>

                                <p className="text-xs text-gray-400">
                                    Started On
                                </p>

                                <p className="text-sm font-semibold text-gray-800">
                                    {subscription.startDate}
                                </p>

                            </div>

                        </div>


                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                <FiClock />
                            </div>

                            <div>

                                <p className="text-xs text-gray-400">
                                    Expires On
                                </p>

                                <p className="text-sm font-semibold text-gray-800">
                                    {subscription.expiryDate}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Cancel */}

                    <div className="mt-6 flex justify-end">

                        <button
                            onClick={handleCancel}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >

                            <FiXCircle size={16} />

                            Cancel Subscription

                        </button>

                    </div>

                </div>

            )}


            {/* =====================================================
                AVAILABLE PLANS
            ====================================================== */}

            <div id="available-plans">

                <div className="mb-6">

                    <h2 className="text-xl font-bold text-gray-900">
                        Available Plans
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Choose the plan that works best for you.
                    </p>

                </div>


                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {plans.map((plan) => (

                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                plan.name === "Premium"
                                    ? "border-blue-300 ring-2 ring-blue-500/10"
                                    : "border-gray-100"
                            }`}
                        >


                            {/* Popular badge */}

                            {plan.name === "Premium" && (

                                <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow-md">
                                    MOST POPULAR
                                </div>

                            )}


                            <h3 className="text-xl font-bold text-gray-900">
                                {plan.name}
                            </h3>


                            <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                                {plan.description}
                            </p>


                            {/* Price */}

                            <div className="my-6">

                                <span className="text-3xl font-bold text-gray-900">
                                    ₹{plan.price}
                                </span>

                                <span className="text-sm text-gray-400">
                                    / {plan.duration}
                                </span>

                            </div>


                            {/* Features */}

                            <div className="flex-1 space-y-3">

                                {plan.features.map(
                                    (feature, index) => (

                                        <div
                                            key={index}
                                            className="flex items-start gap-3"
                                        >

                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                                                <FiCheck size={12} />

                                            </div>

                                            <span className="text-sm text-gray-600">
                                                {feature}
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* Plan button */}

                            <div className="mt-8">

                                {plan.currentPlan ? (

                                    <button
                                        disabled
                                        className="w-full rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-500"
                                    >
                                        Current Plan
                                    </button>

                                ) : (

                                    <button
                                        onClick={() =>
                                            handleUpgrade(plan)
                                        }
                                        disabled={actionLoading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
                                    >

                                        {actionLoading &&
                                        selectedPlan === plan.id ? (

                                            <>
                                                <FiRefreshCw
                                                    className="animate-spin"
                                                    size={16}
                                                />

                                                Processing...

                                            </>

                                        ) : (

                                            <>
                                                Upgrade Now

                                                <FiArrowRight
                                                    size={16}
                                                />

                                            </>

                                        )}

                                    </button>

                                )}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );
}

export default Subscriptions;