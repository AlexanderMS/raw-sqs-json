'use strict';

class MessageValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

function processResults(results) {
  const total = results.length;
  const succeeded = results.reduce((acc, result) => {
    return result.isError ? acc : (acc + 1)
  }, 0);
  const failed = total - succeeded;

  return Promise.resolve({
    total,
    succeeded,
    failed,
    results
  });
}

function processJsonMessages(sqs, sqsParams, consumeMessage) {
  return sqs.receiveMessage(sqsParams).promise()
    .then(data => {
      if (!data.Messages) {
        return processResults([]);
      }

      const messagePromises = data.Messages.map(rawMessage => {

        if (!rawMessage.ReceiptHandle || !rawMessage.Body) {
          return Promise.resolve({
            isError: true,
            result: new MessageValidationError('Failed to validate SQS message. Raw delivery setting should be enabled.', rawMessage)
          });
        }

        let message;
        try {
          message = JSON.parse(rawMessage.Body);
        } catch(error) {
          return Promise.resolve({
            isError: true,
            result: new MessageValidationError(`Failed to parse SQS message. All messages should be JSON`, {
              error,
              rawMessage
            })
          });
        }

        let messageConsumeResult;
        return consumeMessage(message)
          .then(result => {
            messageConsumeResult = result;
            return sqs.deleteMessage({
              QueueUrl: sqsParams.QueueUrl,
              ReceiptHandle: rawMessage.ReceiptHandle
            }).promise();
          })
          .then(() => Promise.resolve({
            isError: false,
            result: messageConsumeResult
          }))
          .catch(err => Promise.resolve({
            isError: true,
            result: err
          }));
      });

      return Promise.all(messagePromises).then(processResults);
    });
}

module.exports = {
  processJsonMessages,
  errors: {
    MessageValidationError
  }
};
