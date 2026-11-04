import { Link } from '@tanstack/react-router'
import { Layers, LayoutDashboard, SlidersHorizontal, Users } from 'lucide-react'
import { ToggleButton } from 'react-aria-components'
import { useUiPreferences } from '../../lib/ui-preferences'
import { DataSourceBadge } from './data-source-badge'
import { ThemeSwitcher } from './theme-switcher'

const navItemClass =
  'flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 max-sm:px-2 max-sm:[&>svg]:hidden font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent-soft-fg'

export function Sidebar() {
  const isSimulatorOpen = useUiPreferences((state) => state.isSimulatorOpen)
  const setSimulatorOpen = useUiPreferences((state) => state.setSimulatorOpen)

  return (
    <header className="border-border bg-surface flex flex-col gap-3 border-b px-4 py-3 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:px-3 lg:py-5">
      <div className="flex items-center justify-between gap-3 lg:px-2.5 lg:pb-4">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-[0.9375rem] font-semibold tracking-tight">
              Cadência
            </span>
            <span className="text-fg-subtle text-xs">Billing</span>
          </Link>
          <DataSourceBadge />
        </div>
        <div className="lg:hidden">
          <ThemeSwitcher />
        </div>
      </div>

      <nav
        aria-label="Main"
        className="-mx-1 [scrollbar-width:none] overflow-x-auto px-1 lg:mx-0 lg:px-0"
      >
        <ul className="flex gap-1 lg:flex-col">
          <li>
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className={navItemClass}
            >
              <LayoutDashboard aria-hidden size={16} strokeWidth={1.75} />
              Overview
            </Link>
          </li>
          <li>
            <Link to="/customers" className={navItemClass}>
              <Users aria-hidden size={16} strokeWidth={1.75} />
              Customers
            </Link>
          </li>
          <li>
            <Link to="/plans" className={navItemClass}>
              <Layers aria-hidden size={16} strokeWidth={1.75} />
              Plans
            </Link>
          </li>
          <li className="lg:hidden">
            <ToggleButton
              isSelected={isSimulatorOpen}
              onChange={setSimulatorOpen}
              className={`${navItemClass} data-selected:bg-accent-soft data-selected:text-accent-soft-fg cursor-default`}
            >
              <SlidersHorizontal aria-hidden size={16} strokeWidth={1.75} />
              Simulator
            </ToggleButton>
          </li>
        </ul>
      </nav>

      <div className="border-border mt-auto hidden flex-col gap-3 border-t pt-4 lg:flex">
        <ToggleButton
          isSelected={isSimulatorOpen}
          onChange={setSimulatorOpen}
          className={`${navItemClass} data-selected:bg-accent-soft data-selected:text-accent-soft-fg cursor-default`}
        >
          <SlidersHorizontal aria-hidden size={16} strokeWidth={1.75} />
          Simulator
        </ToggleButton>
        <div className="flex items-center justify-between px-2.5">
          <span className="text-fg-subtle text-xs">Theme</span>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
