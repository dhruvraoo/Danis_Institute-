Danis Institute is a “one-stop campus in the cloud.”
It bundles a slick React SPA with a tiny Express gateway and a full-power Django backend to run (almost) everything an educational institute needs online.

Think of it as:

Front-of-house: a responsive website for students, parents, faculty and admins.
Back-of-house: a Django brain handling data, log-ins, marks, chats, ML models… the serious stuff.
A tiny Express concierge that glues the two together and adds a few extra REST endpoints.
✨ Core Features & Functions
🚪 Admissions & Enquiries
Fancy admission-enquiry form (React) → stored & managed in Django
Admin dashboard shows stats and lets staff mark enquiries as contacted / resolved.
🔐 Role-based Portals
Separate dashboards for Student, Teacher, Principal, and Admin.
ProtectedRoute (+ Django auth) keeps everyone in their own lane.
🧑‍🏫 Marks & Attendance
CRUD screens for entering marks, viewing performance, and tracking attendance.
Data backed by Django models and served via REST.
🗞️ News & Fake-News Detector
Education-news feed.
On-board ML model (saved_model/model.safetensors, handled by Git LFS) that flags fake news.
💬 Real-time Chat
WebSockets via Django Channels + Redis.
Admin <-> Principal messaging page included.
🎨 UI Goodies
Radix UI, TailwindCSS, Lucide icons, dark/light themes.
Built-in command palette, tooltips, toasts, and a friendly ChatBot widget.
⚡ Tech Treats
Hot-reload dev workflow (npm run dev + Django runserver).
Shared TypeScript types for end-to-end type safety.
Vitest for unit tests, Prettier for auto-formatting, Zod for validation.
Ready for Netlify / Docker deployment out of the box.
