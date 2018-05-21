<!--  -->
<script lang="ts" src="./robinhood.ts"></script>

<style>
/**/

</style>

<template>
	<section>
		<section class="section has-background-white-bis">
			<div class="container">
				<div class="columns">
					<!-- <div class="column">
						<div class="box">
							<img class="image w-64 mb-4" src="@/assets/robinhood-banner.png">
							<p class="subtitle font-medium">{{rh.user.first_name}} {{rh.user.last_name}}</p>
							<p class="">{{rh.user.username}}</p>
						</div>
					</div> -->
					<div class="column">
						<div class="p-4 card border-rhgreen border-0 border-l-4">
							<p class="title is-size-4 font-medium">{{rh.user.first_name}} {{rh.user.last_name}}</p>
							<p class="subtitle is-size-6">{{rh.user.username}}</p>
						</div>
					</div>
					<div class="column">
						<div class="p-4 card">
							<p class="title is-size-4 font-medium font-mono">{{vnumber(equityvalue,{precision:2,dollar:true})}}</p>
							<p class="subtitle is-size-6">Equity Value</p>
						</div>
					</div>
					<div class="column">
						<div class="p-4 card">
							<p class="title is-size-4 font-medium font-mono">{{vnumber(marketvalue,{precision:2,dollar:true})}}</p>
							<p class="subtitle is-size-6">Market Value</p>
						</div>
					</div>
					<div class="column">
						<div class="p-4 card">
							<p class="title is-size-4 font-medium font-mono">{{vnumber(buyingpower,{precision:2,dollar:true})}}</p>
							<p class="subtitle is-size-6">Buying Power</p>
						</div>
					</div>
				</div>
			</div>

			<nav class="tabs is-toggle is-centered is-fullwidth mt-8">
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

		</section>
		<hr class="h-px my-0 mb-8">



		<router-view></router-view>

	</section>
</template>
