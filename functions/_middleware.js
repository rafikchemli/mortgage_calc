const CRAWLER_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|discordbot|embedly|quora|pinterest|slack|vkshare|facebot/i

function formatPrice(num) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(num)
}

function buildOgHtml(price, url, origin) {
  const hasPrice = price != null
  const title = hasPrice
    ? `We can afford ${formatPrice(price)} in Montreal`
    : 'House Affordability Calculator for Couples'
  const description = hasPrice
    ? 'House Affordability Calculator for Couples — Montreal, Quebec, Canada'
    : 'Find out what you can afford together in Montreal, Quebec'
  const ogImage = hasPrice
    ? `${origin}/api/og?p=${price}`
    : `${origin}/og.png`

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

  // Skip middleware for API routes and static assets
  if (url.pathname.startsWith('/api/') || url.pathname.match(/\.\w+$/)) {
    return next()
  }

  if (CRAWLER_UA.test(ua)) {
    const html = buildOgHtml(price ? Number(price) : null, url.toString(), url.origin)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    })
  }

  return next()
}
