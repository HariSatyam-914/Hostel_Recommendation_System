export const mockSubscriptionData = {
    hasSubscription: false,

    subscription: null,

    plans: [
        {
            id: 4,
            name: "Free",
            price: 0,
            duration: "month",

            description:
                "Essential features to help you find your hostel.",

            features: [
                "Basic hostel search",
                "View hostel details",
                "Save hostels",
            ],

            currentPlan: true,
        },

        {
            id: 5,
            name: "Premium",
            price: 59,
            duration: "month",

            description:
                "Advanced features for a better hostel searching experience.",

            features: [
                "Smart hostel matching",
                "Unlimited saved hostels",
                "Priority recommendations",
                "Advanced search",
                "Premium support",
            ],

            currentPlan: false,
        },

        {
            id: 6,
            name: "Premium Plus",
            price: 89,
            duration: "month",

            description:
                "The complete experience for hostel seekers.",

            features: [
                "Everything in Premium",
                "Personalized recommendations",
                "Exclusive hostel deals",
                "Priority support",
                "Early access to new features",
            ],

            currentPlan: false,
        },
    ],
};