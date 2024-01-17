// h3.js
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import { latLngToCell } from 'h3-js'
import { useMapStore } from '@/store/map';
import { cellToParent } from 'h3-js';
import { read, utils } from 'xlsx';

export const useH3Store = defineStore('h3Store', () => {
    let loading = ref(false)
    let fileData = ref("");
    let latColumn = ref("");
    let lngColumn = ref("");
    let h3IndexesBuilt = ref(false);
    let h3IndexesConfigured = ref(false);

    /**
     * Method used to generate h3 grids
     */
    async function generateH3Values() {       
        
        loading.value = true;
        h3IndexesBuilt.value = true

        const workbook = read(fileData.value);

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const sheetData = utils.sheet_to_json(worksheet, { header: 0 });

        let h3IndexMap = {}
        sheetData.forEach(row => {
            let h3Value = latLngToCell(row[latColumn.value], row[lngColumn.value], 10)
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
        h3IndexesBuilt.value = true;

    }

    return {
        generateH3Values,
        loading,
        fileData,
        lngColumn,
        latColumn,
        h3IndexesBuilt,
        h3IndexesConfigured
    }

});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useH3Store, import.meta.hot))
}
