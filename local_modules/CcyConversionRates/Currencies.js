// Copyright (c) 2020-2020 Wazniya
// Copyright (c) 2014-2019, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict'
//
const wazn_config = require('../wazniya_libapp_js/wazniya-core-js/wazn_utils/wazn_config')
const wazn_amount_format_utils = require('../wazniya_libapp_js/wazniya-core-js/wazn_utils/wazn_amount_format_utils')
const JSBigInt = require('../wazniya_libapp_js/wazniya-core-js/cryptonote_utils/biginteger').BigInteger
//
const ccySymbolsByCcy = exports.ccySymbolsByCcy =
{
  WAZN: 'WAZN', // included for completeness / convenience / API
  USD: 'USD',
  AUD: 'AUD',
  BRL: 'BRL',
  CAD: 'CAD',
  CHF: 'CHF',
  CNY: 'CNY',
  EUR: 'EUR',
  GBP: 'GBP',
  HKD: 'HKD',
  INR: 'INR',
  JPY: 'JPY',
  KRW: 'KRW',
  MXN: 'MXN',
  NOK: 'NOK',
  NZD: 'NZD',
  SEK: 'SEK',
  SGD: 'SGD',
  TRY: 'TRY',
  RUB: 'RUB',
  ZAR: 'ZAR'
}
const allOrderedCurrencySymbols = exports.allOrderedCurrencySymbols =
[
  ccySymbolsByCcy.WAZN, // included for completeness / convenience / API
  ccySymbolsByCcy.USD,
  ccySymbolsByCcy.AUD,
  ccySymbolsByCcy.BRL,
  ccySymbolsByCcy.CAD,
  ccySymbolsByCcy.CHF,
  ccySymbolsByCcy.CNY,
  ccySymbolsByCcy.EUR,
  ccySymbolsByCcy.GBP,
  ccySymbolsByCcy.HKD,
  ccySymbolsByCcy.INR,
  ccySymbolsByCcy.JPY,
  ccySymbolsByCcy.KRW,
  ccySymbolsByCcy.MXN,
  ccySymbolsByCcy.NOK,
  ccySymbolsByCcy.NZD,
  ccySymbolsByCcy.SEK,
  ccySymbolsByCcy.SGD,
  ccySymbolsByCcy.TRY,
  ccySymbolsByCcy.RUB,
  ccySymbolsByCcy.ZAR
]
const hasAtomicUnits = exports.hasAtomicUnits = function (ccySymbol) {
  return (ccySymbol == ccySymbolsByCcy.WAZN)
}
const unitsForDisplay = exports.unitsForDisplay = function (ccySymbol) {
  if (ccySymbol == ccySymbolsByCcy.WAZN) {
    return wazn_config.coinUnitPlaces
  }
  return 2
}
const nonAtomicCurrency_formattedString = exports.nonAtomicCurrency_formattedString = function (
  final_amountDouble, // final as in display-units-rounded - will throw if amount has too much precision
  ccySymbol
) { // -> String
  // is nonAtomic-unit'd currency a good enough way to categorize these?
  if (ccySymbol == ccySymbolsByCcy.WAZN) {
    throw 'nonAtomicCurrency_formattedString not to be called with ccySymbol=.WAZN'
  }
  if (final_amountDouble == 0) {
    return '0' // not 0.0
  }
  const naiveString = `${final_amountDouble}`
  const components = naiveString.split('.')
  const components_length = components.length
  if (components_length <= 0) {
    throw 'Unexpected 0 components while formatting nonatomic currency'
  }
  if (components_length == 1) { // meaning there's no '.'
    if (naiveString.indexOf('.') != -1) {
      throw "one component but no '.' character"
    }
    return naiveString + '.00'
  }
  if (components_length != 2) {
    throw 'expected components_length=' + components_length
  }
  const component_1 = components[0]
  const component_2 = components[1]
  const component_2_str_length = component_2.length
  const currency_unitsForDisplay = unitsForDisplay(ccySymbol)
  if (component_2_str_length > currency_unitsForDisplay) {
    throw 'expected component_2_characters_count<=currency_unitsForDisplay'
  }
  const requiredNumberOfZeroes = currency_unitsForDisplay - component_2_str_length
  let rightSidePaddingZeroes = ''
  if (requiredNumberOfZeroes > 0) {
    for (let i = 0; i < requiredNumberOfZeroes; i++) {
      rightSidePaddingZeroes += '0' // TODO: less verbose way to do this?
    }
  }
  return component_1 + '.' + component_2 + rightSidePaddingZeroes // pad
}
function roundTo (num, digits) {
  return +(Math.round(num + 'e+' + digits) + 'e-' + digits)
}
exports.submittableWaznAmountDouble_orNull = function (
  CcyConversionRates_Controller_shared,
  selectedCurrencySymbol,
  submittableAmountRawNumber_orNull // passing null causes immediate return of null
) { // -> Double?
  // conversion approximation will be performed from user input
  if (submittableAmountRawNumber_orNull == null) {
    return null
  }
  const submittableAmountRawNumber = submittableAmountRawNumber_orNull
  if (selectedCurrencySymbol == ccySymbolsByCcy.WAZN) {
    return submittableAmountRawNumber // identity rate - NOTE: this is also the RAW non-truncated amount
  }
  const waznAmountDouble = rounded_ccyConversionRateCalculated_waznAmountNumber(
    CcyConversionRates_Controller_shared,
    submittableAmountRawNumber,
    selectedCurrencySymbol
  )
  return waznAmountDouble
}
const rounded_ccyConversionRateCalculated_waznAmountNumber =
	exports.rounded_ccyConversionRateCalculated_waznAmountNumber =
	function (
	    CcyConversionRates_Controller_shared,
	    userInputAmountJSNumber,
	    selectedCurrencySymbol
	  ) { // -> Double? // may return nil if ccyConversion rate unavailable - consumers will try again on 'didUpdateAvailabilityOfRates'
	    const waznToCurrencyRate = CcyConversionRates_Controller_shared.rateFromWAZN_orNullIfNotReady(
	      selectedCurrencySymbol
	    )
	    if (waznToCurrencyRate == null) {
	      return null // ccyConversion rate unavailable - consumers will try again on 'didUpdateAvailabilityOfRates'
	    }
	    // conversion:
	    // currencyAmt = waznAmt * waznToCurrencyRate;
	    // waznAmt = currencyAmt / waznToCurrencyRate.
	    // I figure it's better to apply the rounding here rather than only at the display level so that what is actually sent corresponds to what the user saw, even if greater ccyConversion precision /could/ be accomplished..
	    const raw_ccyConversionRateApplied_amount = userInputAmountJSNumber * (1 / waznToCurrencyRate)
	    const truncated_amount = roundTo(raw_ccyConversionRateApplied_amount, 4) // must be truncated for display purposes
	    if (isNaN(truncated_amount)) {
	      throw 'truncated_amount in rounded_ccyConversionRateCalculated_waznAmountNumber is NaN'
	    }
	    //
	    return truncated_amount
	  }
const displayUnitsRounded_amountInCurrency = exports.displayUnitsRounded_amountInCurrency = function ( // Note: __DISPLAY__ units
  CcyConversionRates_Controller_shared,
  ccySymbol,
  waznAmountNumber // NOTE: 'Double' JS Number, not JS BigInt
) { // -> Double?
  if (typeof waznAmountNumber !== 'number') {
    throw 'unexpected typeof waznAmountNumber=' + (typeof waznAmountNumber)
  }
  if (ccySymbol == ccySymbolsByCcy.WAZN) {
    return waznAmountNumber // no conversion necessary
  }
  const waznToCurrencyRate = CcyConversionRates_Controller_shared.rateFromWAZN_orNullIfNotReady(
    ccySymbol // toCurrency
  )
  if (waznToCurrencyRate == null) {
    return null // ccyConversion rate unavailable - consumers will try again
  }
  const currency_unitsForDisplay = unitsForDisplay(ccySymbol)
  const raw_ccyConversionRateApplied_amountNumber = waznAmountNumber * waznToCurrencyRate
  const truncated_amount = roundTo(raw_ccyConversionRateApplied_amountNumber, currency_unitsForDisplay) // must be truncated for display purposes
  //
  return truncated_amount
}
//
exports.displayStringComponentsFrom = function (
  CcyConversionRates_Controller_shared,
  wazn_amount_JSBigInt,
  displayCcySymbol
) {
  const WAZN = ccySymbolsByCcy.WAZN
  const wazn_amount_str = wazn_amount_format_utils.formatMoney(wazn_amount_JSBigInt)
  if (displayCcySymbol != WAZN) {
    // TODO: using doubles here is not very good, and must be replaced with JSBigInts to support small amounts
    const wazn_amount_double = parseFloat(wazn_amount_str)
    //
    const displayCurrencyAmountDouble_orNull = displayUnitsRounded_amountInCurrency(
      CcyConversionRates_Controller_shared,
      displayCcySymbol,
      wazn_amount_double
    )
    if (displayCurrencyAmountDouble_orNull != null) { // rate is ready
      const displayCurrencyAmountDouble = displayCurrencyAmountDouble_orNull
      const displayFormattedAmount = nonAtomicCurrency_formattedString(
        displayCurrencyAmountDouble,
        displayCcySymbol
      )
      return {
        amt_str: displayFormattedAmount,
        ccy_str: displayCcySymbol
      }
    } else {
      // rate is not ready, so wait for it by falling through to display WAZN:
    }
  }
  return {
    amt_str: wazn_amount_str,
    ccy_str: WAZN
  } // special case
}
