import { useState, useEffect, useRef } from 'react'

export function useAlmacenamientoLocal<T>(clave: string, valorInicial: T) {
  const [valor, setValor] = useState<T>(() => {
    const guardado = localStorage.getItem(clave)
    return guardado ? (JSON.parse(guardado) as T) : valorInicial
  })

  const montado = useRef(false)

  useEffect(() => {
    if (!montado.current) {
      montado.current = true
      return
    }
    localStorage.setItem(clave, JSON.stringify(valor))
  }, [clave, valor])

  return [valor, setValor] as const
}
