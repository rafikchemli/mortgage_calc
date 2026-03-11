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
              children: formatPrice(price),
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

    // Fall through to static assets
    return env.ASSETS.fetch(request)
  },
}
