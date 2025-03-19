const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  cache: {
    type: "filesystem",
    cacheDirectory: ".webpack_cache",
    buildDependencies: {
      config: [__filename], // 웹팩 설정 변경 시 캐시 초기화
    },
  },
  optimization: {
    minimize: true, // 코드 최적화 활성화
    minimizer: [
      new TerserPlugin({
        parallel: true, // 멀티코어 CPU 활용 (빌드 속도 향상)
        terserOptions: {
          compress: {
            drop_console: true, // console.log() 삭제
          },
        },
      }),
    ],
  },
};
