<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

#symbol_route table.bidask .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}


/*#symbol_route nav.tabs li.is-active {
	background: rgb(255, 255, 255);
	background: linear-gradient(0deg, white 0%, #F1F5F8 100%);
}*/

</style>

<template>
	<div id="symbol_route">

		<section class="section has-background-white-ter pb-0">
			<div class="container">

				<div class="columns is-mobile flex-wrap desktop:flex-no-wrap mb-0">

					<div class="column is-narrow">
						<symbol-logo class="is-48x48 card is-light" :symbol="symbol"></symbol-logo>
					</div>

					<div class="column flex">
						<div class="box is-light h-12 flex py-0 px-5">
							<p class="self-center title mr-4 whitespace-no-wrap">{{symbol}}</p>
							<p class="self-center is-size-6">{{breakpoints.widescreenAndUp?all.quote.name:all.quote.tinyName}}</p>
						</div>
					</div>

					<div class="column is-narrow">
						<div class="box is-light h-12 flex py-0 px-5 whitespace-no-wrap">
							<number-ticker :number="all.quote.price" class="self-center title mr-4 font-mono"></number-ticker>
							<p class="self-center is-size-6 font-medium" v-bull-bear="all.quote.change">
								<span>{{vnumber(all.quote.change,{plusminus:true})}}</span>
								<br>
								<span>{{vnumber(all.quote.percent,{plusminus:true,percent:true,precision:2})}}</span>
							</p>
						</div>
					</div>

					<div class="column is-narrow">
						<div class="box is-light h-12 flex py-0">
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
						<div class="box is-light h-12 flex py-0">
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
						<div class="box is-light h-12 flex py-0">
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

				</div>

				<nav class="tabs is-centered is-fullwidth mb-0">
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

		<!-- <section class="section flex-col-full"> -->
		<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
			<router-view></router-view>
		</transition>
		<!-- </section> -->

	</div>
</template>
