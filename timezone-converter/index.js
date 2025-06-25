const TimezoneConverter = require('./timezone-converter');

// Create converters with different modes
const momentConverter = new TimezoneConverter('moment');
const luxonConverter = new TimezoneConverter('luxon');
const intlConverter = new TimezoneConverter('intl');

// Example 1: Convert between timezones
console.log('Moment.js:', momentConverter.convert('2023-05-15 14:30', 'Asia/Tokyo', 'Europe/London'));
console.log('Luxon:', luxonConverter.convert('2023-05-15 14:30', 'Asia/Tokyo', 'Europe/London'));
console.log('Intl:', intlConverter.convert('2023-05-15 14:30', 'Asia/Tokyo', 'Europe/London'));

// Example 2: Get current time in different timezone
console.log('Current time in New York (Moment):', momentConverter.nowInTimezone('America/New_York'));
console.log('Current time in New York (Luxon):', luxonConverter.nowInTimezone('America/New_York'));
console.log('Current time in New York (Intl):', intlConverter.nowInTimezone('America/New_York'));

// Example 3: Validate timezone
console.log('Is valid (Moment):', momentConverter.isValidTimezone('America/New_York'));
console.log('Is valid (Luxon):', luxonConverter.isValidTimezone('America/New_York'));
console.log('Is valid (Intl):', intlConverter.isValidTimezone('America/New_York'));