import { adminOnlyRoutes } from '../../features/admin/routes/admin.routes';
import { authPublicRoutes } from '../../features/auth/routes/auth.routes';
import { listingPrivateRoutes, listingPublicRoutes } from '../../features/listing/routes/listing.routes';
import { profilePrivateRoutes, profilePublicRoutes } from '../../features/profile/routes/profile.routes';
import { reviewRoutes } from '../../features/review/routes/review.routes';
import { transactionPrivateRoutes, transactionPublicRoutes } from '../../features/transaction/routes/transaction.routes';

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
