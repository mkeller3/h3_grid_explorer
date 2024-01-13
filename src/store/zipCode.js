// zipCode.js
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import { latLngToCell } from 'h3-js'
import { useMapStore } from '@/store/map';
import { cellToParent } from 'h3-js';
import { read, utils } from 'xlsx';

export const useZipCodeStore = defineStore('zipCodeStore', () => {
    let loading = ref(true)

    /**
     * Method used to generate the zip code variables
     */
    async function generateZipCodeVariables() {

        const response = await fetch("population_points.xlsx");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let file = await response.arrayBuffer()

        const workbook = read(file);

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const sheetData = utils.sheet_to_json(worksheet, { header: 0 });

        let h3IndexMap = {}
        sheetData.forEach(row => {
            let h3Value = latLngToCell(row['lat'], row['lng'], 10)
            for (var res = 1; res <= 9; res++) {
                let h3_value = cellToParent(h3Value, res)
                if (h3IndexMap[h3_value]) {
                    h3IndexMap[h3_value]['count'] = h3IndexMap[h3_value]['count'] += 1
                } else {
                    h3IndexMap[h3_value] = {
                        "count": 0
                    }
                }
            }
        })
        loading.value = false;
        useMapStore().h3Map = h3IndexMap;

    }

    return {
        generateZipCodeVariables,
        loading
    }

});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useZipCodeStore, import.meta.hot))
}
