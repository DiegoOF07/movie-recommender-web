import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NodeForm from './NodeForm.vue'
import { NODE_TYPES, REL_TYPES, defaultValues } from './schema'

const movieFields = NODE_TYPES.Movie.fields.filter((f) => f.key !== 'title')

describe('NodeForm con promedios', () => {
  it('guarda un promedio como 3.8 sin tocarlo', async () => {
    const w = mount(NodeForm, { props: { fields: movieFields, initial: { avgRating: 3.8, durationMin: 120 } } })
    await w.get('form').trigger('submit')
    expect(w.emitted('submit')?.[0]?.[0]).toMatchObject({ avgRating: 3.8 })
  })

  it('rechaza un promedio fuera de 0–5', async () => {
    const w = mount(NodeForm, { props: { fields: movieFields, initial: { avgRating: 7 } } })
    await w.get('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.text()).toContain('Entre 0 y 5')
  })

  it('crear una película sin promedio no falla por el valor por defecto', async () => {
    const w = mount(NodeForm, { props: { fields: NODE_TYPES.Movie.fields, initial: { ...defaultValues(NODE_TYPES.Movie.fields), title: 'Nueva' } } })
    await w.get('form').trigger('submit')
    expect(w.emitted('submit')?.[0]?.[0]).toMatchObject({ title: 'Nueva' })
  })

  it('WORKED_WITH acepta un promedio como 3.80', async () => {
    const w = mount(NodeForm, { props: { fields: REL_TYPES.WORKED_WITH.fields, initial: { ...defaultValues(REL_TYPES.WORKED_WITH.fields), avgRating: 3.8 } } })
    await w.get('form').trigger('submit')
    expect(w.emitted('submit')?.[0]?.[0]).toMatchObject({ avgRating: 3.8 })
  })

  it('RATED sigue exigiendo pasos de 0.5', async () => {
    const w = mount(NodeForm, { props: { fields: REL_TYPES.RATED.fields, initial: { ...defaultValues(REL_TYPES.RATED.fields), rating: 3.8 } } })
    await w.get('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
  })
})
