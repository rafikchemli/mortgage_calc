const CRAWLER_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|discordbot|embedly|quora|pinterest|slack|vkshare|facebot/i

function formatPrice(num) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(num)
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

export async function onRequest(context) {
  const { request, next } = context
  const url = new URL(request.url)
  const ua = request.headers.get('user-agent') || ''
  const price = url.searchParams.get('p')

  // Skip middleware for API routes (e.g. /api/og image generation)
  if (url.pathname.startsWith('/api/')) {
    return next()
  }

  if (price && CRAWLER_UA.test(ua)) {
    const html = buildOgHtml(Number(price), url.toString(), url.origin)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    })
  }

  return next()
}
