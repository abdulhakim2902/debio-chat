/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEAR_NETWORK: process.env.NEAR_NETWORK,
    NEAR_BURN_CONTRACT: process.env.NEAR_BURN_CONTRACT,
    NEAR_TOKEN_CONTRACT: process.env.NEAR_TOKEN_CONTRACT
  }
}

export default nextConfig
