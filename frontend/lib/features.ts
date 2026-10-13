import {
  CalendarDays,
  Layers,
  Timer,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
};

/** The headline feature: user-defined modules. */
export const MODULE_FEATURE: Feature = {
  icon: Layers,
  title: "Custom Modules",
  description:
    "Build your own lists with your own fields — text, dropdown, subtask, date, or link — so ZenHabits fits how you actually work.",
};

/** The three fixed tools that ship alongside custom modules. */
export const FIXED_FEATURES: Feature[] = [
  {
    href: "/app/calendar",
    icon: CalendarDays,
    title: "Calendar",
    description: "Add reminders and events to specific dates in a month view.",
  },
  {
    href: "/app/timer",
    icon: Timer,
    title: "Work Timer",
    description:
      "Start a session when you begin, stop it when you finish. Duration is calculated for you.",
  },
  {
    href: "/app/expenses",
    icon: Wallet,
    title: "Expenses",
    description:
      "Monthly income and spending, plus a wishlist of planned purchases.",
  },
];
