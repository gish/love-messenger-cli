'use strict';

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _messageList = require('./lib/message-list');

var _messageList2 = _interopRequireDefault(_messageList);

var _sendLoveMessage = require('./lib/send-love-message');

var _sendLoveMessage2 = _interopRequireDefault(_sendLoveMessage);

var _getRequiredKey = require('./lib/get-required-key');

var _getRequiredKey2 = _interopRequireDefault(_getRequiredKey);

var _logger = require('./lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

if (isDevelopment) {
  _dotenv2.default.load();
}

var requiredKeys = ['ELKS_API_PASSWORD', 'ELKS_API_USERNAME', 'GOOGLE_SPREADSHEET_ID', 'MESSAGE_RECEIVER_NUMBER', 'MESSAGE_SENDER_NAME'];

var config = requiredKeys.reduce(function (obj, requiredKey) {
  obj[requiredKey] = (0, _getRequiredKey2.default)(process.env, requiredKey);
  return obj;
}, {});

var logger = (0, _logger2.default)({
  level: 'debug',
  slack: {
    apiToken: process.env.SLACK_API_TOKEN,
    domain: process.env.SLACK_DOMAIN,
    logLevel: process.env.SLACK_LOG_LEVEL,
    channel: process.env.SLACK_CHANNEL,
    userName: process.env.SLACK_USERNAME
  }
});

var todaysDate = (0, _moment2.default)().format('YYYY-MM-DD');

(0, _messageList2.default)(config.GOOGLE_SPREADSHEET_ID).then(function (messageList) {
  var message = messageList.find(function (message) {
    return message.date === todaysDate;
  });
  var messageText = (0, _lodash2.default)(message, 'message');

  if (!messageText) {
    logger.info('No message of the day for ' + todaysDate);
  } else {
    logger.debug('Trying to send message "' + messageText + '"');
    (0, _sendLoveMessage2.default)({
      senderName: config.MESSAGE_SENDER_NAME,
      receiverNumber: config.MESSAGE_RECEIVER_NUMBER,
      message: messageText,
      username: config.ELKS_API_USERNAME,
      password: config.ELKS_API_PASSWORD,
      logger: logger
    }).then(function () {
      var receiverNumber = config.MESSAGE_RECEIVER_NUMBER;
      logger.info('Sent message "' + messageText + '" to ' + receiverNumber);
    }).catch(function () {
      return logger.info('Error sending message: ' + e);
    });
  }
}).catch(function (e) {
  return logger.info('Error getting messages: ' + e);
});