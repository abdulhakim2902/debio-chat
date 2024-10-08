export abstract class AppConfig {
  static NEAR_NETWORK = String(process.env.NEAR_NETWORK)
  static NEAR_CONTRACTS = {
    BURN: String(process.env.NEAR_BURN_CONTRACT),
    TOKEN: String(process.env.NEAR_TOKEN_CONTRACT)
  }

  static STORAGE_SECRET_KEY = String(process.env.STORAGE_SECRET_KEY)
  static STORAGE_HOST = String(process.env.STORAGE_HOST)
  static STORAGE_CANISTER_ID = String(process.env.STORAGE_CANISTER_ID)
}
