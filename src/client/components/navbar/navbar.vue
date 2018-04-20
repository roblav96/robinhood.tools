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

		<div class="navbar-brand">
			<router-link class="navbar-item px-4" :to="{ name: 'home' }" active-class exact-active-class>
				<svg-logo class="image is-32x32" :fill="$store.state.colors.primary"></svg-logo>
			</router-link>

			<span class="navbar-burger burger px-6" :class="{ 'is-active': isMobileMenu }" v-on:click="isMobileMenu = !isMobileMenu">
				<span></span>
				<span></span>
				<span></span>
			</span>
		</div>

		<div class="navbar-menu is-hidden-desktop" :class="{ 'is-active': isMobileMenu }">
			<div class="navbar-start">
				<router-link class="navbar-item flex items-center" v-for="route in routes" :key="route.name" :to="{ name: route.name }">
					<b-icon class="mr-1" :icon="route.icon" />
					<span>{{ route.title }}</span>
				</router-link>
			</div>
		</div>

		<div class="navbar-end is-hidden-touch">
			<b-dropdown position="is-bottom-left" v-on:active-change="ondropdown">
				<a class="navbar-item" slot="trigger">
					<span>Menu</span>
					<b-icon icon="menu-down"></b-icon>
				</a>

				<b-dropdown-item custom>
					Logged as <b>Rafael Beraldo</b>
				</b-dropdown-item>
				<hr class="dropdown-divider">
				<b-dropdown-item has-link>
					<a href="https://google.com" target="_blank" class="flex items-center">
						<b-icon icon="link"></b-icon>
						Google (link)
					</a>
				</b-dropdown-item>
				<b-dropdown-item class="flex items-center" value="home">
					<b-icon icon="home"></b-icon>
					Home
				</b-dropdown-item>
				<b-dropdown-item value="products">
					<b-icon icon="cart"></b-icon>
					Products
				</b-dropdown-item>
				<b-dropdown-item value="blog" disabled>
					<b-icon icon="book-open"></b-icon>
					Blog
				</b-dropdown-item>
				<hr class="dropdown-divider">
				<b-dropdown-item value="settings">
					<b-icon icon="settings"></b-icon>
					Settings
				</b-dropdown-item>
				<b-dropdown-item value="logout">
					<b-icon icon="logout"></b-icon>
					Logout
				</b-dropdown-item>
			</b-dropdown>
		</div>

	</nav>
</template>
