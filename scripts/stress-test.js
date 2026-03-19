import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50, // usuarios virtuales
  duration: '30s' // duracion de la prueba
}

export default function () {
  // Peticion 1: Suma normal
  let rest1 = http.get('http://host.docker.internal:3001/api/calculator?a=10&b=2&op=add')
  check(rest1, {
    'status is 200': (r) => r.status === 200
  })

  // Peticion 2: intento de Romperlo (dividir por cero)
  let res2 = http.get('http://host.docker.internal:3001/api/calculator?a=10&b=0&op=divide')
  check(res2, { 'status is 400(error controlado)': (r) => r.status === 400 })
  sleep(1) // Esperar 1 segundo antes de volver a atacar
}
