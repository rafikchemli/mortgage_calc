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
  const formatted = formatPrice(price)

  if (!wasmInitialized) {
    await initWasm(resvgWasm)
    wasmInitialized = true
  }

  // Fetch the Outfit font for the price display
  const fontRes = await fetch(
    'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4a0EwItq6fNIg.ttf'
  )
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
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
          fontFamily: 'Outfit',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: 28,
                color: '#9ca3af',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 16,
              },
              children: 'You can afford',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 96,
                fontWeight: 700,
                color: '#d4a843',
                letterSpacing: '-0.02em',
              },
              children: formatted,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 22,
                color: '#6b7280',
                marginTop: 24,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              },
              children: 'Montreal, Quebec, Canada',
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
