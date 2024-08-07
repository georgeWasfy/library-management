import { z } from 'zod';

export const ReportFiltersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  // is_overdue: z.boolean().optional()
});

export const ReportQuerySchema = z.object({
  filters: ReportFiltersSchema,
});

export type ReportQueryType = z.infer<typeof ReportQuerySchema>;
export type ReportFiltersType = z.infer<typeof ReportFiltersSchema>;


