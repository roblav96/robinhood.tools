<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

</style>

<template>
	<section>
		<section class="hero is-small has-background-white-bis">
			<div class="hero-body">
				<div class="container">
					<div class="columns is-multiline">
						<div class="column is-half is-one-quarter-widescreen">
							<div class="columns is-mobile">
								<ui-symbol-logo class="column is-narrow is-96x96" :symbol="symbol"></ui-symbol-logo>
								<div class="column">
									<h1 class="title is-spaced my-0 is-2">{{symbol}}</h1>
									<h2 class="subtitle my-0 is-6">{{instrument.simple_name || instrument.name}}</h2>
								</div>
							</div>
						</div>
						<div class="column is-half is-one-quarter-widescreen">
							<p class="content">price bid ask goes here</p>
						</div>
						<div class="column is-half is-one-quarter-widescreen">
							<p class="content">sparkline goes here</p>
						</div>
						<div class="column is-half is-one-quarter-widescreen">
							<p class="content">deals feed goes here</p>
						</div>

						<!-- <article class="message column is-dark">
							<div class="message-body">
								haiii
							</div>
						</article> -->
					</div>
				</div>
			</div>
			<div class="hero-foot">
				<nav class="tabs is-boxed">
					<div class="container">
						<ul>
							<li :class="{ 'is-active': tabindex == i }" v-on:click="tabindex = i" v-for="(tab, i) in tabs">
								<a>
									<b-icon :icon="tab.icon"></b-icon>
									<span>{{tab.title}}</span>
								</a>
							</li>
						</ul>
					</div>
				</nav>
			</div>
		</section>

		<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
			<component :is="tabs[tabindex].vcomponent" class=""></component>
		</transition>

	</section>
</template>
