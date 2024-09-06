export abstract class AppConfig {
  static NEAR_NETWORK = String(process.env.NEAR_NETWORK)
  static NEAR_CONTRACTS = {
    BURN: String(process.env.NEAR_BURN_CONTRACT),
    TOKEN: String(process.env.NEAR_TOKEN_CONTRACT)
  }
}
