import * as _ from 'lodash';
export class MessageParserService {

  parse(messages) {
    let parsedMessages = [];

    if (_.isArray(messages)) {
      messages.forEach(messageSet => this.parseMessageObject(messageSet, parsedMessages));
    } else if (_.isObject(messages)) {
      this.parseMessageObject(messages, parsedMessages);
    } else if (_.isString(messages)) {
      parsedMessages.push(messages);
    }

    if (!parsedMessages.length) {
      parsedMessages = parsedMessages.concat(this.populateDefaultMessages(messages));
    }

    return parsedMessages.filter(_.identity);
  }

  parseSpesific(response) {
    if (_.has(response, 'data.errors') && _.has(response, 'data.data')) {
      _.set(response.data, 'summary', {});

      return this.handleErrors(response);
    }
  }

  handleErrors(response) {
    const errorMessages = [];

    _.forEach(response.data.errors, error => {
      const errorMessage = _.get(error, 'error_message');
      const errorCode = error.error_code;
      if (errorMessage || errorCode) {
        if (errorMessage && errorCode) {
          errorMessages.push(`${errorMessage} [${errorCode}]`);
        } else if (errorMessage && !errorCode) {
          errorMessages.push(errorMessage);
        } else if (!errorMessage && errorCode) {
          errorMessages.push(`Error code ${errorCode}`);
        }

        if (errorCode) {
          _.set(response.data, `summary.${error.error_code}`, true);
        }
      }
    });

    return errorMessages;
  }

  parseMessageObject(messageSet, parsedMessages) {

    if (_.has(messageSet, 'response.data[0]') && _.isArray(_.get(messageSet, 'response.data'))) {
      _.forEach(messageSet.response.data, message => this.parseMessageObject(message, parsedMessages));
    } else if (_.isString(messageSet) && messageSet) {
      parsedMessages.push(messageSet);
    } else if (_.has(messageSet, 'errorMessage') && messageSet.errorMessage) {
      parsedMessages.push(messageSet.errorMessage);
    } else if (_.has(messageSet, 'response.data[0]') && _.isArray(_.get(messageSet, 'response.data[0]'))) {
      _.forEach(messageSet.response.data, message => this.parseMessageObject(message, parsedMessages));
    } else if (_.has(messageSet, 'errors')) {
      _.forEach(messageSet.errors, errorMessage => {
        parsedMessages.push(errorMessage);
      });
    } else if (_.has(messageSet, 'data[0]') && _.isArray(_.get(messageSet, 'data[0]'))) {
      _.forEach(messageSet.data, message => this.parseMessageObject(message, parsedMessages));
    } else if (_.has(messageSet, 'data[0]')) {
      _.forEach(messageSet.data, message => this.parseMessageObject(message, parsedMessages));
    }

  }

  populateDefaultMessages(messages) {
    let url = '';
    let statusCode = 0;
    if (_.has(messages, 'request') && _.has(messages, 'response')) {
      url = _.get(messages, 'config.url');
      statusCode = _.get(messages, 'response.status');
      if (!statusCode) {
        return 'error.http.noInternetConnection';
      }

      return this.setPopulateDefaultMessages(statusCode, url);
    }
    if (_.isArray(messages)) {

      _.forEach(messages, function(message) {
        url = _.get(message, 'config.url');
        statusCode = _.get(message, 'status') || _.get(message, 'response.status');
      });
      if (!statusCode) {
        return 'error.http.noInternetConnection';
      }

      return this.setPopulateDefaultMessages(statusCode, url);

    }
  }

  setPopulateDefaultMessages(statusCode, url) {
    switch (statusCode) {
      case 401:
      case 403:
      case 404:
      case 405:
      case 408:
      case 500:
      case 502:
      case 503:
        return `error.httpCode.${statusCode}`+ { url };
      default:
        return 'unkown error';
    }
  }
}
