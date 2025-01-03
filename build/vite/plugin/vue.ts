import vue from '@vitejs/plugin-vue';

export function configVuePlugin() {
  return vue({
    features: {
      componentIdGenerator: 'filepath',
      // componentIdGenerator(filepath, source, isProduction, getHash) {
      //   console.log('componentIdGenerator - args :', { filepath, source, isProduction, getHash });
      //   return getHash(filepath);
      // },
    },
  });
}
