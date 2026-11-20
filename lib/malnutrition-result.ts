import { z } from "zod";

export const photoReviewSchema = z.object({
  status: z.enum(["visible_concerns", "no_clear_signs", "unable_to_assess"]),
  observations: z.array(z.string().trim().min(1).max(220)).max(4),
  summary: z.string().trim().min(1).max(400),
});

export type PhotoReview = z.infer<typeof photoReviewSchema>;
