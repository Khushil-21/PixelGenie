import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{
				hostname: "res.cloudinary.com",
			},
		],
	},
};

export default nextConfig;
