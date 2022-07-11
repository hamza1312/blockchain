const {Blockchain,Transaction,Block} = require('./blockchain.js')
const EC = require("elliptic").ec
const ec = new EC('secp256k1')

let oubraneom = new Blockchain()


const key = ec.keyFromPrivate('368d7e3ae2c589114f704048208faecf9cd99922b4c0226af23ee12974ef8c6f')
const wallet_address = key.getPublic('hex')
const txt1 = new Transaction(wallet_address,"047c8c113e4400d33d5d3ee6d41c5e36729700d238bb205d0bf815aeacf4f0a5b7f6331b989277769cf948831a73f6b2b32b451818aa09fba901429fc35136d0f8",100)
txt1.signTransaction(key)
oubraneom.addTransaction(txt1)

oubraneom.minePendingTransactions(wallet_address)
oubraneom.minePendingTransactions(wallet_address)
console.log(oubraneom.chain[1].transactions.length)
console.log(oubraneom.getBalanceOfAddress(wallet_address))
