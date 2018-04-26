<!--  -->
<script lang="ts" src="./app.ts"></script>

<style>
/**/

</style>

<template>
	<div id="app">

		<v-navbar></v-navbar>

		<router-view></router-view>

		<footer class="footer py-12">
			<div class="container">
				<div class="content has-text-centered">
					<a class="button" href="https://github.com/roblav96/robinhood.tools" target="_blank">
						<b-icon icon="github-circle" />
						<span>Open Source</span>
					</a>
				</div>

				<template v-show="development">
					<div class="tabs is-toggle is-centered">
						<ul>
							<router-link tag="li" v-for="route in routes" :key="route.name" :to="{ name: route.name }">
								<a>
									<span>{{ route.name }}</span>
								</a>
							</router-link>
						</ul>
					</div>
				</template>
			</div>
		</footer>

	</div>
</template>
