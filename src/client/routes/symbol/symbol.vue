<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

</style>

<template>
	<section class="symbol-route">
		<section class="hero is-small has-background-white-bis">
			<div v-busy="busy" class="hero-body">
				<div class="container">
					<div class="columns is-multiline">

						<div class="column is-half is-one-quarter-widescreen">
							<div class="columns is-mobile">
								<ui-symbol-logo class="column is-narrow my-1 is-96x96" :symbol="symbol"></ui-symbol-logo>
								<div class="column">
									<h1 class="title my-0 is-3">{{symbol}}</h1>
									<h2 class="subtitle my-0 is-5">{{instrument.simple_name || instrument.name}}</h2>
									<p class="subtitle my-0 is-7">{{ticker.disExchangeCode}}</p>
								</div>
							</div>
						</div>

						<div class="column is-half is-one-third-widescreen">
							<div class="columns is-mobile">
								<div class="column is-narrow">
									<p class="title my-0 is-3">{{vnfixed(quote.price)}}</p>
									<p class="subtitle my-0 is-5 font-semibold" v-ui-green-red="quote.change">
										{{vnfixed(quote.change, {plusminus: true})}} ({{vnfixed(quote.changeRatio*100, {plusminus: true, percent: true})}})
									</p>
									<p class="subtitle my-0 is-7">{{vfromnow(quote.tradeTime, {verbose: true})}}</p>
								</div>
								<div class="column">
									<p class="subtitle my-0 is-7">After Hours</p>
									<p class="title my-0 is-4 font-medium">{{vnfixed(quote.pPrice)}}</p>
									<p class="subtitle my-0 is-6 font-medium" v-ui-green-red="quote.pChange">
										{{vnfixed(quote.pChange, {plusminus: true})}} ({{vnfixed(quote.pChRatio*100, {plusminus: true, percent: true})}})
									</p>
									<p class="subtitle my-0 is-7">{{vfromnow(quote.faTradeTime, {verbose: true})}}</p>
								</div>
							</div>
						</div>

						<div class="column is-half is-one-third-widescreen border-debug">
							<div class="columns is-mobile">
								<div class="column is-half">
									<progress class="progress is-small rounded-none" value="15" max="100">15%</progress>
								</div>
								<div class="column is-half">
									<progress class="progress is-small rounded-none" value="15" max="100">15%</progress>
								</div>
							</div>
						</div>

						<div class="column is-half is-one-quarter-widescreen">
							<table class="table is-narrow is-fullwidth content is-small">
								<tbody>
									<tr v-for="deal in vdeals">
										<td width="33%" class="has-text-right">{{vfromnow(deal.tradeTime)}}</td>
										<td width="25%" class="has-text-right font-medium" :class="dealcolor(deal)">{{vnfixed(deal.deal)}}</td>
										<td width="25%">x {{vnfixed(deal.volume,{precision:0})}}</td>
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
