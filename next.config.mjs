/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEAR_NETWORK: process.env.NEAR_NETWORK,
    NEAR_BURN_CONTRACT: process.env.NEAR_BURN_CONTRACT,
    NEAR_TOKEN_CONTRACT: process.env.NEAR_TOKEN_CONTRACT,

    STORAGE_SECRET_KEY: process.env.STORAGE_SECRET_KEY,
    STORAGE_HOST: process.env.STORAGE_HOST,
    STORAGE_CANISTER_ID: process.env.STORAGE_CANISTER_ID
  }
}

export default nextConfig
