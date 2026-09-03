export type PublicNavigationChild = {
  key: string
  labelKey: string
  path: string
  icon: string
  gated?: boolean
}

export type PublicNavigationItem = {
  key: string
  labelKey: string
  path?: string
  icon: string
  children?: PublicNavigationChild[]
}

let chatEnabledCache: boolean | null = null

export const getChatEnabled = async (): Promise<boolean> => {
  if (chatEnabledCache !== null) return chatEnabledCache
  try {
    const res = await $fetch('/api/chat/config')
    chatEnabledCache = res.data.enabled
    return chatEnabledCache
  } catch {
    return true
  }
}

export const clearChatCache = () => {
  chatEnabledCache = null
}

export const getPublicNavigation = (chatEnabled: boolean = true): PublicNavigationItem[] => {
  return [
    {
      key: 'home',
      labelKey: 'header.navItems.home',
      path: '/',
      icon: 'fa-solid fa-house',
    },
    {
      key: 'media',
      labelKey: 'header.navItems.media',
      icon: 'fa-solid fa-clapperboard',
      children: [
        { key: 'tv', labelKey: 'header.navItems.tv', path: '/tv', icon: 'fa-solid fa-tv', gated: true },
        { key: 'alist', labelKey: 'header.navItems.alist', path: '/alist', icon: 'fa-solid fa-server', gated: true },
        { key: 'tvbox', labelKey: 'header.navItems.tvbox', path: '/tvbox', icon: 'fa-solid fa-display' },
        { key: 'dailyMovie', labelKey: 'header.navItems.dailyMovie', path: '/movie/daily', icon: 'fa-solid fa-film' },
        { key: 'fm', labelKey: 'header.navItems.fm', path: '/fm', icon: 'fa-solid fa-radio' },
        { key: 'games', labelKey: 'header.navItems.games', path: '/games', icon: 'fa-solid fa-gamepad' },
      ],
    },
    {
      key: 'community',
      labelKey: 'header.navItems.community',
      icon: 'fa-solid fa-comments',
      children: [
        { key: 'blog', labelKey: 'header.navItems.blog', path: '/blog', icon: 'fa-solid fa-blog' },
        ...(chatEnabled ? [{ key: 'chat', labelKey: 'header.navItems.chat', path: '/chat', icon: 'fa-solid fa-message' }] : []),
      ],
    },
    {
      key: 'more',
      labelKey: 'header.navItems.more',
      icon: 'fa-solid fa-ellipsis',
      children: [
        { key: 'about', labelKey: 'header.about.about', path: '/about', icon: 'fa-solid fa-circle-info' },
        { key: 'releases', labelKey: 'header.about.releases', path: '/releases', icon: 'fa-solid fa-bullhorn' },
        { key: 'disclaimer', labelKey: 'header.about.disclaimer', path: '/disclaimer', icon: 'fa-solid fa-shield' },
        { key: 'copyright', labelKey: 'header.about.copyright', path: '/copyright', icon: 'fa-solid fa-copyright' },
      ],
    },
  ]
}

export const publicNavigation = getPublicNavigation(true)

export const isPublicNavPathActive = (currentPath: string, path = '') => {
  if (!path) return false
  return path === '/' ? currentPath === '/' : currentPath === path || currentPath.startsWith(`${path}/`)
}

export const isPublicNavItemActive = (currentPath: string, item: PublicNavigationItem) => {
  if (item.path && isPublicNavPathActive(currentPath, item.path)) return true
  return item.children?.some((child) => isPublicNavPathActive(currentPath, child.path)) || false
}
