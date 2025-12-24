import { z } from 'zod';
import { insertBrandVoiceSchema, insertRewriteSchema, brandVoices, rewrites } from './schema';
export type { CreateRewriteRequest, CreateBrandVoiceRequest, UpdateBrandVoiceRequest } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    check: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.any(), // User object
        401: z.void(),
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.any(),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        201: z.any(),
        400: z.object({ message: z.string() }),
      },
    },
  },
  brandVoices: {
    list: {
      method: 'GET' as const,
      path: '/api/brand-voices',
      responses: {
        200: z.array(z.custom<typeof brandVoices.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/brand-voices/:id',
      responses: {
        200: z.custom<typeof brandVoices.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/brand-voices',
      input: insertBrandVoiceSchema,
      responses: {
        201: z.custom<typeof brandVoices.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/brand-voices/:id',
      input: insertBrandVoiceSchema.partial(),
      responses: {
        200: z.custom<typeof brandVoices.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/brand-voices/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  rewrites: {
    list: {
      method: 'GET' as const,
      path: '/api/rewrites',
      responses: {
        200: z.array(z.custom<typeof rewrites.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/rewrites',
      input: z.object({
        brandVoiceId: z.number(),
        originalText: z.string().min(1),
        mode: z.enum(["enhance", "generate"]).optional(),
        platform: z.enum(["twitter", "linkedin", "general"]).optional(),
      }),
      responses: {
        201: z.custom<typeof rewrites.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    feedback: {
      method: 'POST' as const,
      path: '/api/feedback',
      input: z.object({
        feedback: z.string(),
        rewriteId: z.number().optional(),
        isPositive: z.boolean().optional(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        500: errorSchemas.internal,
      },
    },
  },
  ai: {
    generateGuidelines: {
      method: 'POST' as const,
      path: '/api/ai/generate-guidelines',
      input: z.object({
        currentText: z.string(),
        toneKeywords: z.array(z.string()),
      }),
      responses: {
        200: z.object({ guidelines: z.string() }),
        400: errorSchemas.validation,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
