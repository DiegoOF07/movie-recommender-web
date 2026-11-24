import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  userApi: {
    activity: vi.fn(),
    createWatched: vi.fn(),
    createRated: vi.fn(),
  },
  graphApi: { deleteRelationship: vi.fn() },
}))
vi.mock('@/services/api', () => api)
const toast = vi.hoisted(() => ({ show: vi.fn() }))
vi.mock('@/ui/toast', () => ({ useToast: () => toast }))

import { useActivity } from './activity'

const user = { label: 'User', key: 'ana' }
const movie = (title: string) => ({ label: 'Movie', key: title })

beforeEach(async () => {
  vi.clearAllMocks()
  api.userApi.activity.mockResolvedValue({ watched: ['Duna'], ratings: { Duna: 3 } })
  api.userApi.createWatched.mockResolvedValue({})
  api.userApi.createRated.mockResolvedValue({})
  api.graphApi.deleteRelationship.mockResolvedValue({ deleted: 1 })
  await useActivity().load('ana')
})

describe('useActivity', () => {
  it('load trae lo visto y las calificaciones', () => {
    const a = useActivity()
    expect(a.isWatched('Duna')).toBe(true)
    expect(a.rating('Duna')).toBe(3)
    expect(a.rating('Otra')).toBe(0)
  })

  it('rate(4.5) borra RATED y crea con rating 4.5', async () => {
    await useActivity().rate('Duna', 4.5)
    expect(api.graphApi.deleteRelationship).toHaveBeenCalledWith('RATED', user, movie('Duna'))
    expect(api.userApi.createRated).toHaveBeenCalledWith(expect.objectContaining({ username: 'ana', movieTitle: 'Duna', rating: 4.5 }))
    expect(useActivity().rating('Duna')).toBe(4.5)
  })

  it('rate(0) solo borra', async () => {
    await useActivity().rate('Duna', 0)
    expect(api.graphApi.deleteRelationship).toHaveBeenCalledTimes(1)
    expect(api.userApi.createRated).not.toHaveBeenCalled()
    expect(useActivity().rating('Duna')).toBe(0)
  })

  it('unwatch borra WATCHED y RATED', async () => {
    await useActivity().unwatch('Duna')
    expect(api.graphApi.deleteRelationship).toHaveBeenCalledWith('WATCHED', user, movie('Duna'))
    expect(api.graphApi.deleteRelationship).toHaveBeenCalledWith('RATED', user, movie('Duna'))
    expect(useActivity().isWatched('Duna')).toBe(false)
    expect(useActivity().rating('Duna')).toBe(0)
  })

  it('markWatched crea WATCHED desde la web', async () => {
    await useActivity().markWatched('Origen')
    expect(api.userApi.createWatched).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'ana', movieTitle: 'Origen', completionPct: 100, deviceType: 'web' }),
    )
    expect(useActivity().isWatched('Origen')).toBe(true)
  })

  it('si createRated falla, rating vuelve al valor anterior', async () => {
    api.userApi.createRated.mockRejectedValueOnce(new Error('sin conexión'))
    await useActivity().rate('Duna', 5)
    expect(useActivity().rating('Duna')).toBe(3)
    expect(toast.show).toHaveBeenCalledWith(expect.stringContaining('sin conexión'), 'error')
  })

  it('pending marca la película mientras guarda', async () => {
    let release!: () => void
    api.userApi.createWatched.mockReturnValueOnce(new Promise<void>((r) => (release = r)))
    const p = useActivity().markWatched('Lenta')
    expect(useActivity().pending('Lenta')).toBe(true)
    release()
    await p
    expect(useActivity().pending('Lenta')).toBe(false)
  })
})

describe('useActivity: carga', () => {
  it('una respuesta vieja de otro usuario no pisa la del usuario actual', async () => {
    let releaseOld!: (v: unknown) => void
    api.userApi.activity
      .mockReturnValueOnce(new Promise((r) => (releaseOld = r)))
      .mockResolvedValueOnce({ watched: ['De Beto'], ratings: {} })
    const first = useActivity().load('ana')
    await useActivity().load('beto')
    releaseOld({ watched: ['De Ana'], ratings: {} })
    await first
    expect(useActivity().isWatched('De Beto')).toBe(true)
    expect(useActivity().isWatched('De Ana')).toBe(false)
  })

  it('si la carga falla avisa y no deja marcar a ciegas', async () => {
    api.userApi.activity.mockRejectedValueOnce(new Error('caída'))
    await useActivity().load('ana')
    expect(toast.show).toHaveBeenCalledWith(expect.stringContaining('actividad'), 'error')
    await useActivity().markWatched('Origen')
    expect(api.userApi.createWatched).not.toHaveBeenCalled()
  })
})
