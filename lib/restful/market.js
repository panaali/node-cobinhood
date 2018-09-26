const Decimal = require('decimal.js')

const processPrecision = (precisions) => (
  precisions
  .map((precision) => new Decimal(precision))
  .sort((a, b) => a.lt(b)? -1: a.eq(b)? 0: 1)
)

const formatOrderbookPricePoint = (point) => ({
  price: new Decimal(point[0]),
  count: parseInt(point[1], 10),
  size: new Decimal(point[2]),
})

const formatFundingbookPricePoint = (point) => ({
  interest: new Decimal(point[0]),
  count: parseInt(point[1], 10),
  size: new Decimal(point[2]),
  minPeriod: parseInt(point[3], 10),
  maxPeriod: parseInt(point[4], 10),
})

const formatTrade = (trade) => ({
  id: trade.id,
  timestamp: new Date(trade.timestamp),
  makerSide: trade.maker_side,
  price: new Decimal(trade.price),
  size: new Decimal(trade.size)
})

const formatTradingPair = (pair) => ({
  id: pair.id,
  base: pair.base_currency_id,
  quote: pair.quote_currency_id,
  maxSize: new Decimal(pair.base_max_size),
  minSize: new Decimal(pair.base_min_size),
  increment: new Decimal(pair.quote_increment),
  marginEnabled: pair.margin_enabled,
})

const formatCurrency = (currency) => ({
  id: currency.currency,
  name: currency.name,
  type: currency.type,
  minUnit: new Decimal(currency.min_unit),
  isVisible: currency.is_visible,

  // funding sections
  fundingMinSize: new Decimal(currency.funding_min_size),
  interestIncrement: new Decimal(currency.interest_increment),
  fundingEnabled: currency.funding_enabled,
  quotationEnabled: currency.quotation_enabled,

  // deposit/withdrawal sections
  depositFee: new Decimal(currency.deposit_fee),
  withdrawalFee: new Decimal(currency.withdrawal_fee),
  cobWithdrawalFee: new Decimal(currency.cob_withdrawal_fee),
  minWithdrawal: new Decimal(currency.min_withdrawal),
  requireKYCLevel: currency.required_kyc_level,
  depositFrozen: currency.deposit_frozen,
  withdrawalFrozen: currency.withdrawal_frozen,
})

const formatTicker = (ticker) => ({
  tradingPair: ticker.trading_pair_id,
  lastTradePrice: new Decimal(ticker.last_trade_price),
  timestamp: new Date(ticker.timestamp),
  highestBid: new Decimal(ticker.highest_bid),
  lowestAsk: new Decimal(ticker.lowest_ask),
  volume24HR: new Decimal(ticker['24h_volume']),
  high24HR: new Decimal(ticker['24h_high']),
  low24HR: new Decimal(ticker['24h_low']),
  open24HR: new Decimal(ticker['24h_open']),
})

const formatLoanTicker = (ticker) => ({
  currency: ticker.symbol,
  lastLoanInterest: new Decimal(ticker['24h_last']),
  timestamp: new Date(ticker.timestamp),
  volume24HR: new Decimal(ticker['24h_volume']),
  high24HR: new Decimal(ticker['24h_high']),
  low24HR: new Decimal(ticker['24h_low']),
  open24HR: new Decimal(ticker['24h_open']),
})

const listTradingPairs = function() { return (
  this.send('tradingPairs')
  .then((result) => result.trading_pairs.map(formatTradingPair))
) }

const listCurrencies = function() { return (
  this.send('currencies')
  .then((result) => result.currencies.map(formatCurrency))
) }

const listFundingbookPrecisions = function(currency) { return (
  this.send('listFundingbookPrecisions', { currency: currency })
  .then((result) => processPrecision(result.precisions))
) }

const listOrderbookPrecisions = function(pair) { return (
  this.send('listOrderbookPrecisions', { trading_pair: pair })
  .then((result) => processPrecision(result))
) }

const getOrderbook = function(pair, precision, limit) { return (
  this.send('getOrderbook', {
    trading_pair: pair,
    precision: precision,
    limit: limit,
  })
  .then((result) => {
    let orderbook = result.orderbook
    if (orderbook.bids) {
      orderbook.bids = orderbook.bids.map(formatOrderbookPricePoint)
    }
    if (orderbook.asks) {
      orderbook.asks = orderbook.asks.map(formatOrderbookPricePoint)
    }
    return orderbook
  })
) }

const getFundingbook = function(currency, precision, limit) { return (
  this.send('getFundingbook', {
    currency: currency,
    precision: precision,
    limit: limit,
  })
  .then((result) => {
    let fundingbook = result.fundingbook
    if (fundingbook.bids) {
      fundingbook.bids = fundingbook.bids.map(formatFundingbookPricePoint)
    }
    if (fundingbook.asks) {
      fundingbook.asks = fundingbook.asks.map(formatFundingbookPricePoint)
    }
    return fundingbook
  })
) }

const listTrades = function(pair) { return (
  this.send('listTrades', { trading_pair: pair })
  .then((result) => result.trades.map(formatTrade))
) }

const getTicker = function(pair) { return (
  this.send('getTicker', { trading_pair: pair })
  .then((result) => formatTicker(result.ticker))
) }

const getLoanTicker = function(currency) { return (
  this.send('getLoanTicker', { currency: currency })
  .then((result) => formatLoanTicker(result.ticker))
) }

module.exports = {
  listOrderbookPrecisions,
  listTradingPairs,
  listCurrencies,
  listFundingbookPrecisions,
  getOrderbook,
  getFundingbook,
  listTrades,
  getTicker,
  getLoanTicker,
}
