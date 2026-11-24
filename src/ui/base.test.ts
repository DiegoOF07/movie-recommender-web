import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'
import Chip from './Chip.vue'
import FieldGroup from './FieldGroup.vue'
import Button from './Button.vue'
import { useToast } from './toast'
import SidePanel from './SidePanel.vue'
import { h } from 'vue'

describe('ConfirmDialog', () => {
  const props = { open: true, title: 'Borrar', message: '¿Seguro?' }

  it('emite confirm al hacer clic en confirmar', async () => {
    const w = mount(ConfirmDialog, { props, attachTo: document.body })
    await w.get('[data-test="confirm"]').trigger('click')
    expect(w.emitted('confirm')).toHaveLength(1)
    w.unmount()
  })

  it('emite cancel con Esc', async () => {
    const w = mount(ConfirmDialog, { props, attachTo: document.body })
    await w.get('dialog').trigger('keydown', { key: 'Escape' })
    expect(w.emitted('cancel')).toHaveLength(1)
    w.unmount()
  })
})

describe('Chip', () => {
  it('removible emite remove', async () => {
    const w = mount(Chip, { props: { node: 'Genre', removable: true }, slots: { default: 'Acción' } })
    await w.get('button').trigger('click')
    expect(w.emitted('remove')).toHaveLength(1)
    expect(w.get('button').attributes('aria-label')).toBe('Quitar Acción')
  })

  it('toma el color del tipo de nodo', () => {
    const w = mount(Chip, { props: { node: 'Movie' }, slots: { default: 'Duna' } })
    expect(w.classes()).toContain('chip--movie')
  })
})

describe('FieldGroup', () => {
  it('asocia label for/id', () => {
    const w = mount(FieldGroup, {
      props: { label: 'Título' },
      slots: { default: `<template #default="{ id }"><input :id="id" /></template>` },
    })
    expect(w.get('label').attributes('for')).toBe(w.get('input').attributes('id'))
  })

  it('muestra el error con aria-invalid', () => {
    const w = mount(FieldGroup, {
      props: { label: 'Título', error: 'Obligatorio' },
      slots: { default: `<template #default="{ id, describedBy }"><input :id="id" :aria-describedby="describedBy" /></template>` },
    })
    expect(w.text()).toContain('Obligatorio')
    expect(w.get('input').attributes('aria-describedby')).toBeTruthy()
  })
})

describe('Button', () => {
  it('se deshabilita mientras carga', () => {
    const w = mount(Button, { props: { loading: true }, slots: { default: 'Guardar' } })
    expect(w.get('button').attributes('disabled')).toBeDefined()
    expect(w.get('button').attributes('aria-busy')).toBe('true')
  })
})

describe('useToast', () => {
  it('comparte los mensajes entre llamadas', () => {
    useToast().show('Guardado')
    expect(useToast().messages.value.some((m) => m.text === 'Guardado')).toBe(true)
  })
})

describe('Esc dentro de la ficha', () => {
  it('cerrar la confirmación con Esc no cierra el panel lateral', async () => {
    const w = mount(SidePanel, {
      props: { open: true },
      slots: { default: () => h(ConfirmDialog, { open: true, title: 'Quitar', message: '¿Seguro?' }) },
      attachTo: document.body,
    })
    await w.get('dialog').trigger('keydown', { key: 'Escape' })
    expect(w.emitted('close')).toBeUndefined()
    w.unmount()
  })
})
