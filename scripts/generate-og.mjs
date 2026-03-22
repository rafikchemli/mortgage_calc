import satori from 'satori'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Init WASM from node_modules
const wasmPath = join(root, 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm')
await initWasm(readFileSync(wasmPath))

// Fetch Outfit font (request TTF format — satori doesn't support WOFF2)
const fonts = await Promise.all(
  [400, 700].map(async (weight) => {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Outfit:wght@${weight}`,
      // Old Safari UA → Google Fonts returns TTF instead of WOFF2
      { headers: { 'User-Agent': 'Safari/604.1' } }
    )
    const css = await cssRes.text()
    const url = css.match(/url\(([^)]+)\)/)?.[1]
    const res = await fetch(url)
    return {
      name: 'Outfit',
      data: await res.arrayBuffer(),
      weight,
      style: 'normal',
    }
  })
)

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
              fontSize: 28,
              color: '#56506A',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: 20,
            },
            children: 'Montreal, Quebec, Canada',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 64,
              fontWeight: 700,
              color: '#C9A84C',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textAlign: 'center',
            },
            children: 'House Affordability',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 52,
              fontWeight: 400,
              color: '#8A849A',
              letterSpacing: '-0.01em',
              marginTop: 4,
            },
            children: 'for Couples',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: 40,
              fontSize: 20,
              color: '#3D7A66',
              letterSpacing: '0.08em',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '40px',
                    height: '1px',
                    background: '#272433',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  children: 'Find out what you can afford together',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    width: '40px',
                    height: '1px',
                    background: '#272433',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    width: 1200,
    height: 630,
    fonts,
  }
)

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
const png = resvg.render().asPng()

mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(join(root, 'public', 'og.png'), png)
console.log('✓ public/og.png generated (1200×630)')
