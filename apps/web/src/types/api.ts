export type {
  UserDTO,
  ProductDTO,
  TransactionDTO,
  MessageDTO,
  UnsplashImage,
  UnsplashCuratedResponse,
  PublicHealthDTO,
} from '../lib/entity-schemas';

export type ApiErrorShape = {
  status?: number;
  message?: string;
  title?: string;
  error?: string;
  errors?: string[];
};
