export { onPageTransitionStart }

import type { OnPageTransitionStartAsync } from 'vike/types'

const onPageTransitionStart: OnPageTransitionStartAsync = async (
  pageContext
): ReturnType<OnPageTransitionStartAsync> => {
  document.getElementById('mabigg-loading-bar')?.classList.remove('opacity-0')
}
