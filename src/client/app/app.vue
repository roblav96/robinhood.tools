<!--  -->
<script lang="ts" src="./app.ts"></script>

<style>
/**/

</style>

<template>
	<div id="app" :class="{ 'opacity-0': initing == true, 'animated-slow fadeIn': initing == false }">

		<v-navbar></v-navbar>

		<transition :enter-active-class="initing == null ? 'animated-slower fadeIn' : ''" leave-active-class="opacity-0">
			<router-view class="router-view is-fullheight has-background-white-bis"></router-view>
		</transition>

		<hr>
		<section class="footer hero py-0">
			<div class="hero-body">
				<div class="container">
					<div class="content has-text-centered">
						<a class="button" href="https://github.com/roblav96/robinhood.tools" target="_blank">
							<b-icon icon="github-circle"></b-icon>
							<span>Open Source</span>
						</a>
					</div>
				</div>
			</div>
			<div class="hero-foot">
				<nav class="tabs is-boxed is-centered">
					<div class="container">
						<ul>
							<router-link tag="li" v-for="route in routes" :key="route.name" :to="{ name: route.name }">
								<a>
									<span>{{ route.name }}</span>
								</a>
							</router-link>
						</ul>
					</div>
				</nav>
			</div>
		</section>

	</div>
</template>
