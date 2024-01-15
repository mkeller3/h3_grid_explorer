<template>
  <v-container fluid class="ma-0 pa-0 h-100">
    <v-row class="ma-0 pa-0 h-100" justify="center" v-if="!h3Store.h3IndexesBuilt">
      <v-col class="h-100 mx-auto text-center" cols="11" lg="6" v-if="!h3Store.h3IndexesConfigured">
        <div class="text-h3 mt-5">Welcome to the H3 Index Explorer</div>
        <div>H3 Index Explorer allows you to take an excel sheet of 1,000's of point and visualize them
          at multiple levels using h3 indexes. To get started, import your own file of locations or use
          the default template of US population.
        </div>
        <v-divider class="my-5" />
        <v-form>
          <v-file-input v-model="filePath" :update:modelValue="uploadFile()" label="Select Your Point Data"
            variant="outlined"></v-file-input>
          <v-container fluid v-if="filePath">
            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="h3Store.latColumn" :items="columns" label="Latitude Column" required variant="outlined"
                  hide-details></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="h3Store.lngColumn" :items="columns" label="Longitude Column" hide-details
                  variant="outlined" required></v-select>
              </v-col>
            </v-row>
            <v-btn color="success" variant="outlined" class="mt-3"
              :disabled="h3Store.lngColumn == '' || h3Store.latColumn == ''" @click="buildH3Indexes()">Build H3
              Indexes</v-btn>
          </v-container>
        </v-form>
        <v-divider class="mb-10" />
        <v-btn color="warning" variant="outlined" class="mt-3" @click="useDemoFile()">Use Demo File</v-btn>
      </v-col>
      <v-col v-else-if="h3Store.loading" class="h-100 mx-auto text-center" cols="auto">
        <v-progress-circular indeterminate color="primary" :size="400">
          <template v-slot:default> Creating H3 Grids <br> This may take up to one minute.</template>
        </v-progress-circular>
      </v-col>
    </v-row>
    <v-row class="ma-0 pa-0 h-100" v-else>
      <v-col class="ma-0 px-3 py-2 h-100" v-if="lgAndUp" cols="2">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>Style</v-expansion-panel-title>
            <v-expansion-panel-text style="height: 400px; overflow: auto;" class="mb-5">
              <div v-for="range in mapStore.styling">
                <v-row>
                  <v-col cols="12">
                    <v-text-field density="compact" v-model.number="range.max" type="number" label="Max Value"
                      variant="outlined"></v-text-field>
                  </v-col>

                </v-row>
                <input style="height: 20px;" type="color" @change="mapStore.updateStyle()" v-model="range.color" />
                <v-divider class="mb-2" />
              </div>
              <v-btn color="success" variant="outlined" @click="mapStore.updateStyle()">Update Styling</v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col class="ma-0 pa-0 h-100" cols="12" lg="10">
        <WebMap />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import WebMap from '@/components/WebMap.vue'
import { useH3Store } from '@/store/h3Store';
import { useMapStore } from '@/store/map';
import { read, utils } from 'xlsx';

const h3Store = useH3Store();
const mapStore = useMapStore();

const { lgAndUp } = useDisplay()
let filePath = ref("");
let columns = ref([]);
let latColumns = ["lat", "y", "latitude"];
let lngColumns = ["lng", "x", "longitude"];

function uploadFile() {
  if (filePath.value != "") {
    const reader = new FileReader();

    reader.onload = function () {
      columns.value = []
      h3Store.fileData = reader.result
      let workbook = read(reader.result);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = utils.sheet_to_json(worksheet, { header: 1 });
      for (let col in sheetData[0]) {
        columns.value.push(sheetData[0][col])
      }
      for (let col in sheetData[0]) {
        if (latColumns.includes(sheetData[0][col].toLowerCase())) {
          h3Store.latColumn = sheetData[0][col]
        }
        if (lngColumns.includes(sheetData[0][col].toLowerCase())) {
          h3Store.lngColumn = sheetData[0][col]
        }
      }
    };
    reader.readAsArrayBuffer(filePath.value[0]);
  }
}

async function buildH3Indexes() {
  h3Store.loading = true;
  h3Store.h3IndexesConfigured = true;
  await h3Store.generateH3Values();
}

async function useDemoFile() {
  h3Store.loading = true;
  h3Store.h3IndexesConfigured = true;
  h3Store.lngColumn = "lng";
  h3Store.latColumn = "lat"
  const response = await fetch("population_points.xlsx");
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  h3Store.fileData = await response.arrayBuffer()
  await h3Store.generateH3Values();
}

</script>
