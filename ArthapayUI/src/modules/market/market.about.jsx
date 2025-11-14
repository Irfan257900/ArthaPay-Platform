import React from 'react'
import CustomButton from '../../core/button/button'

function MarketAbout() {
    return (
        <div>
          <div className='mb-4'>
            <h1 className='text-xl font-semibold text-dbkpiText mb-1'>About Bitcoin (BTC)</h1>
            <p className='text-sm text-labelGrey font-medium'>Bitcoin (BTC) is the first cryptocurrency built on blockchain technology, also known as a decentralized digital currency that is based on cryptography. Unlike government-issued or fiat currencies such as US Dollars or Euro which are controlled by central banks, Bitcoin can operate without the need of a central authority like a central bank or a company. The decentralized nature allows it to operate on a peer-to-peer network whereby users are able to send funds to each other without going through intermediaries.</p>
          </div>
          <div className='mb-4'>
            <h1 className='text-xl font-semibold text-dbkpiText mb-1'>Who created Bitcoin?</h1>
            <p className='text-sm text-labelGrey font-medium'>The creator is an unknown individual or group that goes by the name Satoshi Nakamoto with the idea of an electronic peer-to-peer cash system as it is written in a whitepaper. Until today, the true identity of Satoshi Nakamoto has not been verified though there has been speculation and rumor as to who Satoshi might be. What we do know is that officially, the first genesis block of BTC was mined on 9th January 2009, defining the start of cryptocurrencies.</p>
          </div>
          <div className='mb-4'>
            <h1 className='text-xl font-semibold text-dbkpiText mb-1'>How does Bitcoin work?</h1>
            <p className='text-sm text-labelGrey font-medium'>While the general public perceives Bitcoin as a physical looking coin, it is actually far from that. Under the hood, it is a distributed accounting ledger that is stored as a chain of blocks - hence the name blockchain.</p>          
            <p className='text-sm text-labelGrey font-medium'>Let's compare how Bitcoin is different from a commercial bank, which operates as a centralized system. Given a situation where Alice wants to transact with Bob, the bank is the only entity that holds the ledger that describes how much balance Alice and Bob has. As the bank maintains the ledger, they will do the verification as to whether Alice has enough funds to send to Bob. Finally when the transaction successfully takes place, the Bank will deduct Alice’s account and credit Bob’s account with the latest amount.</p>          
          </div>
          <div className='mb-4'>
            <h1 className='text-xl font-semibold text-dbkpiText mb-1'>Bitcoin Mining</h1>
            <p className='text-sm text-labelGrey font-medium'>A Bitcoin miner will use his or her computer rigs to validate Alice’s transaction to be added into the ledger. In order to stop a miner from adding any arbitrary transactions, they will need to solve a complex puzzle. Only if the miner is able to solve the puzzle (called the Proof of Work), which happens at random, then he or she is able to add the transactions into the ledger and the record is final.</p>
            <p className='text-sm text-labelGrey font-medium'>Since running computer rigs cost money due to capital expenditure, which includes the cost of the rigs and the cost of electricity, miners are rewarded with new supply of bitcoins. This is the monetary system behind Bitcoin, where the fees for validating transactions on the network is paid by the person who wishes to transact (in this case it is Alice).</p>
          </div>
          <div>
            <CustomButton>Read More..</CustomButton>
          </div>
        </div>
    )
}

export default MarketAbout
