/**
 * Skill icon keys — the same list the parse-day-report Edge Function gives the model
 * (supabase/functions/_shared/skillIcons.json), each mapped to a lucide icon.
 */
import {
  Apple,
  Baby,
  Bike,
  BookOpen,
  Briefcase,
  Brush,
  Calculator,
  CalendarCheck,
  Camera,
  Car,
  ChefHat,
  Clapperboard,
  Code2,
  Crown,
  Dumbbell,
  FlaskConical,
  Flower2,
  Footprints,
  Gamepad2,
  GraduationCap,
  Guitar,
  HandHeart,
  Handshake,
  Heart,
  House,
  Languages,
  Laptop,
  type LucideIcon,
  MessageCircle,
  Mic,
  Moon,
  Music,
  PenLine,
  PenTool,
  PersonStanding,
  Phone,
  Plane,
  Route,
  Rss,
  Share2,
  Sparkles,
  SprayCan,
  Sprout,
  StretchHorizontal,
  TrendingUp,
  Users,
  UsersRound,
  Video,
  Wallet,
  Waves,
  Wrench,
} from "lucide-react";

import skillIconList from "../../../supabase/functions/_shared/skillIcons.json" with { type: "json" };

const LUCIDE: Record<string, LucideIcon> = {
  Apple,
  Baby,
  Bike,
  BookOpen,
  Briefcase,
  Brush,
  Calculator,
  CalendarCheck,
  Camera,
  Car,
  ChefHat,
  Clapperboard,
  Code2,
  Crown,
  Dumbbell,
  FlaskConical,
  Flower2,
  Footprints,
  Gamepad2,
  GraduationCap,
  Guitar,
  HandHeart,
  Handshake,
  Heart,
  House,
  Languages,
  Laptop,
  MessageCircle,
  Mic,
  Moon,
  Music,
  PenLine,
  PenTool,
  PersonStanding,
  Phone,
  Plane,
  Route,
  Rss,
  Share2,
  Sparkles,
  SprayCan,
  Sprout,
  StretchHorizontal,
  TrendingUp,
  Users,
  UsersRound,
  Video,
  Wallet,
  Waves,
  Wrench,
};

export interface SkillIconOption {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const SKILL_ICON_OPTIONS: readonly SkillIconOption[] = skillIconList.map((item) => ({
  key: item.key,
  label: item.label,
  Icon: LUCIDE[item.lucide] ?? Sparkles,
}));

const BY_KEY = new Map(SKILL_ICON_OPTIONS.map((o) => [o.key, o]));

export const FALLBACK_SKILL_ICON_KEY = "misc";

/** Icon for a stored skill icon key; undefined for unknown / empty keys */
export function getSkillIconByKey(key: string | null | undefined): SkillIconOption | undefined {
  return key ? BY_KEY.get(key) : undefined;
}
