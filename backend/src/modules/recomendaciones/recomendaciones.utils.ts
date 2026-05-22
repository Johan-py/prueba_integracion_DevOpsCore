import {
  PreferenciasUsuario,
  ReglasAvanzadasConfig,
  SimilaridadFuerte
} from './recomendaciones.types.js'

export class ScoreCalculator {
  calcularScore(
    inmueble: any,
    preferencias: PreferenciasUsuario,
    esFavoritoSimilar: boolean = false
  ): { score: number; razones: string[] } {
    let scoreTotal = 0
    const razones: string[] = []

    const zonaInmueble = inmueble.ubicacion?.zona || ''
    const pesoZona = preferencias.zonasPreferidas.get(zonaInmueble) || 0
    if (pesoZona > 0) {
      const puntosZona = pesoZona * 40
      scoreTotal += puntosZona
      razones.push(`Zona "${zonaInmueble}" +${puntosZona.toFixed(1)}pts`)
    }

    const categoriaInmueble = inmueble.categoria || ''
    const pesoCategoria = preferencias.categoriasPreferidas.get(categoriaInmueble) || 0
    if (pesoCategoria > 0) {
      const puntosCategoria = pesoCategoria * 25
      scoreTotal += puntosCategoria
      razones.push(`Categoría "${categoriaInmueble}" +${puntosCategoria.toFixed(1)}pts`)
    }

    if (preferencias.rangoPrecio) {
      const precio = Number(inmueble.precio)
      const { min, max } = preferencias.rangoPrecio

      if (precio >= min && precio <= max) {
        const cercania = 1 - Math.min(Math.abs(precio - (min + max) / 2) / ((max - min) / 2), 1)
        const puntosPrecio = 20 * cercania
        scoreTotal += puntosPrecio
        razones.push(`Precio $${precio} dentro del rango +${puntosPrecio.toFixed(1)}pts`)
      } else if (Math.abs(precio - min) / min < 0.3) {
        scoreTotal += 10
        razones.push(`Precio $${precio} cerca del rango +10pts`)
      }
    }

    if (preferencias.rangoSuperficie && inmueble.superficieM2) {
      const superficie = Number(inmueble.superficieM2)
      const { min, max } = preferencias.rangoSuperficie

      if (superficie >= min && superficie <= max) {
        scoreTotal += 10
        razones.push(`Superficie ${superficie}m² dentro del rango +10pts`)
      }
    }

    if (esFavoritoSimilar) {
      scoreTotal += 15
      razones.push(`Similar a favoritos +15pts`)
    }

    return { score: scoreTotal, razones }
  }
  calcularScoreAvanzado(
    inmueble: any,
    preferencias: PreferenciasUsuario,
    favoritos: any[],
    totalClics: number,
    config: ReglasAvanzadasConfig = {
      umbralClicsRecomendacionAvanzada: 5,
      pesoFavoritoSimilar: 15,
      pesoZonaConexion: 10,
      pesoSimilaridadFuerte: 20
    }
  ): { score: number; razones: string[]; similaridadFuerte: SimilaridadFuerte } {
    let scoreTotal = 0
    const razones: string[] = []

    const esAvanzado = totalClics >= config.umbralClicsRecomendacionAvanzada
    const zonaInmueble = inmueble.ubicacion?.zona || ''
    const pesoZona = preferencias.zonasPreferidas.get(zonaInmueble) || 0
    const pesoBaseZona = esAvanzado ? 50 : 40
    if (pesoZona > 0) {
      const puntosZona = pesoZona * pesoBaseZona
      scoreTotal += puntosZona
      razones.push(`Zona "${zonaInmueble}" +${puntosZona.toFixed(1)}pts`)
    }
    const categoriaInmueble = inmueble.categoria || ''
    const pesoCategoria = preferencias.categoriasPreferidas.get(categoriaInmueble) || 0
    const pesoBaseCategoria = esAvanzado ? 30 : 25
    if (pesoCategoria > 0) {
      const puntosCategoria = pesoCategoria * pesoBaseCategoria
      scoreTotal += puntosCategoria
      razones.push(`Categoría "${categoriaInmueble}" +${puntosCategoria.toFixed(1)}pts`)
    }
    let rangoPrecioCercano = false
    if (preferencias.rangoPrecio) {
      const precio = Number(inmueble.precio)
      const { min, max } = preferencias.rangoPrecio
      if (precio >= min && precio <= max) {
        const cercania = 1 - Math.min(Math.abs(precio - (min + max) / 2) / ((max - min) / 2), 1)
        const puntosPrecio = 20 * cercania
        scoreTotal += puntosPrecio
        razones.push(`Precio $${precio} dentro del rango +${puntosPrecio.toFixed(1)}pts`)
        rangoPrecioCercano = true
      } else if (Math.abs(precio - min) / min < 0.3) {
        scoreTotal += 10
        razones.push(`Precio $${precio} cerca del rango +10pts`)
        rangoPrecioCercano = true
      }
    }
    let rangoSuperficieCercano = false
    if (preferencias.rangoSuperficie && inmueble.superficieM2) {
      const superficie = Number(inmueble.superficieM2)
      const { min, max } = preferencias.rangoSuperficie
      if (superficie >= min && superficie <= max) {
        scoreTotal += 10
        razones.push(`Superficie ${superficie}m² dentro del rango +10pts`)
        rangoSuperficieCercano = true
      }
    }
    let similaridadFuerte: SimilaridadFuerte = {
      mismaZona: false,
      mismaCategoria: false,
      rangoPrecioCercano: false,
      rangoSuperficieCercano: false
    }
    let mejorScoreFavorito = 0

    for (const favorito of favoritos) {
      let puntosFav = 0
      const sim: SimilaridadFuerte = {
        mismaZona: false,
        mismaCategoria: false,
        rangoPrecioCercano: false,
        rangoSuperficieCercano: false
      }

      if (favorito.ubicacion?.zona === zonaInmueble) {
        puntosFav += 5
        sim.mismaZona = true
      }
      if (favorito.categoria === categoriaInmueble) {
        puntosFav += 5
        sim.mismaCategoria = true
      }

      const precioFav = Number(favorito.precio)
      const precioActual = Number(inmueble.precio)
      if (precioFav > 0 && Math.abs(precioActual - precioFav) / precioFav <= 0.2) {
        puntosFav += 4
        sim.rangoPrecioCercano = true
      }

      const supFav = Number(favorito.superficieM2)
      const supActual = Number(inmueble.superficieM2)
      if (supFav > 0 && supActual > 0 && Math.abs(supActual - supFav) / supFav <= 0.2) {
        puntosFav += 3
        sim.rangoSuperficieCercano = true
      }

      if (puntosFav > mejorScoreFavorito) {
        mejorScoreFavorito = puntosFav
        similaridadFuerte = sim
      }
    }
    if (mejorScoreFavorito > 0) {
      const bonoFav = esAvanzado
        ? config.pesoFavoritoSimilar + mejorScoreFavorito / 2
        : config.pesoFavoritoSimilar
      scoreTotal += bonoFav
      razones.push(`Similar a favoritos +${bonoFav.toFixed(1)}pts`)
    }
    if (esAvanzado) {
      const coincidencias = [
        similaridadFuerte.mismaZona,
        similaridadFuerte.mismaCategoria,
        similaridadFuerte.rangoPrecioCercano,
        similaridadFuerte.rangoSuperficieCercano
      ].filter(Boolean).length

      if (coincidencias >= 3) {
        scoreTotal += config.pesoSimilaridadFuerte
        razones.push(`Similaridad fuerte (${coincidencias}/4) +${config.pesoSimilaridadFuerte}pts`)
      }

      razones.push(`🎯 Modo avanzado activado (${totalClics} clics)`)
    }

    return { score: scoreTotal, razones, similaridadFuerte }
  }
  extraerPreferencias(
    historialVistas: any[],
    ultimasBusquedas: any[],
    favoritos: any[]
  ): PreferenciasUsuario {
    const zonasPreferidas = new Map<string, number>()
    const categoriasPreferidas = new Map<string, number>()
    let totalPeso = 0
    const precios: number[] = []
    const superficies: number[] = []

    for (const vista of historialVistas) {
      const inmueble = vista.inmueble
      const peso = vista.peso
      totalPeso += peso

      const zona = inmueble.ubicacion?.zona
      if (zona) {
        zonasPreferidas.set(zona, (zonasPreferidas.get(zona) || 0) + peso)
      }

      const categoria = inmueble.categoria
      if (categoria) {
        categoriasPreferidas.set(categoria, (categoriasPreferidas.get(categoria) || 0) + peso)
      }

      if (inmueble.precio) precios.push(Number(inmueble.precio))
      if (inmueble.superficieM2) superficies.push(Number(inmueble.superficieM2))
    }

    for (const favorito of favoritos) {
      const zona = favorito.ubicacion?.zona
      if (zona) {
        zonasPreferidas.set(zona, (zonasPreferidas.get(zona) || 0) + 5)
      }

      const categoria = favorito.categoria
      if (categoria) {
        categoriasPreferidas.set(categoria, (categoriasPreferidas.get(categoria) || 0) + 5)
      }
    }

    if (totalPeso > 0) {
      for (const [zona, peso] of zonasPreferidas) {
        zonasPreferidas.set(zona, peso / totalPeso)
      }
      for (const [categoria, peso] of categoriasPreferidas) {
        categoriasPreferidas.set(categoria, peso / totalPeso)
      }
    }

    let rangoPrecio = null
    if (precios.length > 0) {
      const media = precios.reduce((a, b) => a + b, 0) / precios.length
      rangoPrecio = { min: media * 0.7, max: media * 1.3 }
    }

    let rangoSuperficie = null
    if (superficies.length > 0) {
      const media = superficies.reduce((a, b) => a + b, 0) / superficies.length
      rangoSuperficie = { min: media * 0.7, max: media * 1.3 }
    }

    return {
      zonasPreferidas,
      categoriasPreferidas,
      rangoPrecio,
      rangoSuperficie,
      ultimasBusquedas: ultimasBusquedas.map((b: any) => b.query || b.termino).filter(Boolean),
      totalClics: historialVistas.length
    }
  }
}
