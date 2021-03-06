/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { parseTransactionDate } from '../util';

describe( 'util', () => {
	describe( '#parseTransactionDate()', () => {
		const transaction = deepFreeze( {
			id: 123456,
			date: '2016-12-12T11:22:33+0000',
		} );

		test( 'should parse the date of the transaction', () => {
			const updatedTransaction = parseTransactionDate( transaction );

			expect( updatedTransaction ).to.eql( {
				id: 123456,
				date: moment( transaction.date ).toDate(),
			} );
		} );
	} );
} );
