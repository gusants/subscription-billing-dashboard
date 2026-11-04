import { Link } from '@tanstack/react-router'
import { UserX } from 'lucide-react'

export function CustomerNotFound() {
  return (
    <section className="flex flex-col items-start gap-2 py-16">
      <UserX
        aria-hidden
        size={22}
        strokeWidth={1.75}
        className="text-fg-subtle"
      />
      <h1 className="text-xl font-semibold tracking-tight">
        Customer not found
      </h1>
      <p className="text-fg-muted">
        It may have been removed, or the link has a typo.
      </p>
      <Link
        to="/customers"
        className="text-accent hover:text-accent-hover mt-2 font-medium underline"
      >
        Back to customers
      </Link>
    </section>
  )
}
