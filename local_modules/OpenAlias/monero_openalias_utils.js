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
//
'use strict'
//
const wazn_config = require('../wazniya_libapp_js/wazniya-core-js/wazn_utils/wazn_config')
// ^-- TODO: remove this
//
const openalias_utils = require('./openalias_utils')
//
const currency_openAliasPrefix = wazn_config.openAliasPrefix
//
function DoesStringContainPeriodChar_excludingAsWAZNAddress_qualifyingAsPossibleOAAddress (address) {
  if (address.indexOf('.') !== -1) {
    // assumed to be an OA address asWAZN addresses do not have periods and OA addrs must
    return true
  }
  return false
}
exports.DoesStringContainPeriodChar_excludingAsWAZNAddress_qualifyingAsPossibleOAAddress = DoesStringContainPeriodChar_excludingAsWAZNAddress_qualifyingAsPossibleOAAddress
//
function ResolvedWaznAddressInfoFromOpenAliasAddress (
  openAliasAddress,
  txtRecordResolver, // see "./TXTResolver*.js"
  nettype,
  wazn_utils,
  fn
  // fn: (
  // 	err,
  // 	waznReady_address,
  //	payment_id, // may be undefined
  //	tx_description, // may be undefined
  // 	openAlias_domain,
  // 	oaRecords_0_name,
  // 	oaRecords_0_description,
  // 	dnssec_used_and_secured
  // ) -> HostedWaznAPIClient_RequestHandle
) {
  if (DoesStringContainPeriodChar_excludingAsWAZNAddress_qualifyingAsPossibleOAAddress(openAliasAddress) === false) {
    throw 'Asked to resolve non-OpenAlias address.' // throw as code fault
  }
  const openAlias_domain = openAliasAddress.replace(/@/g, '.')
  const resolverHandle = txtRecordResolver.TXTRecords(
    openAlias_domain,
    function (err, records, dnssec_used, secured, dnssec_fail_reason) {
      if (err) {
        const message = err.message ? err.message : err.toString()
        const errStr = "Couldn't look up '" + openAlias_domain + "'??? " + message
        const returnableErr = new Error(errStr)
        fn(returnableErr)
        return
      }
      // console.log(openAlias_domain + ": ", records);
      let oaRecords
      try {
        oaRecords = openalias_utils.ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix(
          openAlias_domain,
          records,
          dnssec_used,
          secured,
          dnssec_fail_reason,
          currency_openAliasPrefix
        )
      } catch (e) {
        const err = new Error(e)
        fn(err)
        return
      }
      const sampled_oaRecord = oaRecords[0] // going to assume we only have one, or that the first one is sufficient
      // console.log("OpenAlias record: ", sampled_oaRecord)
      const oaRecord_address = sampled_oaRecord.address
      try { // verify address is decodable for currency
        wazn_utils.decode_address(oaRecord_address, nettype)
      } catch (e) {
        const errStr = 'Address received by parsing OpenAlias address ' + oaRecord_address + ' was not a valid Wazn address: ' + e
        const error = new Error(errStr) // apparently if this is named err, JS will complain. no-semicolon parsing issue?
        fn(error)
        return
      }
      const waznReady_address = oaRecord_address // now considered valid
      const payment_id = sampled_oaRecord.tx_payment_id
      const tx_description = sampled_oaRecord.tx_description
      //
      const oaRecords_0_name = sampled_oaRecord.name
      const oaRecords_0_description = sampled_oaRecord.description
      const dnssec_used_and_secured = dnssec_used && secured
      //
      fn(
        null,
        //
        waznReady_address,
        payment_id,
        tx_description,
        //
        openAlias_domain,
        oaRecords_0_name,
        oaRecords_0_description,
        dnssec_used_and_secured
      )
    }
  )
  return resolverHandle
}
exports.ResolvedWaznAddressInfoFromOpenAliasAddress = ResolvedWaznAddressInfoFromOpenAliasAddress
