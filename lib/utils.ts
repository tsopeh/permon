export function onDocumentVisibilityChange (callback: (isDocumentVisible: boolean) => void): boolean {

  document.addEventListener('visibilitychange', () => {
    callback(!document.hidden)
  })

  return !document.hidden
}