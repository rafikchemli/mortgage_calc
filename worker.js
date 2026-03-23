import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'

const CRAWLER_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|discordbot|embedly|quora|pinterest|slack|vkshare|facebot/i

let wasmInitialized = false

// Dark theme colors (matches app .dark)
const BG = '#0C0A09'
const GOLD = '#D4A017'
const TEXT = '#FAFAF9'
const MUTED = '#A8A29E'
const SURFACE2 = '#292524'
const BORDER = 'rgba(255,255,255,0.06)'
const TEAL = '#2DD4BF'

function formatPrice(num) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(num)
}

function buildOgHtml(price, url, origin) {
  const formatted = formatPrice(price)
  const title = `We can afford ${formatted} in Montreal`
  const description = 'House Affordability Calculator for Couples — Montreal, Quebec, Canada'
  const ogImage = `${origin}/api/og?p=${price}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImage}" />
  <title>${title}</title>
  <meta http-equiv="refresh" content="0;url=${url}" />
</head>
<body><p>Redirecting...</p></body>
</html>`
}

async function loadFont() {
  const cssRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
  )
  const css = await cssRes.text()
  const fontUrls = [...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1])
  const fonts = []
  for (const fontUrl of fontUrls) {
    const res = await fetch(fontUrl)
    fonts.push(await res.arrayBuffer())
  }
  return fonts
}

/* ── Base OG image (no price — welcome screen style) ── */
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
        // House icon (simplified SVG as text)
        {
          type: 'div',
          props: {
            style: {
              fontSize: 64,
              marginBottom: 24,
            },
            children: '🏠',
          },
        },
        // Title
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 64,
                    fontWeight: 700,
                    color: TEXT,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    textAlign: 'center',
                  },
                  children: 'How much house',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 64,
                    fontWeight: 700,
                    color: GOLD,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    textAlign: 'center',
                  },
                  children: 'can you afford?',
                },
              },
            ],
          },
        },
        // Subtitle
        {
          type: 'div',
          props: {
            style: {
              fontSize: 28,
              color: MUTED,
              marginTop: 24,
              textAlign: 'center',
              lineHeight: 1.5,
            },
            children: 'A few questions about your finances. A clear answer in 30 seconds.',
          },
        },
        // Feature pills row
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              gap: 16,
              marginTop: 40,
            },
            children: ['100% private', '30 seconds', 'Quebec 2025 rates'].map(label => ({
              type: 'div',
              props: {
                style: {
                  fontSize: 20,
                  color: MUTED,
                  padding: '10px 24px',
                  borderRadius: 999,
                  border: `1px solid ${SURFACE2}`,
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

/* ── Shared OG image (with price — reveal screen style) ── */
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
        // Label
        {
          type: 'div',
          props: {
            style: {
              fontSize: 32,
              color: MUTED,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 20,
            },
            children: 'You can afford up to',
          },
        },
        // Price
        {
          type: 'div',
          props: {
            style: {
              fontSize: 148,
              fontWeight: 700,
              color: GOLD,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            },
            children: formatPrice(price),
          },
        },
        // Location
        {
          type: 'div',
          props: {
            style: {
              fontSize: 26,
              color: MUTED,
              marginTop: 32,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            },
            children: 'Montreal, Quebec',
          },
        },
        // App branding
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 40,
              padding: '10px 28px',
              borderRadius: 999,
              border: `1px solid ${SURFACE2}`,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: 20, color: TEAL },
                  children: '🏠',
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 20, color: MUTED },
                  children: 'nestify.rafikchemli.com',
                },
              },
            ],
          },
        },
      ],
    },
  }
}

async function generateOgImage(price) {
  if (!wasmInitialized) {
    await initWasm(resvgWasm)
    wasmInitialized = true
  }

  const fontBuffers = await loadFont()
  const layout = price > 0 ? buildPriceOgLayout(price) : buildBaseOgLayout()

  const fontConfigs = []
  const weights = [400, 600, 700]
  fontBuffers.forEach((data, i) => {
    fontConfigs.push({
      name: 'Outfit',
      data,
      weight: weights[i] || 700,
      style: 'normal',
    })
  })
  // Ensure at least one font
  if (fontConfigs.length === 0) throw new Error('No fonts loaded')

  const svg = await satori(layout, {
    width: 1200,
    height: 630,
    fonts: fontConfigs,
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  return resvg.render().asPng()
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Handle OG image generation (both base and with price)
    if (url.pathname === '/api/og') {
      const price = Number(url.searchParams.get('p')) || 0
      try {
        const png = await generateOgImage(price)
        return new Response(png, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      } catch (e) {
        return new Response(`Error generating image: ${e.message}`, { status: 500 })
      }
    }

    // Handle crawler requests for OG meta tags
    const ua = request.headers.get('user-agent') || ''
    const price = url.searchParams.get('p')
    if (price && CRAWLER_UA.test(ua)) {
      const html = buildOgHtml(Number(price), url.toString(), url.origin)
      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      })
    }

    // Try static assets first, fall back to index.html for SPA routing
    const assetResponse = await env.ASSETS.fetch(request)
    if (assetResponse.ok) return assetResponse
    // SPA fallback: serve index.html for any non-asset path
    return env.ASSETS.fetch(new URL('/index.html', request.url))
  },
}
