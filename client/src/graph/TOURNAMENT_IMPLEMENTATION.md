# Tournament Reward Implementation Guide

## Overview

This document outlines how to implement tournament rewards using the subgraph data instead of implementing the logic directly in the smart contract. This approach offers several advantages:

- **Cost Efficiency**: Avoids expensive on-chain calculations and storage
- **Flexibility**: Easily modify tournament rules without contract upgrades
- **Scalability**: Handle complex tournament logic without gas limitations
- **User Experience**: Faster UI updates and historical data access

## Implementation Steps

### 1. Define Tournament Rules

Example tournament structure:

```javascript
const tournamentConfig = {
  id: "summer2023",
  startDate: new Date("2023-06-01"),
  endDate: new Date("2023-08-31"),
  categories: [
    {
      name: "Top Investors",
      rewards: ["5000 USDT", "3000 USDT", "1000 USDT"],
      metric: "totalInvestment"
    },
    {
      name: "Top Recruiters",
      rewards: ["5000 USDT", "3000 USDT", "1000 USDT"],
      metric: "referralCount"
    }
  ]
};
```

### 2. Create Backend Service

Develop a Node.js service that:

1. Queries the subgraph periodically
2. Calculates tournament standings
3. Stores results in a database
4. Provides API endpoints for the frontend

```javascript
// Example backend service pseudocode
const { request, gql } = require('graphql-request');
const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/YOUR_USERNAME/hicaperasubgraph';

// Query to get all investments within tournament timeframe
const GET_TOURNAMENT_DATA = gql`
  query GetTournamentData($startTime: BigInt!, $endTime: BigInt!) {
    investments(where: {timestamp_gte: $startTime, timestamp_lte: $endTime}) {
      user {
        id
      }
      amount
      timestamp
    }
    users {
      id
      referrals {
        id
      }
    }
  }
`;

async function calculateTournamentStandings() {
  const startTime = Math.floor(tournamentConfig.startDate.getTime() / 1000);
  const endTime = Math.floor(tournamentConfig.endDate.getTime() / 1000);
  
  const data = await request(SUBGRAPH_URL, GET_TOURNAMENT_DATA, {
    startTime: startTime.toString(),
    endTime: endTime.toString()
  });
  
  // Process investments for "Top Investors" category
  const investorStandings = processInvestorStandings(data.investments);
  
  // Process referrals for "Top Recruiters" category
  const recruiterStandings = processRecruiterStandings(data.users);
  
  // Store results in database
  await storeResults(investorStandings, recruiterStandings);
}

function processInvestorStandings(investments) {
  // Group investments by user and sum amounts
  const userTotals = {};
  
  investments.forEach(investment => {
    const userId = investment.user.id;
    if (!userTotals[userId]) {
      userTotals[userId] = 0;
    }
    userTotals[userId] += parseFloat(investment.amount) / 1e18; // Convert from wei
  });
  
  // Sort users by total investment
  return Object.entries(userTotals)
    .map(([id, total]) => ({ id, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Top 10 investors
}

function processRecruiterStandings(users) {
  // Count referrals for each user
  const referralCounts = users.map(user => ({
    id: user.id,
    count: user.referrals.length
  }));
  
  // Sort by referral count
  return referralCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 recruiters
}
```

### 3. Frontend Integration

Create UI components to display tournament standings and rewards:

```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TournamentLeaderboard = () => {
  const [investors, setInvestors] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/tournament/standings');
        setInvestors(response.data.investors);
        setRecruiters(response.data.recruiters);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tournament data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) return <div>Loading tournament data...</div>;
  
  return (
    <div className="tournament-container">
      <h2>Tournament Leaderboard</h2>
      
      <div className="leaderboard-section">
        <h3>Top Investors</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Address</th>
              <th>Total Investment</th>
              <th>Reward</th>
            </tr>
          </thead>
          <tbody>
            {investors.map((investor, index) => (
              <tr key={investor.id}>
                <td>{index + 1}</td>
                <td>{shortenAddress(investor.id)}</td>
                <td>{investor.total.toFixed(2)} USDT</td>
                <td>
                  {index < 3 ? tournamentConfig.categories[0].rewards[index] : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="leaderboard-section">
        <h3>Top Recruiters</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Address</th>
              <th>Referrals</th>
              <th>Reward</th>
            </tr>
          </thead>
          <tbody>
            {recruiters.map((recruiter, index) => (
              <tr key={recruiter.id}>
                <td>{index + 1}</td>
                <td>{shortenAddress(recruiter.id)}</td>
                <td>{recruiter.count}</td>
                <td>
                  {index < 3 ? tournamentConfig.categories[1].rewards[index] : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function shortenAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default TournamentLeaderboard;
```

### 4. Reward Distribution

Options for distributing rewards:

1. **Manual Distribution**: Admin sends rewards to winners' wallets
2. **Semi-Automated**: Generate a transaction batch for admin approval
3. **Fully Automated**: Smart contract with admin-only function to distribute rewards

Example of a semi-automated approach:

```javascript
// Generate transaction batch for admin
async function generateRewardTransactions() {
  const tournamentResults = await getTournamentResults();
  const transactions = [];
  
  // Process investor category
  tournamentConfig.categories[0].rewards.forEach((reward, index) => {
    if (tournamentResults.investors[index]) {
      const amount = parseFloat(reward.split(' ')[0]) * 1e18; // Convert to wei
      transactions.push({
        recipient: tournamentResults.investors[index].id,
        amount: amount.toString(),
        category: 'Top Investors',
        rank: index + 1
      });
    }
  });
  
  // Process recruiter category
  tournamentConfig.categories[1].rewards.forEach((reward, index) => {
    if (tournamentResults.recruiters[index]) {
      const amount = parseFloat(reward.split(' ')[0]) * 1e18; // Convert to wei
      transactions.push({
        recipient: tournamentResults.recruiters[index].id,
        amount: amount.toString(),
        category: 'Top Recruiters',
        rank: index + 1
      });
    }
  });
  
  return transactions;
}
```

## Next Steps

1. **Set up the subgraph** as described in the README.md
2. **Define tournament rules** based on your business requirements
3. **Implement the backend service** to calculate standings
4. **Create frontend components** to display tournament data
5. **Develop reward distribution mechanism** based on your preferred approach

## Benefits Over On-Chain Implementation

- **Cost Savings**: Avoid expensive on-chain calculations and storage
- **Flexibility**: Easily modify tournament rules without contract upgrades
- **User Experience**: Real-time updates without waiting for transactions
- **Historical Data**: Access to complete tournament history
- **Complex Logic**: Implement sophisticated tournament rules without gas limitations