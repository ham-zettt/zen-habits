export type DemoSubtask = { id: string; text: string; done: boolean };

export type DemoItem = {
  id: string;
  title: string;
  done: boolean;
  textLabel: string;
  textValue: string;
  dropdownLabel: string;
  dropdownValue: string;
  dateLabel: string;
  dateValue: string;
  subtaskLabel: string;
  subtasks: DemoSubtask[];
  linkLabel: string;
  linkValue: string;
};

export type DemoModule = {
  id: string;
  tab: string;
  name: string;
  description: string;
  items: DemoItem[];
};

export const NAV_LINKS = [
  { href: "#why", label: "Why ZenHabits" },
  { href: "#preview", label: "Preview" },
  { href: "#modules", label: "Modules" },
  { href: "#benefits", label: "Benefits" },
];

export const COMPARISON_LOSER_TITLE = "Single-purpose apps";
export const COMPARISON_WINNER_TITLE = "ZenHabits";

export const COMPARISON_LOSER: string[] = [
  "Install and learn a separate app for every task",
  "Data scattered across many places",
  "Many logins and many notifications",
  "Fixed features: you adapt to the app",
  "Pay for several subscriptions",
  "Switch between apps all day",
];

export const COMPARISON_WINNER: string[] = [
  "One app, one account, one place",
  "Build your own modules in minutes",
  "You decide the fields: text, dropdown, subtasks, date, links",
  "Your structure fits your life, not the other way around",
  "Nothing to install, it works in your browser",
  "Free to use",
];

export const COLLAPSE_ICONS = ["Todos", "Notes", "Calendar", "Tracker", "Budget"];

export const STEPS = [
  { n: "1", title: "Create a module", text: "Name it after your goal, from groceries to job hunting." },
  { n: "2", title: "Add the fields you need", text: "Pick text, dropdown, subtasks, date, or links." },
  { n: "3", title: "Start adding items", text: "Tick things off. Done items sink to the bottom." },
];

export const DEMO_MODULES: DemoModule[] = [
  {
    id: "shopping",
    tab: "Shopping List",
    name: "Daily Shopping",
    description: "Groceries and household needs for the week.",
    items: [
      {
        id: "s1",
        title: "Buy soup vegetables",
        done: false,
        textLabel: "Buy at",
        textValue: "Amir Store",
        dropdownLabel: "Status",
        dropdownValue: "Buy this week",
        dateLabel: "Planned date",
        dateValue: "Jun 2, 2026",
        subtaskLabel: "Items to buy",
        subtasks: [
          { id: "s1-a", text: "Tomatoes", done: false },
          { id: "s1-b", text: "Carrots", done: true },
          { id: "s1-c", text: "Shallots", done: false },
        ],
        linkLabel: "Reference",
        linkValue: "https://example.com/soup-recipe",
      },
      {
        id: "s2",
        title: "Restock cleaning supplies",
        done: false,
        textLabel: "Buy at",
        textValue: "Corner Mart",
        dropdownLabel: "Status",
        dropdownValue: "Normal",
        dateLabel: "Planned date",
        dateValue: "Jun 5, 2026",
        subtaskLabel: "Items to buy",
        subtasks: [
          { id: "s2-a", text: "Dish soap", done: false },
          { id: "s2-b", text: "Sponges", done: false },
        ],
        linkLabel: "Reference",
        linkValue: "https://example.com/cleaning-list",
      },
      {
        id: "s3",
        title: "Buy bread and eggs",
        done: true,
        textLabel: "Buy at",
        textValue: "Bakery",
        dropdownLabel: "Status",
        dropdownValue: "Done",
        dateLabel: "Planned date",
        dateValue: "May 30, 2026",
        subtaskLabel: "Items to buy",
        subtasks: [{ id: "s3-a", text: "Whole wheat bread", done: true }],
        linkLabel: "Reference",
        linkValue: "https://example.com/breakfast",
      },
    ],
  },
  {
    id: "jobs",
    tab: "Job Tracker",
    name: "Job Applications",
    description: "Every application, deadline, and follow-up in one list.",
    items: [
      {
        id: "j1",
        title: "Backend Engineer at Acme",
        done: false,
        textLabel: "Company",
        textValue: "Acme Corp",
        dropdownLabel: "Status",
        dropdownValue: "Applied",
        dateLabel: "Deadline",
        dateValue: "Jun 12, 2026",
        subtaskLabel: "Next steps",
        subtasks: [
          { id: "j1-a", text: "Send cover letter", done: true },
          { id: "j1-b", text: "Prep interview questions", done: false },
        ],
        linkLabel: "Listing URL",
        linkValue: "https://example.com/jobs/acme",
      },
      {
        id: "j2",
        title: "Platform Engineer at Northwind",
        done: false,
        textLabel: "Company",
        textValue: "Northwind",
        dropdownLabel: "Status",
        dropdownValue: "Interview",
        dateLabel: "Deadline",
        dateValue: "Jun 8, 2026",
        subtaskLabel: "Next steps",
        subtasks: [{ id: "j2-a", text: "Research the team", done: false }],
        linkLabel: "Listing URL",
        linkValue: "https://example.com/jobs/northwind",
      },
    ],
  },
  {
    id: "study",
    tab: "Study Plan",
    name: "Study Plan",
    description: "Topics, reading material, and review dates.",
    items: [
      {
        id: "t1",
        title: "Learn database indexes",
        done: false,
        textLabel: "Topic",
        textValue: "PostgreSQL basics",
        dropdownLabel: "Priority",
        dropdownValue: "Urgent",
        dateLabel: "Review date",
        dateValue: "Jun 4, 2026",
        subtaskLabel: "Chapters",
        subtasks: [
          { id: "t1-a", text: "B-tree basics", done: true },
          { id: "t1-b", text: "EXPLAIN ANALYZE", done: false },
        ],
        linkLabel: "Reference URL",
        linkValue: "https://example.com/db-indexes",
      },
      {
        id: "t2",
        title: "Practice system design",
        done: false,
        textLabel: "Topic",
        textValue: "URL shortener",
        dropdownLabel: "Priority",
        dropdownValue: "Normal",
        dateLabel: "Review date",
        dateValue: "Jun 10, 2026",
        subtaskLabel: "Chapters",
        subtasks: [{ id: "t2-a", text: "Sketch the API", done: false }],
        linkLabel: "Reference URL",
        linkValue: "https://example.com/system-design",
      },
    ],
  },
];

export const DEFAULT_MODULES = [
  {
    name: "Todo List",
    description: "Manage your daily tasks",
    fields: ["Task (text)", "Status (Urgent, Normal, Low)"],
  },
  {
    name: "Study Plan",
    description: "Manage your learning plans",
    fields: ["Reference URL (link)", "Date (date)"],
  },
  {
    name: "Job Tracker",
    description: "Track the jobs you are applying for",
    fields: ["Position", "Company", "Deadline", "Status", "Listing URL"],
  },
];

export const BUILT_IN_TOOLS = [
  { name: "Calendar Reminder", description: "Events and reminders on a monthly calendar." },
  { name: "Work Timer", description: "Time your work sessions and see the total." },
  { name: "Expense Tracker", description: "Income, spending, and a wishlist in one view." },
];

export const BENEFITS = [
  { title: "Everything in one place", text: "No more hunting through different apps for one answer." },
  { title: "Fits how you actually live", text: "Build modules for groceries, workouts, bills, projects, anything." },
  { title: "Stay focused", text: "Simple lists, clear priorities, no clutter." },
  { title: "Always accessible", text: "Works in any browser, on desktop or mobile." },
  { title: "Know your deadlines", text: "Dates, statuses, and reminders in a single view." },
  { title: "Grows with you", text: "Add or change fields any time as your needs change." },
];

export const USE_CASES = [
  "Monthly Groceries",
  "Workout Plan",
  "Trip Planning",
  "Home Renovation",
  "Reading List",
  "Bill Tracker",
  "Habit Streaks",
];
