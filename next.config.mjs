const nextConfig = {
  output: "export",
  turbopack: {
    root: process.cwd()
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
