<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

section.symbol-route table.bidask .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}

</style>

<template>
	<section class="symbol-route">

		<section class="section has-background-white-ter">
			<div class="container">

				<div class="columns is-mobile flex-wrap desktop:flex-no-wrap">

					<div class="column is-narrow">
						<symbol-logo class="is-48x48 card" :symbol="symbol"></symbol-logo>
					</div>

					<div class="column flex">
						<div class="box h-12 flex py-0 px-5">
							<p class="self-center title mr-4 whitespace-no-wrap">{{symbol}}</p>
							<p class="self-center is-size-6">{{breakpoints.widescreenAndUp?all.quote.name:all.quote.tinyName}}</p>
						</div>
					</div>

					<div class="column is-narrow">
						<div class="box h-12 flex py-0 px-5 whitespace-no-wrap">
							<number-ticker :number="all.quote.price" class="self-center title mr-4 font-mono"></number-ticker>
							<p class="self-center is-size-6 font-medium" v-bull-bear="all.quote.change">
								<span>{{vnumber(all.quote.change,{plusminus:true})}}</span>
								<br>
								<span>{{vnumber(all.quote.percent,{plusminus:true,percent:true,precision:2})}}</span>
							</p>
						</div>
					</div>



					<div class="column is-narrow">
						<div class="box h-12 flex py-0">
							<table class="bidask table is-paddingless is-middle is-nowrap is-borderless self-center is-size-6">
								<tbody>
									<tr>
										<td class="has-text-danger has-text-right">
											<b-tooltip label="Bid Price">
												<p>{{vnumber(all.quote.bid)}}</p>
											</b-tooltip>
										</td>
										<td>
											<progress class="progress w-16 is-danger is-small rounded-none pr-2" :value="bidask.bid.price" :min="0"
											    :max="100" style="transform: rotate(180deg);"></progress>
										</td>
										<td>
											<progress class="progress w-16 is-success is-small rounded-none pr-2" :value="bidask.ask.price" :min="0"
											    :max="100"></progress>
										</td>
										<td class="has-text-success has-text-left">
											<b-tooltip label="Ask Price">
												<p>{{vnumber(all.quote.ask)}}</p>
											</b-tooltip>
										</td>
									</tr>
									<tr>
										<td class="has-text-success has-text-right">
											<b-tooltip label="Bid Size" position="is-bottom">
												<p>{{vnumber(all.quote.bids,{precision:0})}}</p>
											</b-tooltip>
										</td>
										<td>
											<progress class="progress w-16 is-success is-small rounded-none pr-2" :value="bidask.bid.size" :min="0"
											    :max="100" style="transform: rotate(180deg);"></progress>
										</td>
										<td>
											<progress class="progress w-16 is-danger is-small rounded-none pr-2" :value="bidask.ask.size" :min="0"
											    :max="100"></progress>
										</td>
										<td class="has-text-danger has-text-left">
											<b-tooltip label="Ask Size" position="is-bottom">
												<p>{{vnumber(all.quote.asks,{precision:0})}}</p>
											</b-tooltip>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>



					<div class="column is-narrow widescreen:flex hidden">
						<div class="box h-12 flex py-0">
							<table class="table is-paddingless is-middle is-nowrap is-borderless self-center is-size-6">
								<tbody>
									<tr>
										<td class="font-semibold has-text-right pr-2">{{vnumber(all.quote.volume,{compact:true})}}</td>
										<td>Volume</td>
									</tr>
									<tr>
										<td class="font-semibold has-text-right pr-2">{{vnumber(all.quote.avgVolume,{compact:true})}}</td>
										<td>Avg Volume</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>



					<div v-if="all.quote.marketCap && all.quote.dealFlowVolume" class="column is-narrow fullhd:flex hidden">
						<div class="box h-12 flex py-0">
							<table class="table is-paddingless is-middle is-nowrap is-borderless self-center is-size-6">
								<tbody>
									<tr>
										<td class="font-semibold has-text-right pr-2">{{vnumber(all.quote.marketCap,{compact:true})}}</td>
										<td>Market Cap</td>
									</tr>
									<tr>
										<td class="font-semibold has-text-right pr-2" v-bull-bear="all.quote.dealFlowVolume">
											{{vnumber(all.quote.dealFlowVolume,{compact:true,plusminus:true})}}
										</td>
										<td>Capital Flow</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>



					<!-- <div v-if="all.quote.marketCap" class="column is-narrow widescreen:flex hidden">
						<div class="box h-12 flex">
							<p class="self-center is-size-4 mr-2 font-medium whitespace-no-wrap">
								{{vnumber(all.quote.marketCap,{compact:true})}}
							</p>
							<p class="self-center is-size-6">Market Cap</p>
						</div>
					</div> -->



					<!-- <div class="column is-narrow">
						<div class="box h-12 flex">
							<p class="self-center is-size-4 mr-2 font-medium whitespace-no-wrap">
								{{vnumber(all.quote.volume,{compact:true})}}
							</p>
							<p class="self-center is-size-6">Volume</p>
						</div>
					</div>

					<div v-show="all.quote.avgVolume" class="column is-narrow fullhd:flex hidden">
						<div class="box h-12 flex">
							<p class="self-center is-size-4 mr-2 font-medium whitespace-no-wrap">
								{{vnumber(all.quote.avgVolume,{compact:true})}}
							</p>
							<p class="self-center is-size-6">Avg Volume</p>
						</div>
					</div> -->

				</div>
			</div>

		</section>
		<section class="has-background-white-ter pb-6">

			<nav class="tabs is-toggle is-centered is-fullwidth mb-0">
				<div class="container px-6 desktop:px-0">
					<ul class="has-background-white rounded">
						<!-- <li :class="{'is-active':showticker}">
							<a class="no-underline" v-on:click="showticker = !showticker">
								<b-icon :icon="showticker?'chevron-double-up':'chevron-double-down'"></b-icon>
								<span>Ticker</span>
							</a>
						</li> -->
						<router-link tag="li" v-for="route in routes" :key="route.name" :to="{name:route.name}">
							<a class="no-underline">
								<b-icon :icon="route.icon"></b-icon>
								<span>{{vcapitalize(route.path)}}</span>
							</a>
						</router-link>
					</ul>
				</div>
			</nav>



			<!-- <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
				<v-symbol-ticker v-if="showticker" class="pb-0"></v-symbol-ticker>
			</transition> -->



		</section>

		<hr class="h-px my-0">

		<!-- <section class="section has-background-white-bis"> -->
		<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
			<router-view class="has-background-white-bis"></router-view>
		</transition>
		<!-- </section> -->

	</section>
</template>
