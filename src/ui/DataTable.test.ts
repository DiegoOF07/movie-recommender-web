import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTable from './DataTable.vue'

const rows = Array.from({ length: 60 }, (_, i) => ({ title: `Película ${String(i).padStart(2, '0')}`, avgRating: 3 }))
rows[42] = { title: 'Spider-Man: Un nuevo día', avgRating: 4.2 }
const columns = [
  { key: 'title', label: 'Título' },
  { key: 'avgRating', label: '★', format: (v: unknown) => Number(v).toFixed(1) },
]

const bodyRows = (w: ReturnType<typeof mount>) => w.findAll('tbody tr')

describe('DataTable', () => {
  it('pagina de 25 en 25', async () => {
    const w = mount(DataTable, { props: { rows, columns, rowKey: 'title' } })
    expect(bodyRows(w)).toHaveLength(25)
    expect(w.text()).toContain('1–25 de 60')
    await w.get('[data-test="next"]').trigger('click')
    expect(w.text()).toContain('26–50 de 60')
    await w.get('[data-test="next"]').trigger('click')
    expect(bodyRows(w)).toHaveLength(10)
  })

  it('el filtro ignora acentos y mayúsculas', () => {
    const w = mount(DataTable, { props: { rows, columns, rowKey: 'title', filter: 'NUEVO DIA' } })
    expect(bodyRows(w)).toHaveLength(1)
    expect(w.text()).toContain('1–1 de 1')
  })

  it('aplica format a la celda', () => {
    const w = mount(DataTable, { props: { rows, columns, rowKey: 'title', filter: 'spider' } })
    expect(bodyRows(w)[0].text()).toContain('4.2')
  })

  it('Enter emite la fila activa', async () => {
    const w = mount(DataTable, { props: { rows, columns, rowKey: 'title' } })
    const table = w.get('[data-test="grid"]')
    await table.trigger('keydown', { key: 'ArrowDown' })
    await table.trigger('keydown', { key: 'ArrowDown' })
    await table.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('select')?.[0]).toEqual(['Película 01'])
  })

  it('clic en una fila emite select y marca la seleccionada', async () => {
    const w = mount(DataTable, { props: { rows, columns, rowKey: 'title', selected: 'Película 03' } })
    expect(bodyRows(w)[3].attributes('aria-selected')).toBe('true')
    await bodyRows(w)[5].trigger('click')
    expect(w.emitted('select')?.[0]).toEqual(['Película 05'])
  })

  it('salta a la página de la fila seleccionada', () => {
    const w = mount(DataTable, { props: { rows, columns, rowKey: 'title', selected: 'Spider-Man: Un nuevo día' } })
    expect(w.text()).toContain('26–50 de 60')
    expect(w.find('tr[aria-selected="true"]').text()).toContain('Spider-Man')
  })

  it('salta a la seleccionada aunque las filas lleguen después', async () => {
    const w = mount(DataTable, { props: { rows: [], columns, rowKey: 'title', selected: 'Spider-Man: Un nuevo día' } })
    await w.setProps({ rows })
    expect(w.text()).toContain('26–50 de 60')
  })

  it('sin filas muestra un mensaje', () => {
    const w = mount(DataTable, { props: { rows: [], columns, rowKey: 'title' } })
    expect(w.text()).toContain('Sin resultados')
  })
})
