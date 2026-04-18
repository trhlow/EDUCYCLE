import { adminOnlyRoutes } from '../../features/admin/admin.routes';
import { authPublicRoutes } from '../../features/auth/auth.routes';
import { listingPrivateRoutes, listingPublicRoutes } from '../../features/listing/listing.routes';
import { profilePrivateRoutes, profilePublicRoutes } from '../../features/profile/profile.routes';
import { reviewRoutes } from '../../features/review/review.routes';
import { transactionPrivateRoutes, transactionPublicRoutes } from '../../features/transaction/transaction.routes';

export const publicRoutes = [
  ...listingPublicRoutes,
  ...authPublicRoutes,
  ...transactionPublicRoutes,
  ...profilePublicRoutes,
  ...reviewRoutes,
];

export const privateRoutes = [
  ...listingPrivateRoutes,
  ...transactionPrivateRoutes,
  ...profilePrivateRoutes,
];

export const appRoutes = [
  ...publicRoutes,
  ...privateRoutes,
  ...adminOnlyRoutes,
];
