export { ErrorPage as Page }

import { usePageContext } from 'vike-react/usePageContext'

function ErrorPage() {
  const pageContext = usePageContext()

  let msg: string // Message shown to the user
  const { abortReason, abortStatusCode } = pageContext
  if (typeof abortReason === 'string') {
    msg = abortReason
  } else if (abortStatusCode === 403) {
    msg =
      "You cannot access this page because you don't have enough privileges."
  } else if (abortStatusCode === 401) {
    msg =
      "You cannot access this page because you aren't logged in. Please log in."
  } else {
    // Fallback error message
    msg = pageContext.is404
      ? "This page doesn't exist."
      : 'Something went wrong. Try again (later).'
  }

  return (
    <div className="p-4">
      <p>{msg}</p>
    </div>
  )
}
