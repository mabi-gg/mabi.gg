import { Checkbox } from '@mabigg/ui/components/checkbox'
import { Input } from '@mabigg/ui/components/input'
import { Label } from '@mabigg/ui/components/label'
import { Fragment, useId, useReducer } from 'react'

interface CharacterStats {
  minDamage: number
  maxDamage: number
  magicAttack: number
  criticalDamageMultiplier: number
  balance: number
  bfoPercent: number
}

interface Buffs {
  powerPotion: boolean
  magicPotion: boolean
  fateweaver: boolean
}

const skillMultipliers = {
  smash: 9,
  charge: 2.64,
  windmill: 5,
  bash: 6,
  assaultSlash: 3.5,
}

const arcanaSkillMultipliers = {
  dynavoltSmash: 40.8,
  shatteringWindmill: 21.7,
  blazingAssaultSmash: 18,
}

const SKILL_LABELS = {
  smash: 'Smash',
  charge: 'Charge',
  windmill: 'Windmill',
  bash: 'Bash',
  assaultSlash: 'Assault Slash',
  dynavoltSmash: 'Dynavolt Smash',
  shatteringWindmill: 'Shattering Windmill',
  blazingAssaultSmash: 'Blazing Assault Smash',
} as const satisfies Record<
  keyof typeof skillMultipliers | keyof typeof arcanaSkillMultipliers,
  string
>

const CHARACTER_STAT_LABELS = {
  minDamage: 'Min Damage',
  maxDamage: 'Max Damage',
  magicAttack: 'Magic Attack',
  criticalDamageMultiplier: 'Critical Multiplier',
  balance: 'Balance',
  bfoPercent: 'Battlefield Overture',
} as const satisfies Record<keyof CharacterStats, string>

const BUFF_LABELS = {
  powerPotion: 'Power Potion',
  magicPotion: 'Magic Potion',
  fateweaver: 'Fateweaver',
} as const satisfies Record<keyof Buffs, string>

export function EkDamageCalculatorPage() {
  const [characterStats, dispatchCharacterStats] = useReducer(
    (state: CharacterStats, action: Partial<CharacterStats>) => ({
      ...state,
      ...action,
    }),
    {
      minDamage: 1100,
      maxDamage: 1400,
      magicAttack: 500,
      criticalDamageMultiplier: 3.05,
      balance: 30,
      bfoPercent: 70,
    } satisfies CharacterStats
  )

  const [buffs, dispatchBuffs] = useReducer(
    (state: Buffs, action: Partial<Buffs>) => ({
      ...state,
      ...action,
    }),
    {
      powerPotion: false,
      magicPotion: false,
      fateweaver: false,
    } satisfies Buffs
  )

  let baseDamage = characterStats.maxDamage
  let magicAttack = characterStats.magicAttack
  if (buffs.magicPotion) {
    magicAttack += 80
  }

  // add 10% of magic attack, up to 500
  baseDamage += Math.min(magicAttack * 0.1, 500)

  // apply power potion
  const powerPotionMultiplier = buffs.powerPotion ? 1.2 : 1
  baseDamage *= powerPotionMultiplier

  // apply bfo
  const bfoMultiplier = Math.max(
    1 + (characterStats.bfoPercent / 100) * powerPotionMultiplier,
    1
  )
  baseDamage *= bfoMultiplier

  // apply fateweaver
  const fateweaverMultiplier = buffs.fateweaver
    ? 1.12 * powerPotionMultiplier
    : 1
  baseDamage *= fateweaverMultiplier

  const skillDamages = {
    smash: baseDamage * skillMultipliers.smash,
    charge: baseDamage * skillMultipliers.charge,
    windmill: baseDamage * skillMultipliers.windmill,
    bash: baseDamage * skillMultipliers.bash,
    assaultSlash: baseDamage * skillMultipliers.assaultSlash,
  }

  const arcanaSkillDamages = {
    dynavoltSmash:
      baseDamage * arcanaSkillMultipliers.dynavoltSmash + skillDamages.smash,
    shatteringWindmill:
      baseDamage * arcanaSkillMultipliers.shatteringWindmill +
      skillDamages.windmill,
    blazingAssaultSmash:
      baseDamage * arcanaSkillMultipliers.blazingAssaultSmash +
      skillDamages.assaultSlash,
  }

  const baseId = useId()

  const setCharacterStat = <Key extends keyof CharacterStats>(
    key: Key,
    value: CharacterStats[Key]
  ) => {
    dispatchCharacterStats({ [key]: value } as Partial<CharacterStats>)
  }

  const toggleBuff = <Key extends keyof Buffs>(key: Key, value: Buffs[Key]) => {
    dispatchBuffs({ [key]: value } as Partial<Buffs>)
  }

  function numericFieldset<Key extends keyof CharacterStats>(key: Key) {
    return (
      <>
        <Label htmlFor={`${baseId}-${key}`} className="">
          {CHARACTER_STAT_LABELS[key]}
        </Label>
        <Input
          id={`${baseId}-${key}`}
          type="number"
          value={characterStats[key]}
          onChange={(e) =>
            setCharacterStat(key, Number(e.target.value) as CharacterStats[Key])
          }
          className="w-full"
          placeholder={CHARACTER_STAT_LABELS[key]}
        />
      </>
    )
  }

  function booleanFieldset<Key extends keyof Buffs>(key: Key) {
    return (
      <>
        <Label htmlFor={`${baseId}-${key}`} className="">
          {BUFF_LABELS[key]}
        </Label>
        <div>
          <Checkbox
            id={`${baseId}-${key}`}
            checked={buffs[key]}
            onCheckedChange={(checked) =>
              toggleBuff(key, checked as Buffs[Key])
            }
          />
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      <h1 className="text-2xl font-bold">EK Damage Calculator</h1>
      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="text-xl font-bold">Character stats</div>
          <div className="grid grid-cols-[max-content_auto] gap-4">
            {numericFieldset('minDamage')}
            {numericFieldset('maxDamage')}
            {numericFieldset('magicAttack')}
            {numericFieldset('balance')}
            {numericFieldset('bfoPercent')}
            <div className="col-span-full">
              <hr />
            </div>
            {numericFieldset('criticalDamageMultiplier')}
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-xl font-bold">Buffs</div>
          <div className="grid grid-cols-[max-content_auto] gap-4">
            {booleanFieldset('powerPotion')}
            {booleanFieldset('magicPotion')}
            {booleanFieldset('fateweaver')}
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-xl font-bold">Results</div>
          <div>
            <div className="font-bold">Base Damage</div>
            <div className="font-bold">{formatNumber(baseDamage)}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries({
              ...skillDamages,
              ...arcanaSkillDamages,
            }).map(([key, value], idx) => {
              return (
                <Fragment key={idx}>
                  <div className="flex flex-col">
                    <div className="">
                      {SKILL_LABELS[key as keyof typeof SKILL_LABELS]}
                    </div>
                    <div className="font-bold">{formatDamage(value)}</div>
                    <div className="text-sm">
                      crits{' '}
                      <span className="font-bold">
                        {formatDamage(
                          value * characterStats.criticalDamageMultiplier
                        )}
                      </span>
                    </div>
                  </div>
                  {idx === Object.keys(skillDamages).length - 1 && (
                    <div className="col-span-full">
                      <hr />
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
      <pre>
        {JSON.stringify(
          {
            powerPotionMultiplier: formatNumber(powerPotionMultiplier),
            bfoMultiplier: formatNumber(bfoMultiplier),
            fateweaverMultiplier: formatNumber(fateweaverMultiplier),
          },
          null,
          2
        )}
      </pre>
    </div>
  )
}

// format damage in thousands
const formatDamage = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  notation: 'compact',
  compactDisplay: 'short',
  style: 'decimal',
}).format

const formatNumber = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  notation: 'standard',
  style: 'decimal',
}).format
