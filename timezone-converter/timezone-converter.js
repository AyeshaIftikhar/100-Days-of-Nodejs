// timezone-converter.js
const moment = require('moment-timezone');
const { DateTime } = require('luxon');

class TimezoneConverter {
  constructor(mode = 'moment', defaultTimezone = 'UTC') {
    this.mode = this.validateMode(mode);
    this.defaultTimezone = defaultTimezone;
  }

  // Validate the conversion mode
  validateMode(mode) {
    const validModes = ['moment', 'luxon', 'intl'];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid mode. Choose from: ${validModes.join(', ')}`);
    }
    return mode;
  }

  // Convert between timezones
  convert(
    date,
    targetTimezone,
    sourceTimezone = this.defaultTimezone,
    format = 'yyyy-MM-dd HH:mm:ss'
  ) {
    switch (this.mode) {
      case 'moment':
        return this._convertWithMoment(date, targetTimezone, sourceTimezone, format);
      case 'luxon':
        return this._convertWithLuxon(date, targetTimezone, sourceTimezone, format);
      case 'intl':
        return this._convertWithIntl(date, targetTimezone, sourceTimezone, format);
      default:
        throw new Error('Invalid mode');
    }
  }

  // Get current time in specific timezone
  nowInTimezone(timezone, format = 'yyyy-MM-dd HH:mm:ss') {
    switch (this.mode) {
      case 'moment':
        return moment().tz(timezone).format(this._convertFormatToMoment(format));
      case 'luxon':
        return DateTime.now().setZone(timezone).toFormat(format);
      case 'intl':
        return new Date().toLocaleString('en-US', {
          timeZone: timezone,
          formatMatcher: 'best fit'
        });
      default:
        throw new Error('Invalid mode');
    }
  }

  // Check if timezone is valid
  isValidTimezone(timezone) {
    try {
      switch (this.mode) {
        case 'moment':
          return moment.tz.zone(timezone) !== null;
        case 'luxon':
          return DateTime.local().setZone(timezone).isValid;
        case 'intl':
          // Intl doesn't have a direct way to validate, so we try to use it
          new Date().toLocaleString('en-US', { timeZone: timezone });
          return true;
        default:
          return false;
      }
    } catch (e) {
      return false;
    }
  }

  // PRIVATE METHODS FOR EACH IMPLEMENTATION

  _convertWithMoment(date, targetTimezone, sourceTimezone, format) {
    const momentFormat = this._convertFormatToMoment(format);
    return moment.tz(date, momentFormat, sourceTimezone)
      .tz(targetTimezone)
      .format(momentFormat);
  }

  _convertWithLuxon(date, targetTimezone, sourceTimezone, format) {
    let dateTime;
    
    if (date instanceof Date) {
      dateTime = DateTime.fromJSDate(date).setZone(sourceTimezone);
    } else if (typeof date === 'string') {
      dateTime = DateTime.fromFormat(date, format, { zone: sourceTimezone });
    } else {
      throw new Error('Invalid date format');
    }
    
    return dateTime.setZone(targetTimezone).toFormat(format);
  }

  _convertWithIntl(date, targetTimezone, sourceTimezone, format) {
    // Intl API is more limited - we'll convert to Date object first
    let dateObj;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // This is a simplified parser - you might need a more robust solution
      dateObj = new Date(date);
    } else {
      throw new Error('Invalid date format');
    }
    
    // Convert to target timezone
    return dateObj.toLocaleString('en-US', {
      timeZone: targetTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  _convertFormatToMoment(format) {
    // Simple conversion between Luxon and Moment format tokens
    return format
      .replace(/yyyy/g, 'YYYY')
      .replace(/dd/g, 'DD')
      .replace(/HH/g, 'HH')
      .replace(/mm/g, 'mm')
      .replace(/ss/g, 'ss');
  }
}

module.exports = TimezoneConverter;