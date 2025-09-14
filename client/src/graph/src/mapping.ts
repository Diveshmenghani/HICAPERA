import { BigInt } from "@graphprotocol/graph-ts"
import {
  HicaperaMLM,
  Registered,
  Invested,
  EarningsClaimed
} from "../generated/HicaperaMLM/HicaperaMLM"
import { User, Investment, Claim } from "../generated/schema"

export function handleRegistered(event: Registered): void {
  // Create a new User entity. This will be triggered for every new registration.
  let user = new User(event.params.user.toHexString())

  // Set the referrer link, except for the owner who has address(0) as referrer
  if (event.params.referrer.toHexString() != "0x0000000000000000000000000000000000000000") {
    user.referrer = event.params.referrer.toHexString()
  }

  // Initialize all fields
  user.totalInvestment = BigInt.fromI32(0)
  user.totalWithdrawn = BigInt.fromI32(0)
  user.maxWithdrawalLimit = BigInt.fromI32(0)
  user.registrationTimestamp = event.block.timestamp

  user.save()
}

export function handleInvested(event: Invested): void {
  let userId = event.params.user.toHexString()
  
  // Load the user who made the investment.
  let user = User.load(userId)
  if (user == null) {
    // This should not happen if the registration event is processed first.
    // Handle error or create a user if necessary, though it's better to ensure Registered event comes first.
    return
  }

  // Update the user's investment totals
  user.totalInvestment = user.totalInvestment.plus(event.params.amount)
  user.maxWithdrawalLimit = user.totalInvestment.times(BigInt.fromI32(2))
  user.save()

  // Create a new Investment entity to log this specific transaction
  let investment = new Investment(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  investment.user = userId
  investment.amount = event.params.amount
  investment.timestamp = event.block.timestamp
  investment.transactionHash = event.transaction.hash
  investment.save()
}

export function handleEarningsClaimed(event: EarningsClaimed): void {
  let userId = event.params.user.toHexString()
  
  // Load the user who claimed earnings.
  let user = User.load(userId)
  if (user == null) {
    return
  }

  // Update the user's total withdrawn amount
  user.totalWithdrawn = user.totalWithdrawn.plus(event.params.totalAmount)
  user.save()

  // Create a new Claim entity to log this specific transaction
  let claim = new Claim(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  claim.user = userId
  claim.totalAmount = event.params.totalAmount
  claim.selfProfit = event.params.selfProfit
  claim.referralProfit = event.params.referralProfit
  claim.timestamp = event.block.timestamp
  claim.transactionHash = event.transaction.hash
  claim.save()
}