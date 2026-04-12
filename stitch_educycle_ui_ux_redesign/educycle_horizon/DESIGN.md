# The Design System: Editorial Sustainability & Student Energy

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Academic Curator."** 

We are moving away from the "generic marketplace" aesthetic—which often feels transactional and cold—and toward a high-end, editorial experience that feels like a premium student publication. This system rejects the rigid, boxed-in layouts of traditional e-commerce. Instead, it utilizes **Intentional Asymmetry** and **Tonal Depth** to create a digital environment that is both organized and breathing.

By leveraging a sophisticated palette of sustainable greens and academic blues, we create a "Smart-Tech" atmosphere. The experience should feel like a physical space: clean studio surfaces, frosted glass partitions, and clear, authoritative typography. We don't just list products; we curate a sustainable lifestyle for the modern scholar.

---

## 2. Color & Surface Philosophy

Our palette is rooted in the intersection of nature and intellect. We use `primary` (#006c49) and `secondary` (#006a61) to anchor the sustainability mission, while `tertiary` (#0053db) provides the "Trust-Blue" accents necessary for a secure marketplace.

### The "No-Line" Rule
To achieve a premium, startup-level polish, **1px solid borders are prohibited for sectioning.** 
Standard grids feel like spreadsheets; we want a fluid, organic flow. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly on a `surface` background to define its territory without a "hard" line.

### Surface Hierarchy & Nesting
Think of the UI as layers of fine paper or frosted glass. Use the surface tiers to create "nested" depth:
*   **Base Layer:** `surface` (#f8f9ff) – The canvas.
*   **Secondary Zones:** `surface-container-low` (#eef4ff) – For subtle grouping.
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) – To make content "pop" against the canvas.
*   **Modal/Floating Elements:** `surface-bright` with a backdrop blur.

### The "Glass & Gradient" Rule
To avoid "enterprise stiffness," main CTAs and Hero sections should utilize a subtle **Signature Gradient**. Transition from `primary` (#006c49) to `primary_container` (#10b981) at a 135-degree angle. This adds "soul" and a sense of movement. For floating navigation or overlays, use **Glassmorphism**: semi-transparent `surface` colors with a 12px-20px backdrop-blur.

---

## 3. Typography: The Editorial Voice

We utilize a dual-font strategy to balance character with utility.

*   **The Voice (Display & Headlines):** *Plus Jakarta Sans*. This typeface is used for all `display` and `headline` tokens. Its geometric yet friendly curves provide a modern, energetic "startup" feel.
    *   *Usage:* High-contrast scales (e.g., `display-lg` at 3.5rem) against small body text creates a sophisticated, editorial rhythm.
*   **The Machine (Titles, Body, & Labels):** *Manrope*. Used for `title`, `body`, and `label` tokens. It is engineered for readability, especially for dense marketplace data like prices, OTP codes, and item statuses.

**Typography as Identity:** Use `title-lg` in `primary` for product names to reinforce the brand, while keeping `label-md` in `on_surface_variant` (#3c4a42) for metadata to ensure a clear information hierarchy.

---

## 4. Elevation & Depth

We eschew traditional "drop shadows" in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#eef4ff) background. This creates a natural, soft lift that feels integrated into the environment.
*   **Ambient Shadows:** When an element must float (e.g., a "Sell" FAB), use an extra-diffused shadow. 
    *   *Shadow Specs:* 0px 8px 24px, 6% opacity, using a tint of `on_surface` (#121c28). Never use pure black or grey; shadows should feel like light passing through colored glass.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be a **Ghost Border**. Use the `outline_variant` (#bbcabf) at 20% opacity. 100% opaque borders are forbidden as they "choke" the design.

---

## 5. Signature Components

### Buttons & CTAs
*   **Primary:** A gradient of `primary` to `primary_container` with `xl` (1.5rem) rounded corners. Use `on_primary` (#ffffff) for text.
*   **Secondary:** `surface-container-highest` background with `primary` text. No border.
*   **Tertiary:** No background; `tertiary` (#0053db) text with a subtle `label-md` weight.

### Cards & Marketplace Items
*   **Rule:** Forbid divider lines. Use `xl` (1.5rem) rounded corners and vertical white space (32px or 40px) to separate items. 
*   **Structure:** Use `surface-container-lowest` for the card body. The image should be slightly inset with an `lg` (1rem) corner radius.

### Input Fields & Search
*   **Style:** Minimalist. Use `surface-container-high` as the background. On focus, transition the background to `surface-container-lowest` and add a 2px `ghost border` of `primary`.
*   **Typography:** All helper text and labels use `label-md` in `on_surface_variant`.

### Sustainable Status Chips
*   **Action Chips:** `md` (0.75rem) roundedness. Use `secondary_container` (#86f2e4) with `on_secondary_container` (#006f66) for a fresh, trustworthy "Education/Sustainability" look.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Negative Space:** Allow at least 24px–32px of breathing room between major content blocks. 
*   **Use Asymmetry:** Align high-level headlines to the left while keeping secondary data points slightly offset or right-aligned to create visual interest.
*   **Prioritize Hierarchy:** Use `tertiary` (#0053db) sparingly as a "high-trust" signal (e.g., for verified sellers or successful payments).

### Don’t:
*   **Don't use 1px Dividers:** They create "visual noise" and make the app feel like a legacy enterprise tool.
*   **Don't use Harsh Shadows:** If the shadow is clearly visible at a glance, it's too dark. It should be felt, not seen.
*   **Don't Clutter:** If a screen feels busy, increase the background-color contrast between sections instead of adding lines or boxes.
*   **Don't use Crypto-Gradients:** Avoid neon-purple or high-saturation transitions. Stick to the "Sustainable" green/teal spectrum.