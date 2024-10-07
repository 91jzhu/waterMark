<script setup>
import { ref, onMounted } from "vue";

let ctx = null;
let canvas = null;
let color = [];
let img;
onMounted(() => {
  canvas = document.getElementById("canvas");
  canvas.addEventListener("click", updateColor);
  ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });
  color = hexToRGBA(document.getElementById("color").value);
});

const change = () => {
  color = hexToRGBA(document.getElementById("color").value);
};

function hexToRGBA(hexColor, alpha = 255) {
  // 确保输入是有效的 16 进制颜色字符串
  if (
    !hexColor ||
    !/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hexColor)
  ) {
    throw new Error("Invalid hex color");
  }
  // 去掉 '#' 符号
  hexColor = hexColor.replace("#", "");
  // 解析 RGB 值
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  return [r, g, b, alpha];
}

const loadImage = (e) => {
  const reader = new FileReader();
  reader.onload = function (event) {
    img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
};

const updateColor = (e) => {
  const { offsetX: x, offsetY: y } = e;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const clickColor = getColor(x, y, imageData);
  const targetColor = color;
  const changeColor = (x, y) => {
    const queue = [[x, y]]; // 初始化队列

    while (queue.length > 0) {
      const [currentX, currentY] = queue.shift();

      // 检查边界条件
      if (
        currentX < 0 ||
        currentY < 0 ||
        currentX >= canvas.width ||
        currentY >= canvas.height
      ) {
        continue;
      }

      const color = getColor(currentX, currentY, imageData);
      if (diff(color, clickColor) > 100) {
        continue;
      }

      if (diff(color, targetColor) === 0) {
        continue;
      }

      const index = offsetToIndex(currentX, currentY, imageData);
      imageData.data.set(targetColor, index);
      // 将相邻的四个像素点加入队列
      queue.push([currentX - 1, currentY]);
      queue.push([currentX + 1, currentY]);
      queue.push([currentX, currentY - 1]);
      queue.push([currentX, currentY + 1]);
    }
  };
  changeColor(x, y);
  ctx.putImageData(imageData, 0, 0);
};

const getColor = (x, y, imgData) => {
  const index = offsetToIndex(x, y, imgData);
  return [
    imgData.data[index],
    imgData.data[index + 1],
    imgData.data[index + 2],
    imgData.data[index + 3],
  ];
};

const diff = (color1, color2) => {
  return (
    Math.abs(color1[0] - color2[0]) +
    Math.abs(color1[1] - color2[1]) +
    Math.abs(color1[2] - color2[2]) +
    Math.abs(color1[3] - color2[3])
  );
};

const offsetToIndex = (x, y, imageData) => {
  return (x + y * imageData.width) * 4;
};
</script>

<template>
  <div class="container">
    <input type="file" accept="image/*" @change="loadImage" />
    <h2>修改颜色</h2>
    <div>
      <label for="color">颜色：</label>
      <input type="color" id="color" value="#ff0000" @change="change" />
    </div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
