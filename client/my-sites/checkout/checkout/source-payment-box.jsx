/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { assign, some } from 'lodash';

/**
 * Internal dependencies
 */
import PaymentBox from './payment-box';
import { localize, translate } from 'i18n-calypso';
import { abtest } from 'lib/abtest';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import config from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import CartToggle from './cart-toggle';
import AlternativePaymentMethods from './alternative-payment-methods';
import TermsOfService from './terms-of-service';
import Input from 'my-sites/domains/components/form/input';
import cartValues from 'lib/cart-values';
import SubscriptionText from './subscription-text';
import analytics from 'lib/analytics';
import wpcomUndocumented from 'lib/wpcom-undocumented';

class SourcePaymentBox extends PureComponent {
	static propTypes = {
		paymentType: PropTypes.string.isRequired,
		cart: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
		paymentMethods: PropTypes.array.isRequired,
		onSelectPaymentMethod: PropTypes.func.isRequired,
	}

	getLocationOrigin( l ) {
		return l.protocol + '//' + l.hostname + ( l.port ? ':' + l.port : '' );
	}

	redirectToPayment( event ) {
		const origin = this.getLocationOrigin( location );
		event.preventDefault();

		this.setSubmitState( {
			info: translate( 'Sending details to %(paymentProvider)s', {
				args: { paymentProvider: this.getPaymentProviderName() } } ),
			disabled: true
		} );

		let cancelUrl = origin + '/checkout/';

		if ( this.props.selectedSite ) {
			cancelUrl += this.props.selectedSite.slug;
		} else {
			cancelUrl += 'no-site';
		}

		const dataForApi = assign( {}, this.state, {
			successUrl: origin + this.props.redirectTo(),
			type: this.props.paymentType,
			cancelUrl,
			cart: this.props.cart,
			domainDetails: this.props.transaction.domainDetails
		} );

		// get thre redirect URL from rest endpoint
		wpcomUndocumented.sourcePaymentUrl( dataForApi, function( error, sourcePaymentUrl ) {
			let errorMessage;
			if ( error ) {
				if ( error.message ) {
					errorMessage = error.message;
				} else {
					errorMessage = translate( 'Please specify a country and postal code.' );
				}

				this.setSubmitState( {
					error: errorMessage,
					disabled: false
				} );
			}

			if ( sourcePaymentUrl ) {
				this.setSubmitState( {
					info: translate( 'Redirecting you to our payment provider' ),
					disabled: true
				} );
				analytics.ga.recordEvent( 'Upgrades', 'Clicked Checkout With Source Payment Button' );
				analytics.tracks.recordEvent( 'calypso_checkout_with_source_' + this.props.paymentType );
				location.href = sourcePaymentUrl;
			}
		}.bind( this ) );
	}

	renderButtonText() {
		if ( cartValues.cartItems.hasRenewalItem( this.props.cart ) ) {
			return translate( 'Purchase %(price)s subscription with %(paymentProvider)s', {
				args: { price: this.props.cart.total_cost_display, paymentProvider: this.getPaymentProviderName() },
				context: 'Pay button on /checkout'
			} );
		}

		return translate( 'Pay %(price)s with %(paymentProvider)s', {
			args: { price: this.props.cart.total_cost_display, paymentProvider: this.getPaymentProviderName() },
			context: 'Pay button on /checkout'
		} );
	}

	content() {
		const hasBusinessPlanInCart = some( this.props.cart.products, { product_slug: PLAN_BUSINESS } );
		const showPaymentChatButton =
			config.isEnabled( 'upgrades/presale-chat' ) &&
			abtest( 'presaleChatButton' ) === 'showChatButton' &&
			hasBusinessPlanInCart;

		return (
			<form onSubmit={ this.redirectToPayment }>

				<div className="payment-box-section">
					<Input
						additionalClasses="checkout-field"
						name="name"
						label={ translate( 'Name', { textOnly: true } ) }
						eventFormName="Checkout Form" />
				</div>

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( this.props.cart ) } />

				<div className="payment-box-actions">
					<div className="pay-button">
						<button type="submit" className="button is-primary button-pay" >
							{ this.renderButtonText() }
						</button>
						<SubscriptionText cart={ this.props.cart } />
					</div>

					<AlternativePaymentMethods
						cart={ this.props.cart }
						paymentMethods={ this.props.paymentMethods }
						selectedPaymentMethod={ this.props.paymentType }
						onSelectPaymentMethod={ this.props.onSelectPaymentMethod }
						/>

					{
						showPaymentChatButton &&
						<PaymentChatButton
							paymentType={ this.props.paymentType }
							cart={ this.props.cart } />
					}
				</div>

				<CartCoupon cart={ this.props.cart } />

				<CartToggle />
			</form>
		);
	}

	getPaymentProviderName() {
		switch ( this.props.paymentType ) {
			case 'ideal':
				return 'iDEAL';
		}

		return this.props.paymentType;
	}

	getTitle() {
		switch ( this.props.paymentType ) {
			case 'ideal':
				return translate( 'Secure Payment with iDEAL' );
		}

		return translate( 'Secure Payment' );
	}

	render() {
		return (
			<PaymentBox
				classSet="ideal-payment-box"
				title={ this.getTitle() }>
				{ this.content() }
			</PaymentBox>
		);
	}
}
SourcePaymentBox.displayName = 'SourcePaymentBox';

export default localize( SourcePaymentBox );
