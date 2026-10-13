# Task: Refactor ZenHabits into a Flexible "Custom Module" System

I have an existing app called **ZenHabits** (see attached `PRD.md` for the current tech stack, folder structure, coding style, auth flow, and design rules). I want to make the app much more flexible: users can build their own modules, similar to how WordPress lets you build a site, so they can manage any daily activity inside ZenHabits without installing other apps.

**All rules in `PRD.md` still apply** (Next.js + Go/Gin + PostgreSQL, layered backend `Route → Controller → Service → Repository`, no over-engineering, `c.JSON(...)` written directly in controllers with no wrapper helper, English-only code and UI text, responsive design, follow `design.md`, RESTful API). Read `PRD.md` and the existing codebase before changing anything.

---

## 1. Goal

Introduce a **Custom Module** feature. A custom module is a user-defined list (a todo list by default) whose items have user-defined fields.

Of the 6 existing modules:

| Module                       | Action                                     |
| ---------------------------- | ------------------------------------------ |
| Todo List                    | **Migrate** to the Custom Module structure |
| Study Plan                   | **Migrate** to the Custom Module structure |
| Job Tracker                  | **Migrate** to the Custom Module structure |
| Calendar Reminder            | Keep as is                                 |
| Work Timer                   | Keep as is                                 |
| Expense Tracker (+ Wishlist) | Keep as is                                 |

The old dedicated Todo, Study Plan, and Job Tracker pages, tables, endpoints, and code must be replaced by the generic custom module system (remove the dead code after migrating the data). They are not kept as separate features.

---

## 2. Concept

### 2.1 Module

A module has:

- **Title** (e.g. "Belanja Harian")
- **Description** (e.g. "Untuk belanja kebutuhan rumah harian")
- An ordered list of **field definitions** (the structure/template)
- A list of **items** that follow that structure

### 2.2 Item

Every module is a todo list by default, so each item has:

- **Item title** (the main title, required, e.g. "Beli resep sayur sop")
- **Done checkbox** (toggle done / not done, reversible, same behavior as the old Todo List in PRD 5.2)
- **Values** for each field defined by the module

### 2.3 Field types

Only these 5 field types are available:

| Type       | Input                  | Notes                                                                                                    |
| ---------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `text`     | Single-line text input |                                                                                                          |
| `dropdown` | Select one option      | The module creator defines the list of options when creating the field. The item creator then picks one. |
| `subtask`  | Simple sub-todo list   | Multiple entries, each with text and a done checkbox. Entries can be added and removed.                  |
| `date`     | Date picker            |                                                                                                          |
| `link`     | URL input              | Validate it as a URL. Render as a clickable link (open in a new tab, `rel="noopener noreferrer"`).       |

Every field **always has a user-defined label** (required, free text). The label is what is shown to the user in the form and in the item display. A module may contain multiple fields of the same type (e.g. two `link` fields).

### 2.4 Example (target display)

```
BELANJA HARIAN                                  <- module title
Untuk belanja kebutuhan rumah harian            <- module description

[ ] BELI RESEP SAYUR SOP                        <- item title + done checkbox
    Beli di: Toko Amir                          <- text
    Status: Dibeli minggu ini                   <- dropdown
    Tanggal rencana beli: 2-6-2026              <- date
    Barang yang dibeli:                         <- subtask
        [ ] Tomat
        [ ] Wortel
        [ ] Bawang Merah
    Referensi: www.google.com                   <- link (clickable)
```

---

## 3. User Flows

### 3.1 Create Module

1. A **"+ Add Module"** entry exists in the navigation (next to the module list).
2. Clicking it goes to a **Create Module page**, where the module title and description already hold default placeholder values (e.g. "New Module" / "Describe your module"). The user edits both.
3. Below that is the **structure builder**. A **"+ New Field"** button opens a dropdown of the 5 field types.
4. After choosing a type, a new field row is appended. Fields are always stacked **vertically**, and each newly added field goes **at the bottom** by default.
5. Each field row contains:
    - a label input (required),
    - the field type (shown, read-only after creation),
    - for `dropdown`: an editor to add, remove, and edit its options (at least 1 option required),
    - a remove button.
6. Clicking **Save** persists the module. It then appears in the navigation and is accessible at its own page. Validate: module title is required, every field has a non-empty label, every dropdown has at least 1 option.

### 3.2 Use a Module (Items)

- The module page lists its items. Provide an **"Add Item"** action.
- The add-item form shows: the item title, then each field as an input matching its type and labeled with the field label, stacked vertically in the module's field order.
- On Save, the item appears in the list in the display format from section 2.4.
- Items can be edited and deleted. The done checkbox toggles directly from the list.
- **Sorting rule:** done items are always at the bottom of the list. Among not-done items, if the module has a `dropdown` field, sort by the option order of the **first** dropdown field (the first option has the highest rank). Otherwise, show the newest first. This keeps the old "urgent → normal → low" behavior working for the migrated Todo List.

### 3.3 Edit / Delete Module

- The user can edit module title and description at any time.
- The user can edit the structure of an existing module: rename labels, add new fields (appended at the bottom), delete fields, and edit dropdown options. The **field type cannot be changed** after creation.
- Deleting a field removes that field's values from the existing items.
- If a dropdown option is deleted or renamed and existing items use it, handle it gracefully (e.g. remove the option and clear the value for those items, or show the stored value as is). Pick the simplest approach and document it in a code comment.
- The user can delete a whole module (with a confirmation dialog), which deletes all its items.

---

## 4. Default Modules (migrated from the old features)

These are ordinary custom modules, created from templates. They are **fully editable and deletable** by the user, with no special "system module" behavior.

**Todo List** (description: "Manage your daily tasks")

- Task — `text`
- Status — `dropdown` with options in this order: `Urgent`, `Normal`, `Low`

**Study Plan** (description: "Manage your learning plans")

- Reference URL — `link`
- Date — `date`

**Job Tracker** (description: "Track the jobs you are applying for")

- Position — `text`
- Company — `text`
- Deadline — `date`
- Status — `dropdown` with options in this order: `Planning`, `Applied`, `In Process`, `Rejected`
- Listing URL — `link`

Create these 3 modules automatically for **every new user on registration**. Do this in the register service in a simple, readable way, not through a clever generic mechanism.

### 4.1 Existing data migration

Write a one-time SQL migration or a Go migration step that, for **every existing user**:

1. Creates the 3 default modules above.
2. Converts the old rows into items:
    - **Todo:** the old task name becomes the item title. The old `priority` maps to the Status dropdown (`urgent`→`Urgent`, `normal`→`Normal`, `low`→`Low`). The old done flag maps to the item's done flag. The `Task` text field can be left empty or set to the same name as the item title. Choose one and note it.
    - **Study Plan:** the old name becomes the item title. If there are multiple old reference links, put the first one in `Reference URL` and keep the rest in the item without losing data (for example, add extra `link` fields such as "Reference URL 2" to that user's Study Plan module as needed, or another equally simple lossless approach). Do not silently drop links.
    - **Job Tracker:** map position, company, deadline, status (`Planning`, `Applied`, `In Process`, `Rejected`), and listing URL to the corresponding fields. The job title/position becomes the item title.
3. Only after the data is verified, drop the old tables.

The migration must be safe to run once and must not lose data. Back up or keep the old tables until the migration is verified.

---

## 5. Backend Requirements

Follow the existing folder structure (`models`, `repositories`, `services`, `controller`, `routes`, `middleware`). Keep it simple.

### 5.1 Suggested database design (adjust if the existing conventions differ)

- `modules`: `id`, `user_id`, `title`, `description`, `created_at`, `updated_at`
- `module_fields`: `id`, `module_id`, `label`, `type` (`text|dropdown|subtask|date|link`), `options` (JSONB, for dropdown only), `position` (int), `created_at`
- `module_items`: `id`, `module_id`, `user_id`, `title`, `is_done`, `values` (JSONB, keyed by field id), `created_at`, `updated_at`

Value formats inside `values`:

- `text` → string
- `dropdown` → string (the selected option)
- `date` → `YYYY-MM-DD` string
- `link` → string
- `subtask` → array of `{ "id": "...", "text": "...", "done": false }`

Using JSONB for item values is intentional, because it keeps the schema simple for dynamic fields. Do not create one table per field type unless there is a strong reason.

### 5.2 API (RESTful, JWT-protected, scoped to the logged-in user)

```
GET    /api/modules                          list the user's modules
POST   /api/modules                          create module (with its fields)
GET    /api/modules/:id                      get module + field definitions
PUT    /api/modules/:id                      update module + fields
DELETE /api/modules/:id                      delete module and its items

GET    /api/modules/:id/items                list items (apply the sorting rule from 3.2)
POST   /api/modules/:id/items                create item
PUT    /api/modules/:id/items/:itemId        update item
PATCH  /api/modules/:id/items/:itemId/done   toggle done / not done
DELETE /api/modules/:id/items/:itemId        delete item
```

### 5.3 Rules

- **Authorization:** every query must be filtered by the authenticated user's id. A user must never read or modify another user's modules or items. Return 404 for resources that do not belong to the user.
- **Validation (in the service layer):**
    - Module title is required. Field label is required. Field type must be one of the 5 types.
    - Dropdown fields must have at least 1 option.
    - On item create/update, validate the submitted values against the module's field definitions: ignore unknown field ids, check the type of each value, ensure a dropdown value is one of the defined options, check that dates are valid, and check that links are valid http/https URLs.
- Saving a module with its fields (create/update) should be done in a **single DB transaction**.
- Controllers follow the reference style in `PRD.md` section 3.2 (bind JSON → call the service → write `c.JSON(...)` directly).
- Keep Calendar, Work Timer, and Expense endpoints untouched.

---

## 6. Frontend Requirements

- Follow `design.md` strictly for all styling, components, and spacing. Fully responsive (mobile web too).
- All UI text in English.
- Navigation: a list of the user's modules (Todo List, Study Plan, Job Tracker, plus any custom ones), the fixed modules (Calendar, Work Timer, Expense Tracker), and a **"+ Add Module"** entry.
- Pages (adjust to the existing routing convention):
    - Create Module page (section 3.1)
    - Module page: item list + add/edit item form (section 3.2)
    - Edit Module page: same builder UI as create, pre-filled (section 3.3)
- Build **one generic set of components** driven by the field `type` (for example a single `FieldInput` and a single `FieldDisplay` that switch on the type), so adding a new field type later is easy. Do not hard-code separate pages for Todo, Study Plan, or Job Tracker.
- Show empty states, loading states, and clear validation/error messages.
- The dropdown option editor and the subtask editor must be usable on mobile.
- Update the public landing page (PRD 5.1) so it describes the new flexible custom module feature and still lists Calendar, Work Timer, and Expense Tracker. Keep the "Mobile app coming soon" notice.

---

## 7. Out of Scope (do not build)

- Field types beyond the 5 listed (no number, checkbox, file upload, etc.)
- Drag-and-drop reordering of fields or items
- Sharing modules between users, or module templates/marketplace
- Notifications
- Any change to Calendar, Work Timer, or Expense Tracker
- Android app

---

## 8. Working Instructions for the Agent

1. First read `PRD.md`, `design.md`, and the current codebase. Then give me a **short plan** (data model, endpoints, migration approach, list of files to add/change/delete) before writing code.
2. Implement in this order, and check that each step works before the next:
    1. DB models + migration (new tables, default-module seeding on register, old-data migration)
    2. Backend: repositories → services → controllers → routes
    3. Frontend: generic field components → Create/Edit Module → Module page (items) → navigation → landing page update
    4. Remove the old Todo/Study Plan/Job Tracker code, tables, and routes
3. Keep the code simple and readable, with short comments only where the logic is non-obvious. No over-engineering.
4. If anything in this spec is ambiguous or conflicts with the existing code, choose the simplest reasonable option, state your assumption, and continue. Only ask me when it is truly blocking.
5. At the end, give me a summary: what changed, the migration steps to run, and how to test the main flows (create module, add item, toggle done, edit structure, verify migrated data).
