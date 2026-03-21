import {
  Users,
  BookOpen,
  MapPin,
  Target,
  Heart,
  GraduationCap,
  Briefcase,
  Sparkles,
  Shield,
  Globe,
  Star,
  TrendingUp,
  Award,
  Leaf,
  Zap,
  Building2,
  Handshake,
  Baby,
  Sun,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface ImpactIconOption {
  label: string;
  Icon: LucideIcon;
}

/**
 * Curated whitelist of Lucide icons available for impact metrics.
 * Key is the `iconKey` stored in Firestore; value is the display label + component.
 */
export const IMPACT_ICONS: Record<string, ImpactIconOption> = {
  users: { label: "Users / People", Icon: Users },
  "book-open": { label: "Book / Education", Icon: BookOpen },
  "map-pin": { label: "Map Pin / Location", Icon: MapPin },
  target: { label: "Target / Goal", Icon: Target },
  heart: { label: "Heart / Care", Icon: Heart },
  "graduation-cap": { label: "Graduation Cap / Skills", Icon: GraduationCap },
  briefcase: { label: "Briefcase / Employment", Icon: Briefcase },
  sparkles: { label: "Sparkles / Empowerment", Icon: Sparkles },
  shield: { label: "Shield / Safety", Icon: Shield },
  globe: { label: "Globe / Reach", Icon: Globe },
  star: { label: "Star / Excellence", Icon: Star },
  "trending-up": { label: "Trending Up / Growth", Icon: TrendingUp },
  award: { label: "Award / Recognition", Icon: Award },
  leaf: { label: "Leaf / Sustainability", Icon: Leaf },
  zap: { label: "Zap / Impact", Icon: Zap },
  building2: { label: "Building / Organization", Icon: Building2 },
  handshake: { label: "Handshake / Partnership", Icon: Handshake },
  baby: { label: "Baby / Children", Icon: Baby },
  sun: { label: "Sun / Hope", Icon: Sun },
  trophy: { label: "Trophy / Achievement", Icon: Trophy },
};

/** Default icon key used when a stored key is not found in the whitelist. */
export const DEFAULT_ICON_KEY = "sparkles";

/** Ordered array of icon options for use in dropdowns. */
export const IMPACT_ICON_OPTIONS = Object.entries(IMPACT_ICONS).map(
  ([key, { label, Icon }]) => ({ key, label, Icon })
);
