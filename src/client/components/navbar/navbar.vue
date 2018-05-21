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
	border-bottom: 1px solid var(--white-ter);
}

nav.navbar div.navbar-item.field {
	margin-bottom: 0px;
}

nav.navbar div.dropdown-content a,
nav.navbar div.dropdown-content div.has-link a {
	display: flex;
	align-items: center;
}

nav.navbar div.dropdown-content a > span.icon {
	margin-right: 8px;
}

</style>

<template>
	<nav id="navbar" class="navbar is-fixed-top shadow is-unselectable" role="navigation" aria-label="main navigation">
		<div class="container">

			<div class="navbar-brand">
				<router-link class="navbar-item" :to="{name:'home'}" active-class exact-active-class>
					<img src="@/assets/logo-primary.svg" alt="Robinhood Tools">
				</router-link>

				<div class="is-hidden-mobile navbar-item py-0 flex flex-col self-center">
					<p class="leading-tight font-medium font-mono">{{time}}</p>
					<p class="text-sm font-medium" :class="scolor">{{state}}</p>
				</div>

				<b-field class="navbar-item">
					<v-searchbar></v-searchbar>
				</b-field>

				<span class="navbar-burger burger" :class="{'is-active':showmenu}" v-on:click="showmenu=!showmenu">
					<span></span>
					<span></span>
					<span></span>
				</span>
			</div>

			<div class="navbar-menu" :class="{'is-active animated-slow fadeIn':showmenu}">
				<div class="navbar-start">
					<b-tooltip :active="breakpoints.desktopAndUp" :label="route.title" position="is-bottom" v-for="route in routes"
					    :key="route.name">
						<router-link class="navbar-item flex items-center h-full" :to="{name:route.name}">
							<b-icon class="mx-1" size="is-28x28" :icon="route.icon"></b-icon>
							<span :class="{'is-hidden-desktop':!isroute(route.name),'font-medium':isroute(route.name)}" class="ml-2 animated-slow fadeIn">{{route.title}}</span>
						</router-link>
					</b-tooltip>
					<b-tooltip v-if="!rhusername" label="Robinhood Login" :active="breakpoints.desktopAndUp" position="is-bottom">
						<router-link class="navbar-item flex items-center" :to="{name:'login'}" active-class exact-active-class>
							<img class="image is-28x28 mx-1" src="@/assets/robinhood-logo.svg" alt="Robinhood Login">
							<span class="is-hidden-desktop ml-2">Login</span>
						</router-link>
					</b-tooltip>
				</div>

				<div class="navbar-end">

					<!-- <b-dropdown v-if="rhusername && breakpoints.desktopAndUp" hoverable position="is-bottom-left">
						<router-link class="navbar-item flex items-center hover-rhgreen" :to="{ name: 'robinhood' }" slot="trigger" active-class
						    exact-active-class>
							<img class="image is-28x28 mr-3 touch:ml-1" src="@/assets/robinhood-logo.svg" alt="Robinhood">
							<span class="leading-tight font-medium font-mono">
								{{vnumber(equityvalue,{dollar:true,precision:2})}}
							</span>
						</router-link>

						<b-dropdown-item custom>
							Logged as <b>Rafael Beraldo</b>
						</b-dropdown-item>
						<hr class="dropdown-divider">
						<b-dropdown-item value="home">
							<b-icon icon="home"></b-icon>
							Home
						</b-dropdown-item>
						<b-dropdown-item has-link>
							<a href="https://google.com" target="_blank">
								<b-icon icon="link"></b-icon>
								Google (link)
							</a>
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
					</b-dropdown> -->

					<!-- <router-link v-else-if="rhusername" class="navbar-item flex items-center hover-rhgreen" :to="{ name: 'robinhood' }"
					    active-class exact-active-class>
						<img class="image is-28x28 mr-3 touch:ml-1" src="@/assets/robinhood-logo.svg" alt="Robinhood">
						<span class="leading-tight font-medium font-mono">
							{{vnumber(equityvalue,{dollar:true,precision:2})}}
						</span>
					</router-link> -->

					<router-link v-if="rhusername" class="navbar-item flex items-center desktop:py-0" :to="{ name: 'robinhood' }"
					    active-class exact-active-class>
						<img class="image is-28x28 mr-3 touch:ml-1" src="@/assets/robinhood-logo.svg" alt="Robinhood">
						<div class="flex flex-col self-center">
							<p class="leading-tight font-medium font-mono">
								{{vnumber(equityvalue,{dollar:true,precision:2})}}
							</p>
							<p class="text-sm font-medium" v-bull-bear="equitychange">
								{{vnumber(equitychange,{dollar:true,precision:2,plusminus:true})}} ({{vnumber(equitypercent,{precision:2,plusminus:true,percent:true})}})
							</p>
						</div>
					</router-link>

				</div>

			</div>

		</div>
	</nav>
</template>
