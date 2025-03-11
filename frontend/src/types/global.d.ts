declare module "aos" {
  const AOS: any;
  export default AOS;
}

declare module "./components/*" {
  const ImageGenerator: React.FC;
  export default ImageGenerator;
}
