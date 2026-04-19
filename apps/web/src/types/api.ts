export type {
  UserDTO,
  CategoryDTO,
  ProductDTO,
  TransactionDTO,
  MessageDTO,
  ReviewDTO,
  NotificationDTO,
  PublicProfileDTO,
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
