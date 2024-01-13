// map.js
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import maplibregl from "maplibre-gl";
import { polygonToCells, cellToBoundary, cellToParent } from 'h3-js';
import { useZipCodeStore } from '@/store/zipCode';

export const useMapStore = defineStore('mapStore', () => {
    let map = ref(null);

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
                if(h3Map.value[cells[cell]] != undefined){
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
                map.value.addLayer({
                    'id': 'h3_index',
                    'type': 'fill',
                    'source': 'h3_index',
                    'paint': {
                        'fill-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'count'],
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
                            ],
                        'fill-opacity': 0.5
                    }
                });
                map.value.on('click', 'h3_index', (e) => {
                    console.log(e.features)
                })
            }

        })

    }


    return {
        map,
        h3Map,
        zoomH3Map,
        buildMap,
    }

});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMapStore, import.meta.hot))
}
