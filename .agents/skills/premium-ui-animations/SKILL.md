# Premium UI Animations Skill

This skill explains how to implement "premium" and "fluid" user interfaces using `framer-motion` within this project. Smooth transitions significantly enhance the perceived quality of the application.

## 1. The "Sliding Pill" for Tabs
Instead of a simple background color change on the active tab, we use an animated background "pill" that slides smoothly between options.

### Implementation Pattern:
1.  **Structure**: The `TabsList` remains as the container.
2.  **Pill**: A `motion.div` is added inside the `TabsList`, positioned absolutely.
3.  **Animation**: Use `framer-motion` to interpolate the `left` or `x` position based on the current state.

```tsx
<TabsList className="relative p-1 bg-zinc-100 rounded-xl">
  <TabsTrigger value="tab1" className="relative z-10">Option 1</TabsTrigger>
  <TabsTrigger value="tab2" className="relative z-10">Option 2</TabsTrigger>
  
  <motion.div
    className="absolute inset-y-1 rounded-lg bg-white shadow-sm z-0"
    animate={{
      left: activeTab === "tab1" ? "4px" : "calc(50% + 2px)",
      width: "calc(50% - 6px)"
    }}
    transition={{ type: "spring", stiffness: 350, damping: 35 }}
  />
</TabsList>
```

### Key Principles:
- **`z-index`**: Triggers must be `z-10` to stay above the pill.
- **`spring`**: Use spring transitions (low damping, high stiffness) for a "snappy" but fluid feel.
- **`transparent`**: Override the default Shadcn `data-active:bg-background` on the triggers to avoid visual conflicts.

---

## 2. Fluid Content Transitions
When switching views (e.g., between tabs), content should not just "pop" into existence. Use `AnimatePresence` for smooth exit/entry.

### Implementation Pattern:
1.  **Wrap**: Wrap the conditional content in `AnimatePresence`.
2.  **Key**: Ensure the `motion.div` has a `key` that matches the state (e.g., `activeTab`).
3.  **Variants**: Define subtle `initial`, `animate`, and `exit` states.

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
  >
    {activeTab === "tab1" ? <Table1 /> : <Table2 />}
  </motion.div>
</AnimatePresence>
```

---

## 3. Best Practices
- **Performance**: Use `motion.div` for simple transforms (x, y, opacity, scale). Avoid animating layout properties like `height/width` unless necessary (use `layout` prop instead).
- **Subtlety**: Animations should be fast (< 300ms) and subtle. They should guide the user, not distract them.
- **Accessibility**: Respect `prefers-reduced-motion` settings if the user has them enabled.
