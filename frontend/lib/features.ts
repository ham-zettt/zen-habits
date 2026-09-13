import {
  BookOpen,
  Briefcase,
  CalendarDays,
  ListTodo,
  Timer,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export const FEATURES: Feature[] = [
  {
    href: "/app/todos",
    icon: ListTodo,
    title: "Todo List",
    description:
      "Daily tasks sorted by priority, with completed items moved to the bottom.",
  },
  {
    href: "/app/study",
    icon: BookOpen,
    title: "Study Plan",
    description:
      "Learning topics with reference links, checked off as you finish them.",
  },
  {
    href: "/app/calendar",
    icon: CalendarDays,
    title: "Calendar",
    description: "Add reminders and events to specific dates in a month view.",
  },
  {
    href: "/app/jobs",
    icon: Briefcase,
    title: "Job Tracker",
    description:
      "Save listings and track each application from planning to decision.",
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
