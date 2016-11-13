import dotenv from 'dotenv'
import moment from 'moment'
import get from 'lodash.get'
import getMessageList from './lib/message-list'
import sendLoveMessage from './lib/send-love-message'
import getRequiredKey from './lib/get-required-key'
import loggerFactory from './lib/logger'

const isDevelopment = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')

if (isDevelopment) {
  dotenv.load()
}

const requiredKeys = [
  'ELKS_API_PASSWORD',
  'ELKS_API_USERNAME',
  'GOOGLE_SPREADSHEET_ID',
  'MESSAGE_RECEIVER_NUMBER',
  'MESSAGE_SENDER_NAME'
]

const config = requiredKeys.reduce((obj, requiredKey) => {
  obj[requiredKey] = getRequiredKey(process.env, requiredKey)
  return obj
}, {})

const logger = loggerFactory({
  level: 'debug',
  slack: {
    apiToken: process.env.SLACK_API_TOKEN,
    domain: process.env.SLACK_DOMAIN,
    logLevel: process.env.SLACK_LOG_LEVEL,
    channel: process.env.SLACK_CHANNEL,
    userName: process.env.SLACK_USERNAME
  }
})

const todaysDate = moment().format('YYYY-MM-DD')

getMessageList(config.GOOGLE_SPREADSHEET_ID)
.then((messageList) => {
  const message = messageList.find((message) => {
    return message.date === todaysDate
  })
  const messageText = get(message, 'message');

  if (!messageText) {
    logger.info(`No message of the day`)
  } else {
    logger.debug(`Trying to send message "${messageText}"`)
    sendLoveMessage({
      senderName: config.MESSAGE_SENDER_NAME,
      receiverNumber: config.MESSAGE_RECEIVER_NUMBER,
      message: messageText,
      username: config.ELKS_API_USERNAME,
      password: config.ELKS_API_PASSWORD,
      logger: logger
    })
    .then(() => {
      const receiverNumber = config.MESSAGE_RECEIVER_NUMBER
      logger.info(`Sent message "${messageText}" to ${receiverNumber}`)
    })
    .catch(() => logger.info(`Error sending message: ${e}`))
  }
}).catch((e) => logger.info(`Error getting messages: ${e}`))
