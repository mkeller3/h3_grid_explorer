<template>
  <v-container fluid class="ma-0 pa-0 h-100">
    <v-row class="ma-0 pa-0 h-100" justify="center">
      <v-col class="h-100 mx-auto"  cols="auto" v-if="zipCodeStore.loading">
        <v-progress-circular indeterminate color="primary" :size="400">
          <template v-slot:default> Creating H3 Grids </template>
        </v-progress-circular>
      </v-col>
      <v-col class="ma-0 pa-0 h-100" cols="12" v-else>
        <WebMap />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import WebMap from '@/components/WebMap.vue'
import { useZipCodeStore } from '@/store/zipCode';

const zipCodeStore = useZipCodeStore();

onMounted(async () => {
  await zipCodeStore.generateZipCodeVariables()
})
</script>
