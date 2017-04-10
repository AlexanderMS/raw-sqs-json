# sqs-json

[![npm version](https://badge.fury.io/js/sqs-json.svg)](https://badge.fury.io/js/sqs-json)
[![CircleCI](https://circleci.com/gh/AlexanderMS/sqs-json.svg?style=shield)](https://circleci.com/gh/AlexanderMS/sqs-json)

Simplifies reception, processing, and removal of JSON objects stored in SQS.

`npm install sqs-json`

## API

`sqsJson.processJsonMessages(sqs, params, callback<message>) -> Promise`

1. Polls a queue using provided `sqs` and `params`:  [sqs.receiveMessage(params)](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#receiveMessage-property)
2. Attempts to parse each message as JSON
3. If the message is a valid JSON, calls the provided `callback`
4. If the callback resolves for the given message, removes the message from the queue, otherwise leaves the message in the queue
5. Outputs the `total` number of messages, number of `succeeded` (resolved by `callback`), `failed` (rejected by `callback` OR invalid JSON messages), and an array of `results` for each message in the format defined below

**Note**: unless Raw Message Delivery is enabled for the queue subscription, the parsed message will also include AWS wrappers. You may want to enable this in your AWS console to work with pure JSON objects easier.

## Example:
```javascript
const
  AWS = require('aws-sdk'),
  sqsJson = require('sqs-json'),
  sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

...

return sqsJson.processJsonMessages(sqs, {
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

Example response:

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

In the example, the message corresponding
to the first result will be removed from the queue as it was successful,
while the remaining two will be rejected and stay in the queue adhering to SQS
"maximum receives" policies.
