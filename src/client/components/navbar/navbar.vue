<!--  -->
<script lang="ts" src="./navbar.ts"></script>

<style>
/**/

.navbar-brand a.navbar-item:hover {
	background-color: inherit;
}

</style>

<template>
	<nav class="navbar is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
		<div class="container">

			<div class="navbar-brand">
				<router-link class="navbar-item" :to="{ name: 'home' }" active-class exact-active-class>
					<svg-logo class="h-full" style="width: 32px;" :fill="$store.state.colors.primary"></svg-logo>
				</router-link>

				<div class="navbar-item">
					<!-- <v-searchbar></v-searchbar> -->
				</div>

				<div class="flex-grow is-hidden-desktop"></div>
				<a class="navbar-item is-hidden-desktop" v-on:click="showMobileMenu = !showMobileMenu">
					<b-icon icon="menu" />
				</a>
			</div>

			<div class="navbar-menu" :class="{ 'is-active': showMobileMenu }">
				<div class="navbar-start">
					<router-link class="navbar-item" v-for="route in v_routes" :key="route.name" :to="{ name: route.name }">
						<b-icon class="mr-2 va-middle" :icon="route.icon" />
						<span class="va-middle">{{ route.title }}</span>
					</router-link>
				</div>
			</div>

		</div>
	</nav>
</template>
