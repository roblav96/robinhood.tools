<!--  -->
<script lang="ts" src="./robinhood.ts"></script>

<style>
/**/

</style>

<template>
	<section>
		<section class="hero is-small">
			<div class="hero-body">
				<div class="container">
					<div class="columns">
						<div class="column">
							<img class="image w-64" src="@/assets/robinhood-banner.png">
							<!-- <p class="subtitle">{{user.username}}</p> -->
							<!-- <p class="subtitle">{{user.first_name}} {{user.last_name}}</p> -->
							<!-- <p class="">{{user.first_name}} {{user.last_name}}</p> -->
						</div>
						<div class="column">
							<article class="message is-rhgreen card">
								<div class="message-header">Equity Value</div>
								<div class="message-body">
									<p class="subtitle is-size-3 font-semibold">{{vnumber(equityvalue,{precision:2,dollar:true})}}</p>
								</div>
							</article>
						</div>
						<div class="column">
							<article class="message is-rhgreen card">
								<div class="message-header">Market Value</div>
								<div class="message-body">
									<p class="subtitle is-size-3 font-semibold">{{vnumber(marketvalue,{precision:2,dollar:true})}}</p>
								</div>
							</article>
						</div>
					</div>
				</div>
			</div>
			<div class="hero-foot">
				<nav class="tabs is-toggle">
					<div class="container">
						<ul>
							<router-link tag="li" v-for="(route,i) in routes" :to="{ name: route.name }" :key="i">
								<a>
									<b-icon :icon="route.icon"></b-icon>
									<span>{{route.title}}</span>
								</a>
							</router-link>
						</ul>
					</div>
				</nav>
			</div>
		</section>
		<router-view></router-view>
	</section>
</template>
