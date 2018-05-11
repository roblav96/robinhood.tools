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
					<ui-symbol-logo class="column is-narrow p-0 is-64x64 self-center mr-6" :symbol="symbol"></ui-symbol-logo>
					<div class="column">
						<h1 class="title is-spaced my-0 is-2">{{symbol}}</h1>
						<h2 class="subtitle my-0 is-6">{{instrument.simple_name || instrument.name}}</h2>
					</div>
				</div>
			</div>
		</div>

		<div class="hero-foot">
			<nav class="tabs is-boxed">
				<div class="container">
					<ul>
						<li :class="{ 'is-active': tabindex == i }" v-on:click="tabindex = i" v-for="(tab, i) in tabs">
							<a>{{tab.title}}</a>
						</li>
					</ul>
				</div>
			</nav>
		</div>

		<hr class="my-0 has-background-light">

		<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
			<component :is="tabs[tabindex].vcomponent" class="has-background-white-bis"></component>
		</transition>

	</section>
</template>
