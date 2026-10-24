import { mockSubscriptionData } from "../data/subscriptionData";


/*
 * ============================================================
 * TEMPORARY MOCK SERVICE
 * ============================================================
 *
 * Currently there is no backend.
 *
 * So this function returns local/mock data.
 *
 * When your Spring Boot backend is ready,
 * you only need to replace this function with
 * an Axios API call.
 *
 * The Subscriptions.jsx component does NOT need
 * to know where the data comes from.
 *
 * ============================================================
 */

export const getSubscriptionData = async (userId) => {

    console.log("Getting subscription data for user:", userId);

    /*
     * Simulate network delay.
     *
     * This makes the frontend behave somewhat
     * like it is communicating with a backend.
     */
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });


    return mockSubscriptionData;
};


/*
 * ============================================================
 * TEMPORARY UPGRADE FUNCTION
 * ============================================================
 */

export const upgradeSubscription = async (
    userId,
    planId
) => {

    console.log(
        "Upgrade requested:",
        userId,
        planId
    );


    /*
     * Backend API will be added here later.
     */

    await new Promise((resolve) => {
        setTimeout(resolve, 700);
    });


    return {
        success: true,
        message: "Subscription upgraded successfully.",
    };
};


/*
 * ============================================================
 * TEMPORARY CANCEL FUNCTION
 * ============================================================
 */

export const cancelSubscription = async (
    userId
) => {

    console.log(
        "Cancel subscription requested:",
        userId
    );


    /*
     * Backend API will be added here later.
     */

    await new Promise((resolve) => {
        setTimeout(resolve, 700);
    });


    return {
        success: true,
        message: "Subscription cancelled successfully.",
    };
};