import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Combobox from './Combobox.vue'
import type { NodeRef } from '@/types'

const refs = (...keys: string[]): NodeRef[] => keys.map((key) => ({ label: 'Movie', key }))

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function setup(search: (q: string) => Promise<NodeRef[]>) {
  return mount(Combobox, { props: { search, modelValue: null, debounce: 200 }, attachTo: document.body })
}

describe('Combobox', () => {
  it('espera el debounce antes de buscar', async () => {
    const search = vi.fn(async () => refs('Duna'))
    const w = setup(search)
    await w.get('input').setValue('du')
    vi.advanceTimersByTime(150)
    expect(search).not.toHaveBeenCalled()
    vi.advanceTimersByTime(60)
    expect(search).toHaveBeenCalledWith('du')
    w.unmount()
  })

  it('ignora una respuesta vieja que llega después de una nueva', async () => {
    let resolveOld!: (v: NodeRef[]) => void
    const search = vi.fn((q: string) =>
      q === 'sp' ? new Promise<NodeRef[]>((r) => (resolveOld = r)) : Promise.resolve(refs('Spider-Man')),
    )
    const w = setup(search)
    await w.get('input').setValue('sp')
    vi.advanceTimersByTime(200)
    await w.get('input').setValue('spi')
    vi.advanceTimersByTime(200)
    await flushPromises()
    resolveOld(refs('Spaceballs'))
    await flushPromises()
    const options = w.findAll('[role="option"]').map((o) => o.text())
    expect(options.join()).toContain('Spider-Man')
    expect(options.join()).not.toContain('Spaceballs')
    w.unmount()
  })

  it('ArrowDown + Enter emite el segundo resultado', async () => {
    const w = setup(async () => refs('Uno', 'Dos'))
    const input = w.get('input')
    await input.setValue('o')
    vi.advanceTimersByTime(200)
    await flushPromises()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('update:modelValue')?.[0]).toEqual([{ label: 'Movie', key: 'Dos' }])
    w.unmount()
  })

  it('muestra "Sin resultados"', async () => {
    const w = setup(async () => [])
    await w.get('input').setValue('zzz')
    vi.advanceTimersByTime(200)
    await flushPromises()
    expect(w.text()).toContain('Sin resultados')
    expect(w.get('input').attributes('aria-expanded')).toBe('true')
    w.unmount()
  })

  it('Esc cierra la lista', async () => {
    const w = setup(async () => refs('Uno'))
    await w.get('input').setValue('u')
    vi.advanceTimersByTime(200)
    await flushPromises()
    await w.get('input').trigger('keydown', { key: 'Escape' })
    expect(w.get('input').attributes('aria-expanded')).toBe('false')
    w.unmount()
  })
})
