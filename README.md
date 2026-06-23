# AstroBot

Prototipo de una experiencia de autoconocimiento que combina una carta natal calculada, preguntas personales estructuradas y una lectura generada con OpenAI.

## Desarrollo local

```bash
npm install
npm run dev
```

- Aplicacion: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:3001`
- Salud del backend: `GET /api/health`

Crear un archivo `.env` local, excluido de Git, con:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
OPENAI_MAX_OUTPUT_TOKENS=1600
PORT=3001
```

Las claves nunca deben enviarse al frontend, anadirse al repositorio ni compartirse en conversaciones. Una clave expuesta debe revocarse y reemplazarse antes de volver a utilizarse.

## Motor astrologico

El prototipo utiliza Swiss Ephemeris mediante el paquete `sweph` para desarrollo, evaluacion y validacion del producto.

Antes de cualquier lanzamiento publico comercial, monetizacion o distribucion, se debe revisar el uso completo de Swiss Ephemeris y elegir una modalidad de licencia compatible con el producto. Esto incluye evaluar las obligaciones de AGPL y, si corresponde, adquirir una licencia profesional. La validacion tecnica del prototipo no constituye una decision de licencia para produccion.

Referencias:

- https://www.astro.com/swisseph/swephinfo_e.htm
- https://www.astro.com/swisseph/swephprg.htm
- https://github.com/timotejroiko/sweph

## Estado actual

- Captura de fecha, hora 24h, lugar de nacimiento y redaccion gramatical.
- Autocompletado de ciudad y pais.
- Conversion de hora local a UTC.
- Calculo de planetas, casas, Ascendente, Medio Cielo y aspectos.
- Ocho preguntas estructuradas por ejes de vida.
- Cada respuesta incluye intensidad, modo interpretativo y objetivos astrologicos.
- Generacion de lectura estructurada mediante OpenAI.
- Sin generacion local de respaldo: si OpenAI falla, la app informa que no pudo generar la lectura.
- Envio a OpenAI de un perfil astrologico sintetizado, respuestas orientadas y preferencia gramatical; no se envian fecha, hora ni ubicacion.

## Despliegue

El proyecto incluye `vercel.json` y una entrada serverless en `api/index.ts`.

Variables recomendadas en Vercel:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
OPENAI_MAX_OUTPUT_TOKENS=1600
```

El repositorio no debe incluir `.env`. Antes de un lanzamiento publico o comercial debe repetirse la revision de licencia de Swiss Ephemeris indicada arriba.
