<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

section.symbol-route div.bidask .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}


/*section.symbol-route div.hero-body:first-of-type div.box {
	padding: 0.5rem 1rem;
}*/

</style>

<template>
	<section class="symbol-route">

		<section class="section has-background-white-ter">
			<div class="container">

				<div class="columns is-multiline is-mobile">

					<div class="column is-narrow">
						<symbol-logo class="is-48x48 card" :symbol="symbol"></symbol-logo>
					</div>

					<div class="column flex">
						<div class="box h-12 flex px-5">
							<p class="self-center title mr-4 whitespace-no-wrap">{{symbol}}</p>
							<p class="self-center is-size-6">{{breakpoints.widescreenAndUp?all.quote.name:all.quote.tinyName}}</p>
						</div>
					</div>

					<div class="column is-narrow">
						<div class="box h-12 flex px-5 whitespace-no-wrap font-mono">
							<number-ticker :number="all.quote.price" class="self-center title mr-4"></number-ticker>
							<p class="self-center is-size-6 font-medium" v-bull-bear="all.quote.change">
								<span>{{vnumber(all.quote.change,{plusminus:true})}}</span>
								<br>
								<span>{{vnumber(all.quote.percent,{plusminus:true,percent:true,precision:2})}}</span>
							</p>
						</div>
					</div>

					<div class="column is-narrow">
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
					</div>

					<div v-show="all.quote.marketCap" class="column is-narrow desktop:flex hidden">
						<div class="box h-12 flex">
							<p class="self-center is-size-4 mr-2 font-medium whitespace-no-wrap">
								{{vnumber(all.quote.marketCap,{compact:true})}}
							</p>
							<p class="self-center is-size-6">Market Cap</p>
						</div>
					</div>

				</div>
			</div>

		</section>
		<section class="has-background-white-ter pb-8">

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



			<transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
				<symbol-ticker v-if="showticker" class="pb-0"></symbol-ticker>
			</transition>



		</section>

		<hr class="h-px my-0">

		<section class="section has-background-white-bis">
			<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
				<router-view></router-view>
			</transition>
		</section>

	</section>
</template>
