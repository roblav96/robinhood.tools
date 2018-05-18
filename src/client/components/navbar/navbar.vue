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

nav.navbar {
	border-bottom: 1px solid var(--grey-lighter);
}

nav.navbar a.navbar-robinhood:hover,
nav.navbar a.navbar-robinhood.is-active {
	color: var(--rhgreen);
}

</style>

<template>
	<nav class="navbar is-fixed-top shadow" role="navigation" aria-label="main navigation">
		<div class="container">

			<div class="navbar-brand">
				<router-link class="navbar-item" :to="{ name: 'home' }" active-class exact-active-class>
					<img src="@/assets/logo-primary.svg" alt="Robinhood Tools">
				</router-link>

				<div class="is-hidden-mobile navbar-item py-0 flex flex-col self-center mb-1">
					<p class="font-medium text-sm">{{time}}</p>
					<span class="tag is-small" :class="scolor">{{state}}</span>
				</div>

				<v-searchbar></v-searchbar>

				<span class="navbar-burger burger" :class="{ 'is-active': isMobileMenu }" v-on:click="isMobileMenu = !isMobileMenu">
					<span></span>
					<span></span>
					<span></span>
				</span>
			</div>

			<div class="navbar-menu" :class="{ 'is-active animated-slow fadeIn': isMobileMenu }">
				<div class="navbar-start">
					<router-link class="navbar-item flex items-center" v-for="route in routes" :key="route.name" :to="{ name: route.name }">
						<b-icon class="mr-2" :icon="route.icon"></b-icon>
						<span>{{ route.title }}</span>
					</router-link>
				</div>
				<div class="navbar-end">
					<router-link class="navbar-item navbar-robinhood flex items-center py-0" :to="{ name: rhusername ? 'robinhood' : 'login' }">
						<img class="image is-24x24 mr-1" src="@/assets/robinhood-logo.svg" alt="Robinhood"></img>
						<table v-if="rhusername" class="table is-borderless is-narrowest bg-transparent content text-sm">
							<tbody>
								<tr>
									<td class="leading-tight font-medium font-mono">{{vnumber(portfolio,{dollar:true,precision:2})}}</td>
									<td class="leading-tight font-medium font-mono">{{vnumber(buying,{dollar:true,precision:2})}}</td>
								</tr>
								<tr>
									<td class="leading-tight">Portfolio Value</td>
									<td class="leading-tight">Buying Power</td>
								</tr>
							</tbody>
						</table>
						<!-- <div v-if="rhusername" class="navbar-item p-0 flex flex-col items-end">
							<div class="tags has-addons mb-1">
								<span class="tag is-small">Portfolio</span>
								<span class="tag is-small is-rhgreen font-medium">Bulma</span>
							</div>
							<div class="tags has-addons">
								<span class="tag is-small">Buying</span>
								<span class="tag is-small is-rhgreen font-medium">Bulma</span>
							</div>
						</div> -->
						<span v-else>Login</span>
					</router-link>
				</div>
			</div>

		</div>
	</nav>
</template>
