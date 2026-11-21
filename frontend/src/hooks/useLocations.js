import { useCallback, useEffect, useState } from 'react'
import { fetchLocations } from '../services/locations.js'

export function useLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    fetchLocations()
      .then((loadedLocations) => {
        if (active) {
          setLocations(loadedLocations)
          setError('')
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  const reload = useCallback(() => {
    setError('')
    setLoading(true)
    setReloadKey((key) => key + 1)
  }, [])

  return { locations, loading, error, reload }
}
