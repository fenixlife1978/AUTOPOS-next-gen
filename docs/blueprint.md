# **App Name**: AutoPOS

## Core Features:

- Sales & Cart Management: Comprehensive point-of-sale functionality including product selection, cart modification (add, remove, quantity adjustment), client assignment, and real-time total calculation for streamlined transactions.
- Inventory Tracking: Ability to view, add, edit, and remove products/services, with automatic stock decrement on sales and low stock warnings, crucial for maintaining accurate inventory records.
- Client and Supplier Databases: Dedicated sections for managing client and supplier details, including contact information and associated metadata (e.g., vehicle details for clients).
- Accounts Payable & Receivable: Track outstanding invoices (clients) and bills (suppliers), allowing for manual entry of payments/abonnement and updating account statuses.
- Sales History & Reporting: Review detailed past sales records, filterable by date and keywords, along with a basic daily summary of sales figures and income.
- Local Data Persistence: Securely store all application data (products, sales, clients, etc.) within the browser's localStorage using the 'autopos_v3' key, ensuring data is retained across sessions.
- Optimized Inventory Suggestions: A generative AI tool that processes historical sales data stored locally to offer intelligent recommendations for product reorder quantities and identify best-selling items, aiding in stock optimization.

## Style Guidelines:

- Primary interactive color: HSL(34, 91%, 50%). Vibrant orange (#F59E0B) is utilized for calls-to-action, active states, and critical highlights, ensuring high visibility and user engagement.
- Background scheme: HSL(240, 29%, 6%). A deep, dark bluish-gray (#0C0C14) establishes a sophisticated, low-contrast foundation across the interface, minimizing eye strain during prolonged use.
- Accent color: HSL(33, 91%, 44%). A slightly darker orange-red (#D97706) serves as a secondary accent, providing depth to interactive elements and hover states while maintaining an analogous relationship with the primary action color.
- Headline font: 'Space Grotesk' (sans-serif). Chosen for its modern, tech-inspired character, ensuring headings are distinct and authoritative. Note: currently only Google Fonts are supported.
- Body font: 'DM Sans' (sans-serif). Provides a clean, highly legible experience for all general text and detailed information within the application. Note: currently only Google Fonts are supported.
- Utilize a comprehensive set of Font Awesome icons, carefully selected to represent specific actions, categories (e.g., 'fa-oil-can' for AutoPOS, 'fa-wrench' for services), and statuses, maintaining clear visual metaphors without altering existing icon choices.
- The interface will maintain the exact desktop and mobile-responsive layout of the original HTML, including precise element positioning, spacing, and sizing to ensure visual fidelity. Key structural components like the menu bar, toolbar, main content area, and side panels will be replicated without deviation.
- Preserve existing subtle animations, such as the `winOpen` and `toastIn` keyframe effects for modal windows and notifications, contributing to a fluid and responsive user experience without introducing new motions.