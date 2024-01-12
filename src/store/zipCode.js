// zipCode.js
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import { latLngToCell } from 'h3-js'

export const useZipCodeStore = defineStore('zipCodeStore', () => {
    let zipCodeMap = ref(null)
    let zipCodeList = ref([])
    let zipCodeGeojson = ref()

    /**
     * Method used to generate the zip code variables
     */
    async function generateZipCodeVariables(){
        if(zipCodeMap.value == null){

            const response = await fetch("geojson/zip_centroids.geojson");
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            let zipCodeObject = {}

            let zipCodes = await response.json()

            zipCodeGeojson.value = zipCodes

            zipCodes['features'].forEach(feature => {
                zipCodeObject[feature['properties']['ZCTA5CE20']] = {
                    "lat": feature['geometry']['coordinates'][1],
                    "lng": feature['geometry']['coordinates'][0],
                    "h3": latLngToCell(feature['geometry']['coordinates'][1],feature['geometry']['coordinates'][0],10)
                }
                zipCodeList.value.push(feature['properties']['ZCTA5CE20'])
            });

            zipCodeMap.value = zipCodeObject
        }
     
    }

    return{
        generateZipCodeVariables,
        zipCodeList,
        zipCodeMap,
        zipCodeGeojson
    }

});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useZipCodeStore, import.meta.hot))
}
