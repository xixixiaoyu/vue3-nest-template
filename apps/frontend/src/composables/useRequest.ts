import { ref, type Ref } from "vue";

/**
 * 请求状态接口
 */
interface RequestState<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
}

/**
 * 通用请求 Hook
 * 封装加载状态、错误处理等通用逻辑
 */
export function useRequest<T>(
  requestFn: () => Promise<T>
): RequestState<T> & { execute: () => Promise<void> } {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function execute() {
    loading.value = true;
    error.value = null;

    try {
      data.value = await requestFn();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "请求失败";
      console.error("Request failed:", e);
    } finally {
      loading.value = false;
    }
  }

  return {
    data,
    loading,
    error,
    execute,
  };
}
