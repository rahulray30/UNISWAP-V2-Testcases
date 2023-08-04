
import {
  UniswapV2Router02,
  UniswapV2Router02__factory,
  ERC20__factory,
  UniswapV2Factory,
  UniswapV2Factory__factory,
  UniswapV2Pair__factory,
  WETH9,
  WETH9__factory,
  UniswapV2Pair

} from "../typechain";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";
import { mineBlocks, expandTo18Decimals, expandTo6Decimals } from "./utilities/utilities";
import { expect } from "chai";
import { FactoryOptions } from "hardhat/types";



describe("UniswapV2-router", async () => {

  let router: UniswapV2Router02;
  let factory: UniswapV2Factory;

  let owner: SignerWithAddress;
  let s1: SignerWithAddress;
  let signers: SignerWithAddress[];
  let Weth: WETH9
  let pair: UniswapV2Pair


  beforeEach(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];
    s1 = signers[1];

    Weth = await new WETH9__factory(owner).deploy();
    factory = await new UniswapV2Factory__factory(owner).deploy(owner.address);
    router = await new UniswapV2Router02__factory(owner).deploy(factory.address, Weth.address);
   // pair = await new UniswapV2Pair__factory(owner).deploy(owner.address);
    pair = await new UniswapV2Pair__factory(owner).deploy();


  })

  // it("this is uniswap router WETH", async () => {
  //   const router2 = await ethers.getContractFactory("UniswapV2Router02");
  //   const Router2 = await router2.deploy("0x8cdFcF107492a7fC6c4Ace58a6E71322D123aDB4","0xc778417E063141139Fce010982780140Aa0cD5Ab");

  //   await Router2.deployed();
  //   expect(await Router2.WETH()).to.equal("0xc778417E063141139Fce010982780140Aa0cD5Ab");
  //   expect(await Router2.factory()).to.equal("0x8cdFcF107492a7fC6c4Ace58a6E71322D123aDB4");
  // });


  it("testing for the UniswapV2: k error", async() => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
    let Token_B = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    await Token_A.approve(router.address, expandTo18Decimals(1000));
    await Token_B.approve(router.address, expandTo18Decimals(1000));

    //console.log("above router.connect");

    await router.connect(owner).addLiquidity(Token_A.address, Token_B.address, expandTo18Decimals(10),
      expandTo18Decimals(10), expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);

    //pair.connect(owner).swap()

  })

  it("Let's add liquidity", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
    let Token_B = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    await Token_A.approve(router.address, expandTo18Decimals(10));
    await Token_B.approve(router.address, expandTo18Decimals(10));

    console.log("allowance---", Number(await Token_A.allowance(owner.address, router.address))); 

    //console.log("above router.connect");

    await router.connect(owner).addLiquidity(Token_A.address, Token_B.address, expandTo18Decimals(10),
      expandTo18Decimals(10), expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);
     
     console.log("allowance---", Number(await Token_A.allowance(owner.address, router.address))); 

    const Pair = await factory.getPair(Token_A.address, Token_B.address);
    const pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);

    //console.log(await pair_instance.balanceOf(owner.address)+ "fsdsdfdsf");

    let result = await pair_instance.getReserves();
    let reserve0 = Number(result._reserve0);
    let reserve1 = Number(result._reserve1);

    expect(reserve0).to.be.lessThanOrEqual(Number(expandTo18Decimals(10)));
    expect(reserve1).to.be.lessThanOrEqual(Number(expandTo18Decimals(10)));

    console.log(reserve0, reserve1);

  })

  it("let's add LiquidityETH", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    await Token_A.approve(router.address, expandTo18Decimals(1000));

    await router.connect(owner).addLiquidityETH(Token_A.address, expandTo18Decimals(10), expandTo18Decimals(1),
      expandTo18Decimals(1), owner.address, 1671258710, { value: 100 });

    const Pair = await factory.getPair(Token_A.address, Weth.address);
    const pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);

    let result = await pair_instance.getReserves();
    let reserve0 = Number(result._reserve0);
    let reserve1 = Number(result._reserve1);

    expect(reserve0).to.be.lessThanOrEqual(Number(expandTo18Decimals(10)));
    expect(reserve1).to.be.lessThanOrEqual(Number(expandTo18Decimals(10)));

    console.log(reserve0, reserve1);
  })

  it("add liquidity functionality fails if the amount is greater than the actual no of tokens", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
    let Token_B = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    await Token_A.connect(owner).transfer(s1.address, expandTo18Decimals(100));
    await Token_B.connect(owner).transfer(s1.address, expandTo18Decimals(10));

    await Token_A.connect(s1).approve(router.address, expandTo18Decimals(10));
    await Token_B.connect(s1).approve(router.address, expandTo18Decimals(1000));


    await expect(router.connect(s1).addLiquidity(Token_A.address, Token_B.address,
      expandTo18Decimals(20), expandTo18Decimals(20),
      expandTo18Decimals(1), expandTo18Decimals(1), s1.address, 1678948210)).revertedWith("transferFrom: transferFrom failed");

  })

  it("add liquidity ETH functionality fails if the amount is greater than the actual no of tokens", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    await Token_A.connect(owner).transfer(s1.address, expandTo18Decimals(10));
    await Token_A.connect(s1).approve(router.address, expandTo18Decimals(1000));

    await expect(router.connect(s1).addLiquidityETH(Token_A.address, expandTo18Decimals(100), expandTo18Decimals(1),
      expandTo18Decimals(1), s1.address, 1678948210, { value: "100" })).revertedWith("TransferHelper::transferFrom: transferFrom failed");
  })

  it("Swap exact tokens for tokens", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
    let Token_B = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    let array = [Token_A.address, Token_B.address];
    await Token_A.approve(router.address, expandTo18Decimals(1000));
    await Token_B.approve(router.address, expandTo18Decimals(1000));

    await router.connect(owner).addLiquidity(Token_A.address, Token_B.address,
      expandTo18Decimals(10), expandTo18Decimals(10),
      expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);

    const Pair = await factory.getPair(Token_A.address, Token_B.address);
    const pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);

    let result = await pair_instance.getReserves();
    let Reserve0 = Number(result._reserve0);
    let Reserve1 = Number(result._reserve1);
    //console.log("Initial token reserves " + Reserve0, Reserve1);


    await router.connect(owner).swapExactTokensForTokens(expandTo18Decimals(2), expandTo18Decimals(1),
      array, owner.address, 1678948210);

    let result1 = await pair_instance.getReserves();
    let Reserve3 = Number(result1._reserve0);
    let Reserve4 = Number(result1._reserve1);

    //console.log("after swapping " + Reserve3 + "   "+ Reserve4);

    let AmountOut = await router.connect(owner).getAmountsOut(expandTo18Decimals(2), array);
    let a1 = Number(AmountOut[1]);

    //console.log(a1+ "  ", a1+Reserve4);

    expect(Reserve0).to.be.lessThan(Reserve3);

  })

  it("Swap tokens for exact Tokens", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
    let Token_B = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
    let array = [Token_A.address, Token_B.address];
    await Token_A.approve(router.address, expandTo18Decimals(1000));
    await Token_B.approve(router.address, expandTo18Decimals(1000));


    await router.connect(owner).addLiquidity(Token_A.address, Token_B.address,
      expandTo18Decimals(10), expandTo18Decimals(10),
      expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);

    const Pair = await factory.getPair(Token_A.address, Token_B.address);

    const pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);

    let result = await pair_instance.getReserves();
    let Reserve0 = Number(result._reserve0);
    let Reserve1 = Number(result._reserve1);

    await router.connect(owner).swapTokensForExactTokens(expandTo18Decimals(2), expandTo18Decimals(100),
      array, owner.address, 1678948210);

    let result1 = await pair_instance.getReserves();
    let Reserve3 = Number(result1._reserve0);

    expect(Reserve3).to.be.greaterThanOrEqual(Reserve0);
  })

  it("Swap exact ETH for Tokens", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    let array = [Weth.address, Token_A.address];

    await Token_A.approve(router.address, expandTo18Decimals(1000));
    await Weth.approve(router.address, expandTo18Decimals(100));

    await router.connect(owner).addLiquidityETH(Token_A.address,
      expandTo18Decimals(100),
      expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210, { value: "125" });

    const Pair = await factory.getPair(Weth.address, Token_A.address);

    const Pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);

    let result = await Pair_instance.getReserves();
    let Reserve0 = Number(result._reserve0);
    let Reserve1 = Number(result._reserve1);

    await router.connect(owner).swapExactETHForTokens(expandTo18Decimals(10), array,
      owner.address, 1678948210, { value: "125" });
    let result1 = await Pair_instance.getReserves();
    let Reserve2 = Number(result1._reserve0);
    Reserve1 = Number(result1._reserve1);

    expect(Reserve2).to.be.lessThan(Reserve0);
  })

  it.only("swap tokens for exact ETH ", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    let array = [Token_A.address, Weth.address];
    await Token_A.approve(router.address, expandTo18Decimals(1000));
    await Weth.approve(router.address, expandTo18Decimals(100));

    await router.connect(owner).addLiquidityETH(Token_A.address,
      expandTo18Decimals(100),
      expandTo18Decimals(100), expandTo18Decimals(1), owner.address, 1678948210, { value: "125" });

    const Pair = await factory.getPair(Weth.address, Token_A.address);
    const Pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);

    let result = await Pair_instance.getReserves();
    let Reserve0 = Number(result._reserve0);
    let Reserve1 = Number(result._reserve1);
    //console.log(Reserve0, "  ", Reserve1);

    let AmountIn = await router.connect(owner).getAmountsIn(2, array);
    let a1 = Number(AmountIn[0]);

    await router.connect(owner).swapTokensForExactETH(2, expandTo18Decimals(83), array, owner.address, 1671258710);
    let result1 = await Pair_instance.getReserves();
    let Reserve2 = Number(result1._reserve0);

    AmountIn = await router.connect(owner).getAmountsOut(expandTo18Decimals(200), array);
    a1 = Number(AmountIn[1]);
    expect(Reserve2).to.be.greaterThanOrEqual(Reserve0);

  })

  it("swap Exact Tokens for ETH", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    let array = [Token_A.address, Weth.address];

    await Token_A.approve(router.address, expandTo18Decimals(1000));
    //await Weth.approve(router.address, expandTo18Decimals(100));

    await router.connect(owner).addLiquidityETH(Token_A.address, expandTo18Decimals(100), expandTo18Decimals(10),
      expandTo18Decimals(1), owner.address, 1671258710, { value: "125" });

    // console.log("__________^____")

    const pair = await factory.getPair(Weth.address, Token_A.address);
    const pair_instance = await new UniswapV2Pair__factory(owner).attach(pair);

    let result = await pair_instance.getReserves();
    let Reserve0 = Number(result._reserve0);
    //console.log(Reserve0);
    let Reserve1 = Number(result._reserve1);
    //console.log(Reserve1);

    await router.connect(owner).swapExactTokensForETH(expandTo18Decimals(100), 1, array, owner.address, 1671258710);

    let result1 = await pair_instance.getReserves();
    let Reserve2 = Number(result1._reserve0);
    let Reserve3 = Number(result1._reserve1);
    console.log(Reserve2 + "  " + Reserve3);

    expect(Reserve2).to.be.greaterThan(Reserve0);
    expect(Reserve3).to.be.lessThanOrEqual(Reserve1);

  })

  it("let's remove liquidity with entire lp_token", async () => {
    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));
    let Token_B = await new ERC20__factory(owner).deploy(expandTo18Decimals(1000));

    await Token_A.approve(router.address, expandTo18Decimals(1000));
    await Token_B.approve(router.address, expandTo18Decimals(1000));

    await router.connect(owner).addLiquidity(Token_A.address, Token_B.address, expandTo18Decimals(100),
      expandTo18Decimals(100), expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);

    const Pair = await factory.getPair(Token_A.address, Token_B.address);
    const pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);
    const owner_TokenA = await Token_A.balanceOf(owner.address);

    console.log("owner initial token value " + owner_TokenA);

    let result = await pair_instance.getReserves();
    let reserve0 = (Number(result._reserve0));
    let reserve1 = (Number(result._reserve1));

    console.log("Reserves of token before removing liquidity " + reserve0 + " " + reserve1)

    const lP_token = await pair_instance.balanceOf(owner.address);
    console.log("Lp token initially " + (Number(lP_token)));

    const pairData = await pair_instance.connect(owner).approve(router.address, lP_token);

    await router.connect(owner).removeLiquidity(Token_A.address, Token_B.address, lP_token,
      expandTo18Decimals(1), expandTo18Decimals(1), owner.address, 1678948210);

    const lP_token_new = await pair_instance.balanceOf(owner.address);
    console.log("remainig Lp token "+ (Number(lP_token_new)));

    let result1 = await pair_instance.getReserves();
    //console.log(result1,"'''''''''''''''''''''''''''")
    let reserve2 = (Number(result1._reserve0));
    let reserve3 = (Number(result1._reserve1));

    console.log("Token returned to the address "+ await Token_A.balanceOf(owner.address));

    console.log("Reserves of token after removing all liquidity " + reserve2, " " + reserve3);

    console.log("Percentage of token still in the pool "+((reserve2/(reserve0))*100)+ "%");

    const owner_TokenA_after = await Token_A.balanceOf(owner.address);

    console.log("owner after token value " + owner_TokenA_after);

    expect(Number(owner_TokenA)).to.be.lessThanOrEqual(Number(owner_TokenA_after));


  })

  it("remove liquidity Eth", async () => {

    let Token_A = await new ERC20__factory(owner).deploy(expandTo18Decimals(10000));

    await Token_A.approve(router.address, expandTo18Decimals(10000));

    await router.connect(owner).addLiquidityETH(Token_A.address, expandTo18Decimals(1000), expandTo18Decimals(3),
      expandTo18Decimals(1), owner.address, 1671258710, { value:100});

    const Pair = await factory.getPair(Token_A.address, Weth.address);
    const pair_instance = await new UniswapV2Pair__factory(owner).attach(Pair);

    let result = await pair_instance.getReserves();
    let reserve0 = (Number(result._reserve0));
    let reserve1 = (Number(result._reserve1));
    
    const lP_token = await pair_instance.balanceOf(owner.address);

    console.log("Initial reserves of tokens "+reserve0," ", reserve1);
    console.log("LP_token initially "+ lP_token);

    const pairData = await pair_instance.connect(owner).approve(router.address, lP_token);

    await router.connect(owner).removeLiquidityETH(Token_A.address, lP_token, expandTo18Decimals(0),
    expandTo18Decimals(0), owner.address, 1678948210);

   // console.log("below remove liquidity");

    const lP_token_new = await pair_instance.balanceOf(owner.address);

    const Pair1 = await factory.getPair(Token_A.address, Weth.address);
    const pair_instance1 = await new UniswapV2Pair__factory(owner).attach(Pair);

    let result1 = await pair_instance.getReserves();
    let reserve2 = Number(result1._reserve0);
    let reserve3 = Number(result1._reserve1);

    console.log("Reserves of Token after removeLiquidity "+reserve2+ "  "+ reserve3);
    console.log("LP_token after removing all liquidity "+ Number(lP_token_new));
    console.log("Percentage of Eth token still in the pool "+((reserve2/(reserve0))*100)+ "%");

  })

  it("swap fails with error Uniswapv2: K", async() => {


  })

})



