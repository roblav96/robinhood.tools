<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

#symbol_route table .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}

</style>

<template>
	<div id="symbol_route">
		<section class="section py-0 has-background-white">

			<div class="columns my-0 py-2 items-center leading-tight touch:flex-wrap">

				<div class="column is-narrow">
					<v-symbol-logo class="is-48x48 shadow" :symbol="symbol"></v-symbol-logo>
				</div>

				<div class="column is-narrow">
					<p class="whitespace-no-wrap">
						<span class="title font-bold is-size-4">{{symbol}}</span>
						<!-- {{all.quote.tinyName||all.quote.name}} -->
						{{all.quote.acronym}}
					</p>
					<p>{{all.quote.tinyName||all.quote.name}}</p>
					<!-- <p>{{symbol}}:{{all.quote.acronym}}</p> -->
				</div>

				<div class="column is-narrow has-text-centered">
					<p class="title font-bold is-size-4">
						<v-price-ticker :price="all.quote.price"></v-price-ticker>
					</p>
					<p>
						<v-timestamp :value="all.quote.timestamp"></v-timestamp>
					</p>
				</div>

				<div class="column is-narrow has-text-centered">
					<p class="title font-bold is-size-4" v-bull-bear="all.quote.percent">
						{{vnumber(all.quote.percent,{plusminus:true,percent:true})}}
					</p>
					<p v-bull-bear="all.quote.change">
						{{vnumber(all.quote.change,{plusminus:true})}}
					</p>
				</div>

				<div v-if="all.quote.volume" class="column is-narrow has-text-centered">
					<p class="is-size-4 font-medium leading-tighter">
						{{vnumber(all.quote.volume,{compact:true,precision:1})}}
					</p>
					<p>Volume</p>
				</div>
				<div v-if="all.quote.avgVolume" class="column is-narrow has-text-centered">
					<p class="is-size-4 font-medium leading-tighter">
						{{vnumber(all.quote.avgVolume,{compact:true,precision:1})}}
					</p>
					<p>Avg Volume</p>
				</div>
				<div v-if="all.quote.marketCap" class="column is-narrow has-text-centered">
					<p class="is-size-4 font-medium leading-tighter">
						{{vnumber(all.quote.marketCap,{compact:true})}}
					</p>
					<p>Market Cap</p>
				</div>
				<div v-if="all.quote.dealFlowVolume" class="column is-narrow has-text-centered">
					<p class="is-size-4 font-medium leading-tighter" v-bull-bear="all.quote.dealFlowVolume">
						{{vnumber(all.quote.dealFlowVolume,{compact:true,plusminus:true})}}
					</p>
					<p>Captial Flow</p>
				</div>

				<!-- <div class="column is-narrow">
						<table class="table is-paddingless is-middle is-nowrap is-borderless">
							<tbody>
								<tr>
									<td class="has-text-danger has-text-right">
										<b-tooltip label="Bid Price" position="is-left" size="is-small" animated>
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
										<b-tooltip label="Ask Price" position="is-right" size="is-small" animated>
											<p>{{vnumber(all.quote.ask)}}</p>
										</b-tooltip>
									</td>
								</tr>
								<tr>
									<td class="has-text-success has-text-right">
										<b-tooltip label="Bid Size" position="is-left" size="is-small" animated>
											<p>{{vnumber(all.quote.bids,{precision:1,compact:true})}}</p>
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
										<b-tooltip label="Ask Size" position="is-right" size="is-small" animated>
											<p>{{vnumber(all.quote.asks,{precision:1,compact:true})}}</p>
										</b-tooltip>
									</td>
								</tr>
							</tbody>
						</table>
					</div> -->

				<!-- <div v-if="all.quote.marketCap && all.quote.dealFlowVolume" class="column is-narrow desktop:flex hidden">
						<div class="flex py-0">
							<table class="table is-paddingless is-middle is-nowrap is-borderless">
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
					</div> -->

			</div>

			<nav class="tabs is-boxed mb-0">
				<ul>
					<router-link tag="li" class="is-dark" v-for="route in routes" :key="route.name" :to="{name:route.name}">
						<a class="is-dark no-underline">
							<b-icon :icon="route.meta.icon"></b-icon>
							<span>{{vcapitalize(route.path)}}</span>
						</a>
					</router-link>
				</ul>
			</nav>
		</section>

		<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
			<router-view :symbol="symbol" :quote="all.quote"></router-view>
		</transition>

	</div>
</template>
