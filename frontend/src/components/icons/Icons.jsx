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
  BookOpen,
  Books,
  GraduationCap,
  ArrowsLeftRight,
  ShieldCheck,
  Users,
  Tag,
  Storefront,
  MagnifyingGlass,
  Handshake,
  Upload,
  Star,
  ArrowRight,
  ArrowUpRight,
  Check,
  Recycle,
  CurrencyCircleDollar,
  ChartLine,
  Sparkle,
  SealCheck,
  Lightning,
  Package,
  UserCircle,
  Envelope,
  Phone,
  MapPin,
  Clock,
  Plus,
  Minus,
  Eye,
  PencilSimple,
  CalendarBlank,
  TrendUp,
  BookBookmark,
  NotePencil,
  Gift,
  ArrowsClockwise,
} from '@phosphor-icons/react';

const ph = (size, className) => ({
  size,
  weight: 'regular',
  className,
  color: 'currentColor',
  'aria-hidden': true,
});

const phFill = (size, className) => ({
  size,
  weight: 'fill',
  className,
  color: 'currentColor',
  'aria-hidden': true,
});

/* ── Original icons ───────────────────────────────── */
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

/* ── Extended icons ───────────────────────────────── */
export const IconBookOpen     = ({ size = 20, className = '' }) => <BookOpen {...ph(size, className)} />;
export const IconBooks        = ({ size = 20, className = '' }) => <Books {...ph(size, className)} />;
export const IconBookBookmark = ({ size = 20, className = '' }) => <BookBookmark {...ph(size, className)} />;
export const IconGraduationCap = ({ size = 20, className = '' }) => <GraduationCap {...ph(size, className)} />;
export const IconArrowsLeftRight = ({ size = 20, className = '' }) => <ArrowsLeftRight {...ph(size, className)} />;
export const IconArrowsClockwise = ({ size = 20, className = '' }) => <ArrowsClockwise {...ph(size, className)} />;
export const IconShieldCheck  = ({ size = 20, className = '' }) => <ShieldCheck {...ph(size, className)} />;
export const IconUsers        = ({ size = 20, className = '' }) => <Users {...ph(size, className)} />;
export const IconTag          = ({ size = 20, className = '' }) => <Tag {...ph(size, className)} />;
export const IconStorefront   = ({ size = 20, className = '' }) => <Storefront {...ph(size, className)} />;
export const IconSearch       = ({ size = 20, className = '' }) => <MagnifyingGlass {...ph(size, className)} />;
export const IconHandshake    = ({ size = 20, className = '' }) => <Handshake {...ph(size, className)} />;
export const IconUpload       = ({ size = 20, className = '' }) => <Upload {...ph(size, className)} />;
export const IconStar         = ({ size = 20, className = '' }) => <Star {...ph(size, className)} />;
export const IconStarFill     = ({ size = 20, className = '' }) => <Star {...phFill(size, className)} />;
export const IconArrowRight   = ({ size = 20, className = '' }) => <ArrowRight {...ph(size, className)} />;
export const IconArrowUpRight = ({ size = 20, className = '' }) => <ArrowUpRight {...ph(size, className)} />;
export const IconCheck        = ({ size = 20, className = '' }) => <Check {...ph(size, className)} />;
export const IconRecycle      = ({ size = 20, className = '' }) => <Recycle {...ph(size, className)} />;
export const IconCurrency     = ({ size = 20, className = '' }) => <CurrencyCircleDollar {...ph(size, className)} />;
export const IconChartLine    = ({ size = 20, className = '' }) => <ChartLine {...ph(size, className)} />;
export const IconSparkle      = ({ size = 20, className = '' }) => <Sparkle {...ph(size, className)} />;
export const IconSealCheck    = ({ size = 20, className = '' }) => <SealCheck {...ph(size, className)} />;
export const IconLightning    = ({ size = 20, className = '' }) => <Lightning {...ph(size, className)} />;
export const IconPackage      = ({ size = 20, className = '' }) => <Package {...ph(size, className)} />;
export const IconUserCircle   = ({ size = 20, className = '' }) => <UserCircle {...ph(size, className)} />;
export const IconEnvelope     = ({ size = 20, className = '' }) => <Envelope {...ph(size, className)} />;
export const IconPhone        = ({ size = 20, className = '' }) => <Phone {...ph(size, className)} />;
export const IconMapPin       = ({ size = 20, className = '' }) => <MapPin {...ph(size, className)} />;
export const IconClock        = ({ size = 20, className = '' }) => <Clock {...ph(size, className)} />;
export const IconPlus         = ({ size = 20, className = '' }) => <Plus {...ph(size, className)} />;
export const IconMinus        = ({ size = 20, className = '' }) => <Minus {...ph(size, className)} />;
export const IconEye          = ({ size = 20, className = '' }) => <Eye {...ph(size, className)} />;
export const IconPencil       = ({ size = 20, className = '' }) => <PencilSimple {...ph(size, className)} />;
export const IconCalendar     = ({ size = 20, className = '' }) => <CalendarBlank {...ph(size, className)} />;
export const IconTrendUp      = ({ size = 20, className = '' }) => <TrendUp {...ph(size, className)} />;
export const IconNotePencil   = ({ size = 20, className = '' }) => <NotePencil {...ph(size, className)} />;
export const IconGift         = ({ size = 20, className = '' }) => <Gift {...ph(size, className)} />;
