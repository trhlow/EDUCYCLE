/**
 * Icon set: Phosphor Icons — https://phosphoricons.com/ (package @phosphor-icons/react).
 * Monochrome via currentColor on parent. Decorative: set aria-label on button/link; icons use aria-hidden.
 */
import {
  Bell,
  Heart,
  X,
  List,
  CaretLeft,
  CaretRight,
  Trash,
  ChatCircle,
  PaperPlaneTilt,
  Lock,
  CheckCircle,
  WarningCircle,
  Warning,
  Info,
} from '@phosphor-icons/react';

const ph = (size, className) => ({
  size,
  weight: 'regular',
  className,
  color: 'currentColor',
  'aria-hidden': true,
});

export const IconBell = ({ size = 20, className = '' }) => <Bell {...ph(size, className)} />;

export const IconHeart = ({ size = 20, className = '' }) => <Heart {...ph(size, className)} />;

export const IconHeartFilled = ({ size = 20, className = '' }) => (
  <Heart size={size} className={className} color="currentColor" weight="fill" aria-hidden="true" />
);

export const IconX = ({ size = 20, className = '' }) => <X {...ph(size, className)} />;

export const IconMenu = ({ size = 20, className = '' }) => <List {...ph(size, className)} />;

export const IconChevronLeft = ({ size = 20, className = '' }) => <CaretLeft {...ph(size, className)} />;

export const IconChevronRight = ({ size = 20, className = '' }) => <CaretRight {...ph(size, className)} />;

export const IconTrash = ({ size = 20, className = '' }) => <Trash {...ph(size, className)} />;

export const IconMessageCircle = ({ size = 20, className = '' }) => <ChatCircle {...ph(size, className)} />;

export const IconSend = ({ size = 20, className = '' }) => <PaperPlaneTilt {...ph(size, className)} />;

export const IconLock = ({ size = 18, className = '' }) => <Lock {...ph(size, className)} />;

export const IconCheckCircle = ({ size = 18, className = '' }) => <CheckCircle {...ph(size, className)} />;

export const IconAlertCircle = ({ size = 18, className = '' }) => <WarningCircle {...ph(size, className)} />;

export const IconAlertTriangle = ({ size = 18, className = '' }) => <Warning {...ph(size, className)} />;

export const IconInfo = ({ size = 18, className = '' }) => <Info {...ph(size, className)} />;
