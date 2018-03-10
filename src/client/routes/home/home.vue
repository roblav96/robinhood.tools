<!--  -->
<script lang="ts" src="./home.ts"></script>

<style>
/**/

/**/

</style>

<template>
	<section>
		<section class="hero is-bold is-primary">
			<div class="hero-body">
				<div class="container has-text-centered">
					<img class="mb-4" src="@/assets/robinhood-logo-white.svg" width="128" alt="Robinhood Tools">
					<p class="title">Advanced trading tools &amp; resources for Robinhood.</p>
					<!-- <p class="subtitle">Are you ready to step up your game?</p> -->
					<button class="button is-medium is-secondary">
						<span>Level Up</span>
						<b-icon icon="trending-up" class="t-bold" size="" />
					</button>
				</div>
			</div>
		</section>

		<section class="section container">
			<div class="columns">

				<div class="column is-4">
					<div class="card">
						<div class="card-content">
							<div class="media">
								<div class="media-left">
									<b-icon icon="scale-balance" size="is-large" />
								</div>
								<div class="">
									<p class="title is-4">Bid/Ask Quotes</p>
									<p class="subtitle is-6 is-italic">via NASDAQ</p>
								</div>
							</div>
							<hr>
							<div class="content">
								<p>
									Make accurate decisions by knowing exactely what the supply and demand of an asset is.
								</p>
								<!-- <p>
									<span class="t-600">Bid Price</span> is the price buyers are willing to pay to acquire an asset.
									<br>
									<span class="t-600">Bid Size</span> is the quantity of buyers for an asset.
								</p>
								<p>
									<span class="t-600">Ask Price</span> is the price owners of an asset are willing to sell it for.
									<br>
									<span class="t-600">Ask Size</span> is the quantity of sellers for an asset.
								</p> -->
							</div>
						</div>
					</div>
				</div>

				<div class="column is-4">
					<div class="card">
						<div class="card-content">
							<div class="media">
								<div class="media-left">
									<b-icon icon="backburger" size="is-large" />
								</div>
								<div class="">
									<p class="title is-4">Trade History</p>
									<p class="subtitle is-6 is-italic">via NASDAQ</p>
								</div>
							</div>
							<hr>
							<div class="content">
								<p>
									The real-time transaction records of an asset allows you to see who's buying long and selling short.
								</p>
								<!-- <p>Better understand the capital flow of an asset.</p> -->
							</div>
						</div>
					</div>
				</div>

				<div class="column is-4">
					<div class="card">
						<div class="card-content">
							<div class="media">
								<div class="media-left">
									<b-icon icon="newspaper" size="is-large" />
								</div>
								<div class="">
									<p class="title is-4">News Articles</p>
									<p class="subtitle is-6 is-italic">via robots</p>
								</div>
							</div>
							<hr>
							<div class="content">
								<p>
									Our bots aggregate news articles 24/7 delivering them to you before they're indexed on search engines.
									<!-- Our bots Read the news articles before they're publicly indexed on search engines. -->
									<!-- We aggregate news articles from over +100 reliable &amp; accurate sources. -->
								</p>
								<!-- <p>The best market sentiment you'll find.</p> -->
							</div>
						</div>
					</div>
				</div>

			</div>
		</section>
	</section>
</template>
