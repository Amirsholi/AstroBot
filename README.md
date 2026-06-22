# AstroBot

Prototipo de una experiencia de autoconocimiento que combina una carta natal calculada, preguntas personales estructuradas y una devolución generada con IA.

## Desarrollo local

```bash
npm install
npm run dev
```

- Aplicación: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:3001`
- Salud del backend: `GET /api/health`

Crear un archivo `.env` local, excluido de Git, con:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
REPORT_PROVIDER=rules
PORT=3001
```

Las claves nunca deben enviarse al frontend, añadirse al repositorio ni compartirse en conversaciones. Una clave expuesta debe revocarse y reemplazarse antes de volver a utilizarse.

## Motor astrológico

El prototipo utiliza Swiss Ephemeris mediante el paquete `sweph` para desarrollo, evaluación y validación del producto.

Antes de cualquier lanzamiento público comercial, monetización o distribución, se debe revisar el uso completo de Swiss Ephemeris y elegir una modalidad de licencia compatible con el producto. Esto incluye evaluar las obligaciones de AGPL y, si corresponde, adquirir una licencia profesional. La validación técnica del prototipo no constituye una decisión de licencia para producción.

Referencias:

- https://www.astro.com/swisseph/swephinfo_e.htm
- https://www.astro.com/swisseph/swephprg.htm
- https://github.com/timotejroiko/sweph

## Estado actual

- Captura de fecha y hora con formato automático.
- Selector AM/PM.
- Autocompletado de ciudad y país.
- Conversión de hora local a UTC.
- Cálculo de planetas, casas, Ascendente, Medio Cielo y aspectos.
- Flujo de preguntas configurable.
- Generación de informe estructurado mediante OpenAI Responses API.
- Generación local determinista disponible con `REPORT_PROVIDER=rules`.
- Prompt y conocimiento astrológico separados del código de interfaz.
- Envío a OpenAI limitado a posiciones, aspectos y respuestas; no se envían fecha, hora ni ubicación.

## Próxima fase

Reemplazar las preguntas provisionales y ajustar el contrato editorial definitivo del informe. La integración está preparada para modificar ambos sin cambiar el motor astrológico.

## Despliegue de pre-prueba

El proyecto incluye `vercel.json` y una entrada serverless en `api/index.ts`. Para esta fase se despliega con `REPORT_PROVIDER=rules`; no necesita una clave de OpenAI.

Variable recomendada en Vercel:

```env
REPORT_PROVIDER=rules
```

El repositorio no debe incluir `.env`. Antes de un lanzamiento público o comercial debe repetirse la revisión de licencia de Swiss Ephemeris indicada arriba.
