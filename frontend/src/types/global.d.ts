declare module "aos" {
  const AOS: any;
  export default AOS;
}

declare module "./components/ImageGenerator" {
  const ImageGenerator: React.FC;
  export default ImageGenerator;
}

declare module "../store/Store" {
  export const useStore: any; // useStore의 정확한 타입을 적절히 정의
}
