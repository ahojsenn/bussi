import { reactive } from 'vue';
import { b as useNuxtApp, e as __appConfig } from '../server.mjs';

function useAppConfig() {
  const nuxtApp = useNuxtApp();
  if (!nuxtApp._appConfig) {
    nuxtApp._appConfig = reactive(__appConfig);
  }
  return nuxtApp._appConfig;
}

export { useAppConfig as u };
//# sourceMappingURL=config-845b9774.mjs.map
