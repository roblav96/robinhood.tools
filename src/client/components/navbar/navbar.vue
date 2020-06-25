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
	<nav
		class="navbar is-fixed-top is-unselectable shadow-sm"
		role="navigation"
		aria-label="main navigation"
	>
		<div class="container is-fluid">
			<div class="navbar-brand">
				<router-link
					class="navbar-item"
					:to="{ name: 'home' }"
					active-class
					exact-active-class
				>
					<img
						class="max-h-initial"
						src="../../../assets/logo-primary.svg"
						alt="Robinhood Tools"
					/>
				</router-link>

				<div class="navbar-item py-0 is-hidden-mobile">
					<div class="has-text-centered">
						<p class="leading-tight">{{ time }}</p>
						<p class="text-sm" :class="colorstate">{{ state }}</p>
					</div>
				</div>

				<v-searchbar class="navbar-item mb-0"></v-searchbar>

				<span
					class="navbar-burger burger"
					:class="{ 'is-active': mobilemenu }"
					v-on:click="mobilemenu = !mobilemenu"
				>
					<span></span>
					<span></span>
					<span></span>
				</span>
			</div>

			<div class="navbar-menu" :class="{ 'is-active animated-slow fadeIn': mobilemenu }">
				<div class="navbar-start">
					<router-link
						class="navbar-item flex items-center h-full"
						v-for="route in routes"
						:key="route.name"
						:to="{ name: route.name }"
					>
						<b-icon class="mx-1" size="is-28x28" :icon="route.meta.icon"></b-icon>
						<span :class="{ 'font-medium': route.name == $route.name }" class="ml-1">
							{{ vcapitalize(route.name) }}
						</span>
					</router-link>
					<!-- <b-tooltip v-if="!rhusername" label="Robinhood Login" :active="breakpoints.desktopAndUp" position="is-bottom">
						<router-link class="navbar-item flex items-center h-full" :to="{name:'login'}" active-class exact-active-class>
							<img class="image is-28x28 mx-1" src="../../../assets/robinhood-logo.svg" alt="Robinhood Login">
							<span class="is-hidden-desktop ml-2">Login</span>
						</router-link>
					</b-tooltip> -->
				</div>

				<!-- <div class="navbar-end is-hidden-touch"> -->

				<!-- <v-devmenu class="is-hidden-touch"></v-devmenu> -->

				<!-- <router-link v-if="rhusername" class="navbar-item flex items-center desktop:py-0" :to="{ name: 'robinhood' }"
					    active-class exact-active-class>
						<img class="image is-28x28 mr-3 touch:ml-1" src="../../../assets/robinhood-logo.svg" alt="Robinhood">
						<div class="flex flex-col self-center">
							<p class="leading-tight font-medium font-mono">
								{{vnumber(equityvalue,{dollar:true,precision:2})}}
							</p>
							<p class="text-sm font-medium" v-bull-bear="equitychange">
								{{vnumber(equitychange,{dollar:true,precision:2,plusminus:true})}} ({{vnumber(equitypercent,{precision:2,plusminus:true,percent:true})}})
							</p>
						</div>
					</router-link> -->

				<!-- </div> -->
			</div>

			<!-- <v-navticker v-if="breakpoints.desktopAndUp" class="is-hidden-touch"></v-navticker> -->
		</div>
	</nav>
</template>
