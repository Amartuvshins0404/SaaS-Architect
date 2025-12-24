import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    // Warn but don't crash if key is missing, just disable payments
    console.warn("STRIPE_SECRET_KEY is missing. Payments will fail.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-12-18.acacia" as any,
    typescript: true,
});
