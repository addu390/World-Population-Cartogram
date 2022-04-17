# 🗺️ World Population Cartogram

Demo: [https://www.pyblog.xyz/population-cartogram/](https://www.pyblog.xyz/population-cartogram/)

A cartogram is a map in which the geometry of regions is distorted in order to convey the information of an alternate variable such as population. The region area will be inflated or deflated according to its numeric value

<img src="https://github.com/addu390/population-cartogram/blob/master/images/cartogram.gif"/>

## Project set-up

- Install dependencies: `npm install`
- Start server: `npx parcel index.html`
- Deploy (gh-pages): `npm run deploy`

## Dataset

- [Raster Grid](https://sedac.ciesin.columbia.edu/data/set/gpw-v4-national-identifier-grid-rev11)
- [Topojson](https://raw.githubusercontent.com/addu390/population-cartogram/master/data/test2/topo.json) - Max Roser's 2018 world population carogram by [@mattdzugan](https://github.com/mattdzugan/World-Population-Cartogram)

## 📒 Citations

```
Max Roser (2018) – "The map we need if we want to think about how global living conditions are changing". Published online at OurWorldInData.org. Retrieved from: ‘https://ourworldindata.org/world-population-cartogram’ [Online Resource]

Max's relevant citations:
This data I took from the UN Population Division and you can access that data and visualize it for other countries on our map here. https://ourworldindata.org/grapher/UN-population-projection-medium-variant?year=2018
The 2018 data is a future projection that the UN Population Division created last year.
Other data – the US in 1776, the population of various metropolitan areas, and the population of some small countries – are mostly from Wikipedia.
```