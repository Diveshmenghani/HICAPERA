# Hicapera Subgraph

This subgraph indexes events from the HicaperaMLM contract on the BSC network to provide efficient data access for tournament rewards and other off-chain calculations.

## Setup Instructions

### Prerequisites

- Node.js and npm/yarn installed
- Graph CLI installed globally: `npm install -g @graphprotocol/graph-cli`

### Configuration

Before deploying the subgraph, you need to:

1. Update the contract address in `subgraph.yaml` with your deployed contract address
2. Update the `startBlock` in `subgraph.yaml` with the block number where your contract was deployed
3. Place your contract ABI in `HicaperaMLM.abi.json` file

### Generate Types

Run the following command to generate AssemblyScript types from the GraphQL schema and ABIs:

```bash
npm run codegen
```

### Build the Subgraph

Compile the subgraph:

```bash
npm run build
```

### Deploy the Subgraph

#### To a Hosted Service

Update the deploy script in `package.json` with your GitHub username, then run:

```bash
npm run deploy
```

#### To a Local Graph Node

If you're running a local Graph Node for development:

```bash
npm run create-local
npm run deploy-local
```

## Integration with Frontend

After deploying your subgraph, you can query it using GraphQL. Here's an example of how to integrate it with your frontend:

```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/YOUR_GITHUB_USERNAME/hicaperasubgraph',
  cache: new InMemoryCache(),
});

// Example query to get user data
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      totalInvestment
      totalWithdrawn
      maxWithdrawalLimit
      referrer {
        id
      }
      referrals {
        id
      }
    }
  }
`;

// Function to fetch user data
async function fetchUserData(address) {
  const { data } = await client.query({
    query: GET_USER,
    variables: { id: address.toLowerCase() },
  });
  return data.user;
}
```

## Tournament Reward Implementation

The subgraph provides a foundation for implementing tournament rewards off-chain. Here's how you can use it:

1. Query the subgraph to get investment data for all users
2. Implement tournament logic in your backend or frontend code
3. Calculate rewards based on investment amounts, referral structure, or other criteria
4. Display tournament results and rewards in your UI

This approach allows for complex tournament rules without the gas costs of implementing them on-chain.