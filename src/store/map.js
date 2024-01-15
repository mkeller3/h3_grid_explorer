// map.js
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import maplibregl from "maplibre-gl";
import { polygonToCells, cellToBoundary, cellToParent } from 'h3-js';

export const useMapStore = defineStore('mapStore', () => {
    let map = ref(null);
    let mapLoaded = ref(false)

    let zoomH3Map = ref({
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 4,
        "6": 5,
        "7": 6,
        "8": 7,
        "9": 7,
        "10": 8,
        "11": 8,
        "12": 9,
        "13": 9,
        "14": 10,
        "15": 10,
        "16": 10,
        "17": 10,
        "18": 10,
        "19": 10,
        "20": 10,
        "21": 10,
        "22": 10
    })

    let h3Map = ref({});
    0,
        '#F2F12D',
        1,
        '#EED322',
        2,
        '#E6B71E',
        5,
        '#DA9C20',
        10,
        '#CA8323',
        15,
        '#B86B25',
        20,
        '#A25626',
        25,
        '#8B4225',
        100,
        '#723122'

    let styling = ref([
        {
            "color": "#F2F12D",
            "max": 1,
        },
        {
            "color": "#EED322",
            "max": 2
        },
        {
            "color": "#E6B71E",
            "max": 5
        },
        {
            "color": "#DA9C20",
            "max": 10
        },
        {
            "color": "#CA8323",
            "max": 15
        },
        {
            "color": "#B86B25",
            "max": 20
        },
        {
            "color": "#A25626",
            "max": 25
        },
        {
            "color": "#8B4225",
            "max": 100
        }
    ])

    /**
     * Method used to build map
     */
    async function buildMap() {
        map.value = new maplibregl.Map({
            container: 'map',
            style: {
                'version': 8,
                'sources': {
                    'raster-tiles': {
                        'type': 'raster',
                        'tiles': [
                            'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
                        ],
                        'tileSize': 256,
                        'attribution':
                            '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href= "https://carto.com/about-carto/">CARTO</a>'
                    }
                },
                'layers': [
                    {
                        'id': 'simple-tiles',
                        'type': 'raster',
                        'source': 'raster-tiles',
                        'minzoom': 0,
                        'maxzoom': 22
                    }
                ]
            },
            center: [-95, 40],
            zoom: 4
        })

        map.value.addControl(new maplibregl.NavigationControl());

        map.value.on('moveend', function () {
            buildH3Cells()
        })
        
        map.value.on('render', function () {
            if(!mapLoaded.value){
                mapLoaded.value = true;
                buildH3Cells()
            }
        })

    }

    function buildH3Cells() {
        let bounds = map.value.getBounds();
        let ne = bounds.getNorthEast();
        let sw = bounds.getSouthWest();
        let coords = [
            [sw.lng, ne.lat],
            [sw.lng, sw.lat],
            [ne.lng, sw.lat],
            [ne.lng, ne.lat],
            [sw.lng, ne.lat]
        ]
        let zoomLevel = parseInt(map.value.getZoom())
        let cells = polygonToCells(coords, zoomH3Map.value[parseInt(zoomLevel)], true)
        let featureCollection = {
            "type": "FeatureCollection",
            "features": []
        }
        for (let cell in cells) {
            let count = 0
            if (h3Map.value[cells[cell]] != undefined) {
                count = h3Map.value[cells[cell]]['count']
            }
            featureCollection['features'].push({
                "type": "Feature",
                "properties": {
                    "h3": cells[cell],
                    "count": count
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [cellToBoundary(cells[cell], true)]
                }
            })
        }
        if (map.value.getSource('h3_index')) {
            map.value.getSource('h3_index').setData(featureCollection)
        } else {
            map.value.addSource('h3_index', {
                'type': 'geojson',
                'data': featureCollection
            });
        }
        if (!map.value.getLayer('h3_index')) {
            let colorRange = [
                'interpolate',
                ['linear'],
                ['get', 'count']
            ]
            colorRange.push(0)
            for (let range in styling.value) {
                colorRange.push(styling.value[range]['color'])
                colorRange.push(styling.value[range]['max'])
            }
            colorRange.push('#723122')
            map.value.addLayer({
                'id': 'h3_index',
                'type': 'fill',
                'source': 'h3_index',
                'paint': {
                    'fill-color': colorRange,
                    'fill-opacity': 0.5
                }
            });
            map.value.on('click', 'h3_index', (e) => {
                console.log(e.features)
            })
        }
    }

    function updateStyle() {
        let colorRange = [
            'interpolate',
            ['linear'],
            ['get', 'count']
        ]
        colorRange.push(0)
        for (let range in styling.value) {
            colorRange.push(styling.value[range]['color'])
            colorRange.push(styling.value[range]['max'])
        }
        colorRange.push('#723122')
        map.value.setPaintProperty('h3_index', 'fill-color', colorRange);
    }


    return {
        map,
        h3Map,
        zoomH3Map,
        styling,
        buildMap,
        updateStyle
    }

});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMapStore, import.meta.hot))
}
