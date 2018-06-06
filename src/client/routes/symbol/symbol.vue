<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

#symbol_route table .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}

#symbol_route > section:first-child .tags,
#symbol_route > section:first-child .tag {
	margin-bottom: 0px;
}

</style>

<template>
	<div id="symbol_route" class="">

		<section class="has-background-white border border-b-1 touch:px-6">
			<div class="container">

				<div class="columns is-mobile is-variable is-4 my-0 items-center flex-wrap desktop:flex-no-wrap">

					<div class="column is-narrow pr-0">
						<v-symbol-logo class="is-48x48 card" :symbol="symbol"></v-symbol-logo>
					</div>

					<div class="column">
						<p class="title font-bold leading-none whitespace-no-wrap">{{symbol}}</p>
						<p class="leading-none">{{vtruncate(all.quote.tinyName||all.quote.name,48)}}</p>
					</div>

					<div class="column is-narrow has-text-right">
						<p class="title font-bold leading-none font-mono">
							<v-number-ticker :number="all.quote.price"></v-number-ticker>
						</p>
						<p class="leading-none">
							<v-timestamp :value="all.quote.timestamp" :opts="{verbose:false}"></v-timestamp>
						</p>
					</div>

					<div class="column is-narrow has-text-right" v-bull-bear="all.quote.change">
						<p class="is-size-3 font-light leading-none">{{nformat(all.quote.percent,{plusminus:true,percent:true,precision:2})}}</p>
						<p class="leading-none">{{nformat(all.quote.change,{plusminus:true})}}</p>
					</div>

					<div class="column is-narrow">
						<table class="table is-paddingless is-middle is-nowrap is-borderless">
							<tbody>
								<tr>
									<td class="has-text-danger has-text-right">
										<b-tooltip label="Bid Price" position="is-left" size="is-small" animated>
											<p>{{nformat(all.quote.bid)}}</p>
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
											<p>{{nformat(all.quote.ask)}}</p>
										</b-tooltip>
									</td>
								</tr>
								<tr>
									<td class="has-text-success has-text-right">
										<b-tooltip label="Bid Size" position="is-left" size="is-small" animated>
											<p>{{nformat(all.quote.bids,{precision:1,compact:true})}}</p>
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
											<p>{{nformat(all.quote.asks,{precision:1,compact:true})}}</p>
										</b-tooltip>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div class="column is-narrow widescreen:flex hidden">
						<div class="flex py-0">
							<table class="table is-paddingless is-middle is-nowrap is-borderless">
								<tbody>
									<tr>
										<td class="font-semibold has-text-right pr-2">{{nformat(all.quote.volume,{compact:true})}}</td>
										<td>Volume</td>
									</tr>
									<tr>
										<td class="font-semibold has-text-right pr-2">{{nformat(all.quote.avgVolume,{compact:true})}}</td>
										<td>Avg Volume</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div v-if="all.quote.marketCap && all.quote.dealFlowVolume" class="column is-narrow fullhd:flex hidden">
						<div class="flex py-0">
							<table class="table is-paddingless is-middle is-nowrap is-borderless">
								<tbody>
									<tr>
										<td class="font-semibold has-text-right pr-2">{{nformat(all.quote.marketCap,{compact:true})}}</td>
										<td>Market Cap</td>
									</tr>
									<tr>
										<td class="font-semibold has-text-right pr-2" v-bull-bear="all.quote.dealFlowVolume">
											{{nformat(all.quote.dealFlowVolume,{compact:true,plusminus:true})}}
										</td>
										<td>Capital Flow</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

				</div>

				<nav class="tabs is-boxed is-centered is-fullwidth mb-0">
					<div class="container">
						<ul>
							<router-link tag="li" class="is-dark" v-for="route in routes" :key="route.name" :to="{name:route.name}">
								<a class="is-dark no-underline">
									<b-icon :icon="route.icon"></b-icon>
									<span>{{vcapitalize(route.path)}}</span>
								</a>
							</router-link>
						</ul>
					</div>
				</nav>
			</div>
		</section>

		<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
			<router-view></router-view>
		</transition>

	</div>
</template>
