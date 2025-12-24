import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSubmitFeedback() {
    return useMutation({
        mutationFn: async (data: { feedback: string; rewriteId?: number; isPositive?: boolean }) => {
            const res = await fetch(api.rewrites.feedback.path, {
                method: api.rewrites.feedback.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to submit feedback");
            }
            return await res.json();
        },
    });
}
