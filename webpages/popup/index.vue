<template>
  <p>Hello, World!</p>
</template>

<script lang="ts">
import saPromise from '../../content';

export default {
  created() {
  }
}

saPromise.then(SA => {
  SA.getAddon('single-file-addon').getSetting('experimentalKeys').setAny(true);
});
</script>

<style>
p {
  color: red;
}
</style>