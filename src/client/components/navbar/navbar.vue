<!--  -->
<script lang="ts" src="./navbar.ts"></script>

<style>
/**/

span.navbar-burger.burger {
	width: 3.5rem;
}

span.navbar-burger.burger > span {
	width: 20px;
	height: 2px;
}

</style>

<template>
	<nav class="navbar is-fixed-top shadow" role="navigation" aria-label="main navigation">
		<div class="container">

			<div class="navbar-brand">
				<router-link class="navbar-item" :to="{ name: 'home' }" active-class exact-active-class>
					<img src="@/assets/logo-primary.svg" alt="Robinhood Tools">
				</router-link>

				<v-searchbar></v-searchbar>

				<span class="navbar-burger burger" :class="{ 'is-active': isMobileMenu }" v-on:click="isMobileMenu = !isMobileMenu">
					<span></span>
					<span></span>
					<span></span>
				</span>
			</div>

			<div class="navbar-menu" :class="{ 'is-active animated-slow fadeIn': isMobileMenu }">
				<div class="navbar-start">
					<router-link class="navbar-item flex items-center" v-for="route in routes" v-on:click.native="isMobileMenu = false"
					    :key="route.name" :to="{ name: route.name }">
						<b-icon class="mr-2" :icon="route.icon" />
						<span>{{ route.title }}</span>
					</router-link>
				</div>
				<div class="navbar-end">
					<router-link class="navbar-item flex items-center" v-on:click.native="isMobileMenu = false" :to="{ name: 'login' }">
						<img class="image is-24x24 mr-2" src="@/assets/robinhood-logo.svg" alt="Robinhood"></img>
						<span class="has-text-rhgreen">Login</span>
					</router-link>
				</div>
			</div>

		</div>
	</nav>
</template>
