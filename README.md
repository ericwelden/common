# Common

A neighborhood app: visualize the neighborhood on an interactive map, with resource
sharing and neighbor-offered services planned next.

Built with [Next.js](https://nextjs.org) and [Leaflet](https://leafletjs.com)
(OpenStreetMap tiles).

## Run it locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project layout

- `src/app/page.js` — the home page (header + map)
- `src/components/NeighborhoodMap.js` — the interactive Leaflet map
- `src/components/MapLoader.js` — client-side loader for the map (Leaflet needs a browser)
- `src/data/neighborhood.js` — map center, zoom, and points of interest; edit this to
  move the map or add markers

## Roadmap

- [x] Interactive neighborhood map
- [ ] Resource sharing (tools, produce, spare items)
- [ ] Services offered/requested by neighbors
- [ ] Accounts so neighbors can post their own pins
