<!--  -->
<script lang="ts" src="./about.ts"></script>

<style>
/**/

div.about-boxes span.icon {
	width: initial;
	height: initial;
}

div.about-boxes span.icon > i.mdi,
div.about-boxes span.icon > i.mdi:before {
	font-size: 200%;
	line-height: 1;
}

</style>

<template>
	<section>

		<section class="hero is-bold is-primary">
			<div class="hero-body">
				<div class="container has-text-centered">
					<img class="mb-4" style="max-width: 128px;" src="@/assets/logo-white.svg" width="25%" alt="Robinhood Tools">
					<h1 class="title">Robinhood Tools</h1>
					<h2 class="subtitle">Advanced trading tools and resources for Robinhood Web and Crypto.</h2>
				</div>
			</div>
		</section>



		<section class="section">
			<div class="container">
				<div class="columns is-multiline about-boxes">
					<div v-for="box in boxes" class="column is-4">
						<div class="box h-100">
							<div class="has-text-centered">
								<b-icon :icon="box.icon" type="is-primary" class="mb-3" />
								<p class="is-size-5 font-500">{{ box.title }}</p>
							</div>
							<hr class="my-3">
							<p>{{ box.desc }}</p>
						</div>
					</div>
				</div>
			</div>
		</section>

	</section>
</template>
