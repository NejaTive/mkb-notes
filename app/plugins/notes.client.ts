import { useNotesStore } from '~/stores/notes'
import { NOTES_KEY } from '~/utils/storage'

export default defineNuxtPlugin({
  name: 'notes-persistence',
  dependsOn: ['pinia'],
  setup(nuxtApp) {
    const notes = useNotesStore(nuxtApp.$pinia as Parameters<typeof useNotesStore>[0])
    notes.hydrate({ seedDemo: true })

    const flush = () => notes.flush()
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })

    window.addEventListener('storage', (event) => {
      if (event.key === NOTES_KEY || event.key === null) notes.syncFromStorage()
    })
  },
})
