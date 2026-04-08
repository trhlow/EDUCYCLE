export type {
  UserDTO,
  ProductDTO,
  TransactionDTO,
  MessageDTO,
  UnsplashImage,
  UnsplashCuratedResponse,
  PublicHealthDTO,
} from '../schemas/entities';

export type ApiErrorShape = {
  status?: number;
  message?: string;
  title?: string;
  error?: string;
  errors?: string[];
};
