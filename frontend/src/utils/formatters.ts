/**
 * Utility functions for formatting data
 */

/**
 * Format date to specified locale string
 * @param date Date to format
 * @param locale Locale string (default: 'en-US') 
 * @param options Date formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format number as currency
 * @param amount Number to format
 * @param currency Currency code (default: 'USD')
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format number with thousands separators and decimal places
 * @param num Number to format
 * @param decimals Number of decimal places (default: 2)
 * @param locale Locale string (default: 'en-US') 
 * @returns Formatted number string
 */
export const formatNumber = (
  num: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Truncate text to specified length with ellipsis
 * @param text Text to truncate
 * @param length Maximum length (default: 100)
 * @param suffix Suffix to append (default: '...')
 * @returns Truncated text string
 */
export const truncateText = (
  text: string,
  length: number = 100,
  suffix: string = '...'
): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};