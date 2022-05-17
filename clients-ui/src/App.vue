<template>
  <div id="app">
    <router-view />
  </div>
</template>
<style>
*, .input{
  font-family: "JetBrains Mono", monospace;
}
body{
  overflow:hidden;
}
.left-col {
  width: 70%;
  height: 100vh;
  overflow: auto;
  position: fixed;
  text-align: left;
  top: 0;
  left: 0;
  padding:20px;
  border-right:2px solid #eee;
}
.right-col {
  width: 30%;
  height: 100vh;
  overflow: auto;
  position: fixed;
  top: 0;
  right: 0;
  padding:20px;
  text-align: justify;
  word-break: break-all;
  font-size:12px;
}
</style>