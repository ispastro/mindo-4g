import { cn } from "@/lib/utils"

interface MindoLogoProps {
  className?: string
  size?: number
}

export function MindoLogo({ className, size = 24 }: MindoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
    >
      {/* Brain outline - minimalist style */}
      <path
        d="M12 3C9.5 3 7.5 4.5 7 6.5C6 6.5 5 7.5 5 9C5 10 5.5 10.8 6.2 11.2C6.1 11.5 6 11.8 6 12C6 13.5 7 14.5 8.5 14.8C8.2 15.2 8 15.7 8 16.5C8 18 9 19 10.5 19.2C10.8 20.2 11.8 21 13 21C14.2 21 15.2 20.2 15.5 19.2C17 19 18 18 18 16.5C18 15.7 17.8 15.2 17.5 14.8C19 14.5 20 13.5 20 12C20 11.8 19.9 11.5 19.8 11.2C20.5 10.8 21 10 21 9C21 7.5 20 6.5 19 6.5C18.5 4.5 16.5 3 14 3C13.3 3 12.6 3.2 12 3.5C11.4 3.2 10.7 3 10 3H12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Neural connections - dots */}
      <circle cx="10" cy="9" r="1" fill="currentColor" />
      <circle cx="14" cy="9" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
      <circle cx="14" cy="15" r="1" fill="currentColor" />
    </svg>
  )
}
