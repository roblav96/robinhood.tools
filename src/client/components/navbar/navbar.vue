<!--  -->
<script lang="ts" src="./navbar.ts"></script>

<style>
/**/

nav.navbar div.field.navbar-item {
	margin-bottom: 0px;
}

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
	<nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
		<div class="container">

			<div class="navbar-brand">
				<router-link class="navbar-item" :to="{ name: 'home' }" active-class exact-active-class>
					<img src="@/assets/logo-primary.svg" alt="Robinhood Tools">
				</router-link>

				<div class="is-hidden-mobile navbar-item py-0 flex flex-col self-center text-sm">
					<p class="font-medium">{{time}}</p>
					<p :class="scolor">{{state}}</p>
					<!-- <span class="tag is-small" :class="scolor">{{state}}</span> -->
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
						<b-icon class="" :icon="route.icon"></b-icon>
						<span class="ml-2">{{ route.title }}</span>
					</router-link>
				</div>
				<div class="navbar-end">
					<router-link class="navbar-item flex items-center navbar-robinhood" :to="{ name: rhusername ? 'robinhood' : 'login' }"
					    active-class exact-active-class>
						<img class="image is-24x24 mr-2" src="@/assets/robinhood-logo.svg" alt="Robinhood">
						<!-- <div v-if="rhusername" class="navbar-item items-start p-0 flex flex-col">
							<span class="leading-tight font-medium">{{vnumber(equityvalue,{dollar:true,precision:2})}}</span>
							<span class="leading-tight text-xs" v-green-red="equitychange">
								{{vnumber(equitychange,{dollar:true,precision:2,plusminus:true})}}
								({{vnumber(equitypercent,{plusminus:true,percent:true})}})
							</span>
						</div> -->
						<span v-if="rhusername" class="">{{vnumber(equityvalue,{dollar:true,precision:2})}}</span>
						<span v-else>Login</span>
					</router-link>
				</div>
			</div>

		</div>
	</nav>
</template>
