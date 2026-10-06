// Lazily loads Monaco with only what the YAML tab needs: the editor API,
// its base worker, and the YAML tokenizer. Nothing loads until first use.
type MonacoApi = typeof import('monaco-editor/editor/editor.api')

let loading: Promise<MonacoApi> | null = null

export function loadMonaco(): Promise<MonacoApi> {
  loading ??= (async () => {
    const { default: EditorWorker } = await import('monaco-editor/editor/editor.worker?worker')
    ;(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
      getWorker: () => new EditorWorker(),
    }
    const monaco = await import('monaco-editor/editor/editor.api')
    await import('monaco-editor/languages/definitions/yaml/register')
    return monaco
  })()
  return loading
}
