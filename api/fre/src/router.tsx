import { useState, useEffect, Suspense, lazy, useMemo, useRef } from 'fre'

function pathSlice(path) {
  const slice = [
    new RegExp(
      `${path.substr(0, 1) === '*' ? '' : '^'}${path
        .replace(/:[a-zA-Z]+/g, '([^/]+)')
        .replace(/\*/g, '')}${path.substr(-1) === '*' ? '' : '$'}`
    )
  ]
  const params = path.match(/:[a-zA-Z#0-9]+/g)
  slice.push(params ? params.map(name => name.substr(1)) : [])
  return slice
}

export function useRouter(routes) {
  const [url, setUrl] = useState(window.location.pathname)

  const parsedRoutes = useMemo(() => {
    return routes.map(item => ({
      route: pathSlice(item.path),
      handler: lazy(() => item.element),
      loader: item.loader
    }))
  }, [routes])

  useEffect(() => {
    const handlePopState = () => {
      setUrl(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return { url, routes: parsedRoutes }
}

export default function Router({ routes, fallback }) {
  const { url, routes: parsedRoutes } = useRouter(routes)
  const [match, setMatch] = useState(null)
  const [pending, setPending] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    const currentUrl = url === '' ? '/' : url
    const currentRequestId = ++requestId.current

    const matchedRoute = parsedRoutes.find(({ route }) => {
      const [reg] = route
      return currentUrl.match(reg)
    })

    if (!matchedRoute) {
        setMatch(null)
        setPending(false)
      return
    }

    // 解析路由参数
    const [reg, params] = matchedRoute.route
    const res = currentUrl.match(reg)
    const newProps = {}
    if (params.length > 0 && res) {
      params.forEach((prop, index) => (newProps[prop] = res[index + 1]))
    }

    const loadRoute = async () => {

      if (currentRequestId !== requestId.current) return

      setPending(true)
      
      let data = null

      if (typeof matchedRoute.loader === 'function') {
        try {
          data = await matchedRoute.loader(newProps)
        } catch (error) {
          console.error('Loader error:', error)
        }
      }

      if (currentRequestId === requestId.current) {
        setMatch({
          Component: matchedRoute.handler,
          props: { data, ...newProps },
        })
        setPending(false)
      }
    }

    loadRoute()
  }, [url, parsedRoutes])

  return (
    <Suspense fallback={fallback}>
      {pending ? fallback : null}
      {match ? <match.Component {...match.props} /> : null}
    </Suspense>
  )
}

export const push = (path) => {
  if (path.startsWith('.')) {
    path = window.location.pathname + path.slice(1)
  }
  if (window.location.pathname !== path) {
    history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

export const getPath = () => window.location.pathname