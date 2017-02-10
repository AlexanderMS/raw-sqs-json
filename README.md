# raw-sqs-json

Simplifies reception, processing, and removal of JSON objects stored in SQS

`npm install raw-sqs-json`

## Features

1. Polls the given queue using `sqs` and `params`
2. Attempts to parse each message as JSON (**Important**: "Raw delivery" must be enabled for the subscription to the queue)
3. If the message is valid, calls the provided `consumeMessage` callback
4. If `consumeMessage` resolves for the given message, removes the message from the queue
5. Outputs the `total` number of messages, number of `succeeded` (resolved by `consumeMessage`), `failed` (invalid JSONs and rejected by `consumeMessage`), and an array of results for each message

## Example:
```javascript
const
  AWS = require('aws-sdk'),
  rawSqsJson = require('raw-sqs-json'),
  sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

...

return rawSqsJson.processJsonMessages(sqs, {
  QueueUrl: 'https://sqs.us-east-1.amazonaws.com/12345678912/my-awesome-queue',
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 30
}, (message) => {
  if (iWantThisMessage(message)) {
    return Promise.resolve({
      mySuccessfulResult: 'myValue'
    })
  } else {
    return Promise.reject('no!')
  }
});

```

Response:

```json
{
  "total": 3,
  "succeeded": 2,
  "failed": 1,
  "results": [
    {
      "isError": false,
      "result": {
        "mySuccessfulResult": "myValue"
      }
    },
    {
      "isError": true,
      "result": "no"
    },
    {
      "isError": true,
      "result": {
        "name": "MessageValidationError",
        "details": {
          "error": "SyntaxError: Unexpected token N in JSON at position 0",
          "rawMessage": {
            "MessageId": "900efefe-0342-4573-8920-fb24c3a8ce19",
            "ReceiptHandle": "AQEBA5...",
            "MD5OfBody": "8677b7d6bed5e6948ab6e232889940d5",
            "Body": "NotAJson"
          }
        }
      }
    }
  ]
}
```

After execution, the message corresponding to the first result will be removed.
