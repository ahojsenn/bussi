<template lang="pug">
div 
  h1 
    a(href="https://miro.com/app/board/uXjVPyPTepA=/") Bussi
  <img src="/bussi.png"/>
</template>

<script setup lang="ts">

const appConfig = useAppConfig()
console.log(appConfig.theme)
</script>
