import * as React from "react"
import {
  Waves,
  Flower2,
  Mountain,
  Camera,
  Gamepad2,
  BookOpen,
  Music,
  ChefHat,
  Hammer,
  Fish,
  Zap,
  Palette,
  PenLine,
  Music2,
  Sword,
  Bike,
  Coffee,
  Brain,
  Plane,
  Clapperboard,
  Lightbulb,
  Code,
  Coins,
  Languages,
  Wine,
  Tag,
  type LucideIcon,
} from "lucide-react"
import { type VariantProps } from "class-variance-authority"

import { Badge, badgeVariants } from "@/components/ui/badge"

const TAG_ICONS: Record<string, LucideIcon> = {
  "Surfing": Waves,
  "Yoga": Flower2,
  "Hiking": Mountain,
  "Photography": Camera,
  "Gaming": Gamepad2,
  "Reading": BookOpen,
  "Music Production": Music,
  "Cooking": ChefHat,
  "Rock Climbing": Hammer,
  "Diving": Fish,
  "Skateboarding": Zap,
  "Art & Design": Palette,
  "Writing": PenLine,
  "Dancing": Music2,
  "Martial Arts": Sword,
  "Cycling": Bike,
  "Coffee Culture": Coffee,
  "Mindfulness": Brain,
  "Travel Hacking": Plane,
  "Film": Clapperboard,
  "Entrepreneurship": Lightbulb,
  "Open Source": Code,
  "Web3": Coins,
  "Language Learning": Languages,
  "Wine": Wine,
}

type TagBadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    tag: string
    asChild?: boolean
  }

export function TagBadge({ tag, children, ...props }: TagBadgeProps) {
  const Icon = TAG_ICONS[tag] ?? Tag
  return (
    <Badge {...props}>
      <Icon />
      {children ?? tag}
    </Badge>
  )
}
