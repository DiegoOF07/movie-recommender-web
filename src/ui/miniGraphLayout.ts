import type { Group, NodeRef } from '@/types'

export interface PlacedNode {
  ref: NodeRef
  x: number
  y: number
  relType: string
  direction: 'out' | 'in'
}

// Reparte hasta `max` vecinos en círculo: cada grupo con items tiene al menos uno y el resto
// se asigna en proporción al tamaño del grupo (mayor residuo), siempre en el mismo orden.
export function radialLayout(groups: Group[], size: number, max = 12): { nodes: PlacedNode[]; overflow: number } {
  const withItems = groups.filter((g) => g.items.length > 0)
  const available = withItems.reduce((s, g) => s + g.items.length, 0)
  const totals = groups.reduce((s, g) => s + g.total, 0)
  const slots = Math.min(max, available)
  if (!slots) return { nodes: [], overflow: totals }

  const take = withItems.map(() => 1)
  let left = slots - withItems.length
  if (left < 0) {
    // Más grupos que lugares: solo los primeros entran
    for (let i = slots; i < take.length; i++) take[i] = 0
    left = 0
  }
  const room = withItems.map((g, i) => g.items.length - take[i])
  const roomTotal = room.reduce((s, r) => s + r, 0)
  if (left > 0 && roomTotal > 0) {
    const shares = room.map((r) => (r / roomTotal) * left)
    const base = shares.map(Math.floor)
    base.forEach((b, i) => (take[i] += b))
    let rest = left - base.reduce((s, b) => s + b, 0)
    const order = shares
      .map((s, i) => ({ i, frac: s - Math.floor(s) }))
      .sort((a, b) => b.frac - a.frac || a.i - b.i)
    for (const { i } of order) {
      if (rest <= 0) break
      if (take[i] < withItems[i].items.length) {
        take[i]++
        rest--
      }
    }
  }

  const picked: Omit<PlacedNode, 'x' | 'y'>[] = []
  withItems.forEach((g, gi) => {
    for (const it of g.items.slice(0, take[gi])) {
      picked.push({ ref: { label: it.label, key: it.key }, relType: g.type, direction: g.direction })
    }
  })

  const c = size / 2
  const radius = size * 0.38
  const nodes = picked.map((p, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / picked.length
    return { ...p, x: c + radius * Math.cos(a), y: c + radius * Math.sin(a) }
  })
  return { nodes, overflow: totals - nodes.length }
}
