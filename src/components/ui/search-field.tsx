import { Search, X } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  SearchField as AriaSearchField,
} from 'react-aria-components'

type SearchFieldProps = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: SearchFieldProps) {
  return (
    <AriaSearchField
      value={value}
      onChange={onChange}
      className="group flex flex-col gap-1.5"
    >
      <Label className="sr-only">{label}</Label>
      <div className="border-border bg-surface focus-within:border-accent hover:border-border-strong flex h-9 items-center gap-2 rounded-md border px-2.5 transition-colors">
        <Search
          aria-hidden
          size={15}
          strokeWidth={1.75}
          className="text-fg-subtle shrink-0"
        />
        <Input
          placeholder={placeholder}
          className="placeholder:text-fg-subtle min-w-0 flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <Button
          aria-label="Clear search"
          className="text-fg-subtle hover:text-fg grid size-6 cursor-default place-items-center rounded group-data-empty:invisible"
        >
          <X aria-hidden size={14} strokeWidth={1.75} />
        </Button>
      </div>
    </AriaSearchField>
  )
}
