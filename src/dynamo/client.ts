import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamoClient = new DynamoDB({
  region: "us-west-1",
});

export default dynamoClient;
