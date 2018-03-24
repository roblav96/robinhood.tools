<!--  -->
<script lang="ts" src="./navbar.ts"></script>

<style>
/**/

html.has-navbar-fixed-top .hero.is-fullheight {
	min-height: calc(100vh - 3.25rem);
}

</style>

<template>
	<nav class="navbar is-fixed-top has-shadow">
		<div class="container">

			<div class="navbar-brand">
				<a class="navbar-item">
					<img src="@/assets/robinhood-logo.svg" class="h-4 mr-2 va-top">
					<span>Login</span>
				</a>
				<div class="fx-fill is-hidden-desktop"></div>
				<a class="navbar-item is-hidden-desktop" v-on:click="showMobileMenu = !showMobileMenu">
					<b-icon icon="menu" />
				</a>
			</div>

			<div class="navbar-menu" :class="{ 'is-active': showMobileMenu }">
				<div class="navbar-end">
					<a class="navbar-item">
						<b-icon class="mr-2" icon="security-account" /> Account
					</a>
				</div>
			</div>

		</div>
	</nav>
</template>
