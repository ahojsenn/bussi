<template lang="pug">
div 
  h1 
    a(href="https://miro.com/app/board/uXjVPyPTepA=/") Bussi
  nuxt-img(src="../../bussi/img/bussi.png" sizes="xs:320px sm:400px md:750px lg:1000px"  )
</template>

<script setup lang="ts">

const appConfig = useAppConfig()
console.log(appConfig.theme)
</script>
