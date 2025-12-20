import { ref, onMounted, onUnmounted } from "vue";

/**
 * 响应式窗口尺寸 Hook
 */
export function useWindowSize() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  function update() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  onMounted(() => {
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return { width, height };
}

/**
 * 判断是否为移动端
 */
export function useIsMobile() {
  const { width } = useWindowSize();
  const isMobile = ref(width.value < 768);

  return { isMobile };
}
