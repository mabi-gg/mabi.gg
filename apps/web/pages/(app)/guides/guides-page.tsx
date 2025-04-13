import { Config } from 'vike-react/Config'

export function GuidesPage() {
  return (
    <div className="p-4">
      <Config title="Guides | mabi.gg" />
      <div className="flex flex-col gap-2">
        <a href="/guides/special-upgrades" className="text-rose-300 underline">
          Special upgrades
        </a>
        <a
          href="/guides/ek-damage-calculator"
          className="text-rose-300 underline"
        >
          EK Damage calculator
        </a>
      </div>
    </div>
  )
}
