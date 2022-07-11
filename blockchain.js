const SHA256 = require('crypto-js/sha256')
const EC = require("elliptic").ec
const ec = new EC('secp256k1')
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
        
        this.fee = 21000 * (100 + 10) / 100000
    }
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.fee).toString()
    }
    signTransaction(signingKey ){
        if(signingKey.getPublic('hex')!== this.fromAddress){
            throw new Error("You Cannot Sign transactions for other Wallets.")
        }
        const hashTx = this.calculateHash()
        const sig = signingKey.sign(hashTx,'base64')
        this.signature = sig.toDER('hex')
    }
    isValid(){
        if(this.fromAddress ===null) return true
        if(!this.signature || this.signature.length === 0){
            console.log("ERROR NO SIGNATURE IN THIS TRANSACTION")
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature)
    }
}
class Block{
    constructor(timestamp,transactions=[],previousHash = ''){

        this.timestamp = timestamp
        this.previousHash = previousHash
        this.transactions = transactions
        this.hash = this.calculateHash()
        this.nonce = 0
    }
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp+ JSON.stringify(this.data) + this.nonce).toString()
    }
    mineBlock(diffculity){
        console.log("MINING...")
        while(this.hash.substring(0,diffculity)!== Array(diffculity + 1).join("0")){
            
            this.nonce++
            this.hash = this.calculateHash()
        }
        console.log(this.hash)
        console.log("MINED")
    }
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false
            }
        }
    }
}
class Blockchain{ 
    constructor(){
        this.chain = [this.createGenesisBlock()]
        this.pendingTransactions = []
        this.miningReward = 1000
    }
    createGenesisBlock(){ 
        return new Block("6/07/2022", "Genesis Block", '0')
    }
    getLatestBlock(){
        return this.chain[this.chain.length  - 1]
    }
    minePendingTransactions(miner){
        // fee_reward = 0
        if(this.pendingTransactions.length >= 1000){
            let slicedPendingTransactions = this.pendingTransactions.slice(0,1000)
            let block = new Block(Date.now(),slicedPendingTransactions);
            block.mineBlock(4)
            this.chain.push(block)
            let arr = this.pendingTransactions.splice(0,this.pendingTransactions.length - 1000)
            this.pendingTransactions = arr
            this.pendingTransactions.push(new Transaction(null,miner))
        }
        else{
            let block = new Block(Date.now(),this.pendingTransactions);
            block.mineBlock(4)
            this.chain.push(block)
            // for (const transaction in this.pendingTransactions){
            //     fee_reward += transaction.fee
            // }
            this.pendingTransactions =[new Transaction(null,miner,this.miningReward)]
            
        }
        
    }
    
    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transaction must include from to address")
        }
        if(!transaction.isValid()){
            throw new Error('Cannot Add invalid Transaction')
        }
        this.pendingTransactions.push(transaction)
    }
    getBalanceOfAddress(address){
        let balance = 0
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= (trans.amount + trans.fee)
                }
                if(trans.toAddress === address){
                    balance += trans.amount
                }
            }
        }
        return balance
    }
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash
        newBlock.hash = newBlock.calculateHash()
        newBlock.mineBlock(4)
        this.chain.push(newBlock)
    }
    isChainValid(){
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
      
            if (previousBlock.hash !== currentBlock.previousHash) {
              return false;
            }
            if(!currentBlock.hasValidTransactions()){
                return false
            }

      
            if (currentBlock.hash !== currentBlock.calculateHash()) {
              return false;
            }
          }
      
          return true;
    }
}
module.exports.Blockchain = Blockchain
module.exports.Transaction = Transaction
module.exports.Block = Block