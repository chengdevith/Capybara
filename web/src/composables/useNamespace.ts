import { computed, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** The selected namespace, kept in the URL as ?ns= (null = all namespaces). */
export function useNamespace(): { namespace: ComputedRef<string | null>; setNamespace: (ns: string | null) => void } {
  const route = useRoute()
  const router = useRouter()
  const namespace = computed(() => {
    const ns = route.query.ns
    return typeof ns === 'string' && ns !== '' ? ns : null
  })
  function setNamespace(ns: string | null) {
    const query = { ...route.query }
    if (ns) query.ns = ns
    else delete query.ns
    void router.replace({ query })
  }
  return { namespace, setNamespace }
}
