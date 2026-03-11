import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'

let wasmInitialized = false

function formatPrice(num) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(num)
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const price = Number(url.searchParams.get('p')) || 0

  if (!wasmInitialized) {
    await initWasm(resvgWasm)
    wasmInitialized = true
  }

  // Fetch font via Google Fonts CSS API (more reliable)
  const cssRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Outfit:wght@700',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
  )
  const css = await cssRes.text()
  const fontUrl = css.match(/url\(([^)]+)\)/)?.[1]
  if (!fontUrl) throw new Error('Could not find font URL')
  const fontRes = await fetch(fontUrl)
  const fontData = await fontRes.arrayBuffer()

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200px',
          height: '630px',
          background: '#0E0C15',
          fontFamily: 'Outfit',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: 40,
                color: '#8A849A',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 16,
              },
              children: 'YOU CAN AFFORD',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 168,
                fontWeight: 700,
                color: '#C9A84C',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              },
              children: formatPrice(price),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 32,
                color: '#56506A',
                marginTop: 24,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              },
              children: 'MONTREAL, QUEBEC, CANADA',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Outfit',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  const png = resvg.render().asPng()

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
