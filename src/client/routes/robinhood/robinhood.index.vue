<!--  -->
<script lang="ts" src="./robinhood.index.ts"></script>

<style>
/**/

</style>

<template>
	<section class="robinhood-route">
		<section class="hero is-small">
			<div class="hero-body">
				<div class="container">
					<img class="image w-64" src="@/assets/robinhood-banner.png">
				</div>
			</div>
			<div class="hero-foot">
				<nav class="tabs is-toggle is-toggle-rounded">
					<div class="container">
						<ul>
							<li v-for="route in routes">
								<router-link :to="{ name: route.name }">
									<b-icon :icon="route.icon"></b-icon>
									<span>{{route.title}}</span>
								</router-link>
							</li>
						</ul>
					</div>
				</nav>
			</div>
		</section>
		<router-view></router-view>
	</section>
</template>
