'use client'
import {
  CartesianGrid,
  ChartContainer,
  ChartTooltipContent,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from '@mabigg/ui/components/chart'
import { Input } from '@mabigg/ui/components/input'
import { Label } from '@mabigg/ui/components/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@mabigg/ui/components/table'
import { cn } from '@mabigg/ui/lib/utils'
import { useId, useMemo, useState } from 'react'
import { Config } from 'vike-react/Config'
import { usePageContext } from 'vike-react/usePageContext'

// -----------------------------
//    Transition matrices
//    M[i][j] = probability of going from step i to j in one attempt.
//    Steps: 0,1,2,3,4,5 (5 is absorbing).
// -----------------------------
const standardMatrix: number[][] = [
  /* step 0 -> step1 */
  [0, 1, 0, 0, 0, 0],
  /* step 1: 50% ->2, 50% ->0 */
  [0.5, 0, 0.5, 0, 0, 0],
  /* step 2: 50% ->3, 50% ->1 */
  [0, 0.5, 0, 0.5, 0, 0],
  /* step 3: 45%->4, 55%->2 */
  [0, 0, 0.55, 0, 0.45, 0],
  /* step 4: 45%->5, 55%->3 */
  [0, 0, 0, 0.55, 0, 0.45],
  /* step 5: absorbing */
  [0, 0, 0, 0, 0, 1],
]

const albanMatrix: number[][] = [
  /* step 0 -> step1 */
  [0, 1, 0, 0, 0, 0],
  /* step 1: 75%->2, 25%->0 */
  [0.25, 0, 0.75, 0, 0, 0],
  /* step 2: 75%->3, 25%->1 */
  [0, 0.25, 0, 0.75, 0, 0],
  /* step 3: 67%->4, 33%->2 */
  [0, 0, 0.33, 0, 0.67, 0],
  /* step 4: 67%->5, 33%->3 */
  [0, 0, 0, 0.33, 0, 0.67],
  /* step 5: absorbing */
  [0, 0, 0, 0, 0, 1],
]

export function SpecialUpgradePage() {
  const pageContext = usePageContext()
  const [attempts, setAttempts] = useState<number>(
    Number(pageContext.urlParsed.search.attempts) || 20
  )
  const [start, setStart] = useState<number>(
    Number(pageContext.urlParsed.search.startingStep) || 0
  )

  const data = useMemo(() => {
    // arr[k] will be probability distribution after k attempts
    const albanDistArray: number[][] = []
    const regularDistArray: number[][] = []

    // Start distribution: 100% at `start`
    let currentRegularDist = Array.from({ length: 6 }).fill(0) as number[]
    currentRegularDist[start] = 1
    let currentAlbanDist = Array.from({ length: 6 }).fill(0) as number[]
    currentAlbanDist[start] = 1

    for (let k = 0; k <= attempts; k++) {
      regularDistArray.push(currentRegularDist)
      albanDistArray.push(currentAlbanDist)
      if (k < attempts) {
        // Multiply to get next distribution
        currentRegularDist = multiplyVectorByMatrix(
          currentRegularDist,
          standardMatrix
        )
        currentAlbanDist = multiplyVectorByMatrix(currentAlbanDist, albanMatrix)
      }
    }

    const chartData = Array.from({ length: attempts }, (_, i) => ({
      attemptNumber: i + 1,
      alban: albanDistArray[i + 1][5] * 100,
      albanLabel: `${albanDistArray[i + 1][5] * 100}%`,
      regular: regularDistArray[i + 1][5] * 100,
      regularLabel: `${regularDistArray[i + 1][5] * 100}%`,
    }))

    return {
      regularDistArray,
      albanDistArray,
      chartData,
    }
  }, [attempts, start])

  const ids = {
    numAttempts: useId(),
    startingStep: useId(),
  }

  function table(matrix: number[][]) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>&nbsp;</TableHead>
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <TableHead key={j}>Step {j}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.map((row, i) => (
            <TableRow key={i}>
              <TableCell style={{ fontWeight: 'bold' }}>Step {i}</TableCell>
              {row.map((val, j) => (
                <TableCell
                  key={j}
                  className={cn(
                    val > 0 ? 'font-bold' : 'font-normal',
                    val === 0 ? 'text-gray-400' : 'text-inherit'
                  )}
                >
                  {new Intl.NumberFormat('en-US', {
                    maximumFractionDigits: 2,
                  }).format(val)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <Config
        title="Special upgrade attempt calculator | mabi.gg"
        description="Mabinogi guides, tools, and resources."
      />
      <h1 className="mb-8 text-3xl">
        Special Upgrade (to step 5) Attempt Calculator
      </h1>
      <div className="flex items-center justify-start gap-4">
        <div className="space-y-2">
          <Label htmlFor={ids.numAttempts}>Number of attempts</Label>
          <Input
            id={ids.numAttempts}
            type="number"
            value={attempts}
            onChange={(e) => setAttempts(Number(e.target.value) || 0)}
            min={0}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.startingStep}>Starting step</Label>
          <Input
            id={ids.startingStep}
            type="number"
            value={start}
            onChange={(e) => setStart(Number(e.target.value) || 0)}
            min={0}
            max={4}
            step={1}
          />
        </div>
      </div>
      <div className="container max-w-4xl">
        We can model the special upgrade process as a Markov chain with the
        given transition matrix. Since we want step 5 to be an absorbing state,
        step 5 is the last step in the chain. Steps 6 and 7 are not shown in the
        matrix since protective upgrade stones are typically used.
      </div>

      <div className="flex">
        <div className="flex-1 space-y-2">
          <div className="text-xl font-bold">
            Transition Matrix (using Standard Anvil)
          </div>
          {table(standardMatrix)}
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-xl font-bold">
            Transition Matrix (using Alban Anvil)
          </div>
          {table(albanMatrix)}
        </div>
      </div>

      <ChartContainer
        config={{
          regular: {
            label: 'Regular',
          },
          alban: {
            label: 'Alban',
          },
        }}
      >
        <LineChart data={data.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line type="monotone" dataKey="regular" stroke="#82ca9d" />
          <Line type="monotone" dataKey="alban" stroke="#8884d8" />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

/** Multiply distribution vector `dist` (length=6) by transition matrix M (6x6). */
function multiplyVectorByMatrix(dist: number[], matrix: number[][]): number[] {
  const result = Array.from({ length: 6 }).fill(0) as number[]
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      result[j] += dist[i] * matrix[i][j]
    }
  }
  return result
}
