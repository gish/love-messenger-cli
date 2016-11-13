'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sendLoveMessage = function sendLoveMessage(opts) {
  var senderName = opts.senderName,
      receiverNumber = opts.receiverNumber,
      message = opts.message,
      username = opts.username,
      password = opts.password,
      logger = opts.logger;


  return new Promise(function (resolve, reject) {
    _request2.default.post('https://api.46elks.com/a1/SMS', {
      form: {
        from: senderName,
        to: receiverNumber,
        message: message
      },
      auth: {
        'user': username,
        'pass': password
      }
    }, function (error, response, body) {
      var statusCode = response.statusCode;

      if (error || statusCode !== 200) {
        logger.error('Error sending message. Response: ' + body);
        reject(response);
      } else {
        logger.debug('Response: ' + body);
        resolve(body);
      }
    });
  });
};

exports.default = sendLoveMessage;