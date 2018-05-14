<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style lang="scss">
@import '@/client/styles/theme.scss';
//
.symbol-route .hero-body .progress::-webkit-progress-bar {
	background-color: $white;
	border: 1px solid $border;
}

</style>

<style>
/**/

</style>

<template>
	<section class="symbol-route">
		<section class="hero is-small has-background-white-bis">
			<div v-invisible="busy" class="hero-body">
				<div class="container">
					<div class="columns is-multiline">

						<div class="column">
							<div class="columns is-mobile">
								<ui-symbol-logo class="column is-narrow my-1 is-96x96" :symbol="symbol"></ui-symbol-logo>
								<div class="column">
									<h1 class="title my-0 is-size-3 whitespace-no-wrap">{{symbol}}</h1>
									<h2 class="subtitle my-0 is-size-5">{{instrument.simple_name || instrument.name}}</h2>
									<p class="subtitle is-size-7">
										{{ticker.disExchangeCode}} ({{vcapitalize(quote.status)}})
									</p>
								</div>
							</div>
						</div>

						<div class="column is-6-tablet is-narrow-desktop desktop:w-initial">
							<div class="columns is-mobile">
								<div class="column is-narrow">
									<p class="title is-size-3">{{vnumber(quote.price)}}</p>
									<p class="subtitle is-size-5 whitespace-no-wrap font-semibold" v-ui-green-red="quote.change">
										{{vnumber(quote.change, {plusminus:true})}} ({{vnumber(quote.changeRatio*100, {plusminus:true, percent:true})}})
									</p>
									<p class="subtitle is-size-7">{{vfromnow(quote.tradeTime, {verbose:true})}}</p>
								</div>
								<!-- <div class="column">
									<p class="subtitle is-size-7">After Hours</p>
									<p class="title is-size-4 font-medium">{{vnumber(quote.pPrice)}}</p>
									<p class="subtitle is-size-6 whitespace-no-wrap font-medium" v-ui-green-red="quote.pChange">
										{{vnumber(quote.pChange, {plusminus:true})}} ({{vnumber(quote.pChRatio*100, {plusminus:true, percent:true})}})
									</p>
									<p class="subtitle is-size-7">{{vfromnow(quote.faTradeTime, {verbose:true})}}</p>
								</div> -->
							</div>
						</div>

						<div class="column is-6-tablet is-2-desktop">
							<div class="columns is-mobile is-gapless">
								<div class="column is-6">
									<p class="is-size-7">Bid</p>
									<progress class="progress is-danger is-small rounded-none mb-0" value="15" max="100" style="transform: rotate(180deg);"></progress>
									<p class="is-size-7 has-text-danger">{{vnumber(quote.bid)}}</p>
									<progress class="progress is-success is-small rounded-none mb-0" :value="basize.bid" max="100" style="transform: rotate(180deg);"></progress>
									<p class="is-size-7 has-text-success">{{vnumber(quote.bidSize, {precision:0})}}</p>
								</div>
								<div class="column is-6">
									<p class="is-size-7 has-text-right">Ask</p>
									<progress class="progress is-success is-small rounded-none mb-0" value="15" max="100"></progress>
									<p class="is-size-7 has-text-success has-text-right">{{vnumber(quote.ask)}}</p>
									<progress class="progress is-danger is-small rounded-none mb-0" :value="basize.ask" max="100"></progress>
									<p class="is-size-7 has-text-danger has-text-right">{{vnumber(quote.askSize, {precision:0})}}</p>
								</div>
							</div>
						</div>

						<div class="column is-6-tablet is-3-desktop">
							<table class="table is-narrow is-fullwidth content is-small">
								<tbody>
									<tr v-for="deal in vdeals">
										<td width="33%" class="has-text-right">{{vfromnow(deal.tradeTime)}}</td>
										<td width="25%" class="has-text-right font-medium" :class="dealcolor(deal)">{{vnumber(deal.deal)}}</td>
										<td width="25%">x {{vnumber(deal.volume,{precision:0})}}</td>
									</tr>
								</tbody>
							</table>
						</div>

						<!-- <article class="message column is-dark">
							<div class="message-body">
								haiii
							</div>
						</article> -->

					</div>
				</div>
			</div>
			<div class="hero-foot">
				<nav class="tabs is-boxed">
					<div class="container">
						<ul>
							<li :class="{ 'is-active': tabindex == i }" v-on:click="tabindex = i" v-for="(tab, i) in tabs">
								<a>
									<b-icon :icon="tab.icon"></b-icon>
									<span>{{tab.title}}</span>
								</a>
							</li>
						</ul>
					</div>
				</nav>
			</div>
		</section>

		<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
			<component :is="tabs[tabindex].vcomponent" class=""></component>
		</transition>

	</section>
</template>
