import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../api/endpoints';
import { queryKeys } from '../../services/query/queryKeys';
import { productSchema } from '../../services/schemas/entities';
import { buildPageSchema, normalizePagePayload } from '../../services/schemas/page';

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



