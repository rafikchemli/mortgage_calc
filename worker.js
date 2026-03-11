import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'

const CRAWLER_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|discordbot|embedly|quora|pinterest|slack|vkshare|facebot/i

let wasmInitialized = false

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

async function generateOgImage(price) {
  if (!wasmInitialized) {
    await initWasm(resvgWasm)
    wasmInitialized = true
  }

  // Fetch font via Google Fonts CSS API (more reliable from Workers)
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
  return resvg.render().asPng()
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Handle OG image generation
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
