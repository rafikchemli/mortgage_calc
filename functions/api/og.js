import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'

let wasmInitialized = false

const BG = '#0C0A09'
const GOLD = '#D4A017'
const TEXT = '#FAFAF9'
const MUTED = '#A8A29E'
const SURFACE2 = '#292524'
const TEAL = '#2DD4BF'

function formatPrice(num) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(num)
}

function buildBaseOgLayout() {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1200px',
        height: '630px',
        background: BG,
        fontFamily: 'Outfit',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { fontSize: 64, marginBottom: 24 },
            children: '🏠',
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 64, fontWeight: 700, color: TEXT,
                    letterSpacing: '-0.02em', lineHeight: 1.15, textAlign: 'center',
                  },
                  children: 'How much house',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 64, fontWeight: 700, color: GOLD,
                    letterSpacing: '-0.02em', lineHeight: 1.15, textAlign: 'center',
                  },
                  children: 'can you afford?',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: 28, color: MUTED, marginTop: 24, textAlign: 'center', lineHeight: 1.5 },
            children: 'A few questions about your finances. A clear answer in 30 seconds.',
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: 16, marginTop: 40 },
            children: ['100% private', '30 seconds', 'Quebec 2025 rates'].map(label => ({
              type: 'div',
              props: {
                style: {
                  fontSize: 20, color: MUTED, padding: '10px 24px',
                  borderRadius: 999, border: `1px solid ${SURFACE2}`,
                },
                children: label,
              },
            })),
          },
        },
      ],
    },
  }
}

function buildPriceOgLayout(price) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1200px',
        height: '630px',
        background: BG,
        fontFamily: 'Outfit',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: 32, color: MUTED, letterSpacing: '0.2em',
              textTransform: 'uppercase', marginBottom: 20,
            },
            children: 'You can afford up to',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 148, fontWeight: 700, color: GOLD,
              letterSpacing: '-0.03em', lineHeight: 1,
            },
            children: formatPrice(price),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 26, color: MUTED, marginTop: 32,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            },
            children: 'Montreal, Quebec',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 40, padding: '10px 28px',
              borderRadius: 999, border: `1px solid ${SURFACE2}`,
            },
            children: [
              { type: 'div', props: { style: { fontSize: 20, color: TEAL }, children: '🏠' } },
              { type: 'div', props: { style: { fontSize: 20, color: MUTED }, children: 'nestify.rafikchemli.com' } },
            ],
          },
        },
      ],
    },
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const price = Number(url.searchParams.get('p')) || 0

  if (!wasmInitialized) {
    await initWasm(resvgWasm)
    wasmInitialized = true
  }

  const cssRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Outfit:wght@700',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
  )
  const css = await cssRes.text()
  const fontUrl = css.match(/url\(([^)]+)\)/)?.[1]
  if (!fontUrl) throw new Error('Could not find font URL')
  const fontRes = await fetch(fontUrl)
  const fontData = await fontRes.arrayBuffer()

  const layout = price > 0 ? buildPriceOgLayout(price) : buildBaseOgLayout()

  const svg = await satori(layout, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Outfit', data: fontData, weight: 700, style: 'normal' }],
  })

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const png = resvg.render().asPng()

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
