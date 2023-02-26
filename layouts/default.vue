<template lang="pug">
div.background
    div.foreground
      navigation
      slot 
</template>

<style>
@font-face {
 font-family: 'supermarker'; /* Gewünschter Name */
 src:  url('/SupermarkerVARTrial.woff2') format('woff2'), /* SupermarkerVARTrial.woff2 oder SupermarkerVARTrial.ttf */
       url('/SupermarkerVARTrial.woff') format('woff'), /* SupermarkerVARTrial.woff oder SupermarkerVARTrial.ttf */
       url('/SupermarkerVARTrial.ttf') format('truetype'); /* SupermarkerVARTrial.ttf */

  /* background black */
  background-color: #000;
}
select, option,input, form {
  font: 14px "supermarker";
}
body {
  font: 14px "supermarker";
}
.background {
  /* ich hätte gern ein Prilblumenmuster */
  /* Hintergrundbild mit Transparenz und einem Abrolleffekt */
  background-color: #c1b5f9;
  background-image: url('/prilblumen.png');
  border-radius: 30px;
  height: max-content;
  width: 100%;
  font-family: "supermarker";

}
.foreground {
  background-color: rgba(255, 255, 255, 0.5);
  /* ich hätte gern rude ecken am div */
  border-radius: 30px;
  padding: 20px;
}

table {
  background-color:  rgba(193, 181, 249,0.8); 
  border-radius: 6px;
}
tr:nth-of-type(odd) {
      background: rgba(166, 149, 241, 0.8); 
    }
td{
  vertical-align: top;
  border-radius: 6px;
}
th {
  text-align: left;
}
</style>