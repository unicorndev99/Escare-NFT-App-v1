const supportedChains = [
    // {
    //   name: "Ethereum Mainnet",
    //   short_name: "eth",
    //   chain: "ETH",
    //   network: "mainnet",
    //   chain_id: 1,
    //   network_id: 1,
    //   rpc_url: "https://mainnet.infura.io/v3/%API_KEY%",
    //   native_currency: {
    //     symbol: "ETH",
    //     name: "Ethereum",
    //     decimals: "18",
    //     contractAddress: "",
    //     balance: ""
    //   }
    // },
    {
      name: "Ethereum Görli",
      short_name: "gor",
      chain: "ETH",
      network: "goerli",
      chain_id: 5,
      network_id: 5,
      rpc_url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      native_currency: {
        symbol: "ETH",
        name: "Ethereum",
        decimals: "18",
        contractAddress: "",
        balance: ""
      }
    },
    // {
    //   name: "Binance Smart Chain",
    //   short_name: "bsc",
    //   chain: "smartchain",
    //   network: "mainnet",
    //   chain_id: 56,
    //   network_id: 56,
    //   rpc_url: "https://bsc-dataseed1.defibit.io/",
    //   native_currency: {
    //     symbol: "BNB",
    //     name: "BNB",
    //     decimals: "18",
    //     contractAddress: "",
    //     balance: ""
    //   }
    // },
    {
      name: "Binance Smart Chain - Testnet",
      short_name: "bsc",
      chain: "smartchain",
      network: "mainnet",
      chain_id: 97,
      network_id: 97,
      rpc_url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      native_currency: {
        symbol: "BNB",
        name: "BNB",
        decimals: "18",
        contractAddress: "",
        balance: ""
      }
    },
  ];
  
  export default supportedChains;