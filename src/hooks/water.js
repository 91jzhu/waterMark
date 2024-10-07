import { onBeforeUnmount, ref, watch } from "vue";

/**
 * 绘制带有文本的背景图案
 * @param {Object} options - 绘制选项
 * @param {boolean} [options.isAlign=true] - 是否绘制对齐的背景图案
 * @param {HTMLElement} [options.container={}] - 容器元素
 * @param {string} [options.text=""] - 文本内容
 * @param {string} [options.textAlign="start"] - 文本对齐方式（start, center, end）
 * @param {string} [options.color="rgba(255, 255, 255, 0.2)"] - 文本颜色
 * @param {number} [options.fontSize=25] - 字体大小（像素）
 * @param {string} [options.fontType="Arial"] - 字体类型
 * @param {number} [options.degree=45] - 文本旋转角度（度数）
 * @param {number} [options.rowGap=100] - 行间距（像素）
 * @param {number} [options.columnGap=100] - 列间距（像素）
 */
export const draw = (options = {}) => {
  const defaultSize = 500;
  const {
    isAlign = true,
    container = {},
    text = "",
    textAlign = "start",
    color = "rgba(255, 255, 255, 0.2)",
    fontSize = 25,
    fontType = "Arial",
    degree = 45,
    rowGap = 100,
    columnGap = 100,
  } = options;

  const canvasWidth = ref(defaultSize);
  const canvasHeight = ref(defaultSize);
  const resizeOb = ref(null);
  const mutationOb = ref(null);
  const dom = ref(null);

  watch(
    () => container.value,
    (val) => {
      if (val && text) {
        setListener(val);
      }
    }
  );

  onBeforeUnmount(() => {
    resizeOb.value && resizeOb.value.unobserve(dom.value);
    mutationOb.value && mutationOb.value.disconnect();
  });

  const setListener = (element) => {
    if (!ResizeObserver) return;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect;
        canvasWidth.value = width;
        canvasHeight.value = height;
        handleStyle(element);
      });
    });
    dom.value = element;
    
    resizeObserver.observe(element);
    resizeOb.value = resizeObserver;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          // 恢复原来的背景图像
          handleStyle(mutation.target);
        }
      });
    });
    // 配置观察选项
    const config = { attributes: true, attributeFilter: ["style"] };
    // 开始观察目标元素
    observer.observe(element, config);
    mutationOb.value = observer;
  };

  const handleStyle = (dom) => {
    if (isAlign) {
      dom.style.backgroundImage = `url(${getAlignDataURL()})`;
      dom.style.backgroundRepeat = "repeat";
    } else {
      dom.style.backgroundImage = `url(${getDataURL()})`;
      dom.style.backgroundRepeat = "no-repeat";
    }
  };

  const getAlignDataURL = () => {
    let element = document.createElement("canvas");
    if (!element.getContext) return;
    const ctx = element.getContext("2d");
    ctx.font = `${fontSize}px ${fontType}`;
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    const tiltAngle = (degree * Math.PI) / 180;

    element.width = textWidth + columnGap;
    element.height = textWidth + rowGap;

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontType}`;
    if (tiltAngle > 0) {
      ctx.translate(textHeight, 0);
    } else {
      ctx.translate(0, textWidth);
    }
    ctx.rotate(tiltAngle);
    ctx.textAlign = textAlign;
    ctx.fillText(text, textHeight, textHeight);
    return element.toDataURL();
  };

  const getDataURL = () => {
    let element = document.createElement("canvas");
    element.width = canvasWidth.value;
    element.height = canvasHeight.value;
    if (!element.getContext) return;
    const ctx = element.getContext("2d");
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontType}`;

    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    const tiltAngle = (degree * Math.PI) / 180;
    const pageWidth = document.body.clientWidth;
    const pageHeight = document.body.clientWidth;

    for (let i = -pageWidth; i < pageWidth * 2; i += textWidth + columnGap) {
      for (let j = -pageHeight; j < pageHeight * 2; j += textHeight + rowGap) {
        // 设置倾斜变换
        if (!(i === j && i === 0)) {
          ctx.restore();
        }
        ctx.save();
        ctx.rotate(tiltAngle);
        ctx.textAlign = textAlign;
        ctx.fillText(text, parseInt(i), parseInt(j));
      }
    }
    return element.toDataURL();
  };
};
