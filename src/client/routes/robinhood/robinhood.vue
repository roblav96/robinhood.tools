<!--  -->
<script lang="ts" src="./robinhood.ts"></script>

<style>
/**/

</style>

<template>
	<section>
		<section class="section">
			<div class="container">
				<div class="columns">
					<!-- <div class="column">
						<img class="image w-64" src="@/assets/robinhood-banner.png">
					</div> -->
					<div class="column">
						<article class="message is-dark card">
							<div class="message-header">Equity Value</div>
							<div class="message-body">
								<p class="leading-none font-mono is-size-3 font-semibold">{{vnumber(equityvalue,{precision:2,dollar:true})}}</p>
							</div>
						</article>
					</div>
					<div class="column">
						<article class="message is-dark card">
							<div class="message-header">Market Value</div>
							<div class="message-body">
								<p class="leading-none font-mono is-size-3 font-semibold">{{vnumber(marketvalue,{precision:2,dollar:true})}}</p>
							</div>
						</article>
					</div>
					<div class="column">
						<article class="message is-dark card">
							<div class="message-header">Buying Power</div>
							<div class="message-body">
								<p class="leading-none font-mono is-size-3 font-semibold">{{vnumber(buyingpower,{precision:2,dollar:true})}}</p>
							</div>
						</article>
					</div>
				</div>
			</div>
		</section>

		<nav class="tabs is-toggle is-centered is-fullwidth">
			<div class="container">
				<ul class="has-background-white rounded">
					<router-link tag="li" v-for="(route,i) in routes" :to="{ name: route.name }" :key="i">
						<a>
							<b-icon :icon="route.icon"></b-icon>
							<span>{{route.title}}</span>
						</a>
					</router-link>
				</ul>
			</div>
		</nav>

		<router-view></router-view>

	</section>
</template>
