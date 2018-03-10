<!--  -->
<script lang="ts" src="./navbar.ts"></script>

<style>
/**/

/**/

</style>

<template>
	<nav class="navbar is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
		<div class="container">
			<div class="navbar-brand">
				<a class="navbar-item is-hidden-desktop" v-on:click="showMenu = !showMenu">
					<b-icon icon="menu" />
				</a>
				<!-- <div class="navbar-item ml-auto">
					<b-field>
						<b-input type="search" placeholder="Search anything..." icon="magnify" />
					</b-field>
				</div> -->
			</div>
			<div class="navbar-menu" :class="{ 'is-active': showMenu }">
				<div class="navbar-start">
					<a class="navbar-item" v-on:click="$root.showLogin">
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
				</div>
			</div>
		</div>
	</nav>
</template>
