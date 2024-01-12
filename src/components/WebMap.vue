<template>
    <div id="map"></div>
</template>

<script setup>

import { onMounted } from 'vue';
import { useMapStore } from '@/store/map';

const mapStore = useMapStore();

onMounted(async() => {
    mapStore.buildMap()
})
</script>


<style scoped>
#map {
    height: 100%;
}
</style>