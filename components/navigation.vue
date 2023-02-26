<template lang="pug">
nav.menu
  input#burger-menu-toggle01.burger-menu-toggle(type="checkbox")
  label(for="burger-menu-toggle01")
    .burger-menu
      div 
      span 
      span      
      span 
  .responsive-menu
    span.burgerMenuText
      NuxtLink(to="/") 
        Nuxt home
    span.burgerMenuText
      NuxtLink(to="/balance") 
        Nuxt balance
    span.burgerMenuText
      NuxtLink(to="/stakeholder") 
        Nuxt stakeholder
    span.burgerMenuText
      NuxtLink(to="/accounts") 
       Nuxt accounts
    span.burgerMenuText
      NuxtLink(to="/hauptbuch") 
        Nuxt hauptbuch      
</template>

<script setup lang="ts">

</script>



<style scoped>
.invisible {
  display: none;
}
/* exact link will show the primary color for only the exact matching link */
a.nuxt-link-exact-active {
  color: #3c3c3b !important;
  background: #76ede9 !important;
}

a.active {
  color: red;
}

@media (max-width: 1200px) {
  .burger-menu {
    z-index: 99;
    position: absolute;
    right: 4%;
    top: 3%;
    background-color: #3c3c3b;
    padding: 4px 12px 4px 12px;
    width: 42px;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
  }

  .burger-menu span {
    display: block;
    width: 42px;
    height: 5px;
    margin: 5px 0px;
    background: #76ede9;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
  }
  .burgerMenuText:after {
    content: "\A";
    white-space: pre;
  }

  .responsive-menu {
    text-align: right;
    z-index: 99;
    right: 4%;
    top: 67px;
  }

  .menu input[type="checkbox"]:checked ~ .responsive-menu {
    display: block;
    position: absolute;
    max-width: 180px;
    right: 4%;
    transition-property: right;
    transition-duration: 0.2s;
    transition-timing-function: cubic-bezier(0, 2.5, 1.5, 2.5);
  }

  .menu input[type="checkbox"]:not(:checked) ~ .responsive-menu {
    display: block;
    right: -130px;
    max-width: 80px;
    transition-property: right;
    transition-duration: 0.2s;
    transition-timing-function: cubic-bezier(0, 2.5, 1.5, 2.5);
    position: fixed;
  }
}

.responsive-menu {
  display: table;
  width: 100%;
  table-layout: fixed; /* For cells of equal size */
}

.responsive-menu a,
.responsive-menu a:visited,
.responsive-menu a:link {
  font-size: 12px;
  border: solid 1px #3c3c3b;
  background: #3c3c3b;
  color: #76ede9;
  padding: 4px 12px 2px 12px;
  margin: 1px 0px 0px 1px;
  text-decoration: none;
  line-height: 26px;
  border-radius: 6px;
}

.responsive-menu a:hover {
  background: #76ede9;
  color: #3c3c3b;
}
/*
.responsive-menu a:selected {
  background: #76ede9;
  color: #3c3c3b;
}
*/

.responsive-menu span:first-child {
  text-align: right;
}

.responsive-menu span:last-child {
  text-align: right;
}

.menu input {
  display: none;
}

.responsive-menu.closed {
  max-height: 0;
  background-color: #76ede9;
}
</style>
