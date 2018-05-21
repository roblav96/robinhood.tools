<!--  -->
<script lang="ts" src="./home.ts"></script>

<style>
/**/

</style>

<template>
	<section class="has-background-white-bis">

		<section class="hero is-primary is-bold">
			<div class="hero-body">
				<div class="container has-text-centered">
					<img class="max-w-ns mb-8" width="33%" src="@/assets/logo-white.svg" alt="Robinhood Tools">
					<h1 class="title is-size-2">Robinhood Tools</h1>
					<h2 class="subtitle is-size-4">Advanced trading tools and resources for Robinhood Web.</h2>
					<router-link class="button is-large is-rhgreen font-medium" :to="{name:'login'}">
						<img class="image is-28x28 mr-2" src="@/assets/robinhood-logo-white.svg" alt="Robinhood Login">
						<span>Login Now</span>
					</router-link>
				</div>
			</div>
		</section>

		<section class="section is-medium">
			<div class="container">
				<div class="columns is-multiline">
					<div v-for="box in boxes" class="column is-half-tablet is-one-quarter-widescreen">
						<div class="box content">
							<div class="has-text-centered">
								<b-icon :icon="box.icon" size="is-xxlarge" type="is-primary" class="mb-4"></b-icon>
								<p class="text-inherit title is-4">{{ box.title }}</p>
							</div>
							<hr class="my-4">
							<p>{{ box.desc }}</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="hero is-primary is-bold">
			<div class="hero-body">
				<div class="container has-text-centered">
					<nav class="tabs is-medium is-toggle is-centered">
						<ul>
							<router-link tag="li" :to="{name:'markets'}">
								<a>
									<b-icon size="is-medium" icon="earth"></b-icon>
									<span class="font-medium">Explore Markets</span>
								</a>
							</router-link>
							<router-link tag="li" :to="{name:'news'}">
								<a>
									<b-icon size="is-medium" icon="newspaper"></b-icon>
									<span class="font-medium">News Stream</span>
								</a>
							</router-link>
							<router-link tag="li" :to="{name:'screener'}">
								<a>
									<b-icon size="is-medium" icon="radar"></b-icon>
									<span class="font-medium">Stock Screener</span>
								</a>
							</router-link>
						</ul>
					</nav>


				</div>
			</div>
		</section>

	</section>
</template>
