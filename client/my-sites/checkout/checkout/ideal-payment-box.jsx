/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import PaymentBox from './payment-box';
import { localize, translate } from 'i18n-calypso';

class IdealPaymentBox extends PureComponent {
	handleToggle = ( event ) => {
		event.preventDefault();
		this.props.onToggle( 'credit-card' );
	};

	render() {
		return (
			<PaymentBox
				classSet="ideal-payment-box"
				title={ translate( 'Secure Payment with iDEAL' ) }>
				WIP<br />
				Switch back to <a href="" onClick={ this.handleToggle }>
					Credit card
				</a>
			</PaymentBox>
		);
	}
}
IdealPaymentBox.displayName = 'IdealPaymentBox';

export default localize( IdealPaymentBox );
