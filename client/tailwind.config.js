/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
        },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0f5ff",
          100: "#e5edff",
          200: "#cddbfe",
          300: "#b4c6fc",
          400: "#8da9f8",
          500: "#6687f4",
          600: "#4563e9",
          700: "#3551d2",
          800: "#2c40a5",
          900: "#283987",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        slideUp: "slideUp 0.5s ease-out",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "100%",
            code: {
              background: theme("colors.gray.100"),
              padding: "0.25rem 0.375rem",
              borderRadius: "0.25rem",
              fontWeight: "400",
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.300"),
            h1: {
              color: theme("colors.gray.100"),
            },
            h2: {
              color: theme("colors.gray.100"),
            },
            h3: {
              color: theme("colors.gray.100"),
            },
            h4: {
              color: theme("colors.gray.100"),
            },
            p: {
              color: theme("colors.gray.300"),
            },
            a: {
              color: theme("colors.primary.400"),
            },
            strong: {
              color: theme("colors.gray.100"),
            },
            blockquote: {
              color: theme("colors.gray.300"),
              borderLeftColor: theme("colors.gray.700"),
            },
            code: {
              color: theme("colors.gray.300"),
              background: theme("colors.gray.800"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
