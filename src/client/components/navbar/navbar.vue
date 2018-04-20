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
	<nav class="navbar is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
		<!-- <div class="container"> -->

		<div class="navbar-brand">
			<router-link class="navbar-item px-4" :to="{ name: 'home' }" active-class exact-active-class>
				<svg-logo class="image is-32x32" :fill="$store.state.colors.primary"></svg-logo>
			</router-link>

			<!-- <div class="navbar-item">
					<v-searchbar></v-searchbar>
				</div> -->

			<div class="flex-grow is-hidden-desktop"></div>
			<span class="navbar-burger burger px-6" :class="{ 'is-active': isMenu }" v-on:click="isMenu = !isMenu">
				<span></span>
				<span></span>
				<span></span>
			</span>
			<!-- <a class="navbar-item is-hidden-desktop" v-on:click="isMenu = !isMenu">
					<b-icon icon="menu" />
				</a> -->
		</div>

		<div class="navbar-menu" :class="{ 'is-active': isMenu }">
			<div class="navbar-start">
				<router-link class="navbar-item" v-for="route in routes" :key="route.name" :to="{ name: route.name }">
					<b-icon class="mr-2 va-middle" :icon="route.icon" />
					<span class="va-middle">{{ route.title }}</span>
				</router-link>
			</div>
		</div>

		<!-- </div> -->
	</nav>
</template>
