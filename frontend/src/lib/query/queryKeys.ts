export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  products: {
    list: (params: unknown) => ['products', 'list', params] as const,
  },
  transactions: {
    detail: (id: string | number) => ['transactions', 'detail', String(id)] as const,
    messages: (id: string | number) => ['transactions', 'messages', String(id)] as const,
  },
  media: {
    unsplashCurated: (topic: string, orientation: string, count: number) =>
      ['media', 'unsplash', 'curated', topic, orientation, count] as const,
  },
  system: {
    backendHealth: ['system', 'backend-health'] as const,
  },
};
