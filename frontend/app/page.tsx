"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Image from "next/image";
import contractJson from "@/contracts/Greeter.sol/Greeter.json";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contracts } from "@/types";

const App: React.FC = () => {
  const [mmStatus, setMmStatus] = useState<string>("Not connected!");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined
  );
  const [displayMessage, setDisplayMessage] = useState<string>("");
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [getNetwork, setGetNetwork] = useState<number | undefined>(undefined);
  const [contracts, setContracts] = useState<Contracts | undefined>(undefined);
  const [contractAddress, setContractAddress] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Web3 and set contract
    (async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const web3 = new Web3(window.ethereum);
          setWeb3(web3);
          const networkId: any = await web3.eth.getChainId();
          setGetNetwork(networkId);
          const contractAddress = "0x48D2d71e26931a68A496F66d83Ca2f209eA9956E";
          setContractAddress(contractAddress);
          const Greeter = new web3.eth.Contract(
            contractJson.abi,
            contractAddress
          ) as Contracts;
          setContracts(Greeter);
          Greeter.setProvider(window.ethereum);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Failed to initialize web3 or contract:", error);
      }
    })();
  }, []);

  const ConnectWallet = async () => {
    // Connect to MetaMask and handle errors
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== "0xa045c") {
          alert(
            `Please connect to the "Open Campus Codex" network in Metamask.`
          );
          return;
        }
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setAccountAddress(accounts[0]);
        setMmStatus("Connected!");
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const receive = async () => {
    // Fetch message from the blockchain
    if (contracts) {
      try {
        const displayMessage = await contracts.methods.read().call();
        setDisplayMessage(displayMessage);
      } catch (error) {
        console.error("Failed to read from contract:", error);
      }
    }
  };

  const send = async () => {
    // Send message to the blockchain
    const getMessage = (document.getElementById("message") as HTMLInputElement)
      .value;
    if (!getMessage.trim()) {
      alert("Message cannot be empty.");
      return;
    }
    setLoading(true);
    setShowMessage(true);
    if (contracts && accountAddress) {
      try {
        await contracts.methods
          .write(getMessage)
          .send({ from: accountAddress })
          .on("transactionHash", (hash: string) => {
            setTxnHash(hash);
          });
        // Auto-refresh message after sending
        await receive();
      } catch (error) {
        console.error("Failed to write to contract:", error);
      }
    }
    setLoading(false);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  return (
    <div className="App min-h-screen flex flex-col items-center justify-between">
      <div className="w-full fixed top-0 bg-white z-50">
        <div className="text-center mb-4 p-4 border-b border-gray-300 text-xl">
          <h1>
            A starter kit for building (Dapps) on the Open Campus L3 chain,
            powered by create-edu-chain.
          </h1>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold mt-4">
              📚 create-edu-dapp template 📚
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center mt-4 space-y-6">
            {isConnected && (
              <div className="text-center text-xl">
                <h1>
                  Connected to wallet address: <strong>{accountAddress}</strong>
                </h1>
              </div>
            )}
            {!isConnected && (
              <Button
                className="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md mb-4"
                onClick={ConnectWallet}
                variant="link"
              >
                Connect with Metamask
              </Button>
            )}
            <div className="flex flex-col items-center">
              <input
                type={"text"}
                placeholder={"Enter a message to put onchain"}
                id="message"
                className="w-80 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-white focus:border-indigo-500 text-base outline-none text-gray-700 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
              />
              <div className="flex space-x-4">
                <Button
                  className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                  onClick={isConnected ? send : undefined}
                >
                  Send
                </Button>
                <Button
                  className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                  onClick={isConnected ? receive : undefined}
                >
                  Receive
                </Button>
              </div>
              {showMessage && (
                <>
                  <p className="text-center text-sm mt-6"> loading...</p>
                  <p className="mt-4 text-xs ">
                    Txn hash:{" "}
                    <a
                      className="text-teal-300"
                      href={
                        "https://opencampus-codex.blockscout.com/tx/" + txnHash
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {txnHash}
                    </a>
                  </p>
                  <p className="mt-2 text-xs">
                    Please wait till the Txn is completed :)
                  </p>
                </>
              )}
            </div>
            <div className="text-center text-3xl mt-4">
              <b>{displayMessage}</b>
            </div>
          </CardContent>
        </Card>
      </div>
      <footer className="footer text-center p-4 mt-8 w-full bg-white ">
        <div className="flex items-center justify-center space-x-4">
          <Image
            src="https://www.opencampus.xyz/static/media/coin-logo.39cbd6c42530e57817a5b98ac7621ca7.svg"
            alt="logo"
            width="50"
            height="50"
          />
          <h1 className="text-xl text-black">
            Learn more about Open Campus L3,{" "}
            <a
              className="text-teal-300 no-underline hover:underline hover:text-teal-700"
              href="https://open-campus-docs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Go to Documentation.
            </a>
          </h1>
          <Image
            src="https://www.opencampus.xyz/static/media/coin-logo.39cbd6c42530e57817a5b98ac7621ca7.svg"
            alt="logo"
            width="50"
            height="50"
          />
        </div>
      </footer>
    </div>
  );
};

export default App;
