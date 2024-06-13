import * as nearAPI from "near-api-js";
import { useEffect, useState } from "react";
import styles from './near.module.css'
import { Typography } from "@mui/material";

const { keyStores, WalletConnection, connect, Contract, ConnectedWalletAccount } = nearAPI;

export const Near = () => {
    const [wallet,setWallet] = useState<nearAPI.WalletConnection>() ;
    const [account, setAccount] = useState<nearAPI.ConnectedWalletAccount>();
    const [signedIn, setSignedIn] = useState<Boolean>(false);
    const [balance, setBalance] = useState()

    useEffect(() => {
        initialConnection()
    },[])

    const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();
    const connectionConfig = {
        networkId: "testnet",
        keyStore: myKeyStore, // first create a key store
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io",
    };

    const initializeConnection = async () => {
        const nearConnection = await connect(connectionConfig);

        const walletConnection = new WalletConnection(nearConnection, "my-app");
        if (walletConnection.isSignedIn()) {
            // user is signed in
            setSignedIn(true);
          }
        else {
            await walletConnection.requestSignIn({
                contractId: "dbio-burn1.testnet",
                methodNames: ["burn"], // optional
              });
              setSignedIn(true);
        }
        setWallet(walletConnection);
        setAccount(walletConnection.account());       
    }

    const initialConnection = async () => {
        const nearConnection = await connect(connectionConfig);

        const walletConnection = new WalletConnection(nearConnection, "my-app");
        if (walletConnection.isSignedIn()) {
            // user is signed in
            setSignedIn(true);
            setWallet(walletConnection);
            setAccount(walletConnection.account());
            const contract = new Contract(
                walletConnection.account(), // the account object that is connecting
                "debio-token3.testnet",
                {
                      // name of contract you're connecting to
                    viewMethods: ["ft_balance_of"], // view methods do not change state but usually return a value
                    changeMethods: [""], // change methods modify state
                    useLocalViewExecution : true
                }
            );
            const balance = await contract.ft_balance_of(
                {
                    "account_id": walletConnection.getAccountId(), // argument name and value - pass empty object if no args required
                }
            );
            setBalance(balance)
                
            
          }
    }

    const burn = async () => {
        if (typeof(account) !== "undefined") {
            const contract = new Contract(
                account, // the account object that is connecting
                "dbio-burn1.testnet",
                {
                  // name of contract you're connecting to
                  viewMethods: ["ft_balance_of"], // view methods do not change state but usually return a value
                  changeMethods: ["burn"], // change methods modify state
                  useLocalViewExecution : true
                }
            );
            await contract.burn(
                {
                  "amount": "10000", // argument name and value - pass empty object if no args required
                },
                "300000000000000", // attached GAS (optional)
                "1" // attached deposit in yoctoNEAR (optional)
              );
            
        }  
    }

    return (
        <>
        <button onClick={initializeConnection}>Connect to Near</button>
        {signedIn && (<button className={styles.burn} onClick={burn}>Burn</button>)}
        {balance && (<Typography className={styles.balance}>Balance is {balance} </Typography>)}
        </>
    )

}