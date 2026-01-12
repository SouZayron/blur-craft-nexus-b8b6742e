import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        labxat: {
          blue: "hsl(var(--labxat-blue))",
          purple: "hsl(var(--labxat-purple))",
          pink: "hsl(var(--labxat-pink))",
          green: "hsl(var(--labxat-green))",
          lilac: "hsl(var(--labxat-lilac))",
        },
        tiffany: {
          50: "hsl(174, 60%, 96%)",
          100: "hsl(174, 55%, 90%)",
          200: "hsl(174, 50%, 80%)",
          300: "hsl(174, 48%, 65%)",
          400: "hsl(174, 45%, 55%)",
          500: "hsl(174, 42%, 45%)",
          600: "hsl(174, 45%, 38%)",
          700: "hsl(174, 50%, 30%)",
          800: "hsl(174, 55%, 22%)",
          900: "hsl(174, 60%, 15%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "pulse-slow": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(0, 166, 147, 0.4)" },
          "50%": { transform: "scale(1.03)", boxShadow: "0 0 20px 5px rgba(0, 166, 147, 0.3)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
        "pulse-slow": "pulse-slow 2.5s ease-in-out infinite",
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
        'glow': '0 0 40px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 60px rgba(139, 92, 246, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '64px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
