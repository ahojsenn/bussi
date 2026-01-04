<template lang="pug">
div.popup {{ props.data }}
  br
  button(type="button"  @click="$emit('closePopup')" ) close
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: String,
  }
})
</script>

<style lang="css">
/*  a nice flowery popup with a border that floats in the center on top of the page */
.popup {
  position: fixed;
  top: 50%;
  /* center the popup */
  /* left: 50%; */
  /* transform: translate(-50%, -50%); */
  left: 50%;
  transform: translate(-50%, -50%);
  border: 4px solid rgb(237, 107, 15);
  padding: 1em;
  background-color: rgba(232, 207, 207, 0.712);
  border-radius: 10px;
  color:rgb(186, 5, 99);
}
/* make a nice fitting button and align it in the middle */
button {
  display: block;
  margin: 10px auto;
  padding: 1em 1em;
  background-color: rgb(237, 107, 15);
  color: white;
  border: none;
  border-radius: 5px;
}

</style>