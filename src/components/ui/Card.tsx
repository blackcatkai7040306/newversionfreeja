import { CardProps } from "@/types"
import { cn } from "@/lib/utils/cn"

export default function Card({
  title,
  description,
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md border border-gray-200 p-6",
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {children}
    </div>
  )
}
