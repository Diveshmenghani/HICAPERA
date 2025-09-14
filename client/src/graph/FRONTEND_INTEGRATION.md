# Frontend Integration Guide

## Overview

This guide explains how to integrate the HicaperaMLM subgraph with your frontend application to efficiently query blockchain data and implement tournament rewards.

## Setup

### 1. Install Dependencies

Add the following packages to your frontend project:

```bash
npm install @apollo/client graphql
```

### 2. Configure Apollo Client

Create a GraphQL client configuration in your application:

```javascript
// src/graphql/client.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/YOUR_USERNAME/hicaperasubgraph';

const httpLink = new HttpLink({
  uri: SUBGRAPH_URL
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

export default client;
```

### 3. Create GraphQL Queries

Define your GraphQL queries in a separate file:

```javascript
// src/graphql/queries.js
import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      totalInvestment
      totalWithdrawn
      maxWithdrawalLimit
      registrationTimestamp
      referrer {
        id
      }
      referrals {
        id
      }
    }
  }
`;

export const GET_USER_INVESTMENTS = gql`
  query GetUserInvestments($userId: ID!) {
    investments(where: { user: $userId }, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
      transactionHash
    }
  }
`;

export const GET_USER_CLAIMS = gql`
  query GetUserClaims($userId: ID!) {
    claims(where: { user: $userId }, orderBy: timestamp, orderDirection: desc) {
      id
      totalAmount
      selfProfit
      referralProfit
      timestamp
      transactionHash
    }
  }
`;

export const GET_TOP_INVESTORS = gql`
  query GetTopInvestors($limit: Int!) {
    users(first: $limit, orderBy: totalInvestment, orderDirection: desc) {
      id
      totalInvestment
      referrals {
        id
      }
    }
  }
`;

export const GET_TOURNAMENT_DATA = gql`
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
```

### 4. Set Up Apollo Provider

Wrap your application with the Apollo Provider:

```jsx
// src/index.js or App.js
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import client from './graphql/client';
import App from './App';

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
```

## Usage Examples

### 1. Fetch User Data

```jsx
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../graphql/queries';

const UserProfile = ({ address }) => {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: address.toLowerCase() },
    skip: !address
  });

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p>Error loading user data: {error.message}</p>;
  if (!data || !data.user) return <p>No user data found</p>;

  const { user } = data;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <p><strong>Address:</strong> {user.id}</p>
      <p><strong>Total Investment:</strong> {formatAmount(user.totalInvestment)} USDT</p>
      <p><strong>Total Withdrawn:</strong> {formatAmount(user.totalWithdrawn)} USDT</p>
      <p><strong>Max Withdrawal Limit:</strong> {formatAmount(user.maxWithdrawalLimit)} USDT</p>
      <p><strong>Referrer:</strong> {user.referrer ? shortenAddress(user.referrer.id) : 'None'}</p>
      <p><strong>Direct Referrals:</strong> {user.referrals.length}</p>
    </div>
  );
};

function formatAmount(amount) {
  return (parseInt(amount) / 1e18).toFixed(2);
}

function shortenAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default UserProfile;
```

### 2. Display User Investments

```jsx
import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_INVESTMENTS } from '../graphql/queries';

const UserInvestments = ({ address }) => {
  const { loading, error, data } = useQuery(GET_USER_INVESTMENTS, {
    variables: { userId: address.toLowerCase() },
    skip: !address
  });

  if (loading) return <p>Loading investment history...</p>;
  if (error) return <p>Error loading investments: {error.message}</p>;
  if (!data || !data.investments || data.investments.length === 0) {
    return <p>No investment history found</p>;
  }

  return (
    <div className="investment-history">
      <h3>Investment History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {data.investments.map(investment => (
            <tr key={investment.id}>
              <td>{new Date(parseInt(investment.timestamp) * 1000).toLocaleString()}</td>
              <td>{formatAmount(investment.amount)} USDT</td>
              <td>
                <a 
                  href={`https://bscscan.com/tx/${investment.transactionHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function formatAmount(amount) {
  return (parseInt(amount) / 1e18).toFixed(2);
}

export default UserInvestments;
```

### 3. Tournament Leaderboard

```jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TOURNAMENT_DATA } from '../graphql/queries';

const TournamentLeaderboard = () => {
  const [tournamentConfig, setTournamentConfig] = useState({
    startDate: new Date('2023-09-01'),
    endDate: new Date('2023-09-30'),
    categories: [
      {
        name: 'Top Investors',
        rewards: ['5000 USDT', '3000 USDT', '1000 USDT']
      },
      {
        name: 'Top Recruiters',
        rewards: ['5000 USDT', '3000 USDT', '1000 USDT']
      }
    ]
  });
  
  const [investors, setInvestors] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  
  const startTime = Math.floor(tournamentConfig.startDate.getTime() / 1000).toString();
  const endTime = Math.floor(tournamentConfig.endDate.getTime() / 1000).toString();
  
  const { loading, error, data } = useQuery(GET_TOURNAMENT_DATA, {
    variables: { startTime, endTime }
  });
  
  useEffect(() => {
    if (data) {
      // Process investors data
      const userInvestments = {};
      data.investments.forEach(investment => {
        const userId = investment.user.id;
        if (!userInvestments[userId]) {
          userInvestments[userId] = 0;
        }
        userInvestments[userId] += parseInt(investment.amount);
      });
      
      const investorsList = Object.entries(userInvestments)
        .map(([id, total]) => ({ id, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      
      setInvestors(investorsList);
      
      // Process recruiters data
      const recruitersList = data.users
        .map(user => ({
          id: user.id,
          count: user.referrals.length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      setRecruiters(recruitersList);
    }
  }, [data]);
  
  if (loading) return <p>Loading tournament data...</p>;
  if (error) return <p>Error loading tournament data: {error.message}</p>;
  
  return (
    <div className="tournament-container">
      <h2>Tournament Leaderboard</h2>
      <p>
        <strong>Period:</strong> {tournamentConfig.startDate.toLocaleDateString()} - {tournamentConfig.endDate.toLocaleDateString()}
      </p>
      
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
                <td>{formatAmount(investor.total)} USDT</td>
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

function formatAmount(amount) {
  return (parseInt(amount) / 1e18).toFixed(2);
}

function shortenAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default TournamentLeaderboard;
```

## Best Practices

1. **Caching Strategy**: Configure Apollo Client's cache policy based on your data refresh needs

```javascript
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'cache-and-network', // Fetches from cache first, then network
      nextFetchPolicy: 'cache-first',   // Subsequent fetches use cache first
    },
  },
});
```

2. **Error Handling**: Implement robust error handling for GraphQL queries

```jsx
const { loading, error, data } = useQuery(GET_USER, {
  variables: { id: address.toLowerCase() },
  onError: (error) => {
    console.error('GraphQL error:', error);
    // Implement fallback or retry logic
  }
});
```

3. **Polling for Updates**: For real-time updates, consider polling or subscriptions

```jsx
const { loading, error, data } = useQuery(GET_TOURNAMENT_DATA, {
  variables: { startTime, endTime },
  pollInterval: 30000, // Poll every 30 seconds
});
```

4. **Optimistic UI Updates**: For mutations, use optimistic UI updates

```jsx
const [claimEarnings] = useMutation(CLAIM_EARNINGS, {
  optimisticResponse: {
    __typename: 'Mutation',
    claimEarnings: {
      __typename: 'ClaimResult',
      success: true,
      amount: expectedAmount
    }
  },
  update: (cache, { data }) => {
    // Update cache with the expected result
  }
});
```

## Next Steps

1. **Deploy the subgraph** to a hosted service or local Graph Node
2. **Integrate the Apollo Client** into your frontend application
3. **Implement the GraphQL queries** for your specific use cases
4. **Create UI components** to display the data
5. **Test the integration** thoroughly before deploying to production

By following this guide, you'll be able to efficiently query blockchain data from your frontend application and implement tournament rewards without the gas costs of on-chain calculations.