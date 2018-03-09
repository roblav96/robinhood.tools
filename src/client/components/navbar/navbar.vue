<!--  -->
<script lang="ts" src="./navbar.ts"></script>

<style>
/*  */

/*  */

</style>

<template>
	<nav class="navbar is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
		<div class="container">
			<div class="navbar-brand">
				<a class="navbar-item is-hidden-desktop" v-on:click="showMenu = !showMenu">
					<b-icon icon="menu" />
				</a>
				<!-- <router-link class="navbar-item" :to="{ name: 'home' }">
					<img src="@/assets/logo-primary.svg">
				</router-link> -->


				<!-- <div class="navbar-burger" data-target="">
					<span></span>
					<span></span>
					<span></span>
				</div> -->
				<!-- <div class="navbar-end">
					<a class="navbar-item" v-on:click="showSearch = !showSearch">
						<b-icon icon="menu" />
					</a>
				</div> -->
			</div>
			<div class="navbar-menu" :class="{ 'is-active': showMenu }">
				<div class="navbar-start">
					<a class="navbar-item">
						<img src="@/assets/robinhood-logo.svg" class="h-4 mr-2 va-top" style="width: 24px;">
						<span>Login</span>
					</a>
					<a class="navbar-item">
						<b-icon class="mr-2 va-top" icon="wunderlist" />
						<span>Watchlist</span>
					</a>
					<a class="navbar-item">
						<b-icon class="mr-2 va-top" icon="web" />
						<span>Markets</span>
					</a>
					<a class="navbar-item">
						<b-icon class="mr-2 va-top" icon="bitcoin" />
						<span>Crypto</span>
					</a>
				</div>
				<div class="navbar-end">
					<div class="navbar-item">
						<b-field>
							<b-input type="search" placeholder="Search anything..." icon="magnify" />
						</b-field>
					</div>
					<!-- <b-collapse class="navbar-item" :open.sync="showSearch">
						<b-field>
							<b-input type="search" placeholder="Search anything..." icon="magnify" />
							<p class="control">
								<button class="button">Close</button>
							</p>
						</b-field>
					</b-collapse>
					<a class="navbar-item" v-on:click="showSearch = !showSearch">
						<b-icon :icon="showSearch ? 'close' : 'magnify'" />
					</a> -->
				</div>
			</div>

		</div>
	</nav>
</template>
