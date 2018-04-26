<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

</style>

<template>
	<section class="hero is-small">
		<div class="hero-body">
			<div class="container">
				<div class="columns is-mobile is-gapless">
					<img class="column is-narrow p-0 is-png image is-64x64 self-center rounded mr-6" :src="'https://storage.googleapis.com/iex/api/logos/'+symbol+'.png'"
					    v-on:error="onerror">
					<div class="column content">
						<h1 class="title leading-none is-spaced my-0 is-1">{{symbol}}</h1>
						<h2 class="subtitle leading-none my-0 is-5">Walk Disney</h2>
					</div>
				</div>
				<!-- <h1 class="title">
					{{ symbol }}
				</h1>
				<h2 class="subtitle">
					Primary subtitle
				</h2> -->
			</div>
		</div>

		<div class="hero-foot">
			<nav class="tabs is-centered is-fullwidth">
				<div class="container">
					<ul>
						<li class="is-active">
							<a>Overview</a>
						</li>
						<li>
							<a>Modifiers</a>
						</li>
						<li>
							<a>Grid</a>
						</li>
						<li>
							<a>Elements</a>
						</li>
						<li>
							<a>Components</a>
						</li>
						<li>
							<a>Layout</a>
						</li>
					</ul>
				</div>
			</nav>
		</div>
	</section>
</template>
