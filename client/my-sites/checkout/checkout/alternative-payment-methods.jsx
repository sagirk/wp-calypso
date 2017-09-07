/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import analytics from 'lib/analytics';
import cartValues from 'lib/cart-values';

class AlternativePaymentMethods extends PureComponent {
	static propTypes = {
		selectedPaymentMethod: PropTypes.string,
		cart: PropTypes.object.isRequired,
		paymentMethods: PropTypes.array.isRequired,
		onSelectPaymentMethod: PropTypes.func.isRequired,
	};

	handleToggle( paymentMethod ) {
		// event.preventDefault();

		analytics.ga.recordEvent( 'Upgrades', 'Switch Payment Method' );
		analytics.tracks.recordEvent( 'calypso_checkout_switch_to_' + paymentMethod );
		this.props.onSelectPaymentMethod( paymentMethod );
	}

	getPaymentProviderName( method ) {
		switch ( method ) {
			case 'ideal':
				return 'iDEAL';
			case 'credit-card':
				return 'Credit card';
			case 'paypal':
				return 'PayPal';
		}

		return method;
	}

	getPaymentProviderImage( method ) {
		switch ( method ) {
			case 'paypal':
				return (
					<img src="/calypso/images/upgrades/paypal.svg" alt="PayPal" width="80" />
				);
		}

		return (
			<span>
				{ this.getPaymentProviderName( method ) }
			</span>
		);
	}

	paymentMethod( method ) {
		if ( this.props.selectedPaymentMethod === method ) {
			return null;
		}

		if ( ! cartValues.isPaymentMethodEnabled( this.props.cart, method ) ) {
			return null;
		}

		return (
			<a key={ method } id={ method } className={ method } href="" onClick={ () => this.handleToggle( method ) }>
				{ this.getPaymentProviderImage( method ) }
			</a>
		);
	}

	render() {
		if ( ! this.props.paymentMethods ) {
			return null;
		}

		return (
			<div className="checkout__alternative-payment-methods">
				<span>{ translate( 'Or pay with:' ) }</span>
				{ this.props.paymentMethods.map( method => {
					return this.paymentMethod( method );
				} ) }
			</div>
		);
	}
}
AlternativePaymentMethods.displayName = 'AlternativePaymentMethods';

export default localize( AlternativePaymentMethods );
