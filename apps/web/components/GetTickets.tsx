"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { getTicketContract } from "@/lib/getTicketContract";
import { ContractPermission } from "@/types";

import { GasFeeCard } from "./GasFeeCard";
import MetaMaskProvider from "@/providers/MetamaskProvider";
import { addImg, addTokenMetadata } from "@/lib/ipfs";
import { formatEther, parseEther } from "ethers";

interface GetTicketsProps {
  ticketPrice: bigint;
  ticketNFT: string;
  title: string;
  date: bigint;
}

const GetTickets: React.FC<GetTicketsProps> = ({
  ticketPrice,
  ticketNFT,
  title,
  date,
}) => {
  const [numberOfTickets, setNumberOfTickets] = useState(0);

  const handleUploadSVG = async () => {
    const svgIPFS = await addImg(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
        <text x="150" y="125" font-size="40" fill="black">
          ${title}
        </text>
        <text x="150" y="170" font-size="20" fill="black">
          ${date}
        </text>
        <text x="150" y="215" font-size="20" fill="black">
          ${location}
        </text>
      </svg>
  `);

    const tokenMetadata = {
      name: title,
      description: `Ticket for ${title} on ${Number(date)}`,
      image: `https://ipfs.io/ipfs/${svgIPFS.Hash}`,
      attributes: [
        {
          trait_type: "Ticket ID",
          value: 1,
        },
      ],
    };

    const metadataHash = await addTokenMetadata(tokenMetadata);

    return metadataHash;
  };

  const handleIncrement = () => {
    setNumberOfTickets((prevCount) => prevCount + 1);
  };

  const handleDecrement = () => {
    setNumberOfTickets((prevCount) => prevCount - 1);
  };

  const handleGetTickets = async () => {
    const nftContract = await getTicketContract({
      address: ticketNFT,
      permission: ContractPermission.WRITE,
    });
    if (numberOfTickets <= 0) {
      console.log("Please select number of tickets");
      return;
    }
    try {
      const metadataHash = await handleUploadSVG();
      const totalAmount = ticketPrice * BigInt(numberOfTickets);
      const token = (
        await nftContract.mint(
          numberOfTickets,
          `https://ipfs.io/ipfs/${metadataHash}`,
          {
            value: parseEther(totalAmount.toString()),
          }
        )
      ).wait();
      console.log(await token, " Minted");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <MetaMaskProvider>
      <div className="p-8 bg-white shadow-xl rounded-xl full md:w-3/4 md:sticky md:top-4 h-fit">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Ticket Price</span>
          <span>{formatEther(ticketPrice)}ETH</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Number of tickets</span>
          <div className="flex">
            <button
              onClick={handleDecrement}
              className="px-4 py-1 bg-gray-200 rounded-xl focus:outline-none"
              disabled={numberOfTickets <= 1}
            >
              -
            </button>
            <span className="px-4 py-2">{numberOfTickets}</span>
            <button
              onClick={handleIncrement}
              className="px-4 py-1 bg-gray-200 rounded-xl focus:outline-none"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Total</span>
          <span>
            {formatEther(
              (BigInt(numberOfTickets.toString()) * ticketPrice).toString()
            )}
            ETH
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Gas fee</span>
          <GasFeeCard />
        </div>
        <Button
          variant="primary"
          className="w-full text-[#0C200A] p-2 rounded focus:outline-none "
          onClick={async () => await handleGetTickets()}
        >
          Get tickets
        </Button>
      </div>
    </MetaMaskProvider>
  );
};

export default GetTickets;
