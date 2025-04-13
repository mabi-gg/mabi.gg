export { onPageTransitionEnd }

import type { OnPageTransitionEndAsync } from 'vike/types'

const onPageTransitionEnd: OnPageTransitionEndAsync = async (
  pageContext
): ReturnType<OnPageTransitionEndAsync> => {
  document.getElementById('mabigg-loading-bar')?.classList.add('opacity-0')
}
