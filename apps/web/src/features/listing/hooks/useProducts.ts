import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api';
import { queryKeys } from '../../../lib/query-keys';
import { productSchema } from '../schemas';
import { buildPageSchema, normalizePagePayload } from '../../../lib/page-schema';

export type ProductsQueryParams = {
  page?: number;
  size?: number;
  direction?: 'asc' | 'desc';
  sort?: string;
  q?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
};

const productPageSchema = buildPageSchema(productSchema);

export const useProducts = (params: ProductsQueryParams) =>
  useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: async () => {
      const response = await productsApi.getAll(params);
      const normalized = normalizePagePayload(response.data);
      return productPageSchema.parse(normalized);
    },
    staleTime: 30_000,
  });



