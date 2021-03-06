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
const EventEmitter = require('events')
const Currencies = require('./Currencies')
//
class Controller extends EventEmitter {
  //
  // Interface - Constants
  eventName_didUpdateAvailabilityOfRates () {
    return 'CcyConversionRates_Controller_EventName_didUpdateAvailabilityOfRates'
  }

  //
  // Interface - Lifecycle - Init
  constructor (options, context) {
    super()
    // must call super before accessing this
    const self = this
    //
    self.options = options
    self.context = context
    //
    self.setup()
  }

  //
  // Internal - Lifecycle - Init
  setup () {
    const self = this
    //
    self.setMaxListeners(999) // avoid error
    //
    // Internal - Properties
    self.waznToCcyRateJSNumbersByCcySymbols = {} // [CurrencySymbol: Rate]
  }

  //
  // Interface - Accessors
  isRateReady ( // if you won't need the actual value
    ccySymbol // fromWAZNToCurrencySymbol
  ) // -> Bool
  {
    const self = this
    //
    if (ccySymbol == Currencies.ccySymbolsByCcy.WAZN) {
      throw "Invalid 'currency' argument value"
    }
    const rateValue_orNil = self.waznToCcyRateJSNumbersByCcySymbols[ccySymbol]
    return (rateValue_orNil != null && typeof rateValue_orNil !== 'undefined')
  }

  rateFromWAZN_orNullIfNotReady (
    ccySymbol // toCurrency
  ) // -> Rate?
  {
    const self = this
    //
    if (ccySymbol == Currencies.ccySymbolsByCcy.WAZN) {
      throw "Invalid 'currency' argument value"
    }
    const rateValue_orNil = self.waznToCcyRateJSNumbersByCcySymbols[ccySymbol] // which may be nil if the rate is not ready yet
    if (rateValue_orNil == null || typeof rateValue_orNil === 'undefined') {
      return null // value=null|undefined -> null
    }
    const final_rateValue = rateValue_orNil
    return final_rateValue
  }

  //
  // Interface - Imperatives
  set (
    rateAsNumber, // WAZNToCurrencyRate; non-nil ??? ought to only need to be set to nil internally
    ccySymbol, // forCurrency
    isPartOfBatch // internally, aka doNotNotify; defaults to false; normally false ??? but pass true for batch calls and then call ifBatched_notifyOf_set_WAZNToCurrencyRate manually (arg is called doNotNotify b/c if part of batch, you only want to do currency-non-specific notify post once instead of N times)
  ) // -> Bool // wasSetValueDifferent
  {
    const self = this
    //
    if (rateAsNumber == null || typeof rateAsNumber === 'undefined') {
      throw 'unexpected nil rateAsNumber passed to CcyConversionRates.Controller.set()'
    }
    const doNotNotify = isPartOfBatch
    const raw_previouslyExisting_rateValue = self.waznToCcyRateJSNumbersByCcySymbols[ccySymbol]
    const previouslyExistingRateValue_orNull = raw_previouslyExisting_rateValue != null && typeof raw_previouslyExisting_rateValue !== 'undefined' ? raw_previouslyExisting_rateValue : null
    //
    self.waznToCcyRateJSNumbersByCcySymbols[ccySymbol] = rateAsNumber
    //
    if (doNotNotify != true) {
      self._notifyOf_updateTo_WAZNToCurrencyRate() // the default
    }
    const wasSetValueDifferent = rateAsNumber != previouslyExistingRateValue_orNull // given rateAsNumber != nil
    return wasSetValueDifferent
  }

  ifBatched_notifyOf_set_WAZNToCurrencyRate () {
    const self = this
    //
    // console.log(
    // 	"CcyConversionRates: Received updates:",
    // 	JSON.stringify(self.waznToCcyRateJSNumbersByCcySymbols, null, '  ')
    // )
    self._notifyOf_updateTo_WAZNToCurrencyRate()
  }

  //
  set_batchOf_ratesBySymbol (
    ratesBySymbol // : [String: Number]
  ) {
    const self = this
    //
    let mutable_didUpdateAnyValues = false
    {
      const ccySymbols = Object.keys(Currencies.ccySymbolsByCcy)
      const numberOf_ccySymbols = ccySymbols.length
      for (let i = 0; i < numberOf_ccySymbols; i++) {
        const ccySymbol = ccySymbols[i]
        if (ccySymbol == Currencies.ccySymbolsByCcy.WAZN) {
          continue // do not need to mock WAZN<->WAZN rate
        }
        const rateAsNumber = ratesBySymbol[ccySymbol]
        if (typeof rateAsNumber !== 'undefined') { // but this WILL allow nulls! is that ok? figure being able to nil serverside might be important... and if it is null from server, invalidating/expiring the local value is probably therefore a good idea
          const _wasSetValueDifferent = self.set(
            rateAsNumber,
            ccySymbol,
            true // isPartOfBatch ??? defer notify
          )
          if (_wasSetValueDifferent) {
            mutable_didUpdateAnyValues = true
          }
        }
      }
    }
    const didUpdateAnyValues = mutable_didUpdateAnyValues
    if (didUpdateAnyValues) {
      // notify all of update
      self.ifBatched_notifyOf_set_WAZNToCurrencyRate()
    }
  }

  //
  // Internal - Imperatives
  _notifyOf_updateTo_WAZNToCurrencyRate () {
    const self = this
    //
    self.emit(
      self.eventName_didUpdateAvailabilityOfRates()
    )
  }
}
module.exports = Controller
