import { snemField } from '@devedesiatky/simulation'
import { useGameStore } from './useGameStore'
import './Snem.css'

/** Polar arc path for a seat wedge (degrees from -90 start, clockwise-ish). */
function arcPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x0 = cx + rOuter * Math.cos(toRad(startDeg))
  const y0 = cy + rOuter * Math.sin(toRad(startDeg))
  const x1 = cx + rOuter * Math.cos(toRad(endDeg))
  const y1 = cy + rOuter * Math.sin(toRad(endDeg))
  const x2 = cx + rInner * Math.cos(toRad(endDeg))
  const y2 = cy + rInner * Math.sin(toRad(endDeg))
  const x3 = cx + rInner * Math.cos(toRad(startDeg))
  const y3 = cy + rInner * Math.sin(toRad(startDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${x0} ${y0}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x3} ${y3}`,
    'Z',
  ].join(' ')
}

export function Snem({ onClose }: { onClose: () => void }) {
  const state = useGameStore((s) => s.state)
  const field = snemField(state)

  const cx = 160
  const cy = 150
  const rOuter = 120
  const rInner = 52
  const span = 180
  const startBase = 180

  let cursor = startBase
  const wedges = field.arcs.map((arc) => {
    const sweep = (arc.seats / field.totalSeats) * span
    const start = cursor
    const end = cursor + sweep
    cursor = end
    return { arc, start, end, path: arcPath(cx, cy, rInner, rOuter, start, end) }
  })

  return (
    <main className="snem">
      <header className="snem__brand">
        <p className="snem__eyebrow">Snem</p>
        <h1 className="snem__title">Rozloženie síl</h1>
        <p className="snem__lede">
          Koalícia {field.coalitionSeats} / {field.majority} na väčšinu
          {field.holdsMajority ? ' · drží' : ' · nedrží'}
        </p>
      </header>

      <svg
        className="snem__arcs"
        viewBox="0 0 320 200"
        role="img"
        aria-label={`Snem, koalícia ${field.coalitionSeats} mandátov z ${field.majority}`}
      >
        {wedges.map(({ arc, path }) => (
          <path
            key={arc.id}
            d={path}
            fill={arc.color}
            opacity={arc.inGovernment ? 1 : 0.55}
            stroke="var(--soot)"
            strokeWidth={1.5}
          >
            <title>
              {arc.labelSk}: {arc.seats} mandátov
              {arc.isAntagonist ? ' (antagonista)' : ''}
            </title>
          </path>
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" className="snem__hub">
          {field.coalitionSeats}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="snem__hub-sub">
          koalícia
        </text>
      </svg>

      <ul className="snem__legend">
        {field.arcs.map((arc) => (
          <li key={arc.id} className={arc.isAntagonist ? 'snem__row snem__row--foe' : 'snem__row'}>
            <span className="snem__swatch" style={{ background: arc.color }} />
            <strong>{arc.labelSk}</strong>
            <span>
              {arc.seats} · {arc.preferencie.toFixed(1)}%
              {arc.inGovernment ? ' · vláda' : ''}
              {arc.isAntagonist ? ' · súper' : ''}
            </span>
          </li>
        ))}
      </ul>

      <button type="button" className="snem__cta" onClick={onClose}>
        Späť do centrály
      </button>
    </main>
  )
}
