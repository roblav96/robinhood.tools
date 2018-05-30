<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

section.symbol-route div.bidask .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}

</style>

<template>
	<section class="symbol-route">

		<section class="hero is-small has-background-white-ter">
			<div class="hero-body">
				<div class="container">

					<div class="columns">

						<div class="column flex">
							<div class="self-center mr-6">
								<symbol-logo class="is-48x48 card" :symbol="symbol"></symbol-logo>
							</div>
							<div class="flex self-center card rounded px-4 py-2">
								<p class="self-center title leading-none mr-3 whitespace-no-wrap">{{symbol}}</p>
								<p class="self-center is-size-6 leading-none">{{all.quote.name}}</p>
							</div>
						</div>

						<div class="column is-narrow flex">
							<div class="flex self-center whitespace-no-wrap card rounded px-4 py-2">
								<number-ticker :number="all.quote.price" class="self-center title leading-none mr-3 font-mono"></number-ticker>
								<p class="self-center is-size-6 leading-none font-medium font-mono" v-bull-bear="all.quote.change">
									{{vnumber(all.quote.change,{plusminus:true})}}
									<br> {{vnumber(all.quote.percent,{plusminus:true,percent:true,precision:2})}}
								</p>
							</div>
							<div class="flex self-center ml-6 card rounded px-4 py-3">
								<p class="self-center is-size-4 leading-none mr-2 font-medium whitespace-no-wrap">
									{{vnumber(all.quote.volume,{compact:true})}}
								</p>
								<p class="self-center is-size-6 leading-none">Volume</p>
							</div>
							<div class="fullhd:flex hidden ml-6 self-center card rounded px-4 py-3">
								<p class="self-center is-size-4 leading-none mr-2 font-medium whitespace-no-wrap">
									{{vnumber(all.quote.avgVolume,{compact:true})}}
								</p>
								<p class="self-center is-size-6 leading-none">Avg Volume</p>
							</div>
							<div v-show="all.quote.marketCap" class="desktop:flex ml-6 hidden self-center card rounded px-4 py-3">
								<p class="self-center is-size-4 leading-none mr-2 font-medium whitespace-no-wrap">
									{{vnumber(all.quote.marketCap,{compact:true})}}
								</p>
								<p class="self-center is-size-6 leading-none">Market Cap</p>
							</div>
						</div>

					</div>
				</div>
			</div>



			<nav class="tabs is-toggle is-centered is-fullwidth mb-6">
				<div class="container px-6 desktop:px-0">
					<ul class="has-background-white rounded">
						<li :class="{'is-active':showticker}">
							<a class="no-underline" v-on:click="showticker = !showticker">
								<b-icon :icon="showticker?'arrow-up-bold':'arrow-down-bold'"></b-icon>
								<span>Ticker</span>
							</a>
						</li>
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
				<symbol-ticker v-if="showticker" class="pt-0 pb-6"></symbol-ticker>
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
