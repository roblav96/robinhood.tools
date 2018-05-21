<!--  -->
<script lang="ts" src="./home.ts"></script>

<style>
/**/

</style>

<template>
	<section>

		<section class="hero is-fullheight">
			<div class="hero-body">
				<div class="container self-start">

					<section class="section has-text-centered">
						<img class="max-w-ns mb-12" width="25%" src="@/assets/logo-primary.svg" alt="Robinhood Tools">
						<h1 class="is-size-2 font-semibold">Robinhood Tools</h1>
						<h2 class="is-size-4">Advanced trading tools and resources for Robinhood Web.</h2>
						<!-- <v-searchbar class="justify-center is-medium" size="is-medium"></v-searchbar> -->
					</section>


					<section class="section columns is-multiline">
						<div v-for="box in boxes" class="column is-half-tablet is-one-quarter-widescreen">
							<div class="box content">
								<div class="has-text-centered">
									<b-icon :icon="box.icon" size="is-xxlarge" type="is-primary" class="mb-4"></b-icon>
									<p class="text-inherit title is-4">{{ box.title }}</p>
								</div>
								<hr class="has-background-primary my-5">
								<p>{{ box.desc }}</p>
							</div>
						</div>
					</section>
				</div>
			</div>
		</section>

	</section>
</template>
