<script setup>
import { draw } from "../hooks/water.js";
import { ref, onMounted } from "vue";

const p = ref(null);
draw({
  text: "版权所有！",
  container: p,
  isAlign: false,
});
const change = () => {
  p.value.style.width = Math.floor(Math.random() * 1000 + 200) + "px";
};
</script>

<template>
  <p class="text" ref="p">
    这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。这是一段文字。
  </p>
  <div class="btn" @click="change">changeWidth</div>
</template>

<style scoped>
.text {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  height: 1200px;
  width: 500px;
  background: transparent;
  color: #fff;
  border: 1px solid red;
}
</style>
