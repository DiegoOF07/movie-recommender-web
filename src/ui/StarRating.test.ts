import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StarRating from './StarRating.vue'

// Cada estrella tiene dos mitades clicables: data-value = i - 0.5 y i
const half = (w: ReturnType<typeof mount>, v: number) => w.get(`[data-value="${v}"]`)

describe('StarRating', () => {
  it('clic en la mitad izquierda de la 4ª estrella emite 3.5', async () => {
    const w = mount(StarRating, { props: { modelValue: 0 } })
    await half(w, 3.5).trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([3.5])
  })

  it('clic sobre el valor actual emite 0', async () => {
    const w = mount(StarRating, { props: { modelValue: 4 } })
    await half(w, 4).trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it('ArrowRight desde 4 emite 4.5 y Delete emite 0', async () => {
    const w = mount(StarRating, { props: { modelValue: 4 } })
    const slider = w.get('[role="slider"]')
    await slider.trigger('keydown', { key: 'ArrowRight' })
    await slider.trigger('keydown', { key: 'Delete' })
    expect(w.emitted('update:modelValue')).toEqual([[4.5], [0]])
  })

  it('Home y End van a 0.5 y 5', async () => {
    const w = mount(StarRating, { props: { modelValue: 2 } })
    const slider = w.get('[role="slider"]')
    await slider.trigger('keydown', { key: 'Home' })
    await slider.trigger('keydown', { key: 'End' })
    expect(w.emitted('update:modelValue')).toEqual([[0.5], [5]])
  })

  it('4.5 pinta 4 llenas y 1 media, con aria-valuetext', () => {
    const w = mount(StarRating, { props: { modelValue: 4.5 } })
    expect(w.findAll('.star--full')).toHaveLength(4)
    expect(w.findAll('.star--half')).toHaveLength(1)
    expect(w.get('[role="slider"]').attributes('aria-valuetext')).toBe('4.5 de 5')
  })

  it('disabled no emite', async () => {
    const w = mount(StarRating, { props: { modelValue: 0, disabled: true, disabledHint: 'Márcala como vista' } })
    await half(w, 3).trigger('click')
    await w.get('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')).toBeUndefined()
    expect(w.get('[role="slider"]').attributes('title')).toBe('Márcala como vista')
  })
})
