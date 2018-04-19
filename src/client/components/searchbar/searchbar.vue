<!--  -->
<script lang="ts" src="./searchbar.ts"></script>

<style lang="scss">
// 
@import '~bulma/sass/utilities/all';
@include mobile {
	div.searchbar .autocomplete .dropdown-content {
		position: fixed;
		left: 5vw;
		right: 5vw;
	}
}

</style>

<style>
/**/

div.searchbar .autocomplete .dropdown-content {
	max-height: 66vh;
}

/**/

</style>

<template>
	<b-field class="searchbar">
		<b-autocomplete class="is-danger" custom-class="is-danger" type="search" placeholder="Search..." icon="magnify"
		    open-on-focus v-model="query" :data="results" :loading="busy" v-on:input="oninput" v-on:select="onselect">
			<template slot-scope="props">
				<router-link tag="div" :to="{ name: 'symbol' }" class="columns is-mobile is-gapless">
					<div class="media">
						<div class="media-left">
							<img width="32" src="https://image.tmdb.org/t/p/w500//zwslsX98Hp4GyJGoVI4mZMU9mDO.jpg">
						</div>
						<div class="media-content">
							<h5 class="title is-5">{{ props.option.symbol }}</h5>
							<h5 class="subtitle is-5">{{ props.option.name }}</h5>
						</div>
					</div>
				</router-link>
			</template>
		</b-autocomplete>
	</b-field>
</template>
