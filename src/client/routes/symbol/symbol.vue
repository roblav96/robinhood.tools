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
									<h2 class="subtitle my-0 is-6">{{instrument.simple_name || instrument.name}}</h2>
									<h2 class="subtitle my-0 is-6">
										<b-tooltip label="stock exchange" position="is-bottom">{{ticker.disExchangeCode}}</b-tooltip>
										<!-- <b-tooltip label="country" position="is-bottom">{{ticker.regionIsoCode}}</b-tooltip> -->
									</h2>
									<!-- <span class="tag is-small is-success">{{vcapitalize(quote.status)}}</span> -->
									<!-- ({{vcapitalize(quote.status)}}) -->
								</div>
							</div>
						</div>

						<div class="column is-half is-one-quarter-widescreen">
							<h1 class="title my-0 is-3">{{vnfixed(quote.price)}}</h1>
							<h2 class="subtitle my-0 is-6 font-semibold" v-ui-green-red="quote.change">
								{{vnfixed(quote.change, {plusminus: true})}} ({{vnfixed(quote.changeRatio*100, {plusminus: true, percent: true})}})
							</h2>
							<h2 class="subtitle my-0 is-6">{{vfromnow(quote.tradeTime, {verbose: true})}}</h2>
							<!-- <h2 class="subtitle my-0 is-6">{{vcapitalize(quote.status)}}</h2> -->
							<!-- <span class="font-normal">({{vplusminus(vpercent(quote.price, quote.open))}}%)</span> -->
							<!-- <ui-number :value="quote.open" plus-minus></ui-number> -->
							<!-- <br> {{vnfixed(quote.changeRatio, {plusminus:true})}}% -->
							<!-- ({{vpercent(quote.price, quote.open)}}%) -->
							<!-- <h2 class="subtitle my-0 is-6">{{vcapitalize(quote.status)}}</h2> -->
						</div>

						<div class="column is-half is-one-quarter-widescreen">
							<p class="content">sparkline goes here</p>
						</div>

						<div class="column is-half is-one-quarter-widescreen">
							<table class="table is-narrow is-fullwidth content is-small">
								<tbody>
									<tr v-for="deal in vdeals">
										<td width="25%" class="has-text-right">{{vfromnow(deal.tradeTime)}}</td>
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
