<!--  -->
<script lang="ts" src="./app.ts"></script>

<style>
/**/

</style>

<template>
	<div id="app">

		<v-navbar></v-navbar>

		<router-view></router-view>

		<hr class="mb-0">
		
		<section class="section">
			<div class="container">
				<div class="box buttons is-block has-text-centered">
					<button class="button is-large is-primary">primary</button>
					<button class="button is-large is-link">link</button>
					<button class="button is-large is-info">info</button>
					<button class="button is-large is-success">success</button>
					<button class="button is-large is-warning">warning</button>
					<button class="button is-large is-danger">danger</button>
					<hr>
					<button class="button is-large is-white">white</button>
					<button class="button is-large is-black">black</button>
					<button class="button is-large is-light">light</button>
					<button class="button is-large is-dark">dark</button>
				</div>
			</div>
		</section>

		<footer class="footer py-4">
			<div class="container">
				<div class="content has-text-centered">
					<a class="button" href="https://github.com/roblav96/robinhood.tools" target="_blank">
						<b-icon icon="github-circle" />
						<span>Open Source</span>
					</a>
				</div>
			</div>
		</footer>

	</div>
</template>
