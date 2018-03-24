<!--  -->
<script lang="ts" src="./styleguide.ts"></script>

<style>
/**/

</style>

<template>
	<section>

		<section class="hero is-bold is-primary is-small">
			<div class="hero-body">
				<div class="container">
					<h1 class="title">CSS Helpers</h1>
				</div>
			</div>
		</section>

		<section class="section">
			<div class="container">
				<b-collapse class="card" v-for="helper in helpers" :key="helper.title" :open="false">
					<div class="card-header is-unselectable" slot="trigger" slot-scope="props">
						<p class="card-header-title">{{ helper.title }}</p>
					</div>
					<hr class="my-0">
					<div class="content is-small">
						<pre>{{ helper.styles }}</pre>
					</div>
				</b-collapse>
			</div>
		</section>

		<section class="hero is-bold is-primary is-small">
			<div class="hero-body">
				<div class="container">
					<h1 class="title">Theme</h1>
				</div>
			</div>
		</section>
		<section class="section">
			<div class="container">
				<div class="box buttons is-block has-text-centered">
					<button class="button is-large is-primary">primary</button>
					<button class="button is-large is-secondary">secondary</button>
					<button class="button is-large is-accent">accent</button>
					<button class="button is-large is-robinhood-green">robinhood-green</button>
					<button class="button is-large is-robinhood-red">robinhood-red</button>
					<hr>
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

	</section>
</template>
