export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface NavItem {
  title: string
  href: string
  disabled?: boolean
}

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}
